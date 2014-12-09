'use strict';

var createAnimationObject = require('./createAnimationObject');
var getAnimationFrame = require('./getAnimationFrame');
var EasingTypes = require('./EasingTypes');

function createAnimationWorker(config) {

  function getEndTime(config) {
    var timePoints = config.timePoints;
    return timePoints[timePoints.length - 1];
  }

  function convertToMS(str) {
    if (str.match(/^[0-9]+ms$/)) {
      return parseInt(str.substr(0, str.length - 2), 10);
    }
    else if (str.match(/^[0-9]+s$/)) {
      return parseInt(str.substr(0, str.length - 1), 10) * 1000;
    }
    else {
      console.warn('Unknown time format:', str);
    }
  }

  function animation(config) {
    var structure = createAnimationObject(config);
    var timePoints = Object.keys(config);
    var convertedTimePoints = [];
    var newConfig = {};
    for (var i = 0, l = timePoints.length; i < l; i++) {
      convertedTimePoints[i] = convertToMS(timePoints[i]);
      newConfig[convertedTimePoints[i]] = config[timePoints[i]];
    }
    newConfig.timePoints = convertedTimePoints;

    var duration = getEndTime(newConfig);

    var paused = true;
    var x = 0;
    var a = {};
    var startTime;
    var currentTime = 0;


    function loop() {
      currentTime = new Date().getTime() - startTime.getTime();

      getAnimationFrame({
        structure: structure,
        currentTime: currentTime,
        duration: duration,
        config: newConfig
      });

      postMessage({value:structure, type: 0});
      if (!paused && currentTime <= duration) {
        setTimeout(loop, 1000 / 60);
      }
    }

    addEventListener('message', function(m) {
      if (m.data === 1 && paused) {
        startTime = new Date();
        paused = false;
        setTimeout(loop);
      }
      else if (m.data === 0) {
        paused = true;
      }
    })
  }

  // TODO: inline easing functions so they can be transfered to the webworker

  var webworkerCode = 'var EasingTypes = ' + EasingTypes.toString() + '();\n' +
                      'var createAnimationObject = ' + createAnimationObject.toString() + ';\n' +
                      'var getAnimationFrame = ' + getAnimationFrame.toString() + ';\n' +
                      'var getEndTime = ' + getEndTime.toString() + ';\n' +
                      'var convertToMS = ' + convertToMS.toString() + ';\n' +
                       animation.toString() + ';\n ' +
                      'animation(' + JSON.stringify(config) + ');\n';
  var blob = new Blob([webworkerCode], {type: 'application/javascript'});
  var url = window.URL.createObjectURL(blob);
  var worker = new Worker(url);
  return worker;
}

module.exports = createAnimationWorker;