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
var meteorBabelHelpers = Package.modules.meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

var require = meteorInstall({"node_modules":{"meteor":{"socialize:server-time":{"client":{"entry-meteor.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                              //
// packages/socialize_server-time/client/entry-meteor.js                                        //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
module.export({
  ServerTime: function () {
    return ServerTime;
  }
});
var Meteor;
module.link("meteor/meteor", {
  Meteor: function (v) {
    Meteor = v;
  }
}, 0);
var construct;
module.link("./server-time.js", {
  "default": function (v) {
    construct = v;
  }
}, 1);
var ServerTime = construct({
  Meteor: Meteor
}); // At startup, wait a couple seconds so that we can get a more accurate latency estimation.
// This is far from optimal but should work.

Meteor.startup(function () {
  return Meteor.setTimeout(function () {
    return ServerTime.init();
  }, 2000);
});
//////////////////////////////////////////////////////////////////////////////////////////////////

},"server-time.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                              //
// packages/socialize_server-time/client/server-time.js                                         //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
var ServerTime;
module.link("../common/server-time", {
  ServerTime: function (v) {
    ServerTime = v;
  }
}, 0);
module.exportDefault(function (_ref) {
  var Meteor = _ref.Meteor;

  ServerTime.init = function () {
    ServerTime._diffStart = Date.now();
    Meteor.call('socialize:getServerTime', function (error, serverTimeStamp) {
      if (!error) {
        var now = Date.now();
        var latency = now - ServerTime._diffStart;
        ServerTime._timeDifference = serverTimeStamp + latency - now;
      } else {
        throw error;
      }
    });
  };

  if (!Meteor.isReactNative) {} else {
    setTimeout(function () {
      return ServerTime.init();
    }, 2000);
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
  ServerTime: function () {
    return ServerTime;
  }
});
var ServerTime = {
  _timeDifference: 0
};

ServerTime.now = function () {
  function now() {
    return Date.now() + this._timeDifference;
  }

  return now;
}();

ServerTime.date = function () {
  function date() {
    return new Date(this.now());
  }

  return date;
}();
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
