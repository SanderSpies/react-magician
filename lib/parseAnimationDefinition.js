
var timePointRegExp = /[0-9]+ms/; // good enough for now
var variableNameRegExp = /\w:/;

var oldBlocks = {};

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
        var _value = '';
        for (var j = i, l2 = tokens.length; j < l2; j++) {
          var currentToken = tokens[j];
          if ((currentToken.length > 1 && currentToken[currentToken.length - 1] === ':') || currentToken === '}') {
            break;
          }
          else {
            _value += ' ' + currentToken;
            i = j;
          }
        }
        var time = parseInt(currentTimePoint.split('ms')[0], 10); // should always be in ms (todo: sec, min, other forms?!)
        var value = isNaN(_value) ? _value.trim() : parseInt(_value, 10);
        var easing = currentEasing || 'linear';
        var fn = null;
        console.log('testing:', value)
        if (typeof value === 'string' && value.match(/exec\('[A-Za-z0-9.()\-:|+ ]*'\)/)) {
          console.log('\tisFn');
          fn = new Function('React', 'return  ' + value.substr('exec(\''.length, value.length - 'exec(\''.length - 2));
          value = 'exec';
        }
        var oldBlock = oldBlocks[currentBlockName];
        if (oldBlock) {
          var oldBlockVar = oldBlock[currentVariableName];
          if (oldBlockVar) {
            oldBlockVar.nextTime = time;
            oldBlockVar.nextValue = value;
            oldBlockVar.nextEasing = easing;
            oldBlockVar.nextFn = fn;
          }
        }


        var obj = {
          time: time,
          easing: easing,
          block: currentBlockName,
          name: currentVariableName,
          nextTime: time,
          value: value,
          nextValue: value,
          nextEasing: easing,
          fn: fn,
          nextFn: fn
        };
        result.push(obj);

        if (!oldBlocks[currentBlockName]) {
          oldBlocks[currentBlockName] = {};
        }
        oldBlocks[currentBlockName][currentVariableName] = obj;
      }
    }
  }
  return result;
}

module.exports = parseAnimationDefinition;
