'use strict';

var parseAnimationDefinition = require('./parseAnimationDefinition');

class Animation {

  constructor(animationData) {
    this.animationData = parseAnimationDefinition(animationData);
    this.isPlaying = false;
  }

  play() {
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  reset() {

  }

  moveTo(timePoint) {

  }

  values() {
    // TODO: calculate positions here (re-use old code)
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
