(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var Accounts = Package['accounts-base'].Accounts;
var ECMAScript = Package.ecmascript.ECMAScript;
var Collection2 = Package['aldeed:collection2'].Collection2;
var CollectionHooks = Package['matb33:collection-hooks'].CollectionHooks;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"socialize:user-presence":{"server":{"server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/socialize_user-presence/server/server.js                                                               //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.export({
  UserPresence: () => UserPresence
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check, Match;
module.link("meteor/check", {
  check(v) {
    check = v;
  },

  Match(v) {
    Match = v;
  }

}, 1);
let determineStatus, UserPresence;
module.link("./user-presence.js", {
  determineStatus(v) {
    determineStatus = v;
  },

  UserPresence(v) {
    UserPresence = v;
  }

}, 2);
let UserSessions;
module.link("../common/common.js", {
  UserSessions(v) {
    UserSessions = v;
  }

}, 3);
module.link("./publications.js");
Meteor.methods({
  updateSessionStatus(status) {
    check(status, Match.Integer);

    if (this.userId && (status === 1 || status === 2)) {
      UserSessions.update(this.connection.id, {
        $set: {
          status
        }
      });
      determineStatus(this.userId);
    }
  }

});
/* eslint-disable import/prefer-default-export */
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"publications.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/socialize_user-presence/server/publications.js                                                         //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let ServerPresence;
module.link("meteor/socialize:server-presence", {
  ServerPresence(v) {
    ServerPresence = v;
  }

}, 1);
let userConnected, sessionConnected, userDisconnected, sessionDisconnected;
module.link("./user-presence.js", {
  userConnected(v) {
    userConnected = v;
  },

  sessionConnected(v) {
    sessionConnected = v;
  },

  userDisconnected(v) {
    userDisconnected = v;
  },

  sessionDisconnected(v) {
    sessionDisconnected = v;
  }

}, 2);
Meteor.publish(null, function userPresenceSessionConnected() {
  if (this.userId && this.connection && this.connection.id) {
    userConnected(this.connection.id, this.userId, ServerPresence.serverId(), this.connection);
    sessionConnected(this.connection, this.userId);
    this.onStop(() => {
      userDisconnected(this.connection.id, this.userId, this.connection);
      sessionDisconnected(this.connection, this.userId);
    });
  }

  this.ready();
}, {
  is_auto: true
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user-presence.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/socialize_user-presence/server/user-presence.js                                                        //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.export({
  UserPresence: () => UserPresence,
  sessionConnected: () => sessionConnected,
  sessionDisconnected: () => sessionDisconnected,
  determineStatus: () => determineStatus,
  userConnected: () => userConnected,
  userDisconnected: () => userDisconnected
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let ServerPresence;
module.link("meteor/socialize:server-presence", {
  ServerPresence(v) {
    ServerPresence = v;
  }

}, 1);
let UserSessions;
module.link("../common/common.js", {
  UserSessions(v) {
    UserSessions = v;
  }

}, 2);

UserSessions._ensureIndex({
  userId: 1
});

UserSessions._ensureIndex({
  serverId: 1
});

UserSessions._ensureIndex({
  sessionId: 1
});

const cleanupFunctions = [];
const userOnlineFunctions = [];
const userOfflineFunctions = [];
const userIdleFunctions = [];
const sessionConnectedFunctions = [];
const sessionDisconnectedFunctions = [];
/* eslint-disable import/prefer-default-export */

const UserPresence = {};

UserPresence.onSessionConnected = sessionConnectedFunction => {
  if (typeof sessionConnectedFunction === 'function') {
    sessionConnectedFunctions.push(sessionConnectedFunction);
  } else {
    throw new Meteor.Error('Not A Function', 'UserPresence.onSessionConnected requires function as parameter');
  }
};

const sessionConnected = (connection, userId) => {
  sessionConnectedFunctions.forEach(sessionFunction => {
    sessionFunction(connection, userId);
  });
};

UserPresence.onSessionDisconnected = sessionDisconnectedFunction => {
  if (typeof sessionDisconnectedFunction === 'function') {
    sessionDisconnectedFunctions.push(sessionDisconnectedFunction);
  } else {
    throw new Meteor.Error('Not A Function', 'UserPresence.onSessionDisconnected requires function as parameter');
  }
};

const sessionDisconnected = (connection, userId) => {
  sessionDisconnectedFunctions.forEach(sessionFunction => {
    sessionFunction(connection, userId);
  });
};

UserPresence.onUserOnline = userOnlineFunction => {
  if (typeof userOnlineFunction === 'function') {
    userOnlineFunctions.push(userOnlineFunction);
  } else {
    throw new Meteor.Error('Not A Function', 'UserPresence.onUserOnline requires function as parameter');
  }
};

const userOnline = (userId, connection) => {
  userOnlineFunctions.forEach(onlineFunction => {
    onlineFunction(userId, connection);
  });
};

UserPresence.onUserIdle = userIdleFunction => {
  if (typeof userIdleFunction === 'function') {
    userIdleFunctions.push(userIdleFunction);
  } else {
    throw new Meteor.Error('Not A Function', 'UserPresence.onUserIdle requires function as parameter');
  }
};

const userIdle = (userId, connection) => {
  userIdleFunctions.forEach(idleFunction => {
    idleFunction(userId, connection);
  });
};

UserPresence.onUserOffline = userOfflineFunction => {
  if (typeof userOfflineFunction === 'function') {
    userOfflineFunctions.push(userOfflineFunction);
  } else {
    throw new Meteor.Error('Not A Function', 'UserPresence.onUserOffline requires function as parameter');
  }
};

const userOffline = (userId, connection) => {
  userOfflineFunctions.forEach(offlineFunction => {
    offlineFunction(userId, connection);
  });
};

const determineStatus = (userId, connection) => {
  let status = 0;
  const sessions = UserSessions.find({
    userId
  }, {
    fields: {
      status: 1
    }
  });
  const sessionCount = sessions.fetch().length;

  if (sessionCount > 0) {
    status = 1;
    sessions.forEach(session => {
      if (session.status === 2) {
        status = 2;
      }
    });
  }

  switch (status) {
    case 1:
      userIdle(userId, connection);
      break;

    case 2:
      userOnline(userId, connection);
      break;

    default:
      userOffline(userId, connection);
      break;
  }
};

const userConnected = (sessionId, userId, serverId, connection) => {
  UserSessions.insert({
    serverId,
    userId,
    _id: sessionId,
    status: 2
  });
  determineStatus(userId, connection);
};

const userDisconnected = (sessionId, userId, connection) => {
  UserSessions.remove(sessionId);
  determineStatus(userId, connection);
};

UserPresence.onCleanup = cleanupFunction => {
  if (typeof cleanupFunction === 'function') {
    cleanupFunctions.push(cleanupFunction);
  } else {
    throw new Meteor.Error('Not A Function', 'UserPresence.onCleanup requires function as parameter');
  }
};

const cleanup = sessionIds => {
  cleanupFunctions.forEach(cleanupFunction => {
    cleanupFunction(sessionIds);
  });
};

ServerPresence.onCleanup(serverId => {
  if (serverId) {
    const sessionIds = UserSessions.find({
      serverId
    }, {
      fields: {
        userId: true
      }
    }).map(session => {
      userDisconnected(session._id, session.userId, null);
      return session._id;
    });
    cleanup(sessionIds);
  } else {
    cleanup();
    UserSessions.remove({});
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"common":{"collection.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/socialize_user-presence/common/collection.js                                                           //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
module.exportDefault(_ref => {
  let {
    Mongo
  } = _ref;
  const UserSessions = new Mongo.Collection('presence:user-sessions');
  return UserSessions;
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"common.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/socialize_user-presence/common/common.js                                                               //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user-extensions.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/socialize_user-presence/common/user-extensions.js                                                      //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/socialize:user-presence/server/server.js");

/* Exports */
Package._define("socialize:user-presence", exports);

})();

//# sourceURL=meteor://💻app/packages/socialize_user-presence.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc29jaWFsaXplOnVzZXItcHJlc2VuY2Uvc2VydmVyL3NlcnZlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc29jaWFsaXplOnVzZXItcHJlc2VuY2Uvc2VydmVyL3B1YmxpY2F0aW9ucy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc29jaWFsaXplOnVzZXItcHJlc2VuY2Uvc2VydmVyL3VzZXItcHJlc2VuY2UuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3NvY2lhbGl6ZTp1c2VyLXByZXNlbmNlL2NvbW1vbi9jb2xsZWN0aW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9zb2NpYWxpemU6dXNlci1wcmVzZW5jZS9jb21tb24vY29tbW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9zb2NpYWxpemU6dXNlci1wcmVzZW5jZS9jb21tb24vdXNlci1leHRlbnNpb25zLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydCIsIlVzZXJQcmVzZW5jZSIsIk1ldGVvciIsImxpbmsiLCJ2IiwiY2hlY2siLCJNYXRjaCIsImRldGVybWluZVN0YXR1cyIsIlVzZXJTZXNzaW9ucyIsIm1ldGhvZHMiLCJ1cGRhdGVTZXNzaW9uU3RhdHVzIiwic3RhdHVzIiwiSW50ZWdlciIsInVzZXJJZCIsInVwZGF0ZSIsImNvbm5lY3Rpb24iLCJpZCIsIiRzZXQiLCJTZXJ2ZXJQcmVzZW5jZSIsInVzZXJDb25uZWN0ZWQiLCJzZXNzaW9uQ29ubmVjdGVkIiwidXNlckRpc2Nvbm5lY3RlZCIsInNlc3Npb25EaXNjb25uZWN0ZWQiLCJwdWJsaXNoIiwidXNlclByZXNlbmNlU2Vzc2lvbkNvbm5lY3RlZCIsInNlcnZlcklkIiwib25TdG9wIiwicmVhZHkiLCJpc19hdXRvIiwiX2Vuc3VyZUluZGV4Iiwic2Vzc2lvbklkIiwiY2xlYW51cEZ1bmN0aW9ucyIsInVzZXJPbmxpbmVGdW5jdGlvbnMiLCJ1c2VyT2ZmbGluZUZ1bmN0aW9ucyIsInVzZXJJZGxlRnVuY3Rpb25zIiwic2Vzc2lvbkNvbm5lY3RlZEZ1bmN0aW9ucyIsInNlc3Npb25EaXNjb25uZWN0ZWRGdW5jdGlvbnMiLCJvblNlc3Npb25Db25uZWN0ZWQiLCJzZXNzaW9uQ29ubmVjdGVkRnVuY3Rpb24iLCJwdXNoIiwiRXJyb3IiLCJmb3JFYWNoIiwic2Vzc2lvbkZ1bmN0aW9uIiwib25TZXNzaW9uRGlzY29ubmVjdGVkIiwic2Vzc2lvbkRpc2Nvbm5lY3RlZEZ1bmN0aW9uIiwib25Vc2VyT25saW5lIiwidXNlck9ubGluZUZ1bmN0aW9uIiwidXNlck9ubGluZSIsIm9ubGluZUZ1bmN0aW9uIiwib25Vc2VySWRsZSIsInVzZXJJZGxlRnVuY3Rpb24iLCJ1c2VySWRsZSIsImlkbGVGdW5jdGlvbiIsIm9uVXNlck9mZmxpbmUiLCJ1c2VyT2ZmbGluZUZ1bmN0aW9uIiwidXNlck9mZmxpbmUiLCJvZmZsaW5lRnVuY3Rpb24iLCJzZXNzaW9ucyIsImZpbmQiLCJmaWVsZHMiLCJzZXNzaW9uQ291bnQiLCJmZXRjaCIsImxlbmd0aCIsInNlc3Npb24iLCJpbnNlcnQiLCJfaWQiLCJyZW1vdmUiLCJvbkNsZWFudXAiLCJjbGVhbnVwRnVuY3Rpb24iLCJjbGVhbnVwIiwic2Vzc2lvbklkcyIsIm1hcCIsImV4cG9ydERlZmF1bHQiLCJNb25nbyIsIkNvbGxlY3Rpb24iLCJVc2VyIiwiY29uc3RydWN0IiwiZGVmYXVsdCIsImV4dGVuZFVzZXIiLCJzZXRTdGF0dXNJZGxlIiwiY2FsbCIsInNldFN0YXR1c09ubGluZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsTUFBTSxDQUFDQyxNQUFQLENBQWM7QUFBQ0MsY0FBWSxFQUFDLE1BQUlBO0FBQWxCLENBQWQ7QUFBK0MsSUFBSUMsTUFBSjtBQUFXSCxNQUFNLENBQUNJLElBQVAsQ0FBWSxlQUFaLEVBQTRCO0FBQUNELFFBQU0sQ0FBQ0UsQ0FBRCxFQUFH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QUNsRSxPQUFMLENBQWE7QUFDVHNFLGlCQUFhLEdBQUc7QUFDWjdFLFlBQU0sQ0FBQzhFLElBQVAsQ0FBWSxxQkFBWixFQUFtQyxDQUFuQztBQUNILEtBSFE7O0FBSVRDLG1CQUFlLEdBQUc7QUFDZC9FLFlBQU0sQ0FBQzhFLElBQVAsQ0FBWSxxQkFBWixFQUFtQyxDQUFuQztBQUNIOztBQU5RLEdBQWI7QUFRSCxDQVRELEUiLCJmaWxlIjoiL3BhY2thZ2VzL3NvY2lhbGl6ZV91c2VyLXByZXNlbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgaW1wb3J0L25vLXVucmVzb2x2ZWQgKi9cbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgY2hlY2ssIE1hdGNoIH0gZnJvbSAnbWV0ZW9yL2NoZWNrJztcblxuLyogZXNsaW50LWVuYWJsZSBpbXBvcnQvbm8tdW5yZXNvbHZlZCAqL1xuXG5pbXBvcnQgeyBkZXRlcm1pbmVTdGF0dXMsIFVzZXJQcmVzZW5jZSB9IGZyb20gJy4vdXNlci1wcmVzZW5jZS5qcyc7XG5pbXBvcnQgeyBVc2VyU2Vzc2lvbnMgfSBmcm9tICcuLi9jb21tb24vY29tbW9uLmpzJztcblxuaW1wb3J0ICcuL3B1YmxpY2F0aW9ucy5qcyc7XG5cbk1ldGVvci5tZXRob2RzKHtcbiAgICB1cGRhdGVTZXNzaW9uU3RhdHVzKHN0YXR1cykge1xuICAgICAgICBjaGVjayhzdGF0dXMsIE1hdGNoLkludGVnZXIpO1xuICAgICAgICBpZiAodGhpcy51c2VySWQgJiYgKHN0YXR1cyA9PT0gMSB8fCBzdGF0dXMgPT09IDIpKSB7XG4gICAgICAgICAgICBVc2VyU2Vzc2lvbnMudXBkYXRlKHRoaXMuY29ubmVjdGlvbi5pZCwgeyAkc2V0OiB7IHN0YXR1cyB9IH0pO1xuICAgICAgICAgICAgZGV0ZXJtaW5lU3RhdHVzKHRoaXMudXNlcklkKTtcbiAgICAgICAgfVxuICAgIH0sXG59KTtcblxuLyogZXNsaW50LWRpc2FibGUgaW1wb3J0L3ByZWZlci1kZWZhdWx0LWV4cG9ydCAqL1xuZXhwb3J0IHsgVXNlclByZXNlbmNlIH07XG4iLCIvKiBlc2xpbnQtZGlzYWJsZSBpbXBvcnQvbm8tdW5yZXNvbHZlZCAqL1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBTZXJ2ZXJQcmVzZW5jZSB9IGZyb20gJ21ldGVvci9zb2NpYWxpemU6c2VydmVyLXByZXNlbmNlJztcblxuLyogZXNsaW50LWVuYWJsZSBpbXBvcnQvbm8tdW5yZXNvbHZlZCAqL1xuXG5pbXBvcnQgeyB1c2VyQ29ubmVjdGVkLCBzZXNzaW9uQ29ubmVjdGVkLCB1c2VyRGlzY29ubmVjdGVkLCBzZXNzaW9uRGlzY29ubmVjdGVkIH0gZnJvbSAnLi91c2VyLXByZXNlbmNlLmpzJztcblxuTWV0ZW9yLnB1Ymxpc2gobnVsbCwgZnVuY3Rpb24gdXNlclByZXNlbmNlU2Vzc2lvbkNvbm5lY3RlZCgpIHtcbiAgICBpZiAodGhpcy51c2VySWQgJiYgdGhpcy5jb25uZWN0aW9uICYmIHRoaXMuY29ubmVjdGlvbi5pZCkge1xuICAgICAgICB1c2VyQ29ubmVjdGVkKHRoaXMuY29ubmVjdGlvbi5pZCwgdGhpcy51c2VySWQsIFNlcnZlclByZXNlbmNlLnNlcnZlcklkKCksIHRoaXMuY29ubmVjdGlvbik7XG4gICAgICAgIHNlc3Npb25Db25uZWN0ZWQodGhpcy5jb25uZWN0aW9uLCB0aGlzLnVzZXJJZCk7XG5cbiAgICAgICAgdGhpcy5vblN0b3AoKCkgPT4ge1xuICAgICAgICAgICAgdXNlckRpc2Nvbm5lY3RlZCh0aGlzLmNvbm5lY3Rpb24uaWQsIHRoaXMudXNlcklkLCB0aGlzLmNvbm5lY3Rpb24pO1xuICAgICAgICAgICAgc2Vzc2lvbkRpc2Nvbm5lY3RlZCh0aGlzLmNvbm5lY3Rpb24sIHRoaXMudXNlcklkKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMucmVhZHkoKTtcbn0sIHsgaXNfYXV0bzogdHJ1ZSB9KTtcbiIsIi8qIGVzbGludC1kaXNhYmxlIGltcG9ydC9uby11bnJlc29sdmVkICovXG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IFNlcnZlclByZXNlbmNlIH0gZnJvbSAnbWV0ZW9yL3NvY2lhbGl6ZTpzZXJ2ZXItcHJlc2VuY2UnO1xuXG4vKiBlc2xpbnQtZW5hYmxlIGltcG9ydC9uby11bnJlc29sdmVkICovXG5cbmltcG9ydCB7IFVzZXJTZXNzaW9ucyB9IGZyb20gJy4uL2NvbW1vbi9jb21tb24uanMnO1xuXG5Vc2VyU2Vzc2lvbnMuX2Vuc3VyZUluZGV4KHsgdXNlcklkOiAxIH0pO1xuVXNlclNlc3Npb25zLl9lbnN1cmVJbmRleCh7IHNlcnZlcklkOiAxIH0pO1xuVXNlclNlc3Npb25zLl9lbnN1cmVJbmRleCh7IHNlc3Npb25JZDogMSB9KTtcblxuY29uc3QgY2xlYW51cEZ1bmN0aW9ucyA9IFtdO1xuY29uc3QgdXNlck9ubGluZUZ1bmN0aW9ucyA9IFtdO1xuY29uc3QgdXNlck9mZmxpbmVGdW5jdGlvbnMgPSBbXTtcbmNvbnN0IHVzZXJJZGxlRnVuY3Rpb25zID0gW107XG5jb25zdCBzZXNzaW9uQ29ubmVjdGVkRnVuY3Rpb25zID0gW107XG5jb25zdCBzZXNzaW9uRGlzY29ubmVjdGVkRnVuY3Rpb25zID0gW107XG5cbi8qIGVzbGludC1kaXNhYmxlIGltcG9ydC9wcmVmZXItZGVmYXVsdC1leHBvcnQgKi9cbmV4cG9ydCBjb25zdCBVc2VyUHJlc2VuY2UgPSB7fTtcblxuVXNlclByZXNlbmNlLm9uU2Vzc2lvbkNvbm5lY3RlZCA9IChzZXNzaW9uQ29ubmVjdGVkRnVuY3Rpb24pID0+IHtcbiAgICBpZiAodHlwZW9mIHNlc3Npb25Db25uZWN0ZWRGdW5jdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzZXNzaW9uQ29ubmVjdGVkRnVuY3Rpb25zLnB1c2goc2Vzc2lvbkNvbm5lY3RlZEZ1bmN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdOb3QgQSBGdW5jdGlvbicsICdVc2VyUHJlc2VuY2Uub25TZXNzaW9uQ29ubmVjdGVkIHJlcXVpcmVzIGZ1bmN0aW9uIGFzIHBhcmFtZXRlcicpO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBzZXNzaW9uQ29ubmVjdGVkID0gKGNvbm5lY3Rpb24sIHVzZXJJZCkgPT4ge1xuICAgIHNlc3Npb25Db25uZWN0ZWRGdW5jdGlvbnMuZm9yRWFjaCgoc2Vzc2lvbkZ1bmN0aW9uKSA9PiB7XG4gICAgICAgIHNlc3Npb25GdW5jdGlvbihjb25uZWN0aW9uLCB1c2VySWQpO1xuICAgIH0pO1xufTtcblxuVXNlclByZXNlbmNlLm9uU2Vzc2lvbkRpc2Nvbm5lY3RlZCA9IChzZXNzaW9uRGlzY29ubmVjdGVkRnVuY3Rpb24pID0+IHtcbiAgICBpZiAodHlwZW9mIHNlc3Npb25EaXNjb25uZWN0ZWRGdW5jdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzZXNzaW9uRGlzY29ubmVjdGVkRnVuY3Rpb25zLnB1c2goc2Vzc2lvbkRpc2Nvbm5lY3RlZEZ1bmN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdOb3QgQSBGdW5jdGlvbicsICdVc2VyUHJlc2VuY2Uub25TZXNzaW9uRGlzY29ubmVjdGVkIHJlcXVpcmVzIGZ1bmN0aW9uIGFzIHBhcmFtZXRlcicpO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBzZXNzaW9uRGlzY29ubmVjdGVkID0gKGNvbm5lY3Rpb24sIHVzZXJJZCkgPT4ge1xuICAgIHNlc3Npb25EaXNjb25uZWN0ZWRGdW5jdGlvbnMuZm9yRWFjaCgoc2Vzc2lvbkZ1bmN0aW9uKSA9PiB7XG4gICAgICAgIHNlc3Npb25GdW5jdGlvbihjb25uZWN0aW9uLCB1c2VySWQpO1xuICAgIH0pO1xufTtcblxuXG5Vc2VyUHJlc2VuY2Uub25Vc2VyT25saW5lID0gKHVzZXJPbmxpbmVGdW5jdGlvbikgPT4ge1xuICAgIGlmICh0eXBlb2YgdXNlck9ubGluZUZ1bmN0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHVzZXJPbmxpbmVGdW5jdGlvbnMucHVzaCh1c2VyT25saW5lRnVuY3Rpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ05vdCBBIEZ1bmN0aW9uJywgJ1VzZXJQcmVzZW5jZS5vblVzZXJPbmxpbmUgcmVxdWlyZXMgZnVuY3Rpb24gYXMgcGFyYW1ldGVyJyk7XG4gICAgfVxufTtcblxuY29uc3QgdXNlck9ubGluZSA9ICh1c2VySWQsIGNvbm5lY3Rpb24pID0+IHtcbiAgICB1c2VyT25saW5lRnVuY3Rpb25zLmZvckVhY2goKG9ubGluZUZ1bmN0aW9uKSA9PiB7XG4gICAgICAgIG9ubGluZUZ1bmN0aW9uKHVzZXJJZCwgY29ubmVjdGlvbik7XG4gICAgfSk7XG59O1xuXG5Vc2VyUHJlc2VuY2Uub25Vc2VySWRsZSA9ICh1c2VySWRsZUZ1bmN0aW9uKSA9PiB7XG4gICAgaWYgKHR5cGVvZiB1c2VySWRsZUZ1bmN0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHVzZXJJZGxlRnVuY3Rpb25zLnB1c2godXNlcklkbGVGdW5jdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignTm90IEEgRnVuY3Rpb24nLCAnVXNlclByZXNlbmNlLm9uVXNlcklkbGUgcmVxdWlyZXMgZnVuY3Rpb24gYXMgcGFyYW1ldGVyJyk7XG4gICAgfVxufTtcblxuY29uc3QgdXNlcklkbGUgPSAodXNlcklkLCBjb25uZWN0aW9uKSA9PiB7XG4gICAgdXNlcklkbGVGdW5jdGlvbnMuZm9yRWFjaCgoaWRsZUZ1bmN0aW9uKSA9PiB7XG4gICAgICAgIGlkbGVGdW5jdGlvbih1c2VySWQsIGNvbm5lY3Rpb24pO1xuICAgIH0pO1xufTtcblxuVXNlclByZXNlbmNlLm9uVXNlck9mZmxpbmUgPSAodXNlck9mZmxpbmVGdW5jdGlvbikgPT4ge1xuICAgIGlmICh0eXBlb2YgdXNlck9mZmxpbmVGdW5jdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB1c2VyT2ZmbGluZUZ1bmN0aW9ucy5wdXNoKHVzZXJPZmZsaW5lRnVuY3Rpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoJ05vdCBBIEZ1bmN0aW9uJywgJ1VzZXJQcmVzZW5jZS5vblVzZXJPZmZsaW5lIHJlcXVpcmVzIGZ1bmN0aW9uIGFzIHBhcmFtZXRlcicpO1xuICAgIH1cbn07XG5cbmNvbnN0IHVzZXJPZmZsaW5lID0gKHVzZXJJZCwgY29ubmVjdGlvbikgPT4ge1xuICAgIHVzZXJPZmZsaW5lRnVuY3Rpb25zLmZvckVhY2goKG9mZmxpbmVGdW5jdGlvbikgPT4ge1xuICAgICAgICBvZmZsaW5lRnVuY3Rpb24odXNlcklkLCBjb25uZWN0aW9uKTtcbiAgICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBkZXRlcm1pbmVTdGF0dXMgPSAodXNlcklkLCBjb25uZWN0aW9uKSA9PiB7XG4gICAgbGV0IHN0YXR1cyA9IDA7XG4gICAgY29uc3Qgc2Vzc2lvbnMgPSBVc2VyU2Vzc2lvbnMuZmluZCh7IHVzZXJJZCB9LCB7IGZpZWxkczogeyBzdGF0dXM6IDEgfSB9KTtcbiAgICBjb25zdCBzZXNzaW9uQ291bnQgPSBzZXNzaW9ucy5mZXRjaCgpLmxlbmd0aDtcblxuICAgIGlmIChzZXNzaW9uQ291bnQgPiAwKSB7XG4gICAgICAgIHN0YXR1cyA9IDE7XG4gICAgICAgIHNlc3Npb25zLmZvckVhY2goKHNlc3Npb24pID0+IHtcbiAgICAgICAgICAgIGlmIChzZXNzaW9uLnN0YXR1cyA9PT0gMikge1xuICAgICAgICAgICAgICAgIHN0YXR1cyA9IDI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHVzZXJJZGxlKHVzZXJJZCwgY29ubmVjdGlvbik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgdXNlck9ubGluZSh1c2VySWQsIGNvbm5lY3Rpb24pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB1c2VyT2ZmbGluZSh1c2VySWQsIGNvbm5lY3Rpb24pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHVzZXJDb25uZWN0ZWQgPSAoc2Vzc2lvbklkLCB1c2VySWQsIHNlcnZlcklkLCBjb25uZWN0aW9uKSA9PiB7XG4gICAgVXNlclNlc3Npb25zLmluc2VydCh7IHNlcnZlcklkLCB1c2VySWQsIF9pZDogc2Vzc2lvbklkLCBzdGF0dXM6IDIgfSk7XG4gICAgZGV0ZXJtaW5lU3RhdHVzKHVzZXJJZCwgY29ubmVjdGlvbik7XG59O1xuXG5leHBvcnQgY29uc3QgdXNlckRpc2Nvbm5lY3RlZCA9IChzZXNzaW9uSWQsIHVzZXJJZCwgY29ubmVjdGlvbikgPT4ge1xuICAgIFVzZXJTZXNzaW9ucy5yZW1vdmUoc2Vzc2lvbklkKTtcbiAgICBkZXRlcm1pbmVTdGF0dXModXNlcklkLCBjb25uZWN0aW9uKTtcbn07XG5cblxuVXNlclByZXNlbmNlLm9uQ2xlYW51cCA9IChjbGVhbnVwRnVuY3Rpb24pID0+IHtcbiAgICBpZiAodHlwZW9mIGNsZWFudXBGdW5jdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjbGVhbnVwRnVuY3Rpb25zLnB1c2goY2xlYW51cEZ1bmN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdOb3QgQSBGdW5jdGlvbicsICdVc2VyUHJlc2VuY2Uub25DbGVhbnVwIHJlcXVpcmVzIGZ1bmN0aW9uIGFzIHBhcmFtZXRlcicpO1xuICAgIH1cbn07XG5cbmNvbnN0IGNsZWFudXAgPSAoc2Vzc2lvbklkcykgPT4ge1xuICAgIGNsZWFudXBGdW5jdGlvbnMuZm9yRWFjaCgoY2xlYW51cEZ1bmN0aW9uKSA9PiB7XG4gICAgICAgIGNsZWFudXBGdW5jdGlvbihzZXNzaW9uSWRzKTtcbiAgICB9KTtcbn07XG5cblNlcnZlclByZXNlbmNlLm9uQ2xlYW51cCgoc2VydmVySWQpID0+IHtcbiAgICBpZiAoc2VydmVySWQpIHtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbklkcyA9IFVzZXJTZXNzaW9ucy5maW5kKHsgc2VydmVySWQgfSwgeyBmaWVsZHM6IHsgdXNlcklkOiB0cnVlIH0gfSkubWFwKChzZXNzaW9uKSA9PiB7XG4gICAgICAgICAgICB1c2VyRGlzY29ubmVjdGVkKHNlc3Npb24uX2lkLCBzZXNzaW9uLnVzZXJJZCwgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm4gc2Vzc2lvbi5faWQ7XG4gICAgICAgIH0pO1xuICAgICAgICBjbGVhbnVwKHNlc3Npb25JZHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgVXNlclNlc3Npb25zLnJlbW92ZSh7fSk7XG4gICAgfVxufSk7XG4iLCJcbmV4cG9ydCBkZWZhdWx0ICh7IE1vbmdvIH0pID0+IHtcbiAgICBjb25zdCBVc2VyU2Vzc2lvbnMgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbigncHJlc2VuY2U6dXNlci1zZXNzaW9ucycpO1xuXG4gICAgcmV0dXJuIFVzZXJTZXNzaW9ucztcbn07XG4iLCIvKiBlc2xpbnQtZGlzYWJsZSBpbXBvcnQvbm8tdW5yZXNvbHZlZCAqL1xuaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnbWV0ZW9yL3NvY2lhbGl6ZTp1c2VyLW1vZGVsJztcbmltcG9ydCB7IE1vbmdvIH0gZnJvbSAnbWV0ZW9yL21vbmdvJztcbi8qIGVzbGludC1lbmFibGUgaW1wb3J0L25vLXVucmVzb2x2ZWQgKi9cblxuaW1wb3J0IGNvbnN0cnVjdCBmcm9tICcuL2NvbGxlY3Rpb24uanMnO1xuaW1wb3J0IGV4dGVuZFVzZXIgZnJvbSAnLi91c2VyLWV4dGVuc2lvbnMuanMnO1xuXG5leHRlbmRVc2VyKHsgTWV0ZW9yLCBVc2VyIH0pO1xuZXhwb3J0IGNvbnN0IFVzZXJTZXNzaW9ucyA9IGNvbnN0cnVjdCh7IE1vbmdvIH0pO1xuIiwiZXhwb3J0IGRlZmF1bHQgKHsgTWV0ZW9yLCBVc2VyIH0pID0+IHtcbiAgICBVc2VyLm1ldGhvZHMoe1xuICAgICAgICBzZXRTdGF0dXNJZGxlKCkge1xuICAgICAgICAgICAgTWV0ZW9yLmNhbGwoJ3VwZGF0ZVNlc3Npb25TdGF0dXMnLCAxKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0U3RhdHVzT25saW5lKCkge1xuICAgICAgICAgICAgTWV0ZW9yLmNhbGwoJ3VwZGF0ZVNlc3Npb25TdGF0dXMnLCAyKTtcbiAgICAgICAgfSxcbiAgICB9KTtcbn07XG4iXX0=
