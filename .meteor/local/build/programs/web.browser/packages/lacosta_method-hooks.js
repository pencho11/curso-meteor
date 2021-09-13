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
