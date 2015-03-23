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
  var nextValue = calculateValue(animationPart.next ? animationPart.next.value : animationPart.value, component);
  var type = typeof value;
  var nextType = typeof nextValue;

  if (!animationPart.next || animationPart.unit === animationPart.next.unit) {
    return value;
  }
  if (type === 'number' && nextType === 'number') {
    var val = animationPart.next.easing.values(currentTimeInMS - animationPart.unit,
      value,
      nextValue,
      animationPart.next.unit - animationPart.unit);

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
        var val = animationPart.next.easing.values(currentTimeInMS - animationPart.unit,
          nr,
          nextNr,
          animationPart.next.unit - animationPart.unit);
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
    var isBusy = false;
    for (var i = 0, l = animationData.length; i < l; i++) {
      var animationPart = animationData[i];

      if (animationPart.name === 'easing' ||
        (animationPart.next && animationPart.next.easing && animationPart.next.easing.isDone())) {
        continue;
      }

      if (!animationPart.previous || (animationPart.easing && animationPart.easing.isDone())) {
        if (animationPart.next) {
          isBusy = true;
          if (animationPart.next.after) {
            if (labelRegistration[animationPart.next.after + '_' + animationPart.name].easing.isDone()) {
              if (!animationPart.startMoment) {
                animationPart.unit = currentTimeInMS;
                animationPart.next.unit = currentTimeInMS + animationPart.next.unit;
                animationPart.startMoment = true;
              }
            }
          }
        }

        if (!newBlocks[animationPart.block]) {
          newBlocks[animationPart.block] = {};
        }
        var block = newBlocks[animationPart.block];
        if (!block[animationPart.name]) {
          var value = parseValue(animationPart, currentTimeInMS, component);
          block[animationPart.name] = value;
        }
      }
    }

    if (!isBusy) {
      this.pause();
    }

    this.currentPosition = currentTimeInMS;
    this.blocks = assign({}, this.blocks, newBlocks);
    return this.blocks;
  }

}

function validateAnimation (definition) {
  var keys = Object.keys(definition);
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    var res;
    if (res = key.match(/^[0-9]+ms/)) {

    } else if (res = key.match(/([a-z]+): \?ms/)) {

    }
  }
}
var labelRegistration = {};
Animation.create = (definition) => {
  var animationData = [];
  var oldBlocks = {};
  var unitPoints = Object.keys(definition);
  for (var i = 0, l = unitPoints.length; i < l; i++) {
    var unitPoint = unitPoints[i];
    var [foo, unitValue, unitType] = unitPoint.match(/^([0-9]*)(ms|px)*/);
    var parsedUnitPoint = NaN;
    if (unitValue) {
      parsedUnitPoint = parseInt(unitValue, 10);
    }

    var label = null;
    var res;
    if (!unitValue) {
      res = unitPoint.match(/([a-z]+): \?ms/);
      if (res && res.length > 1) {
        label = res[1];
      }
    }
    var after = undefined;
    if (!unitValue && !label) {
      res = unitPoint.match(/^([a-z]+) \+ ([0-9]*)\ms/);
      if (res && res.length > 2) {
        after = res[1];
        parsedUnitPoint = parseInt(res[2], 10);
      }
    }

    var definitionUnitPoint = definition[unitPoint];
    var blockNames = Object.keys(definitionUnitPoint);
    for (var j = 0, l2 = blockNames.length; j < l2; j++) {
      var block = blockNames[j];
      var definitionUnitPointBlock = definitionUnitPoint[block];
      var properties = Object.keys(definitionUnitPointBlock);
      for (var i2 = 0, l3 = properties.length; i2 < l3; i2++) {
        var propertyName = properties[i2];
        if (propertyName === 'easing') {
          continue;
        }
        var value = definitionUnitPointBlock[propertyName];
        var obj = {
          unit: parsedUnitPoint,
          type: unitType,
          easing: null,
          block: block,
          name: propertyName,
          next: null,
          previous: null,
          value: value,
          label: label,
          after: after,
          startMoment: 0
        };

        var oldBlock = oldBlocks[block];
        if (oldBlock) {
          var oldBlockVar = oldBlock[propertyName];
          if (oldBlockVar) {
            oldBlockVar.next = obj;
            obj.previous = oldBlockVar;
            obj.easing = definitionUnitPointBlock.easing || EasingTypes.linear();
          }
        }

        if (label) {
          labelRegistration[label + '_' + propertyName] = obj;
        }
        if (after) {
          var current = labelRegistration[after + '_' + propertyName];
          while(current.next && current.next.next) {
            current = current.next;
          }
          current.next = obj;
          obj.previous = labelRegistration[after + '_' + propertyName];
        }

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
  spring.snap(0);
  var isStarted = false;
  return {

    values: function(t, b, c, d) {
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
