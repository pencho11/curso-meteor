(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"akryum:vue-component-dev-server":{"server":{"main.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/akryum_vue-component-dev-server/server/main.js                                                  //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
let os;
module.link("os", {
  default(v) {
    os = v;
  }

}, 0);

function getMeteorPort() {
  const reg = /:\/\/.+:(\d+)/gi;
  const result = reg.exec(Meteor.absoluteUrl());

  if (result && result.length >= 2) {
    return parseInt(result[1]) + 3;
  }
}

function getLocalIp() {
  const ifaces = os.networkInterfaces();
  let ip;

  for (const key of Object.keys(ifaces)) {
    const interfaces = ifaces[key];

    for (const iface of interfaces) {
      if (iface.family !== 'IPv4' || iface.internal !== false) {// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      } else {
        ip = iface.address;
        break;
      }
    }

    if (ip) {
      break;
    }
  }

  if (!ip) {
    console.warn("[HMR] No local IP detected. If you want to connect from a remote device, set the local IP with the 'HMR_URL' env. variable.");
    ip = '127.0.0.1';
  } else {// console.warn(`[HMR] Local IP detected: '${ip}'. If you have issues connecting from a remote device, set the local IP with the 'HMR_URL' env. variable.`)
  }

  return ip;
} // to define only dev port with same url


const PORT = parseInt(process.env.HMR_PORT) || parseInt(process.env.VUE_DEV_SERVER_PORT) || getMeteorPort() || 3003; // to define full url with port (example: https://dev.example.com:8443) or only domain

const DEVURL = process.env.HMR_URL || process.env.VUE_DEV_SERVER_URL || getLocalIp(); // Client-side config

__meteor_runtime_config__.VUE_DEV_SERVER_URL = DEVURL.indexOf(':') === -1 ? "".concat(DEVURL, ":").concat(PORT) : DEVURL;
__meteor_runtime_config__.VUE_NO_HMR = !!process.env.NO_HMR;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/akryum:vue-component-dev-server/server/main.js");

/* Exports */
Package._define("akryum:vue-component-dev-server", exports);

})();

//# sourceURL=meteor://💻app/packages/akryum_vue-component-dev-server.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWtyeXVtOnZ1ZS1jb21wb25lbnQtZGV2LXNlcnZlci9zZXJ2ZXIvbWFpbi5qcyJdLCJuYW1lcyI6WyJvcyIsIm1vZHVsZSIsImxpbmsiLCJkZWZhdWx0IiwidiIsImdldE1ldGVvclBvcnQiLCJyZWciLCJyZXN1bHQiLCJleGVjIiwiTWV0ZW9yIiwiYWJzb2x1dGVVcmwiLCJsZW5ndGgiLCJwYXJzZUludCIsImdldExvY2FsSXAiLCJpZmFjZXMiLCJuZXR3b3JrSW50ZXJmYWNlcyIsImlwIiwia2V5IiwiT2JqZWN0Iiwia2V5cyIsImludGVyZmFjZXMiLCJpZmFjZSIsImZhbWlseSIsImludGVybmFsIiwiYWRkcmVzcyIsImNvbnNvbGUiLCJ3YXJuIiwiUE9SVCIsInByb2Nlc3MiLCJlbnYiLCJITVJfUE9SVCIsIlZVRV9ERVZfU0VSVkVSX1BPUlQiLCJERVZVUkwiLCJITVJfVVJMIiwiVlVFX0RFVl9TRVJWRVJfVVJMIiwiX19tZXRlb3JfcnVudGltZV9jb25maWdfXyIsImluZGV4T2YiLCJWVUVfTk9fSE1SIiwiTk9fSE1SIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFJQSxFQUFKO0FBQU9DLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLElBQVosRUFBaUI7QUFBQ0MsU0FBTyxDQUFDQyxDQUFELEVBQUc7QUFBQ0osTUFBRSxHQUFDSSxDQUFIO0FBQUs7O0FBQWpCLENBQWpCLEVBQW9DLENBQXBDOztBQUVQLFNBQVNDLGFBQVQsR0FBMEI7QUFDeEIsUUFBTUMsR0FBRyxHQUFHLGlCQUFaO0FBQ0EsUUFBTUMsTUFBTSxHQUFHRCxHQUFHLENBQUNFLElBQUosQ0FBU0MsTUFBTSxDQUFDQyxXQUFQLEVBQVQsQ0FBZjs7QUFDQSxNQUFJSCxNQUFNLElBQUlBLE1BQU0sQ0FBQ0ksTUFBUCxJQUFpQixDQUEvQixFQUFrQztBQUNoQyxXQUFPQyxRQUFRLENBQUNMLE1BQU0sQ0FBQyxDQUFELENBQVAsQ0FBUixHQUFzQixDQUE3QjtBQUNEO0FBQ0Y7O0FBRUQsU0FBU00sVUFBVCxHQUF1QjtBQUNyQixRQUFNQyxNQUFNLEdBQUdkLEVBQUUsQ0FBQ2UsaUJBQUgsRUFBZjtBQUVBLE1BQUlDLEVBQUo7O0FBQ0EsT0FBSyxNQUFNQyxHQUFYLElBQWtCQyxNQUFNLENBQUNDLElBQVAsQ0FBWUwsTUFBWixDQUFsQixFQUF1QztBQUNyQyxVQUFNTSxVQUFVLEdBQUdOLE1BQU0sQ0FBQ0csR0FBRCxDQUF6Qjs7QUFDQSxTQUFLLE1BQU1JLEtBQVgsSUFBb0JELFVBQXBCLEVBQWdDO0FBQzlCLFVBQUlDLEtBQUssQ0FBQ0MsTUFBTixLQUFpQixNQUFqQixJQUEyQkQsS0FBSyxDQUFDRSxRQUFOLEtBQW1CLEtBQWxELEVBQXlELENBQ3ZEO0FBQ0QsT0FGRCxNQUVPO0FBQ0xQLFVBQUUsR0FBR0ssS0FBSyxDQUFDRyxPQUFYO0FBQ0E7QUFDRDtBQUNGOztBQUNELFFBQUlSLEVBQUosRUFBUTtBQUNOO0FBQ0Q7QUFDRjs7QUFFRCxNQUFJLENBQUNBLEVBQUwsRUFBUztBQUNQUyxXQUFPLENBQUNDLElBQVI7QUFDQVYsTUFBRSxHQUFHLFdBQUw7QUFDRCxHQUhELE1BR08sQ0FDTDtBQUNEOztBQUVELFNBQU9BLEVBQVA7QUFDRCxDLENBRUQ7OztBQUNBLE1BQU1XLElBQUksR0FBR2YsUUFBUSxDQUFDZ0IsT0FBTyxDQUFDQyxHQUFSLENBQVlDLFFBQWIsQ0FBUixJQUFrQ2xCLFFBQVEsQ0FBQ2dCLE9BQU8sQ0FBQ0MsR0FBUixDQUFZRSxtQkFBYixDQUExQyxJQUErRTFCLGFBQWEsRUFBNUYsSUFBa0csSUFBL0csQyxDQUVBOztBQUNBLE1BQU0yQixNQUFNLEdBQUdKLE9BQU8sQ0FBQ0MsR0FBUixDQUFZSSxPQUFaLElBQXVCTCxPQUFPLENBQUNDLEdBQVIsQ0FBWUssa0JBQW5DLElBQXlEckIsVUFBVSxFQUFsRixDLENBRUE7O0FBQ0FzQix5QkFBeUIsQ0FBQ0Qsa0JBQTFCLEdBQStDRixNQUFNLENBQUNJLE9BQVAsQ0FBZSxHQUFmLE1BQXdCLENBQUMsQ0FBekIsYUFBZ0NKLE1BQWhDLGNBQTBDTCxJQUExQyxJQUFtREssTUFBbEc7QUFDQUcseUJBQXlCLENBQUNFLFVBQTFCLEdBQXVDLENBQUMsQ0FBQ1QsT0FBTyxDQUFDQyxHQUFSLENBQVlTLE1BQXJELEMiLCJmaWxlIjoiL3BhY2thZ2VzL2Frcnl1bV92dWUtY29tcG9uZW50LWRldi1zZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgb3MgZnJvbSAnb3MnXG5cbmZ1bmN0aW9uIGdldE1ldGVvclBvcnQgKCkge1xuICBjb25zdCByZWcgPSAvOlxcL1xcLy4rOihcXGQrKS9naVxuICBjb25zdCByZXN1bHQgPSByZWcuZXhlYyhNZXRlb3IuYWJzb2x1dGVVcmwoKSlcbiAgaWYgKHJlc3VsdCAmJiByZXN1bHQubGVuZ3RoID49IDIpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQocmVzdWx0WzFdKSArIDNcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRMb2NhbElwICgpIHtcbiAgY29uc3QgaWZhY2VzID0gb3MubmV0d29ya0ludGVyZmFjZXMoKVxuXG4gIGxldCBpcFxuICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhpZmFjZXMpKSB7XG4gICAgY29uc3QgaW50ZXJmYWNlcyA9IGlmYWNlc1trZXldXG4gICAgZm9yIChjb25zdCBpZmFjZSBvZiBpbnRlcmZhY2VzKSB7XG4gICAgICBpZiAoaWZhY2UuZmFtaWx5ICE9PSAnSVB2NCcgfHwgaWZhY2UuaW50ZXJuYWwgIT09IGZhbHNlKSB7XG4gICAgICAgIC8vIHNraXAgb3ZlciBpbnRlcm5hbCAoaS5lLiAxMjcuMC4wLjEpIGFuZCBub24taXB2NCBhZGRyZXNzZXNcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlwID0gaWZhY2UuYWRkcmVzc1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXApIHtcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKCFpcCkge1xuICAgIGNvbnNvbGUud2FybihgW0hNUl0gTm8gbG9jYWwgSVAgZGV0ZWN0ZWQuIElmIHlvdSB3YW50IHRvIGNvbm5lY3QgZnJvbSBhIHJlbW90ZSBkZXZpY2UsIHNldCB0aGUgbG9jYWwgSVAgd2l0aCB0aGUgJ0hNUl9VUkwnIGVudi4gdmFyaWFibGUuYClcbiAgICBpcCA9ICcxMjcuMC4wLjEnXG4gIH0gZWxzZSB7XG4gICAgLy8gY29uc29sZS53YXJuKGBbSE1SXSBMb2NhbCBJUCBkZXRlY3RlZDogJyR7aXB9Jy4gSWYgeW91IGhhdmUgaXNzdWVzIGNvbm5lY3RpbmcgZnJvbSBhIHJlbW90ZSBkZXZpY2UsIHNldCB0aGUgbG9jYWwgSVAgd2l0aCB0aGUgJ0hNUl9VUkwnIGVudi4gdmFyaWFibGUuYClcbiAgfVxuXG4gIHJldHVybiBpcFxufVxuXG4vLyB0byBkZWZpbmUgb25seSBkZXYgcG9ydCB3aXRoIHNhbWUgdXJsXG5jb25zdCBQT1JUID0gcGFyc2VJbnQocHJvY2Vzcy5lbnYuSE1SX1BPUlQpIHx8IHBhcnNlSW50KHByb2Nlc3MuZW52LlZVRV9ERVZfU0VSVkVSX1BPUlQpIHx8IGdldE1ldGVvclBvcnQoKSB8fCAzMDAzXG5cbi8vIHRvIGRlZmluZSBmdWxsIHVybCB3aXRoIHBvcnQgKGV4YW1wbGU6IGh0dHBzOi8vZGV2LmV4YW1wbGUuY29tOjg0NDMpIG9yIG9ubHkgZG9tYWluXG5jb25zdCBERVZVUkwgPSBwcm9jZXNzLmVudi5ITVJfVVJMIHx8IHByb2Nlc3MuZW52LlZVRV9ERVZfU0VSVkVSX1VSTCB8fCBnZXRMb2NhbElwKClcblxuLy8gQ2xpZW50LXNpZGUgY29uZmlnXG5fX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLlZVRV9ERVZfU0VSVkVSX1VSTCA9IERFVlVSTC5pbmRleE9mKCc6JykgPT09IC0xID8gYCR7REVWVVJMfToke1BPUlR9YCA6IERFVlVSTFxuX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5WVUVfTk9fSE1SID0gISFwcm9jZXNzLmVudi5OT19ITVJcbiJdfQ==
