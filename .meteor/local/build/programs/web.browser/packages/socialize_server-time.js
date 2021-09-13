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
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"socialize:server-time":{"client":{"entry-meteor.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                              //
// packages/socialize_server-time/client/entry-meteor.js                                        //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
module.export({
  ServerTime: () => ServerTime
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let construct;
module.link("./server-time.js", {
  default(v) {
    construct = v;
  }

}, 1);
const ServerTime = construct({
  Meteor
}); // At startup, wait a couple seconds so that we can get a more accurate latency estimation.
// This is far from optimal but should work.

Meteor.startup(() => Meteor.setTimeout(() => ServerTime.init(), 2000));
//////////////////////////////////////////////////////////////////////////////////////////////////

},"server-time.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                              //
// packages/socialize_server-time/client/server-time.js                                         //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
let ServerTime;
module.link("../common/server-time", {
  ServerTime(v) {
    ServerTime = v;
  }

}, 0);
module.exportDefault(_ref => {
  let {
    Meteor
  } = _ref;

  ServerTime.init = () => {
    ServerTime._diffStart = Date.now();
    Meteor.call('socialize:getServerTime', (error, serverTimeStamp) => {
      if (!error) {
        const now = Date.now();
        const latency = now - ServerTime._diffStart;
        ServerTime._timeDifference = serverTimeStamp + latency - now;
      } else {
        throw error;
      }
    });
  };

  if (!Meteor.isReactNative) {} else {
    setTimeout(() => ServerTime.init(), 2000);
  }

  return ServerTime;
});
//////////////////////////////////////////////////////////////////////////////////////////////////

}},"common":{"server-time.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                              //
// packages/socialize_server-time/common/server-time.js                                         //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
module.export({
  ServerTime: () => ServerTime
});
const ServerTime = {
  _timeDifference: 0
};

ServerTime.now = function now() {
  return Date.now() + this._timeDifference;
};

ServerTime.date = function date() {
  return new Date(this.now());
};
//////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/socialize:server-time/client/entry-meteor.js");

/* Exports */
Package._define("socialize:server-time", exports);

})();
