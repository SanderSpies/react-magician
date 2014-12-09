'use strict';

var createAnimationWorker = require('./createAnimationWorker');
var EasingTypes = require('./EasingTypes');

class Animation {

  constructor(webworker) {
    this.animationFrameFunction = null;
    this.oldValues = null;
    this.values = {};
    this.animationWorker = webworker;
    var self = this;
    webworker.addEventListener('message', function(msg) {
      self.values = msg.data;
    });
  }

  moveTo(time) {
    // TODO
  }

  play() {
    this.animationWorker.postMessage(1);
  }

  pause() {
    this.animationWorker.postMessage(0);
  }

  reverse() {
    // TODO
    this.animationWorker.postMessage(2);
  }

  setSpeed(n) {
    // TODO
  }

  onAnimationFrame(fn) {
    this.animationFrameFunction = fn;
    var self = this;
    requestAnimationFrame(function() {
      _callAnimationFrameIfUpdated.call(self)
    });
  }

}

function _callAnimationFrameIfUpdated() {
  if (this.values !== this.oldValues) {
    this.oldValues = this.values;
    this.animationFrameFunction.call();
  }
  var self = this;
  requestAnimationFrame(function() {
    _callAnimationFrameIfUpdated.call(self);
  });
}

function inlineEasings(config){
  var timePoints = Object.keys(config);
  for (var i = 0, l = timePoints.length; i < l; i++) {
    var timePoint = timePoints[i];
    var blocks = Object.keys(config[timePoint]);
    for (var j = 0, l2 = blocks.length; j < l2; j++) {
      var block = blocks[j];
      if (config[timePoint][block].easing) {
        config[timePoint][block].easing = config[timePoint][block].easing.toString();
      }
    }
  }
}

function ReactAnimation(config) {
  inlineEasings(config);

  var animationWorker = createAnimationWorker(config);
  var animation = new Animation(animationWorker);
  return animation;
}

ReactAnimation.EasingTypes = EasingTypes;

module.exports = ReactAnimation;