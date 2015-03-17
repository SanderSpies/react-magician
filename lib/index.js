'use strict';

var EasingTypes = require('./EasingTypes');
var assign = require('./assign');
var Gravitas = require('gravitas');
var Spring = Gravitas.Spring;

function clone(obj) {
  var keys = Object.keys(obj);
  var newObj = {};
  for (var i = 0, l = keys.length; i < l; i++) {
    newObj[keys[i]] = obj[keys[i]];
  }
  return newObj;
}

function calculateValue(value, component) {
  if (typeof value !== 'function') {
    return value;
  }
  return value.call(component);
}

function parseValue(animationPart, currentTimeInMS, component) {
  var value = calculateValue(animationPart.value, component);
  var nextValue = calculateValue(animationPart.nextValue, component);
  var type = typeof value;
  var nextType = typeof nextValue;
  if (animationPart.unit === animationPart.nextUnit) {
    return value;
  }

  if (type === 'number' && nextType === 'number') {
    var val = animationPart.nextEasing(currentTimeInMS - animationPart.unit,
      value,
      nextValue,
      animationPart.nextUnit - animationPart.unit);
    return val;
  }
  else if (type === 'string' && nextType === 'string') {
    var numbers = value.match(/[0-9]+/g);
    var nextNumbers = nextValue.match(/[0-9]+/g);
    var calculatedNumbers = [];
    if (numbers && nextNumbers && numbers.length === nextNumbers.length) {
      for (var i = 0, l = numbers.length; i < l; i++) {
        var nr = parseInt(numbers[i], 10);
        var nextNr = parseInt(nextNumbers[i], 10);
        var val = animationPart.nextEasing(currentTimeInMS - animationPart.unit,
          nr,
          nextNr,
          animationPart.nextUnit - animationPart.unit);
        calculatedNumbers[i] = val;
      }
    }
    var replace = value.replace(/([0-9])+/g, '{{}}');
    for (var i = 0, l = numbers.length; i < l; i++) {
      replace = replace.replace('{{}}', calculatedNumbers[i]);
    }
    return replace;
  }
}

class Animation {

  constructor(animationData) {
    this.animationData = animationData;
    this.isPlaying = false;
    this.startingTime = 0;
    this.currentDelayStartingTime = 0;
    this.delay = 0; // due to pausing
    this.speed = 1;
    var blocks = this.blocks = {};
    for (var i = 0, l = animationData.length; i < l; i++) {
      var data = animationData[i];
      var blockName = data.block;
      var propName = data.name;
      if (!blocks[blockName]) {
        blocks[blockName] = {};
      }
      if (!blocks[blockName][propName]) {
        blocks[blockName][propName] = undefined;
      }
    }
  }

  play() {
    if (this.isPlaying) {
      return;
    }
    this.isPlaying = true;
    if (!this.currentDelayStartingTime) {
      this.startingTime = Date.now();
    }
    else {
      this.delay = this.delay + Date.now() - this.currentDelayStartingTime;
    }
    this.currentDelayStartingTime = 0;
  }

  pause() {
    if (!this.isPlaying) {
      return;
    }
    this.currentDelayStartingTime = Date.now();
    this.isPlaying = false;
  }

  rewind() {
    this.isRewinding = true;
    console.warn('Not implemented yet');
  }

  reset() {
    this.currentDelayStartingTime = 0;
    this.moveTo(0);
  }

  moveTo(unitPoint) {
    this.resetIsPlaying = this.isPlaying;
    this.isPlaying = false;
    this.delay = -unitPoint;
    this.play();
  }

  setSpeed(speed) {
    this.speed = speed;
    this.delay = this.delay / speed;
  }

  values(component) {
    if (!this.isPlaying) {
      return this.blocks;
    }
    if (this.resetIsPlaying !== undefined) {
      this.isPlaying = this.resetIsPlaying;
      this.resetIsPlaying = undefined;
    }
    var currentTimeInMS = (Date.now() - this.delay - this.startingTime - this.currentDelayStartingTime) * this.speed;
    var newBlocks = {};
    var animationData = this.animationData;
    for (var i = 0, l = animationData.length; i < l; i++) {
      var animationPart = animationData[i];
      if (animationPart.name === 'easing') {
        continue;
      }
      if ((animationPart.unit <= currentTimeInMS && animationPart.nextUnit >= currentTimeInMS) ||
        animationPart.unit === animationPart.nextUnit && animationPart.unit < currentTimeInMS
      ) {
        if (!newBlocks[animationPart.block]) {
          newBlocks[animationPart.block] = {};
        }
        var block = newBlocks[animationPart.block];
        if (!block[animationPart.name]) {
          var value = parseValue(animationPart, currentTimeInMS, component);
          block[animationPart.name] = value;
        }
      }
      if (i === l - 1 && currentTimeInMS >= animationPart.nextUnit) {
        this.pause();
      }
    }

    this.currentPosition = currentTimeInMS;
    this.blocks = assign({}, this.blocks, newBlocks);
    return this.blocks;
  }

}

Animation.create = (definition) => {
  var animationData = [];
  var oldBlocks = {};
  var unitPoints = Object.keys(definition);
  for (var i = 0, l = unitPoints.length; i < l; i++) {
    var unitPoint = unitPoints[i];
    var [undefined, unitValue, unitType] = unitPoint.match(/([0-9]*)(ms|px)*/);
    var parsedUnitPoint = parseInt(unitValue, 10);
    var blocks = Object.keys(definition[unitPoint]);
    for (var j = 0, l2 = blocks.length; j < l2; j++) {
      var block = blocks[j];
      var properties = Object.keys(definition[unitPoint][block]);
      for (var i2 = 0, l3 = properties.length; i2 < l3; i2++) {
        var propertyName = properties[i2];
        var easing = definition[unitPoint][block].easing || EasingTypes.linear;
        var value = definition[unitPoint][block][propertyName];
        var oldBlock = oldBlocks[block];
        if (oldBlock) {
          var oldBlockVar = oldBlock[propertyName];
          if (oldBlockVar) {
            oldBlockVar.nextUnit = parsedUnitPoint;
            oldBlockVar.nextValue = value;
            oldBlockVar.nextEasing = easing;
          }
        }

        var obj = {
          unit: parsedUnitPoint,
          type: unitType,
          easing: easing,
          block: block,
          name: propertyName,
          nextUnit: parsedUnitPoint,
          value: value,
          nextValue: value,
          nextEasing: easing
        };
        animationData.push(obj);
        if (!oldBlocks[block]) {
          oldBlocks[block] = {};
        }
        oldBlocks[block][propertyName] = obj;
      }
    }
  }
  return new Animation(animationData)
};

Animation.EasingTypes = EasingTypes;

Animation.EasingTypes.spring = function(opt) {
  var spring = new Spring(opt.mass, opt.spring, opt.damping);
  return function(t, b, c, d) {
    spring.setEnd(1);

    return spring.x() * c;
  };
};

module.exports = Animation;
