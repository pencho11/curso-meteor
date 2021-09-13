(function () {

/* Imports */
var meteorInstall = Package.modules.meteorInstall;
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;

var require = meteorInstall({"node_modules":{"meteor":{"hot-module-replacement":{"server.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////
//                                                                      //
// packages/hot-module-replacement/server.js                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////
                                                                        //
if (!process.env.METEOR_HMR_SECRET) {
  console.log('Restart Meteor to enable hot module replacement.');
} else {
  __meteor_runtime_config__._hmrSecret = process.env.METEOR_HMR_SECRET;
}

//////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/hot-module-replacement/server.js");

/* Exports */
Package._define("hot-module-replacement");

})();
