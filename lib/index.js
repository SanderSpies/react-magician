'use strict';

var EasingTypes = require('./EasingTypes');
var assign = require('./assign');
var Gravitas = require('gravitas');
var Spring = Gravitas.Spring;
var GravityWithBounce = Gravitas.GravityWithBounce;
var React = require('react');
var isUnitlessNumber = require('react/lib/CSSProperty').isUnitlessNumber;


function clone(obj) {
  var keys = Object.keys(obj);
  var newObj = {};
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    var value = obj[key];
    if (Array.isArray(value)) {
      var newValue = {};
      for (var j = 0, l2 = value.length; j < l2; j++) {
        newValue[i] = clone(value[j]);
      }
      obj[key] = newValue;
    } else if (typeof value === 'object') {
      newObj[key] = clone(value);
    } else {
      newObj[key] = value;
    }
  }
  return newObj;
}

function calculateValue(value, component) {
  if (typeof value !== 'function') {
    return value;
  }
  return value.call(component);
}

var numbersRegExp = /[0-9]+/g;
function parseValue(animationPart, currentTimeInMS, component) {
  var value = calculateValue(animationPart.value, component);
  var nextValue = calculateValue(animationPart.next ? animationPart.next.value : animationPart.value, component);
  var type = animationPart.valueType;
  var nextType = animationPart.next ? animationPart.next.valueType : type;

  if (type === 'function') {
    animationPart.valueType = type = typeof value;
  }

  if (nextType === 'function') {
    animationPart.next.valueType = nextType = typeof nextValue;
  }

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
    // this should be moved to initialization time mostly instead
    var numbers = value.match(numbersRegExp);
    if (!numbers) {
      return value;
    }
    var nextNumbers = nextValue.match(numbersRegExp);
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
    var replace = value.replace(numbersRegExp, '{{}}');
    var isInteger = value.indexOf('rgb') > 0;
    for (var i = 0, l = numbers.length; i < l; i++) {
      replace = replace.replace('{{}}', isInteger && i < 3 ? calculatedNumbers[i] | 0 : calculatedNumbers[i]);
    }
    return replace;
  }
}

class Animation {

  constructor(animationData) {
    this.animationData = animationData;
    this.switch = 0;
    this.isBusy = false;
    this.isPlaying = false;
    this.cachedReactResult = null;
    this.currentTimeInMS = -1;
    this.startingTime = 0;
    this.currentDelayStartingTime = 0;
    this.delay = 0; // due to pausing
    this.speed = 1;
    var blockNames = this.blockNames = [];
    var blocks = this.blocks = {};
    for (var i = 0, l = animationData.length; i < l; i++) {
      var data = animationData[i];
      var blockName = data.block;
      var propName = data.name;
      if (!blocks[blockName]) {
        blocks[blockName] = {};
        blockNames.push(blockName);
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

  _getBlockObject() {

  }

  values(component) {
    if (!this.isPlaying) {
      return this.blocks;
    }
    if (this.resetIsPlaying !== undefined) {
      this.isPlaying = this.resetIsPlaying;
      this.resetIsPlaying = undefined;
    }
    var currentTimeInMS = this.currentTimeInMS = (Date.now() - this.delay - this.startingTime - this.currentDelayStartingTime) * this.speed;

    var newBlocks = this.blocks || {};
    var animationData = this.animationData;
    var isBusy = this.isBusy = false;
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
            // todo: remove the _ + part
            if (labelRegistration[animationPart.next.after + '_' + animationPart.name].easing.isDone()) {
              if (!animationPart.startMoment) {
                animationPart.unit = currentTimeInMS;
                animationPart.next.unit = currentTimeInMS + animationPart.next.unit;
                animationPart.startMoment = true;
              }
            }
          }
        }

        var block = newBlocks[animationPart.block];
        var value = parseValue(animationPart, currentTimeInMS, component);
        block[animationPart.name] = value;
      }
    }

    if (!isBusy) {
      this.pause();
    }

    return this.blocks;
  }

  render(self, callback) {
    var animationValues = this.values(self);
    if (self.previousState !== self.state || self.previousProps !== self.props) {
      self.previousState = self.state;
      self.previousProps = self.props;
      return this.cachedReactResult = callback.call(self, animationValues);
    }
    else {
      //console.log('no update so only animate now please:');
      var blockNames = this.blockNames;
      for (var i = 0, l = blockNames.length; i < l; i++) {
        var blockName = blockNames[i];
        var block = this.blocks[blockName];
        var domNode = React.findDOMNode(self.refs[blockName]);
        if (domNode) {
          var propertyNames = Object.keys(block);
          for (var j = 0, l2 = propertyNames.length; j < l2; j++) {
            var propertyName = propertyNames[j];
            var value = animationValues[blockName][propertyName];
            if (!isUnitlessNumber[propertyName] && typeof value === 'number') {
              domNode.style[propertyName] = '' + value + 'px';
            }
            else {
              domNode.style[propertyName] = '' + value;
            }
          }
        }
      }
      return this.cachedReactResult;
    }
  }

}

function validateAnimation (definition) {
  // TODO
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
  var allBlockProperties = {};
  var unitPoints = Object.keys(definition);
  for (var i = 0, l = unitPoints.length; i < l; i++) {
    var unitPoint = unitPoints[i];
    var [foo, unitValue, unitType] = unitPoint.match(/^([0-9]*)(ms|px)*/);
    var parsedUnitPoint = NaN; // hmmm...
    if (unitValue) {
      parsedUnitPoint = parseInt(unitValue, 10);
    }

    var label = null;
    var res;
    if (!unitValue) {
      res = unitPoint.match(/([a-z]+):/);
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
      var blockName = blockNames[j];
      if (!allBlockProperties[blockName]) {
        allBlockProperties[blockName] = {};
      }
      var block = definitionUnitPoint[blockName];
      var properties = Object.keys(block);
      for (var i2 = 0, l3 = properties.length; i2 < l3; i2++) {
        var propertyName = properties[i2];
        if (propertyName === 'easing') {
          continue;
        }
        var value = block[propertyName];
        var obj = {
          unit: parsedUnitPoint,
          type: unitType,
          easing: null,
          block: blockName,
          name: propertyName,
          next: null,
          previous: null,
          value: value,
          valueType: typeof value,
          label: label,
          after: after,
          startMoment: 0
        };
        allBlockProperties[blockName][propertyName] = value;

        var oldBlock = oldBlocks[blockName];
        if (oldBlock) {
          var oldBlockVar = oldBlock[propertyName];
          if (oldBlockVar) {
            oldBlockVar.next = obj;
            obj.previous = oldBlockVar;
            obj.easing = block.easing || EasingTypes.linear();
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
        if (!oldBlocks[blockName]) {
          oldBlocks[blockName] = {};
        }
        oldBlocks[blockName][propertyName] = obj;
      }
    }
  }


  return new Animation(animationData);
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
