//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var check = Package.check.check;
var Match = Package.check.Match;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package.modules.meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

/* Package-scope variables */
var MethodHooks;

var require = meteorInstall({"node_modules":{"meteor":{"lacosta:method-hooks":{"src":{"method-hooks-mixin.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////
//                                                                                      //
// packages/lacosta_method-hooks/src/method-hooks-mixin.js                              //
//                                                                                      //
//////////////////////////////////////////////////////////////////////////////////////////
                                                                                        //
var _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default: function (v) {
    _objectSpread = v;
  }
}, 0);

MethodHooks = function (options) {
  var _Match = Match,
      ObjectIncluding = _Match.ObjectIncluding,
      Optional = _Match.Optional;
  check(options, ObjectIncluding({
    name: String,
    beforeHooks: Optional([Function]),
    afterHooks: Optional([Function]),
    run: Function
  }));
  var _options$beforeHooks = options.beforeHooks,
      beforeHooks = _options$beforeHooks === void 0 ? [] : _options$beforeHooks,
      _options$afterHooks = options.afterHooks,
      afterHooks = _options$afterHooks === void 0 ? [] : _options$afterHooks,
      run = options.run; // remove hooks to avoid sending hooks to themselves
  // remove run function to avoid sending hooks overridden #run

  delete options.beforeHooks;
  delete options.afterHooks;
  delete options.run;

  var finalOptions = _objectSpread(_objectSpread({}, options), {}, {
    run: function (args) {
      var _this = this;

      var finalArgs = beforeHooks.reduce(function (modifiedArgs, hook) {
        return hook.call(_this, modifiedArgs, _objectSpread({}, options));
      }, args);
      var result = run.call(this, finalArgs);
      var finalResult = afterHooks.reduce(function (modifiedResult, hook) {
        return hook.call(_this, finalArgs, modifiedResult, _objectSpread({}, options));
      }, result);
      return finalResult;
    }
  });

  return finalOptions;
};
//////////////////////////////////////////////////////////////////////////////////////////

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
