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
var Mongo = Package.mongo.Mongo;
var Accounts = Package['accounts-base'].Accounts;
var Collection2 = Package['aldeed:collection2'].Collection2;
var CollectionHooks = Package['matb33:collection-hooks'].CollectionHooks;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package.modules.meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

var require = meteorInstall({"node_modules":{"meteor":{"socialize:user-presence":{"common":{"common.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/socialize_user-presence/common/common.js                 //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
module.export({
  UserSessions: function () {
    return UserSessions;
  }
});
var Meteor;
module.link("meteor/meteor", {
  Meteor: function (v) {
    Meteor = v;
  }
}, 0);
var User;
module.link("meteor/socialize:user-model", {
  User: function (v) {
    User = v;
  }
}, 1);
var Mongo;
module.link("meteor/mongo", {
  Mongo: function (v) {
    Mongo = v;
  }
}, 2);
var construct;
module.link("./collection.js", {
  "default": function (v) {
    construct = v;
  }
}, 3);
var extendUser;
module.link("./user-extensions.js", {
  "default": function (v) {
    extendUser = v;
  }
}, 4);
extendUser({
  Meteor: Meteor,
  User: User
});
var UserSessions = construct({
  Mongo: Mongo
});
///////////////////////////////////////////////////////////////////////

},"collection.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/socialize_user-presence/common/collection.js             //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
module.exportDefault(function (_ref) {
  var Mongo = _ref.Mongo;
  var UserSessions = new Mongo.Collection('presence:user-sessions');
  return UserSessions;
});
///////////////////////////////////////////////////////////////////////

},"user-extensions.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/socialize_user-presence/common/user-extensions.js        //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
module.exportDefault(function (_ref) {
  var Meteor = _ref.Meteor,
      User = _ref.User;
  User.methods({
    setStatusIdle: function () {
      Meteor.call('updateSessionStatus', 1);
    },
    setStatusOnline: function () {
      Meteor.call('updateSessionStatus', 2);
    }
  });
});
///////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/socialize:user-presence/common/common.js");

/* Exports */
Package._define("socialize:user-presence", exports);

})();
