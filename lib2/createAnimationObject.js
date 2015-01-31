'use strict';

// TODO: make it easier to loop over by turning it into an array instead
function createAnimationObject(config) {
  // create structure that will be re-used again and again and again and...
  var structure = {};
  var pointsInTime = Object.keys(config);
  for (var i = 0, l = pointsInTime.length; i < l; i++) {
    var pointInTime = pointsInTime[i];
    var configPointInTime = config[pointInTime];
    var blocks = Object.keys(configPointInTime);
    for (var j = 0, l2 = blocks.length; j < l2; j++) {
      var block = blocks[j];
      if (!structure[block]) {
        structure[block] = {};
      }

      var configPointInTimeBlock = configPointInTime[block];
      var properties = Object.keys(configPointInTimeBlock);
      for (var i2 = 0, l3 = properties.length; i2 < l3; i2++) {
        var propertyName = properties[i2];
        if (propertyName === 'easing') {
          continue;
        }
        if (!structure[block][propertyName]) {
          if (typeof configPointInTimeBlock[propertyName] === 'number') {
            structure[block][propertyName] = -1;
          }
          else {
            structure[block][propertyName] = null;
          }
        }
      }
    }
  }
  return structure;
}

module.exports = createAnimationObject;


/**
 * [
 *    {
 *       timepoint: ms,
 *       blocks: [
 *        {
 *          name: '',
 *          cssProperties: [
 *            {
 *              name: '',
 *              value: ''
 *            }
 *          ]
 *        }
 *       ]
 *    }
 *
 * ]
 *
 *
 */