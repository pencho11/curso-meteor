(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"socialize:server-presence":{"server-presence.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/socialize_server-presence/server-presence.js                                                 //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
module.export({
  ServerPresence: () => ServerPresence
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 1);

/* eslint-enable import/no-unresolved */
const Servers = new Mongo.Collection('presence:servers');

Servers._ensureIndex({
  lastPing: 1
}, {
  expireAfterSeconds: 10
});

Servers._ensureIndex({
  createdAt: -1
});

let serverId = null;
let isWatcher = false;
let observeHandle = null;
let exitGracefully = true;
const exitFunctions = [];
/* eslint-disable import/prefer-default-export */

const ServerPresence = {};

const insert = () => {
  const date = new Date();
  serverId = Servers.insert({
    lastPing: date,
    createdAt: date
  });
};

const runCleanupFunctions = removedServerId => {
  exitFunctions.forEach(exitFunc => {
    exitFunc(removedServerId);
  });
};

const setAsWatcher = () => {
  isWatcher = true;
  Servers.update({
    _id: serverId
  }, {
    $set: {
      watcher: true
    }
  });
};

const updateWatcher = () => {
  const server = Servers.findOne({}, {
    sort: {
      createdAt: -1
    }
  });

  if (server._id === serverId) {
    setAsWatcher();
  }
};

const observe = () => {
  observeHandle = Servers.find().observe({
    removed(document) {
      if (document._id === serverId) {
        if (!isWatcher) {
          Meteor._debug('Server Presence Timeout', 'The server-presence package has detected inconsistent presence state. To avoid inconsistent database state your application is exiting.');

          exitGracefully = false;
          process.kill(process.pid, 'SIGHUP');
        } else {
          insert();
        }
      } else if (isWatcher) {
        if (!document.graceful) {
          runCleanupFunctions(document._id);
        }
      } else if (document.watcher) {
        if (!document.graceful) {
          runCleanupFunctions(document._id);
        }

        updateWatcher();
      }
    }

  });
};

const checkForWatcher = () => {
  const current = Servers.findOne({
    watcher: true
  });

  if (current) {
    return true;
  }

  setAsWatcher();
  return false;
};

const start = () => {
  observe();
  Meteor.setInterval(function serverTick() {
    Servers.update(serverId, {
      $set: {
        lastPing: new Date()
      }
    });
    return true;
  }, 5000);
  insert(); // if there isn't any other instance watching and doing cleanup
  // then we need to do a full cleanup since this is likely the only instance

  if (!checkForWatcher()) {
    runCleanupFunctions();
  }
};

const exit = () => {
  // Call all of our externally supplied exit functions
  runCleanupFunctions(serverId);
};
/*
*  We have to bind the meteor environment here since process event callbacks
*  run outside fibers
*/


const stop = Meteor.bindEnvironment(function boundEnvironment() {
  if (exitGracefully) {
    Servers.update({
      _id: serverId
    }, {
      $set: {
        graceful: true
      }
    });
    observeHandle.stop();
    exit();
  }
});

ServerPresence.onCleanup = cleanupFunction => {
  if (typeof cleanupFunction === 'function') {
    exitFunctions.push(cleanupFunction);
  } else {
    throw new Meteor.Error('Not A Function', 'ServerPresence.onCleanup requires function as parameter');
  }
};

ServerPresence.serverId = () => serverId;

Meteor.startup(() => {
  start();
});
/*
*  Here we are catching signals due to the fact that node (Maybe it's a Meteor issue?) doesn't
*  seem to run the exit callbacks except for SIGHUP. Being that SIGTERM is the standard POSIX
*  signal sent when a system shuts down, it doesn't make much sense to only run out cleanup on
*  HUP signals.
*/

['SIGINT', 'SIGHUP', 'SIGTERM'].forEach(sig => {
  process.once(sig, () => {
    stop();
    process.kill(process.pid, sig);
  });
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/socialize:server-presence/server-presence.js");

/* Exports */
Package._define("socialize:server-presence", exports);

})();

//# sourceURL=meteor://💻app/packages/socialize_server-presence.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc29jaWFsaXplOnNlcnZlci1wcmVzZW5jZS9zZXJ2ZXItcHJlc2VuY2UuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0IiwiU2VydmVyUHJlc2VuY2UiLCJNZXRlb3IiLCJsaW5rIiwidiIsIk1vbmdvIiwiU2VydmVycyIsIkNvbGxlY3Rpb24iLCJfZW5zdXJlSW5kZXgiLCJsYXN0UGluZyIsImV4cGlyZUFmdGVyU2Vjb25kcyIsImNyZWF0ZWRBdCIsInNlcnZlcklkIiwiaXNXYXRjaGVyIiwib2JzZXJ2ZUhhbmRsZSIsImV4aXRHcmFjZWZ1bGx5IiwiZXhpdEZ1bmN0aW9ucyIsImluc2VydCIsImRhdGUiLCJEYXRlIiwicnVuQ2xlYW51cEZ1bmN0aW9ucyIsInJlbW92ZWRTZXJ2ZXJJZCIsImZvckVhY2giLCJleGl0RnVuYyIsInNldEFzV2F0Y2hlciIsInVwZGF0ZSIsIl9pZCIsIiRzZXQiLCJ3YXRjaGVyIiwidXBkYXRlV2F0Y2hlciIsInNlcnZlciIsImZpbmRPbmUiLCJzb3J0Iiwib2JzZXJ2ZSIsImZpbmQiLCJyZW1vdmVkIiwiZG9jdW1lbnQiLCJfZGVidWciLCJwcm9jZXNzIiwia2lsbCIsInBpZCIsImdyYWNlZnVsIiwiY2hlY2tGb3JXYXRjaGVyIiwiY3VycmVudCIsInN0YXJ0Iiwic2V0SW50ZXJ2YWwiLCJzZXJ2ZXJUaWNrIiwiZXhpdCIsInN0b3AiLCJiaW5kRW52aXJvbm1lbnQiLCJib3VuZEVudmlyb25tZW50Iiwib25DbGVhbnVwIiwiY2xlYW51cEZ1bmN0aW9uIiwicHVzaCIsIkVycm9yIiwic3RhcnR1cCIsInNpZyIsIm9uY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUFBLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjO0FBQUNDLGdCQUFjLEVBQUMsTUFBSUE7QUFBcEIsQ0FBZDtBQUFtRCxJQUFJQyxNQUFKO0FBQVdILE1BQU0sQ0FBQ0ksSUFBUCxDQUFZLGVB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QztBQUFFZSxVQUFJLEVBQUU7QUFBRWMsZ0JBQVEsRUFBRTtBQUFaO0FBQVIsS0FBbEM7QUFDQTNCLGlCQUFhLENBQUNrQyxJQUFkO0FBQ0FELFFBQUk7QUFDUDtBQUNKLENBTlksQ0FBYjs7QUFTQTlDLGNBQWMsQ0FBQ2tELFNBQWYsR0FBNEJDLGVBQUQsSUFBcUI7QUFDNUMsTUFBSSxPQUFPQSxlQUFQLEtBQTJCLFVBQS9CLEVBQTJDO0FBQ3ZDcEMsaUJBQWEsQ0FBQ3FDLElBQWQsQ0FBbUJELGVBQW5CO0FBQ0gsR0FGRCxNQUVPO0FBQ0gsVUFBTSxJQUFJbEQsTUFBTSxDQUFDb0QsS0FBWCxDQUFpQixnQkFBakIsRUFBbUMseURBQW5DLENBQU47QUFDSDtBQUNKLENBTkQ7O0FBUUFyRCxjQUFjLENBQUNXLFFBQWYsR0FBMEIsTUFBTUEsUUFBaEM7O0FBRUFWLE1BQU0sQ0FBQ3FELE9BQVAsQ0FBZSxNQUFNO0FBQ2pCWCxPQUFLO0FBQ1IsQ0FGRDtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDLFFBQUQsRUFBVyxRQUFYLEVBQXFCLFNBQXJCLEVBQWdDdEIsT0FBaEMsQ0FBeUNrQyxHQUFELElBQVM7QUFDL0NsQixTQUFPLENBQUNtQixJQUFSLENBQWFELEdBQWIsRUFBa0IsTUFBTTtBQUN0QlIsUUFBSTtBQUNKVixXQUFPLENBQUNDLElBQVIsQ0FBYUQsT0FBTyxDQUFDRSxHQUFyQixFQUEwQmdCLEdBQTFCO0FBQ0QsR0FIRDtBQUlELENBTEQsRSIsImZpbGUiOiIvcGFja2FnZXMvc29jaWFsaXplX3NlcnZlci1wcmVzZW5jZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIGltcG9ydC9uby11bnJlc29sdmVkICovXG5pbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcbmltcG9ydCB7IE1vbmdvIH0gZnJvbSAnbWV0ZW9yL21vbmdvJztcbi8qIGVzbGludC1lbmFibGUgaW1wb3J0L25vLXVucmVzb2x2ZWQgKi9cblxuY29uc3QgU2VydmVycyA9IG5ldyBNb25nby5Db2xsZWN0aW9uKCdwcmVzZW5jZTpzZXJ2ZXJzJyk7XG5cblNlcnZlcnMuX2Vuc3VyZUluZGV4KHsgbGFzdFBpbmc6IDEgfSwgeyBleHBpcmVBZnRlclNlY29uZHM6IDEwIH0pO1xuU2VydmVycy5fZW5zdXJlSW5kZXgoeyBjcmVhdGVkQXQ6IC0xIH0pO1xuXG5sZXQgc2VydmVySWQgPSBudWxsO1xubGV0IGlzV2F0Y2hlciA9IGZhbHNlO1xubGV0IG9ic2VydmVIYW5kbGUgPSBudWxsO1xubGV0IGV4aXRHcmFjZWZ1bGx5ID0gdHJ1ZTtcblxuY29uc3QgZXhpdEZ1bmN0aW9ucyA9IFtdO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBpbXBvcnQvcHJlZmVyLWRlZmF1bHQtZXhwb3J0ICovXG5leHBvcnQgY29uc3QgU2VydmVyUHJlc2VuY2UgPSB7fTtcblxuY29uc3QgaW5zZXJ0ID0gKCkgPT4ge1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIHNlcnZlcklkID0gU2VydmVycy5pbnNlcnQoeyBsYXN0UGluZzogZGF0ZSwgY3JlYXRlZEF0OiBkYXRlIH0pO1xufTtcblxuY29uc3QgcnVuQ2xlYW51cEZ1bmN0aW9ucyA9IChyZW1vdmVkU2VydmVySWQpID0+IHtcbiAgICBleGl0RnVuY3Rpb25zLmZvckVhY2goKGV4aXRGdW5jKSA9PiB7XG4gICAgICAgIGV4aXRGdW5jKHJlbW92ZWRTZXJ2ZXJJZCk7XG4gICAgfSk7XG59O1xuXG5jb25zdCBzZXRBc1dhdGNoZXIgPSAoKSA9PiB7XG4gICAgaXNXYXRjaGVyID0gdHJ1ZTtcbiAgICBTZXJ2ZXJzLnVwZGF0ZSh7IF9pZDogc2VydmVySWQgfSwgeyAkc2V0OiB7IHdhdGNoZXI6IHRydWUgfSB9KTtcbn07XG5cbmNvbnN0IHVwZGF0ZVdhdGNoZXIgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2VydmVyID0gU2VydmVycy5maW5kT25lKHt9LCB7IHNvcnQ6IHsgY3JlYXRlZEF0OiAtMSB9IH0pO1xuICAgIGlmIChzZXJ2ZXIuX2lkID09PSBzZXJ2ZXJJZCkge1xuICAgICAgICBzZXRBc1dhdGNoZXIoKTtcbiAgICB9XG59O1xuXG5jb25zdCBvYnNlcnZlID0gKCkgPT4ge1xuICAgIG9ic2VydmVIYW5kbGUgPSBTZXJ2ZXJzLmZpbmQoKS5vYnNlcnZlKHtcbiAgICAgICAgcmVtb3ZlZChkb2N1bWVudCkge1xuICAgICAgICAgICAgaWYgKGRvY3VtZW50Ll9pZCA9PT0gc2VydmVySWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzV2F0Y2hlcikge1xuICAgICAgICAgICAgICAgICAgICBNZXRlb3IuX2RlYnVnKCdTZXJ2ZXIgUHJlc2VuY2UgVGltZW91dCcsICdUaGUgc2VydmVyLXByZXNlbmNlIHBhY2thZ2UgaGFzIGRldGVjdGVkIGluY29uc2lzdGVudCBwcmVzZW5jZSBzdGF0ZS4gVG8gYXZvaWQgaW5jb25zaXN0ZW50IGRhdGFiYXNlIHN0YXRlIHlvdXIgYXBwbGljYXRpb24gaXMgZXhpdGluZy4nKTtcbiAgICAgICAgICAgICAgICAgICAgZXhpdEdyYWNlZnVsbHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5raWxsKHByb2Nlc3MucGlkLCAnU0lHSFVQJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc1dhdGNoZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWRvY3VtZW50LmdyYWNlZnVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bkNsZWFudXBGdW5jdGlvbnMoZG9jdW1lbnQuX2lkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50LndhdGNoZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWRvY3VtZW50LmdyYWNlZnVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bkNsZWFudXBGdW5jdGlvbnMoZG9jdW1lbnQuX2lkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdXBkYXRlV2F0Y2hlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH0pO1xufTtcblxuY29uc3QgY2hlY2tGb3JXYXRjaGVyID0gKCkgPT4ge1xuICAgIGNvbnN0IGN1cnJlbnQgPSBTZXJ2ZXJzLmZpbmRPbmUoeyB3YXRjaGVyOiB0cnVlIH0pO1xuICAgIGlmIChjdXJyZW50KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBzZXRBc1dhdGNoZXIoKTtcbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5jb25zdCBzdGFydCA9ICgpID0+IHtcbiAgICBvYnNlcnZlKCk7XG5cbiAgICBNZXRlb3Iuc2V0SW50ZXJ2YWwoZnVuY3Rpb24gc2VydmVyVGljaygpIHtcbiAgICAgICAgU2VydmVycy51cGRhdGUoc2VydmVySWQsIHsgJHNldDogeyBsYXN0UGluZzogbmV3IERhdGUoKSB9IH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LCA1MDAwKTtcblxuICAgIGluc2VydCgpO1xuXG4gICAgLy8gaWYgdGhlcmUgaXNuJ3QgYW55IG90aGVyIGluc3RhbmNlIHdhdGNoaW5nIGFuZCBkb2luZyBjbGVhbnVwXG4gICAgLy8gdGhlbiB3ZSBuZWVkIHRvIGRvIGEgZnVsbCBjbGVhbnVwIHNpbmNlIHRoaXMgaXMgbGlrZWx5IHRoZSBvbmx5IGluc3RhbmNlXG4gICAgaWYgKCFjaGVja0ZvcldhdGNoZXIoKSkge1xuICAgICAgICBydW5DbGVhbnVwRnVuY3Rpb25zKCk7XG4gICAgfVxufTtcblxuY29uc3QgZXhpdCA9ICgpID0+IHtcbiAgICAvLyBDYWxsIGFsbCBvZiBvdXIgZXh0ZXJuYWxseSBzdXBwbGllZCBleGl0IGZ1bmN0aW9uc1xuICAgIHJ1bkNsZWFudXBGdW5jdGlvbnMoc2VydmVySWQpO1xufTtcblxuLypcbiogIFdlIGhhdmUgdG8gYmluZCB0aGUgbWV0ZW9yIGVudmlyb25tZW50IGhlcmUgc2luY2UgcHJvY2VzcyBldmVudCBjYWxsYmFja3NcbiogIHJ1biBvdXRzaWRlIGZpYmVyc1xuKi9cbmNvbnN0IHN0b3AgPSBNZXRlb3IuYmluZEVudmlyb25tZW50KGZ1bmN0aW9uIGJvdW5kRW52aXJvbm1lbnQoKSB7XG4gICAgaWYgKGV4aXRHcmFjZWZ1bGx5KSB7XG4gICAgICAgIFNlcnZlcnMudXBkYXRlKHsgX2lkOiBzZXJ2ZXJJZCB9LCB7ICRzZXQ6IHsgZ3JhY2VmdWw6IHRydWUgfSB9KTtcbiAgICAgICAgb2JzZXJ2ZUhhbmRsZS5zdG9wKCk7XG4gICAgICAgIGV4aXQoKTtcbiAgICB9XG59KTtcblxuXG5TZXJ2ZXJQcmVzZW5jZS5vbkNsZWFudXAgPSAoY2xlYW51cEZ1bmN0aW9uKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBjbGVhbnVwRnVuY3Rpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZXhpdEZ1bmN0aW9ucy5wdXNoKGNsZWFudXBGdW5jdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcignTm90IEEgRnVuY3Rpb24nLCAnU2VydmVyUHJlc2VuY2Uub25DbGVhbnVwIHJlcXVpcmVzIGZ1bmN0aW9uIGFzIHBhcmFtZXRlcicpO1xuICAgIH1cbn07XG5cblNlcnZlclByZXNlbmNlLnNlcnZlcklkID0gKCkgPT4gc2VydmVySWQ7XG5cbk1ldGVvci5zdGFydHVwKCgpID0+IHtcbiAgICBzdGFydCgpO1xufSk7XG5cbi8qXG4qICBIZXJlIHdlIGFyZSBjYXRjaGluZyBzaWduYWxzIGR1ZSB0byB0aGUgZmFjdCB0aGF0IG5vZGUgKE1heWJlIGl0J3MgYSBNZXRlb3IgaXNzdWU/KSBkb2Vzbid0XG4qICBzZWVtIHRvIHJ1biB0aGUgZXhpdCBjYWxsYmFja3MgZXhjZXB0IGZvciBTSUdIVVAuIEJlaW5nIHRoYXQgU0lHVEVSTSBpcyB0aGUgc3RhbmRhcmQgUE9TSVhcbiogIHNpZ25hbCBzZW50IHdoZW4gYSBzeXN0ZW0gc2h1dHMgZG93biwgaXQgZG9lc24ndCBtYWtlIG11Y2ggc2Vuc2UgdG8gb25seSBydW4gb3V0IGNsZWFudXAgb25cbiogIEhVUCBzaWduYWxzLlxuKi9cblxuWydTSUdJTlQnLCAnU0lHSFVQJywgJ1NJR1RFUk0nXS5mb3JFYWNoKChzaWcpID0+IHtcbiAgcHJvY2Vzcy5vbmNlKHNpZywgKCkgPT4ge1xuICAgIHN0b3AoKTtcbiAgICBwcm9jZXNzLmtpbGwocHJvY2Vzcy5waWQsIHNpZyk7XG4gIH0pO1xufSk7XG4iXX0=
