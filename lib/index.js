'use strict';

var createAnimationWorker = require('./createAnimationWorker');

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

function ReactAnimation(config) {
  var animationWorker = createAnimationWorker(config);
  var animation = new Animation(animationWorker);
  return animation;
}

module.exports = ReactAnimation;