'use strict';

// TODO:
// - reduce creation of new objects
// - reduce loops
function getAnimationFrame(options) {
  var config = options.config;
  var currentTime = options.currentTime;
  var timePoints = config.timePoints;
  if (!this.blockNames) {
    this.blockNames = Object.keys(options.structure);
  }
  var blockNames = this.blockNames;
  var startProperties = {};
  var endProperties = {};
  var i, l, j, l2, i2, l3, blockName;
  for (i = 0, l = timePoints.length; i < l; i++) {
    var timePoint = timePoints[i];
    for (j = 0, l2 = blockNames.length; j < l2; j++) {
      blockName = blockNames[j];
      if (!startProperties[blockName]) {
        startProperties[blockName] = {};
        endProperties[blockName] = {};
      }
      var cssProperties = config[timePoint][blockName];
      if (!cssProperties) {
        continue;
      }
      var cssNames = Object.keys(cssProperties);
      for (i2 = 0, l3 = cssNames.length; i2 < l3; i2++) {
        var cssName = cssNames[i2];
        if (timePoint < currentTime) {
          startProperties[blockName][cssName] = {
            property: cssProperties[cssName],
            timepoint: timePoint
          };
        }
        else if (!endProperties[blockName][cssName]) {
          endProperties[blockName][cssName] = {
            property: cssProperties[cssName],
            timepoint: timePoint
          };
        }
      }
    }
  }

  for (i = 0, l = blockNames.length; i < l; i++) {
    blockName = blockNames[i];
    var startCSSProperties = startProperties[blockName];
    var endCSSProperties = endProperties[blockName];
    var cssPropNames = Object.keys(startCSSProperties);
    for (j = 0, l2 = cssPropNames.length; j < l2; j++) {
      var cssPropName = cssPropNames[j];
      var start = startCSSProperties[cssPropName];
      var end = endCSSProperties[cssPropName] || startCSSProperties[cssPropName];
      var duration = end.timepoint - start.timepoint;
      var currentTime = options.currentTime - start.timepoint;

      var easing = startCSSProperties.easing || EasingTypes.linear;

      options.structure[blockName][cssPropName] = easing(currentTime, start.property, end.property, duration);
    }
  }


  // loop through every block
  // calculate easing value between start + end properties
  // set structure values

}

module.exports = getAnimationFrame;
