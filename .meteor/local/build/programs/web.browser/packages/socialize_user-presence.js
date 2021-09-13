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
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"socialize:user-presence":{"common":{"common.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// packages/socialize_user-presence/common/common.js                   //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
module.export({
  UserSessions: () => UserSessions
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let User;
module.link("meteor/socialize:user-model", {
  User(v) {
    User = v;
  }

}, 1);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 2);
let construct;
module.link("./collection.js", {
  default(v) {
    construct = v;
  }

}, 3);
let extendUser;
module.link("./user-extensions.js", {
  default(v) {
    extendUser = v;
  }

}, 4);
extendUser({
  Meteor,
  User
});
const UserSessions = construct({
  Mongo
});
/////////////////////////////////////////////////////////////////////////

},"collection.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// packages/socialize_user-presence/common/collection.js               //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
module.exportDefault(_ref => {
  let {
    Mongo
  } = _ref;
  const UserSessions = new Mongo.Collection('presence:user-sessions');
  return UserSessions;
});
/////////////////////////////////////////////////////////////////////////

},"user-extensions.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// packages/socialize_user-presence/common/user-extensions.js          //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
module.exportDefault(_ref => {
  let {
    Meteor,
    User
  } = _ref;
  User.methods({
    setStatusIdle() {
      Meteor.call('updateSessionStatus', 1);
    },

    setStatusOnline() {
      Meteor.call('updateSessionStatus', 2);
    }

  });
});
/////////////////////////////////////////////////////////////////////////

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
