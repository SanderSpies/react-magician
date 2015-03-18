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

  if (animationPart.unit === animationPart.nextUnit && !animationPart.nextAuto && !animationPart.isAuto) {
    return value;
  }
  var easingFunc = typeof animationPart.nextEasing === 'object' ? animationPart.nextEasing.value : animationPart.nextEasing;
  if (type === 'number' && nextType === 'number') {
    var val = easingFunc(currentTimeInMS - animationPart.unit,
      value,
      nextValue,
      animationPart.nextUnit - animationPart.unit);
    return val;
  }
  else if (type === 'string' && nextType === 'string') {
    var numbers = value.match(/[0-9]+/g);
    var nextNumbers = nextValue.match(/[0-9]+/g);
    var calculatedNumbers = [];
    var noFloat = value.indexOf('rgb') === 0;
    if (numbers && nextNumbers && numbers.length === nextNumbers.length) {
      for (var i = 0, l = numbers.length; i < l; i++) {
        var nr = parseInt(numbers[i], 10);
        var nextNr = parseInt(nextNumbers[i], 10);
        var val = easingFunc(currentTimeInMS - animationPart.unit,
          nr,
          nextNr,
          animationPart.nextUnit - animationPart.unit);
        calculatedNumbers[i] = noFloat ? Math.round(val) : val;
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



      //if (i === l - 1 && ((!animationPart.isAuto && currentTimeInMS >= animationPart.nextUnit) || (animationPart.nextEasing && animationPart.nextEasing.isDone()))) {
      //  this.pause();
      //}
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
    var label = unitPoint.match(/^([a-z?]):*/);
    var foo = unitPoint;
    var after;
    if (label) {
      label = label[1];
      foo = unitPoint.substr(label.length).trim();
      if (foo.indexOf('+') === 0) {
        after = label;
        label = undefined;
      }
      foo = foo.substr(2);
    }


    var [undefined, unitValue, unitType] = foo.match(/([0-9?]*)(ms|px)*/);

    var parsedUnitPoint;
    var nextAuto = false;
    var isAuto = false;
    if (unitValue === '?') {
      isAuto = true;
    } else {
      parsedUnitPoint = parseInt(unitValue, 10);
    }

    var definitionUnitPoint = definition[unitPoint];
    var blocks = Object.keys(definitionUnitPoint);
    for (var j = 0, l2 = blocks.length; j < l2; j++) {
      var block = blocks[j];
      var definitionUnitPointBlock = definitionUnitPoint[block];
      var properties = Object.keys(definitionUnitPointBlock);
      for (var i2 = 0, l3 = properties.length; i2 < l3; i2++) {
        var propertyName = properties[i2];
        if (propertyName === 'easing') {
          continue;
        }
        var easing = definitionUnitPointBlock.easing || EasingTypes.linear;
        var value = definitionUnitPointBlock[propertyName];
        var oldBlock = oldBlocks[block];
        if (oldBlock) {
          var oldBlockVar = oldBlock[propertyName];
          if (oldBlockVar) {
            oldBlockVar.nextUnit = parsedUnitPoint;
            oldBlockVar.nextValue = value;
            oldBlockVar.nextEasing = easing;
            oldBlockVar.isAuto = isAuto;
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
          nextEasing: easing,
          nextAuto: nextAuto,
          isAuto: isAuto,
          label: label,
          after: after
        };
        animationData.push(obj);
        if (!oldBlocks[block]) {
          oldBlocks[block] = {};
        }
        oldBlocks[block][propertyName] = obj;
      }
    }
  }
  console.log('the blocks:', animationData);
  return new Animation(animationData)
};

Animation.EasingTypes = EasingTypes;

Animation.EasingTypes.spring = function(opt) {
  var spring = new Spring(opt.mass, opt.spring, opt.damping);
  spring.snap(0);
  var isStarted = false;
  return {

    value: function(t, b, c, d) {
      isStarted = true;
      spring.setEnd(1);
      return b + spring.x() * (c - b);
    },

    isStarted: function() {
      return isStarted;
    },

    isDone: function() {
      return spring.done() && isStarted;
    }

  };
};

module.exports = Animation;
