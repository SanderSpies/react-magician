'use strict';

var EasingTypes = require('./EasingTypes');
var assign = require('./assign');

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
  if (type === 'number' && nextType === 'number') {
    if (animationPart.time === animationPart.nextTime) {
      return value;
    }
    else {
      var val = EasingTypes[animationPart.nextEasing](currentTimeInMS - animationPart.time,
        value,
        nextValue,
        animationPart.nextTime - animationPart.time);
      return val;
    }
  }
  else if (type === 'string' && nextType === 'string') {
    var numbers = value.match(/[0-9]+/g);
    var nextNumbers = nextValue.match(/[0-9]+/g);
    var calculatedNumbers = [];
    if (numbers && nextNumbers && numbers.length === nextNumbers.length) {
      for (var i = 0, l = numbers.length; i < l; i++) {
        var nr = parseInt(numbers[i], 10);
        var nextNr = parseInt(nextNumbers[i], 10);
        var val = EasingTypes[animationPart.nextEasing](currentTimeInMS - animationPart.time,
          nr,
          nextNr,
          animationPart.nextTime - animationPart.time);
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

  play(component) {
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
    component.forceUpdate();
  }

  pause() {
    if (!this.isPlaying) {
      return;
    }
    this.currentDelayStartingTime = Date.now();
    this.isPlaying = false;
  }

  reset() {
    this.isPlaying = false;
    this.startingTime = 0;
    this.delay = 0;
  }

  moveTo(timePoint) {
    // TODO
  }

  values(component) {
    if (!this.isPlaying) {
      return this.blocks;
    }
    var currentTimeInMS = Date.now() + this.delay - this.startingTime - this.currentDelayStartingTime;
    var newBlocks = {};
    var animationData = this.animationData;
    for (var i = 0, l = animationData.length; i < l; i++) {
      var animationPart = animationData[i];
      if (animationPart.name === 'easing') {
        continue;
      }
      if ((animationPart.time <= currentTimeInMS && animationPart.nextTime >= currentTimeInMS) ||
        animationPart.time === animationPart.nextTime && animationPart.time < currentTimeInMS
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
      if (i === l - 1 && currentTimeInMS >= animationPart.nextTime) {
        this.pause();
      }
    }

    this.blocks = assign({}, this.blocks, newBlocks);
    return this.blocks;
  }

}

Animation.create = (definition) => {
  var animationData = [];
  var oldBlocks = {};
  var timePoints = Object.keys(definition);
  for (var i = 0, l = timePoints.length; i < l; i++) {
    var timePoint = timePoints[i];
    var parsedTimePoint = parseInt(timePoint.split('ms')[0], 10);
    var blocks = Object.keys(definition[timePoint]);
    for (var j = 0, l2 = blocks.length; j < l2; j++) {
      var block = blocks[j];
      var properties = Object.keys(definition[timePoint][block]);
      for (var i2 = 0, l3 = properties.length; i2 < l3; i2++) {
        var propertyName = properties[i2];
        var easing = definition[timePoint][block].easing || 'linear';
        var value = definition[timePoint][block][propertyName];
        var oldBlock = oldBlocks[block];
        if (oldBlock) {
          var oldBlockVar = oldBlock[propertyName];
          if (oldBlockVar) {
            oldBlockVar.nextTime = parsedTimePoint;
            oldBlockVar.nextValue = value;
            oldBlockVar.nextEasing = easing;
          }
        }

        var obj = {
          time: parsedTimePoint,
          easing: easing,
          block: block,
          name: propertyName,
          nextTime: parsedTimePoint,
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

Animation.registerEasing = (name, func) => {
  EasingTypes[name] = func;
};

module.exports = Animation;
