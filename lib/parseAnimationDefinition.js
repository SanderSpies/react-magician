'use strict';

var timePointRegExp = /[0-9]+ms/; // good enough for now
var variableNameRegExp = /\w:/;

/**
 * Turns an animation definition into an array of objects
 *
 * @param animationDefinition
 * @returns {Array}
 */
function parseAnimationDefinition(animationDefinition) {
  var tokens = animationDefinition.split(/\s/);
  var depth = 0;
  var result = [];
  var currentTimePoint;
  var currentBlockName;
  var currentVariableName;
  var currentEasing;
  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];
    var timePoint = token.match(timePointRegExp);
    if (timePoint) {
      if (depth === 0) {
        currentTimePoint = timePoint[0];
      }
      else {
        // can only set time position at top level
      }
    }
    else if (token === '{') {
      depth++;

    }
    else if (token === '}') {
      if (depth === 1) {

      }
      if (depth === 2) {
        currentEasing = null;
        currentBlockName = null;
      }
      depth--;
    }
    else if (depth === 1) {
      if (!currentBlockName) {
        currentBlockName = token;
      } else {
        currentEasing = token;
      }
    }
    else if (depth === 2) {
      var variableName = token.match(variableNameRegExp);
      if (variableName) {
        currentVariableName = token.split(':')[0];
      }
      else if (token) {
        var value = '';
        for (var j = i, l2 = tokens.length; j < l2; j++) {
          var currentToken = tokens[j];
          if ((currentToken.length > 1 && currentToken[currentToken.length - 1] === ':') || currentToken === '}') {
            break;
          }
          else {
            value += ' ' + currentToken;
            i = j;
          }
        }
        result.push({
          time: currentTimePoint,
          easing: currentEasing || 'linear',
          block: currentBlockName,
          name: currentVariableName,
          value: isNaN(value) ? value.trim() : parseInt(value, 10)
        });
      }
    }
  }
  return result;
}

module.exports = parseAnimationDefinition;
