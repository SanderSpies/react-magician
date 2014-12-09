// no 'use strict';

var createAnimationWorker = require('./createAnimationWorker');
var EasingTypes = require('./EasingTypes');
var DOMOperation = require('./DOMOperation');

class Animation {

  constructor(webworker) {
    this.animationFrameFunction = null;
    this.oldValues = null;
    this.refs = null;
    this.values = {};
    this.animationWorker = webworker;
    var self = this;
    webworker.addEventListener('message', function(msg) {
      var data = msg.data;
      if (data.type === 0) {
        self.values = msg.data.value;
      }
      else if (data.type === 1) {
        // execute locally
        var func = eval('(' + msg.data.func + ')');
        console.log('func:', func);
        // get result
        // post to webworker
        //webworker.postMessage();
      }
    });
  }

  moveTo(time) {
    // TODO
  }

  play(opt) {
    if (opt) {
      this.refs = opt.refs;
    }
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

function inlineFunctions(config){
  var timePoints = Object.keys(config);
  for (var i = 0, l = timePoints.length; i < l; i++) {
    var timePoint = timePoints[i];
    var blocks = Object.keys(config[timePoint]);
    for (var j = 0, l2 = blocks.length; j < l2; j++) {
      var block = blocks[j];
      var cssProperties = Object.keys(config[timePoint][block]);
      for (var i2, l3 = cssProperties.length; i2 < l3; i2++) {
        var cssProperty = cssProperties[i];
        if (typeof (config[timePoint][block][cssProperty]) === 'function') {
          config[timePoint][block][cssProperty] = config[timePoint][block][cssProperty].toString();
        }
      }
    }
  }
}

function ReactAnimation(config) {
  inlineFunctions(config);
  var animationWorker = createAnimationWorker(config);
  var animation = new Animation(animationWorker);
  return animation;
}

ReactAnimation.EasingTypes = EasingTypes;
ReactAnimation.DOMOperation = DOMOperation;

module.exports = ReactAnimation;