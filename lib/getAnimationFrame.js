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
    var easing = startCSSProperties.easing ? eval('(' + startCSSProperties.easing.property + ')') : EasingTypes.linear;
    for (j = 0, l2 = cssPropNames.length; j < l2; j++) {
      var cssPropName = cssPropNames[j];
      var start = startCSSProperties[cssPropName];
      var end = endCSSProperties[cssPropName] || startCSSProperties[cssPropName];
      var duration = end.timepoint - start.timepoint;
      var currentTime2 = currentTime - start.timepoint;

      var startProperty = start.property;
      if (typeof startProperty === 'number' && cssPropName !== 'zIndex') {
        options.structure[blockName][cssPropName] = easing(currentTime2, startProperty, end.property, duration);
      }
      else if (typeof startProperty === 'string') {
        if (startProperty.match(/^[0-9]+%$/)) {
          options.structure[blockName][cssPropName] = easing(currentTime2,
                                                              parseInt(startProperty.replace('%',''), 10),
                                                              parseInt(end.property.replace('%',''), 10),
                                                              duration) + '%';
        }
        else if (startProperty.match(/(-?[.\d]+)px, (-?[.\d]+)px/)) {
          var matchStart = startProperty.match(/(-?[.\d]+)px, (-?[.\d]+)px/);
          var matchEnd = end.property.match(/(-?[.\d]+)px, (-?[.\d]+)px/);
          options.structure[blockName][cssPropName] = 'translate(' +
          easing(currentTime2,
            parseInt(matchStart[1], 10),
            parseInt(matchEnd[1], 10),
            duration) + 'px, ' + easing(currentTime2,
            parseInt(matchStart[2], 10),
            parseInt(matchEnd[2], 10),
            duration) + 'px)';
        }
        else {
          options.structure[blockName][cssPropName] = end.property;
        }

      }
      else {
        options.structure[blockName][cssPropName] = end.property;
      }

      if (currentTime >= end.timepoint) {
        options.structure[blockName][cssPropName] = end.property;
      }
    }
  }


  // loop through every block
  // calculate easing value between start + end properties
  // set structure values

}

module.exports = getAnimationFrame;
