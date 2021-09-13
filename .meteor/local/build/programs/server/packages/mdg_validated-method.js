(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var check = Package.check.check;
var Match = Package.check.Match;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var options, callback, args, ValidatedMethod;

var require = meteorInstall({"node_modules":{"meteor":{"mdg:validated-method":{"validated-method.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/mdg_validated-method/validated-method.js                                                            //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
module.export({
  ValidatedMethod: () => ValidatedMethod
});
let check, Match;
module.link("meteor/check", {
  check(v) {
    check = v;
  },

  Match(v) {
    Match = v;
  }

}, 0);

class ValidatedMethod {
  constructor(options) {
    // Default to no mixins
    options.mixins = options.mixins || [];
    check(options.mixins, [Function]);
    check(options.name, String);
    options = applyMixins(options, options.mixins); // connection argument defaults to Meteor, which is where Methods are defined on client and
    // server

    options.connection = options.connection || Meteor; // Allow validate: null shorthand for methods that take no arguments

    if (options.validate === null) {
      options.validate = function () {};
    } // If this is null/undefined, make it an empty object


    options.applyOptions = options.applyOptions || {};
    check(options, Match.ObjectIncluding({
      name: String,
      validate: Function,
      run: Function,
      mixins: [Function],
      connection: Object,
      applyOptions: Object
    })); // Default options passed to Meteor.apply, can be overridden with applyOptions

    const defaultApplyOptions = {
      // Make it possible to get the ID of an inserted item
      returnStubValue: true,
      // Don't call the server method if the client stub throws an error, so that we don't end
      // up doing validations twice
      throwStubExceptions: true
    };
    options.applyOptions = _objectSpread(_objectSpread({}, defaultApplyOptions), options.applyOptions); // Attach all options to the ValidatedMethod instance

    Object.assign(this, options);
    const method = this;
    this.connection.methods({
      [options.name](args) {
        // Silence audit-argument-checks since arguments are always checked when using this package
        check(args, Match.Any);
        const methodInvocation = this;
        return method._execute(methodInvocation, args);
      }

    });
  }

  call(args, callback) {
    // Accept calling with just a callback
    if (typeof args === 'function') {
      callback = args;
      args = {};
    }

    try {
      return this.connection.apply(this.name, [args], this.applyOptions, callback);
    } catch (err) {
      if (callback) {
        // Get errors from the stub in the same way as from the server-side method
        callback(err);
      } else {
        // No callback passed, throw instead of silently failing; this is what
        // "normal" Methods do if you don't pass a callback.
        throw err;
      }
    }
  }

  _execute() {
    let methodInvocation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    let args = arguments.length > 1 ? arguments[1] : undefined;
    // Add `this.name` to reference the Method name
    methodInvocation.name = this.name;
    const validateResult = this.validate.bind(methodInvocation)(args);

    if (typeof validateResult !== 'undefined') {
      throw new Error("Returning from validate doesn't do anything; perhaps you meant to throw an error?");
    }

    return this.run.bind(methodInvocation)(args);
  }

}

; // Mixins get a chance to transform the arguments before they are passed to the actual Method

function applyMixins(args, mixins) {
  // Save name of the method here, so we can attach it to potential error messages
  const {
    name
  } = args;
  mixins.forEach(mixin => {
    args = mixin(args);

    if (!Match.test(args, Object)) {
      const functionName = mixin.toString().match(/function\s(\w+)/);
      let msg = 'One of the mixins';

      if (functionName) {
        msg = "The function '".concat(functionName[1], "'");
      }

      throw new Error("Error in ".concat(name, " method: ").concat(msg, " didn't return the options object."));
    }
  });
  return args;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/mdg:validated-method/validated-method.js");

/* Exports */
Package._define("mdg:validated-method", exports, {
  ValidatedMethod: ValidatedMethod
});

})();

//# sourceURL=meteor://💻app/packages/mdg_validated-method.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWRnOnZhbGlkYXRlZC1tZXRob2QvdmFsaWRhdGVkLW1ldGhvZC5qcyJdLCJuYW1lcyI6WyJfb2JqZWN0U3ByZWFkIiwibW9kdWxlIiwibGluayIsImRlZmF1bHQiLCJ2IiwiZXhwb3J0IiwiVmFsaWRhdGVkTWV0aG9kIiwiY2hlY2siLCJNYXRjaCIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsIm1peGlucyIsIkZ1bmN0aW9uIiwibmFtZSIsIlN0cmluZyIsImFwcGx5TWl4aW5zIiwiY29ubmVjdGlvbiIsIk1ldGVvciIsInZhbGlkYXRlIiwiYXBwbHlPcHRpb25zIiwiT2JqZWN0SW5jbHVkaW5nIiwicnVuIiwiT2JqZWN0IiwiZGVmYXVsdEFwcGx5T3B0aW9ucyIsInJldHVyblN0dWJWYWx1ZSIsInRocm93U3R1YkV4Y2VwdGlvbnMiLCJhc3NpZ24iLCJtZXRob2QiLCJtZXRob2RzIiwiYXJncyIsIkFueSIsIm1ldGhvZEludm9jYXRpb24iLCJfZXhlY3V0ZSIsImNhbGwiLCJjYWxsYmFjayIsImFwcGx5IiwiZXJyIiwidmFsaWRhdGVSZXN1bHQiLCJiaW5kIiwiRXJyb3IiLCJmb3JFYWNoIiwibWl4aW4iLCJ0ZXN0IiwiZnVuY3Rpb25OYW1lIiwidG9TdHJpbmciLCJtYXRjaCIsIm1zZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQUlBLGFBQUo7O0FBQWtCQyxNQUFNLENBQUNDLElBQVAsQ0FBWSxzQ0FBWixFQUFtRDtBQUFDQyxTQUFPLENBQUNDLENBQUQsRUFBRztBQUFDSixpQkFBYSxHQUFDSSxDQUFkO0FBQWdCOztBQUE1QixDQUFuRCxFQUFpRixDQUFqRjtBQUFsQkgsTUFBTSxDQUFDSSxNQUFQLENBQWM7QUFBQ0MsaUJBQWUsRUFBQyxNQUFJQTtBQUFyQixDQUFkO0FBQXFELElBQUlDLEtBQUosRUFBVUMsS0FBVjtBQUFnQlAsTUFBTSxDQUFDQyxJQUFQLENB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L3BhY2thZ2VzL21kZ192YWxpZGF0ZWQtbWV0aG9kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY2hlY2ssIE1hdGNoIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcblxuZXhwb3J0IGNsYXNzIFZhbGlkYXRlZE1ldGhvZCB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAvLyBEZWZhdWx0IHRvIG5vIG1peGluc1xuICAgIG9wdGlvbnMubWl4aW5zID0gb3B0aW9ucy5taXhpbnMgfHwgW107XG4gICAgY2hlY2sob3B0aW9ucy5taXhpbnMsIFtGdW5jdGlvbl0pO1xuICAgIGNoZWNrKG9wdGlvbnMubmFtZSwgU3RyaW5nKTtcbiAgICBvcHRpb25zID0gYXBwbHlNaXhpbnMob3B0aW9ucywgb3B0aW9ucy5taXhpbnMpO1xuXG4gICAgLy8gY29ubmVjdGlvbiBhcmd1bWVudCBkZWZhdWx0cyB0byBNZXRlb3IsIHdoaWNoIGlzIHdoZXJlIE1ldGhvZHMgYXJlIGRlZmluZWQgb24gY2xpZW50IGFuZFxuICAgIC8vIHNlcnZlclxuICAgIG9wdGlvbnMuY29ubmVjdGlvbiA9IG9wdGlvbnMuY29ubmVjdGlvbiB8fCBNZXRlb3I7XG5cbiAgICAvLyBBbGxvdyB2YWxpZGF0ZTogbnVsbCBzaG9ydGhhbmQgZm9yIG1ldGhvZHMgdGhhdCB0YWtlIG5vIGFyZ3VtZW50c1xuICAgIGlmIChvcHRpb25zLnZhbGlkYXRlID09PSBudWxsKSB7XG4gICAgICBvcHRpb25zLnZhbGlkYXRlID0gZnVuY3Rpb24gKCkge307XG4gICAgfVxuXG4gICAgLy8gSWYgdGhpcyBpcyBudWxsL3VuZGVmaW5lZCwgbWFrZSBpdCBhbiBlbXB0eSBvYmplY3RcbiAgICBvcHRpb25zLmFwcGx5T3B0aW9ucyA9IG9wdGlvbnMuYXBwbHlPcHRpb25zIHx8IHt9O1xuXG4gICAgY2hlY2sob3B0aW9ucywgTWF0Y2guT2JqZWN0SW5jbHVkaW5nKHtcbiAgICAgIG5hbWU6IFN0cmluZyxcbiAgICAgIHZhbGlkYXRlOiBGdW5jdGlvbixcbiAgICAgIHJ1bjogRnVuY3Rpb24sXG4gICAgICBtaXhpbnM6IFtGdW5jdGlvbl0sXG4gICAgICBjb25uZWN0aW9uOiBPYmplY3QsXG4gICAgICBhcHBseU9wdGlvbnM6IE9iamVjdCxcbiAgICB9KSk7XG5cbiAgICAvLyBEZWZhdWx0IG9wdGlvbnMgcGFzc2VkIHRvIE1ldGVvci5hcHBseSwgY2FuIGJlIG92ZXJyaWRkZW4gd2l0aCBhcHBseU9wdGlvbnNcbiAgICBjb25zdCBkZWZhdWx0QXBwbHlPcHRpb25zID0ge1xuICAgICAgLy8gTWFrZSBpdCBwb3NzaWJsZSB0byBnZXQgdGhlIElEIG9mIGFuIGluc2VydGVkIGl0ZW1cbiAgICAgIHJldHVyblN0dWJWYWx1ZTogdHJ1ZSxcblxuICAgICAgLy8gRG9uJ3QgY2FsbCB0aGUgc2VydmVyIG1ldGhvZCBpZiB0aGUgY2xpZW50IHN0dWIgdGhyb3dzIGFuIGVycm9yLCBzbyB0aGF0IHdlIGRvbid0IGVuZFxuICAgICAgLy8gdXAgZG9pbmcgdmFsaWRhdGlvbnMgdHdpY2VcbiAgICAgIHRocm93U3R1YkV4Y2VwdGlvbnM6IHRydWUsXG4gICAgfTtcblxuICAgIG9wdGlvbnMuYXBwbHlPcHRpb25zID0ge1xuICAgICAgLi4uZGVmYXVsdEFwcGx5T3B0aW9ucyxcbiAgICAgIC4uLm9wdGlvbnMuYXBwbHlPcHRpb25zXG4gICAgfTtcblxuICAgIC8vIEF0dGFjaCBhbGwgb3B0aW9ucyB0byB0aGUgVmFsaWRhdGVkTWV0aG9kIGluc3RhbmNlXG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCBvcHRpb25zKTtcblxuICAgIGNvbnN0IG1ldGhvZCA9IHRoaXM7XG4gICAgdGhpcy5jb25uZWN0aW9uLm1ldGhvZHMoe1xuICAgICAgW29wdGlvbnMubmFtZV0oYXJncykge1xuICAgICAgICAvLyBTaWxlbmNlIGF1ZGl0LWFyZ3VtZW50LWNoZWNrcyBzaW5jZSBhcmd1bWVudHMgYXJlIGFsd2F5cyBjaGVja2VkIHdoZW4gdXNpbmcgdGhpcyBwYWNrYWdlXG4gICAgICAgIGNoZWNrKGFyZ3MsIE1hdGNoLkFueSk7XG4gICAgICAgIGNvbnN0IG1ldGhvZEludm9jYXRpb24gPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBtZXRob2QuX2V4ZWN1dGUobWV0aG9kSW52b2NhdGlvbiwgYXJncyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjYWxsKGFyZ3MsIGNhbGxiYWNrKSB7XG4gICAgLy8gQWNjZXB0IGNhbGxpbmcgd2l0aCBqdXN0IGEgY2FsbGJhY2tcbiAgICBpZiAoIHR5cGVvZiBhcmdzID09PSAnZnVuY3Rpb24nICkge1xuICAgICAgY2FsbGJhY2sgPSBhcmdzO1xuICAgICAgYXJncyA9IHt9O1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uLmFwcGx5KHRoaXMubmFtZSwgW2FyZ3NdLCB0aGlzLmFwcGx5T3B0aW9ucywgY2FsbGJhY2spO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIEdldCBlcnJvcnMgZnJvbSB0aGUgc3R1YiBpbiB0aGUgc2FtZSB3YXkgYXMgZnJvbSB0aGUgc2VydmVyLXNpZGUgbWV0aG9kXG4gICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBObyBjYWxsYmFjayBwYXNzZWQsIHRocm93IGluc3RlYWQgb2Ygc2lsZW50bHkgZmFpbGluZzsgdGhpcyBpcyB3aGF0XG4gICAgICAgIC8vIFwibm9ybWFsXCIgTWV0aG9kcyBkbyBpZiB5b3UgZG9uJ3QgcGFzcyBhIGNhbGxiYWNrLlxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2V4ZWN1dGUobWV0aG9kSW52b2NhdGlvbiA9IHt9LCBhcmdzKSB7XG4gICAgLy8gQWRkIGB0aGlzLm5hbWVgIHRvIHJlZmVyZW5jZSB0aGUgTWV0aG9kIG5hbWVcbiAgICBtZXRob2RJbnZvY2F0aW9uLm5hbWUgPSB0aGlzLm5hbWU7XG5cbiAgICBjb25zdCB2YWxpZGF0ZVJlc3VsdCA9IHRoaXMudmFsaWRhdGUuYmluZChtZXRob2RJbnZvY2F0aW9uKShhcmdzKTtcblxuICAgIGlmICh0eXBlb2YgdmFsaWRhdGVSZXN1bHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFJldHVybmluZyBmcm9tIHZhbGlkYXRlIGRvZXNuJ3QgZG8gYW55dGhpbmc7IFxcXG5wZXJoYXBzIHlvdSBtZWFudCB0byB0aHJvdyBhbiBlcnJvcj9gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5ydW4uYmluZChtZXRob2RJbnZvY2F0aW9uKShhcmdzKTtcbiAgfVxufTtcblxuLy8gTWl4aW5zIGdldCBhIGNoYW5jZSB0byB0cmFuc2Zvcm0gdGhlIGFyZ3VtZW50cyBiZWZvcmUgdGhleSBhcmUgcGFzc2VkIHRvIHRoZSBhY3R1YWwgTWV0aG9kXG5mdW5jdGlvbiBhcHBseU1peGlucyhhcmdzLCBtaXhpbnMpIHtcbiAgLy8gU2F2ZSBuYW1lIG9mIHRoZSBtZXRob2QgaGVyZSwgc28gd2UgY2FuIGF0dGFjaCBpdCB0byBwb3RlbnRpYWwgZXJyb3IgbWVzc2FnZXNcbiAgY29uc3QgeyBuYW1lIH0gPSBhcmdzO1xuXG4gIG1peGlucy5mb3JFYWNoKChtaXhpbikgPT4ge1xuICAgIGFyZ3MgPSBtaXhpbihhcmdzKTtcblxuICAgIGlmKCFNYXRjaC50ZXN0KGFyZ3MsIE9iamVjdCkpIHtcbiAgICAgIGNvbnN0IGZ1bmN0aW9uTmFtZSA9IG1peGluLnRvU3RyaW5nKCkubWF0Y2goL2Z1bmN0aW9uXFxzKFxcdyspLyk7XG4gICAgICBsZXQgbXNnID0gJ09uZSBvZiB0aGUgbWl4aW5zJztcblxuICAgICAgaWYoZnVuY3Rpb25OYW1lKSB7XG4gICAgICAgIG1zZyA9IGBUaGUgZnVuY3Rpb24gJyR7ZnVuY3Rpb25OYW1lWzFdfSdgO1xuICAgICAgfVxuXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIGluICR7bmFtZX0gbWV0aG9kOiAke21zZ30gZGlkbid0IHJldHVybiB0aGUgb3B0aW9ucyBvYmplY3QuYCk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gYXJncztcbn1cbiJdfQ==
