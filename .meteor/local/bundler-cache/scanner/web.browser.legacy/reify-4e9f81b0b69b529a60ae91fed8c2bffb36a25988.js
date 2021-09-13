'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.diff = diff;

var _deepDiff = require('deep-diff');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getProperty(object, path) {
  return _lodash2.default.get(object, path);
}

function getPropertyPath(changeDiff) {
  return pathToString(changeDiff.path);
}

function pathToString(path) {
  return path.join('.');
}

function isArrayIndexPath(path) {
  return _lodash2.default.isNumber(_lodash2.default.last(path));
}

function isPropertyRemove(change) {
  return change.diff.kind === 'D';
}

function isPropertyUpdate(change) {
  return (change.diff.kind === 'E' || change.diff.kind === 'N') && !isArrayIndexPath(change.diff.path);
}

function isArrayPush(change) {
  return change.diff.kind === 'A' && change.diff.item.kind === 'N';
}

function isArrayPull(change) {
  if (change.diff.kind === 'A' && change.diff.item.kind === 'D') {
    var array = getProperty(change.rhs, change.diff.path);
    if (!array || !_lodash2.default.includes(array, change.diff.item.lhs)) {
      return true;
    }
  }

  return false;
}

function isArrayUpdate(change) {
  return change.diff.kind === 'A' || (change.diff.kind === 'E' || change.diff.kind === 'N') && isArrayIndexPath(change.diff.path);
}

function setProperty(update, propertyPath, value) {
  if (!update.$set) {
    update.$set = {};
  }
  update.$set[propertyPath] = value;
}

function unsetProperty(update, propertyPath) {
  if (!update.$unset) {
    update.$unset = {};
  }
  update.$unset[propertyPath] = true;
}

function push(update, propertyPath, value) {
  if (!update.$push) {
    update.$push = {};
  }
  if (!update.$push[propertyPath]) {
    update.$push[propertyPath] = value;
  } else {
    if (update.$push[propertyPath].$each) {
      update.$push[propertyPath].$each.push(value);
    } else {
      update.$push[propertyPath] = {
        $each: [update.$push[propertyPath], value]
      };
    }
  }
}

function pull(update, propertyPath, value) {
  if (!update.$pull) {
    update.$pull = {};
  }
  if (!update.$pull[propertyPath]) {
    update.$pull[propertyPath] = value;
  } else {
    if (update.$pull[propertyPath].$in) {
      update.$pull[propertyPath].$in.push(value);
    } else {
      update.$pull[propertyPath] = {
        $in: [update.$pull[propertyPath], value]
      };
    }
  }
}

function createChangeHandler(check, updater) {
  return function changeHandler(update, change) {
    if (check(change)) {
      updater(update, change);
      return true;
    }
  };
}

function applyChangeHandlers(changeHandlers, update, change) {
  _lodash2.default.every(changeHandlers, function (changeHandler) {
    return !changeHandler(update, change);
  });
}

var changeHandlers = [createChangeHandler(isPropertyUpdate, function (update, change) {
  setProperty(update, getPropertyPath(change.diff), change.diff.rhs);
}), createChangeHandler(isPropertyRemove, function (update, change) {
  unsetProperty(update, getPropertyPath(change.diff));
}), createChangeHandler(isArrayPush, function (update, change) {
  if (!(update.$set && update.$set[getPropertyPath(change.diff)])) {
    push(update, getPropertyPath(change.diff), change.diff.item.rhs);
  }
}), createChangeHandler(isArrayPull, function (update, change) {
  pull(update, getPropertyPath(change.diff), change.diff.item.lhs);
}), createChangeHandler(isArrayUpdate, function (update, change) {
  var propertyPathAsArray = isArrayIndexPath(change.diff.path) ? change.diff.path.slice(0, -1) : change.diff.path;
  var propertyPath = pathToString(propertyPathAsArray);
  setProperty(update, propertyPath, getProperty(change.rhs, propertyPathAsArray));
}), createChangeHandler(function () {
  return true;
}, function (update, change) {
  throw new Error('Unhandled change: ' + (0, _stringify2.default)(change));
})];

var applyTheChangeHandlers = _lodash2.default.partial(applyChangeHandlers, changeHandlers);

function diff(lhs, rhs) {
  var theDiff = (0, _deepDiff.diff)(lhs, rhs);
  return _lodash2.default.reduce(theDiff, function (update, changeDiff) {
    applyTheChangeHandlers(update, { lhs: lhs, rhs: rhs, diff: changeDiff });
    return update;
  }, {});
}