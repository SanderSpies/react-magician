'use strict';

var React = require('react');
var parseAnimationDefinition = require('./parseAnimationDefinition');
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

function calculateValue(value, fn, component) { // [a-zA-Z0-9\(\)- :.]?
  if (typeof value !== 'string') {
    return value;
  }
  if (value === 'exec'){
    value = fn.call(component, React);
    return value;
  }
}

function parseValue(animationPart, currentTimeInMS, component) {
  var value = calculateValue(animationPart.value, animationPart.fn, component);
  var nextValue = calculateValue(animationPart.nextValue, animationPart.nextFn, component);
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
}

class Animation {

  constructor(animationData) {
    var _animationData = this.animationData = parseAnimationDefinition(animationData);
    this.isPlaying = false;
    this.startingTime = 0;
    this.currentDelayStartingTime = 0;
    this.delay = 0; // due to pausing
    var blocks = this.blocks = {};
    for (var i = 0, l = _animationData.length; i < l; i++) {
      var data = _animationData[i];
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
      var value;
      if ((animationPart.time < currentTimeInMS && animationPart.nextTime > currentTimeInMS) ||
        animationPart.time === animationPart.nextTime && animationPart.time < currentTimeInMS
      ) {
        if (!newBlocks[animationPart.block]) {
          newBlocks[animationPart.block] = {};
        }
        var block = newBlocks[animationPart.block];
        if (!block[animationPart.name]) {
          // only works for numbers now
          value = block[animationPart.name] = parseValue(animationPart, currentTimeInMS, component);
        }
      }
      if (currentTimeInMS >= animationPart.time && !animationPart.nextTime) {
        this.pause();
      }
    }

    this.blocks = assign({}, this.blocks, newBlocks);
    return this.blocks;
  }

}

module.exports = function(defArray, ...data) {
  var animationDefinition = [];
  for (var i = 0, l = defArray.length; i < l; i++) {
    animationDefinition.push(defArray[i]);
    if (i < defArray.length - 1) {
      animationDefinition.push(data[i]);
    }
  }
  return new Animation(animationDefinition.join(''));
};
