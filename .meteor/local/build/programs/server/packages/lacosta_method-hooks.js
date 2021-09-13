(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var check = Package.check.check;
var Match = Package.check.Match;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var MethodHooks;

var require = meteorInstall({"node_modules":{"meteor":{"lacosta:method-hooks":{"src":{"method-hooks-mixin.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                     //
// packages/lacosta_method-hooks/src/method-hooks-mixin.js                             //
//                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////
                                                                                       //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);

MethodHooks = function (options) {
  const {
    ObjectIncluding,
    Optional
  } = Match;
  check(options, ObjectIncluding({
    name: String,
    beforeHooks: Optional([Function]),
    afterHooks: Optional([Function]),
    run: Function
  }));
  const {
    beforeHooks = [],
    afterHooks = [],
    run
  } = options; // remove hooks to avoid sending hooks to themselves
  // remove run function to avoid sending hooks overridden #run

  delete options.beforeHooks;
  delete options.afterHooks;
  delete options.run;

  const finalOptions = _objectSpread(_objectSpread({}, options), {}, {
    run(args) {
      const finalArgs = beforeHooks.reduce((modifiedArgs, hook) => {
        return hook.call(this, modifiedArgs, _objectSpread({}, options));
      }, args);
      const result = run.call(this, finalArgs);
      const finalResult = afterHooks.reduce((modifiedResult, hook) => {
        return hook.call(this, finalArgs, modifiedResult, _objectSpread({}, options));
      }, result);
      return finalResult;
    }

  });

  return finalOptions;
};
/////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/lacosta:method-hooks/src/method-hooks-mixin.js");

/* Exports */
Package._define("lacosta:method-hooks", {
  MethodHooks: MethodHooks
});

})();

//# sourceURL=meteor://💻app/packages/lacosta_method-hooks.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbGFjb3N0YTptZXRob2QtaG9va3Mvc3JjL21ldGhvZC1ob29rcy1taXhpbi5qcyJdLCJuYW1lcyI6WyJfb2JqZWN0U3ByZWFkIiwibW9kdWxlIiwibGluayIsImRlZmF1bHQiLCJ2IiwiTWV0aG9kSG9va3MiLCJvcHRpb25zIiwiT2JqZWN0SW5jbHVkaW5nIiwiT3B0aW9uYWwiLCJNYXRjaCIsImNoZWNrIiwibmFtZSIsIlN0cmluZyIsImJlZm9yZUhvb2tzIiwiRnVuY3Rpb24iLCJhZnRlckhvb2tzIiwicnVuIiwiZmluYWxPcHRpb25zIiwiYXJncyIsImZpbmFsQXJncyIsInJlZHVjZSIsIm1vZGlmaWVkQXJncyIsImhvb2siLCJjYWxsIiwicmVzdWx0IiwiZmluYWxSZXN1bHQiLCJtb2RpZmllZFJlc3VsdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFJQSxhQUFKOztBQUFrQkMsTUFBTSxDQUFDQyxJQUFQLENBQVksc0NBQVosRUFBbUQ7QUFBQ0MsU0FBTyxDQUFDQyxDQUFELEVBQUc7QUFBQ0osaUJBQWEsR0FBQ0ksQ0FBZDtBQUFnQjs7QUFBNUIsQ0FBbkQsRUFBaUYsQ0FBakY7O0FBQWxCQyxXQUFXLEdBQUcsVUFBU0MsT0FBVCxFQUFpQjtBQUM3QixRQUFNO0FBQUNDLG1CQUFEO0FBQWtCQztBQUFsQixNQUE4QkMsS0FBcEM7QUFFQUMsT0FBSyxDQUFDSixPQUFELEVBQVVDLGVBQWUsQ0FBQztBQUM3QkksUUFBSSxFQUFFQyxNQUR1QjtBQUU3QkMsZUFBVyxFQUFFTCxRQUFRLENBQUMsQ0FBQ00sUUFBRCxDQUFELENBRlE7QUFHN0JDLGNBQVUsRUFBRVAsUUFBUSxDQUFDLENBQUNNLFFBQUQsQ0FBRCxDQUhTO0FBSTdCRSxPQUFHLEVBQUVGO0FBSndCLEdBQUQsQ0FBekIsQ0FBTDtBQU9BLFFBQU07QUFBQ0QsZUFBVyxHQUFHLEVBQWY7QUFBbUJFLGNBQVUsR0FBRyxFQUFoQztBQUFvQ0M7QUFBcEMsTUFBMkNWLE9BQWpELENBVjZCLENBWTNCO0FBQ0E7O0FBQ0YsU0FBT0EsT0FBTyxDQUFDTyxXQUFmO0FBQ0EsU0FBT1AsT0FBTyxDQUFDUyxVQUFmO0FBQ0EsU0FBT1QsT0FBTyxDQUFDVSxHQUFmOztBQUVBLFFBQU1DLFlBQVksbUNBQU9YLE9BQVA7QUFBZ0JVLE9BQUcsQ0FBRUUsSUFBRixFQUFPO0FBQzFDLFlBQU1DLFNBQVMsR0FBR04sV0FBVyxDQUFDTyxNQUFaLENBQW1CLENBQUNDLFlBQUQsRUFBZUMsSUFBZixLQUF3QjtBQUMzRCxlQUFPQSxJQUFJLENBQUNDLElBQUwsQ0FBVSxJQUFWLEVBQWdCRixZQUFoQixvQkFBa0NmLE9BQWxDLEVBQVA7QUFDRCxPQUZpQixFQUVmWSxJQUZlLENBQWxCO0FBSUEsWUFBTU0sTUFBTSxHQUFHUixHQUFHLENBQUNPLElBQUosQ0FBUyxJQUFULEVBQWVKLFNBQWYsQ0FBZjtBQUVBLFlBQU1NLFdBQVcsR0FBR1YsVUFBVSxDQUFDSyxNQUFYLENBQWtCLENBQUNNLGNBQUQsRUFBaUJKLElBQWpCLEtBQTBCO0FBQzlELGVBQU9BLElBQUksQ0FBQ0MsSUFBTCxDQUFVLElBQVYsRUFBZ0JKLFNBQWhCLEVBQTJCTyxjQUEzQixvQkFBK0NwQixPQUEvQyxFQUFQO0FBQ0QsT0FGbUIsRUFFakJrQixNQUZpQixDQUFwQjtBQUlBLGFBQU9DLFdBQVA7QUFDRDs7QUFaaUIsSUFBbEI7O0FBY0EsU0FBT1IsWUFBUDtBQUNELENBakNELEMiLCJmaWxlIjoiL3BhY2thZ2VzL2xhY29zdGFfbWV0aG9kLWhvb2tzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiTWV0aG9kSG9va3MgPSBmdW5jdGlvbihvcHRpb25zKXtcbiAgY29uc3Qge09iamVjdEluY2x1ZGluZywgT3B0aW9uYWx9ID0gTWF0Y2hcblxuICBjaGVjayhvcHRpb25zLCBPYmplY3RJbmNsdWRpbmcoe1xuICAgIG5hbWU6IFN0cmluZyxcbiAgICBiZWZvcmVIb29rczogT3B0aW9uYWwoW0Z1bmN0aW9uXSksXG4gICAgYWZ0ZXJIb29rczogT3B0aW9uYWwoW0Z1bmN0aW9uXSksXG4gICAgcnVuOiBGdW5jdGlvblxuICB9KSlcblxuICBjb25zdCB7YmVmb3JlSG9va3MgPSBbXSwgYWZ0ZXJIb29rcyA9IFtdLCBydW59ID0gb3B0aW9uc1xuXG4gICAgLy8gcmVtb3ZlIGhvb2tzIHRvIGF2b2lkIHNlbmRpbmcgaG9va3MgdG8gdGhlbXNlbHZlc1xuICAgIC8vIHJlbW92ZSBydW4gZnVuY3Rpb24gdG8gYXZvaWQgc2VuZGluZyBob29rcyBvdmVycmlkZGVuICNydW5cbiAgZGVsZXRlIG9wdGlvbnMuYmVmb3JlSG9va3NcbiAgZGVsZXRlIG9wdGlvbnMuYWZ0ZXJIb29rc1xuICBkZWxldGUgb3B0aW9ucy5ydW5cblxuICBjb25zdCBmaW5hbE9wdGlvbnMgPSB7Li4ub3B0aW9ucywgcnVuIChhcmdzKXtcbiAgICBjb25zdCBmaW5hbEFyZ3MgPSBiZWZvcmVIb29rcy5yZWR1Y2UoKG1vZGlmaWVkQXJncywgaG9vaykgPT4ge1xuICAgICAgcmV0dXJuIGhvb2suY2FsbCh0aGlzLCBtb2RpZmllZEFyZ3MsIHsuLi5vcHRpb25zfSlcbiAgICB9LCBhcmdzKVxuXG4gICAgY29uc3QgcmVzdWx0ID0gcnVuLmNhbGwodGhpcywgZmluYWxBcmdzKVxuXG4gICAgY29uc3QgZmluYWxSZXN1bHQgPSBhZnRlckhvb2tzLnJlZHVjZSgobW9kaWZpZWRSZXN1bHQsIGhvb2spID0+IHtcbiAgICAgIHJldHVybiBob29rLmNhbGwodGhpcywgZmluYWxBcmdzLCBtb2RpZmllZFJlc3VsdCwgey4uLm9wdGlvbnN9KVxuICAgIH0sIHJlc3VsdClcblxuICAgIHJldHVybiBmaW5hbFJlc3VsdFxuICB9fVxuXG4gIHJldHVybiBmaW5hbE9wdGlvbnNcbn07XG5cbiJdfQ==
