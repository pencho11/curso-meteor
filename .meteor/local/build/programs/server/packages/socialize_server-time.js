(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"socialize:server-time":{"server":{"server-time.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/socialize_server-time/server/server-time.js              //
//                                                                   //
///////////////////////////////////////////////////////////////////////
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
let ServerTime;
module.link("../common/server-time", {
  ServerTime(v) {
    ServerTime = v;
  }

}, 1);
Meteor.methods({
  'socialize:getServerTime': function getServerTime() {
    return Date.now();
  }
});
///////////////////////////////////////////////////////////////////////

}},"common":{"server-time.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/socialize_server-time/common/server-time.js              //
//                                                                   //
///////////////////////////////////////////////////////////////////////
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
///////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/socialize:server-time/server/server-time.js");

/* Exports */
Package._define("socialize:server-time", exports);

})();

//# sourceURL=meteor://💻app/packages/socialize_server-time.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc29jaWFsaXplOnNlcnZlci10aW1lL3NlcnZlci9zZXJ2ZXItdGltZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc29jaWFsaXplOnNlcnZlci10aW1lL2NvbW1vbi9zZXJ2ZXItdGltZS5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnQiLCJTZXJ2ZXJUaW1lIiwiTWV0ZW9yIiwibGluayIsInYiLCJtZXRob2RzIiwiZ2V0U2VydmVyVGltZSIsIkRhdGUiLCJub3ciLCJfdGltZURpZmZlcmVuY2UiLCJkYXRlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsTUFBTSxDQUFDQyxNQUFQLENBQWM7QUFBQ0MsWUFBVSxFQUFDLE1BQUlBO0FBQWhCLENBQWQ7QUFBMkMsSUFBSUMsTUFBSjtBQUFXSCxNQUFNLENBQUNJLElBQVAsQ0FBWSxlQUFaLEVBQTRCO0FBQUNELFFBQU0sQ0FBQ0UsQ0FBRCxFQUFHO0FBQUNGLFVBQU0sR0FBQ0UsQ0FBUDtBQUFTOztBQUFwQixDQUE1QixFQUFrRCxDQUFsRDtBQUFxRCxJQUFJSCxVQUFKO0FBQWVGLE1BQU0sQ0FBQ0ksSUFBUCxDQUFZLHVCQUFaLEVBQW9DO0FBQUNGLFlBQVUsQ0FBQ0csQ0FBRCxFQUFHO0FBQUNILGNBQVUsR0FBQ0csQ0FBWDtBQUFhOztBQUE1QixDQUFwQyxFQUFrRSxDQUFsRTtBQU8xSEYsTUFBTSxDQUFDRyxPQUFQLENBQWU7QUFDWCw2QkFBMkIsU0FBU0MsYUFBVCxHQUF5QjtBQUNoRCxXQUFPQyxJQUFJLENBQUNDLEdBQUwsRUFBUDtBQUNIO0FBSFUsQ0FBZixFOzs7Ozs7Ozs7OztBQ1BBVCxNQUFNLENBQUNDLE1BQVAsQ0FBYztBQUFDQyxZQUFVLEVBQUMsTUFBSUE7QUFBaEIsQ0FBZDtBQUFPLE1BQU1BLFVBQVUsR0FBRztBQUN0QlEsaUJBQWUsRUFBRTtBQURLLENBQW5COztBQUlQUixVQUFVLENBQUNPLEdBQVgsR0FBaUIsU0FBU0EsR0FBVCxHQUFlO0FBQUUsU0FBT0QsSUFBSSxDQUFDQyxHQUFMLEtBQWEsS0FBS0MsZUFBekI7QUFBMkMsQ0FBN0U7O0FBRUFSLFVBQVUsQ0FBQ1MsSUFBWCxHQUFrQixTQUFTQSxJQUFULEdBQWdCO0FBQUUsU0FBTyxJQUFJSCxJQUFKLENBQVMsS0FBS0MsR0FBTCxFQUFULENBQVA7QUFBOEIsQ0FBbEUsQyIsImZpbGUiOiIvcGFja2FnZXMvc29jaWFsaXplX3NlcnZlci10aW1lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgaW1wb3J0L25vLXVucmVzb2x2ZWQgKi9cbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG4vKiBlc2xpbnQtZW5hYmxlIGltcG9ydC9uby11bnJlc29sdmVkICovXG5cbmltcG9ydCB7IFNlcnZlclRpbWUgfSBmcm9tICcuLi9jb21tb24vc2VydmVyLXRpbWUnO1xuXG5NZXRlb3IubWV0aG9kcyh7XG4gICAgJ3NvY2lhbGl6ZTpnZXRTZXJ2ZXJUaW1lJzogZnVuY3Rpb24gZ2V0U2VydmVyVGltZSgpIHtcbiAgICAgICAgcmV0dXJuIERhdGUubm93KCk7XG4gICAgfSxcbn0pO1xuXG5leHBvcnQgeyBTZXJ2ZXJUaW1lIH07XG4iLCJleHBvcnQgY29uc3QgU2VydmVyVGltZSA9IHtcbiAgICBfdGltZURpZmZlcmVuY2U6IDAsXG59O1xuXG5TZXJ2ZXJUaW1lLm5vdyA9IGZ1bmN0aW9uIG5vdygpIHsgcmV0dXJuIERhdGUubm93KCkgKyB0aGlzLl90aW1lRGlmZmVyZW5jZTsgfTtcblxuU2VydmVyVGltZS5kYXRlID0gZnVuY3Rpb24gZGF0ZSgpIHsgcmV0dXJuIG5ldyBEYXRlKHRoaXMubm93KCkpOyB9O1xuIl19
