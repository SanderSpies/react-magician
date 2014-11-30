'use strict';

function createWebWorker(strategyFunc, timing) {

  // TODO: improve this
  function animation() {
    var paused = true;
    var x = 0;
    var o = {
      transform: null
    };
    function loop() {
      o.transform = 'translateX(' + x++ + 'px)';
      postMessage(o);
      if (!paused) {
        setTimeout(loop, 60);
      }
    }


    addEventListener('message', function(m){
      if (m.data === 1 && paused) {
        paused = false;
        setTimeout(loop);
      }
      else if (m.data === 0) {
        paused = true;
      }
    })
  }

  var blob = new Blob([animation.toString()+ ';animation();'], {type: 'application/javascript'});
  var url = window.URL.createObjectURL(blob);
  var worker = new Worker(url);
  return worker;
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

class Animation {

  constructor(webworker) {
    this.animationFrameFunction = null;
    this.oldValues = null;
    this.values = null;
    this.webworker = webworker;
    var self = this;
    webworker.addEventListener('message', function(msg) {
      self.values = msg.data;
    });
  }

  play() {
    this.webworker.postMessage(1);
  }

  pause() {
    this.webworker.postMessage(0);
  }

  reverse() {
    this.webworker.postMessage(2);
  }

  onAnimationFrame(fn) {
    this.animationFrameFunction = fn;
    var self = this;
    requestAnimationFrame(function() {
      _callAnimationFrameIfUpdated.call(self)
    });
  }

}

function ReactAnimation(strategy, timing) {
  var webworker = createWebWorker();
  var animation = new Animation(webworker);
  return animation;
}

module.exports = ReactAnimation;