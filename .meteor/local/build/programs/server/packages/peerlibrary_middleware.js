(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var _ = Package.underscore._;
var Promise = Package.promise.Promise;
var meteorInstall = Package.modules.meteorInstall;

/* Package-scope variables */
var __coffeescriptShare, PublishEndpoint, PublishMiddleware;

var require = meteorInstall({"node_modules":{"meteor":{"peerlibrary:middleware":{"server.coffee":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                    //
// packages/peerlibrary_middleware/server.coffee                                                      //
//                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                      //
__coffeescriptShare = typeof __coffeescriptShare === 'object' ? __coffeescriptShare : {}; var share = __coffeescriptShare;
module.export({
  PublishEndpoint: () => PublishEndpoint,
  PublishMiddleware: () => PublishMiddleware
});

let _;

module.link("meteor/underscore", {
  _(v) {
    _ = v;
  }

}, 0);
let Fiber;
module.link("fibers", {
  default(v) {
    Fiber = v;
  }

}, 1);
var MiddlewarePublish,
    isInsideNoYieldsAllowed,
    savedYield,
    hasProp = {}.hasOwnProperty;
savedYield = Fiber.yield; // When inside Meteor._noYieldsAllowed Fiber.yield is overridden with
// a function which throws an exception, so is not savedYield anymore.
// Afterwards Fiber.yield is restored back to savedYield.

isInsideNoYieldsAllowed = function () {
  return Fiber.yield !== savedYield;
};

MiddlewarePublish = class MiddlewarePublish {
  constructor(publish1) {
    var key, ref, value;
    this.publish = publish1; // We store those methods at construction time because
    // we override them later on publish object.

    this._publishAdded = this.publish.added.bind(this.publish);
    this._publishChanged = this.publish.changed.bind(this.publish);
    this._publishRemoved = this.publish.removed.bind(this.publish);
    this._publishReady = this.publish.ready.bind(this.publish);
    this._publishStop = this.publish.stop.bind(this.publish);
    this._publishError = this.publish.error.bind(this.publish);
    ref = this.publish;

    for (key in ref) {
      if (!hasProp.call(ref, key)) continue;
      value = ref[key];

      if (key !== 'added' && key !== 'changed' && key !== 'removed' && key !== 'ready' && key !== 'stop' && key !== 'error') {
        this[key] = value;
      }
    }
  }

  added(...args) {
    return this._publishAdded(...args);
  }

  changed(...args) {
    return this._publishChanged(...args);
  }

  removed(...args) {
    return this._publishRemoved(...args);
  }

  ready(...args) {
    return this._publishReady(...args);
  }

  stop(...args) {
    return this._publishStop(...args);
  }

  error(...args) {
    return this._publishError(...args);
  }

};
var PublishEndpoint = class PublishEndpoint {
  constructor(options, publishFunction) {
    var self;
    this.options = options;
    this.publishFunction = publishFunction; // To pass null (autopublish) or string directly for name

    if (this.options === null || _.isString(this.options)) {
      this.options = {
        name: this.options
      };
    }

    this.middlewares = [];
    self = this;
    Meteor.publish(this.options.name, function (...args) {
      var publish, state;
      publish = this;
      state = {};

      publish.params = function () {
        return args;
      };

      publish.set = function (key, value) {
        return state[key] = value;
      };

      publish.get = function (key) {
        return state[key];
      };

      return self.publish(self.middlewares, publish);
    });
  }

  publish(middlewares, publish) {
    var latestMiddleware, midlewarePublish, otherMiddlewares, publishRemoved;

    if (middlewares.length) {
      latestMiddleware = middlewares[middlewares.length - 1];
      otherMiddlewares = middlewares.slice(0, middlewares.length - 1);
      midlewarePublish = new MiddlewarePublish(publish);

      publish.added = function (collection, id, fields) {
        return latestMiddleware.added(midlewarePublish, collection, id, fields);
      };

      publish.changed = function (collection, id, fields) {
        return latestMiddleware.changed(midlewarePublish, collection, id, fields);
      };

      publishRemoved = publish.removed;

      publish.removed = function (collection, id) {
        // When unsubscribing, Meteor removes all documents so this callback is called
        // inside Meteor._noYieldsAllowed which means inside the callback no function
        // which calls yield can be called. Because this is often not true, in that
        // special case we are not going through middlewares but are directly calling
        // original removed callback.
        if (isInsideNoYieldsAllowed()) {
          return publishRemoved.call(publish, collection, id);
        } else {
          return latestMiddleware.removed(midlewarePublish, collection, id);
        }
      };

      publish.ready = function () {
        return latestMiddleware.onReady(midlewarePublish);
      };

      publish.stop = function () {
        return latestMiddleware.onStop(midlewarePublish);
      };

      publish.error = function (error) {
        return latestMiddleware.onError(midlewarePublish, error);
      };

      return this.publish(otherMiddlewares, publish);
    } else {
      return this.publishFunction.apply(publish, publish.params());
    }
  }

  use(middleware) {
    if (!(middleware instanceof PublishMiddleware)) {
      throw new Error(`Middleware '${middleware}' is not an instance of a PublishMiddleware class`);
    }

    return this.middlewares.push(middleware);
  }

};
var PublishMiddleware = class PublishMiddleware {
  added(publish, collection, id, fields) {
    return publish.added(collection, id, fields);
  }

  changed(publish, collection, id, fields) {
    return publish.changed(collection, id, fields);
  }

  removed(publish, collection, id) {
    return publish.removed(collection, id);
  }

  onReady(publish) {
    return publish.ready();
  }

  onStop(publish) {
    return publish.stop();
  }

  onError(publish, error) {
    return publish.error(error);
  }

};
////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json",
    ".coffee"
  ]
});

var exports = require("/node_modules/meteor/peerlibrary:middleware/server.coffee");

/* Exports */
Package._define("peerlibrary:middleware", exports, {
  PublishEndpoint: PublishEndpoint,
  PublishMiddleware: PublishMiddleware
});

})();

//# sourceURL=meteor://💻app/packages/peerlibrary_middleware.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcGVlcmxpYnJhcnlfbWlkZGxld2FyZS9zZXJ2ZXIuY29mZmVlIiwibWV0ZW9yOi8v8J+Su2FwcC9zZXJ2ZXIuY29mZmVlIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydCIsIlB1Ymxpc2hFbmRwb2ludCIsIlB1Ymxpc2hNaWRkbGV3YXJlIiwiXyIsImxpbmsiLCJ2IiwiRmliZXIiLCJkZWZhdWx0IiwiTWlkZGxld2FyZVB1Ymxpc2giLCJpc0luc2lkZU5vWWllbGRzQWxsb3dlZCIsInNhdmVkWWllbGQiLCJoYXNQcm9wIiwiaGFzT3duUHJvcGVydHkiLCJ5aWVsZCIsImNvbnN0cnVjdG9yIiwicHVibGlzaDEiLCJrZXkiLCJyZWYiLCJ2YWx1ZSIsInB1Ymxpc2giLCJfcHVibGlzaEFkZGVkIiwiYWRkZWQiLCJiaW5kIiwiX3B1Ymxpc2hDaGFuZ2VkIiwiY2hhbmdlZCIsIl9wdWJsaXNoUmVtb3ZlZCIsInJlbW92ZWQiLCJfcHVibGlzaFJlYWR5IiwicmVhZHkiLCJfcHVibGlzaFN0b3AiLCJzdG9wIiwiX3B1Ymxpc2hFcnJvciIsImVycm9yIiwiY2FsbCIsImFyZ3MiLCJvcHRpb25zIiwicHVibGlzaEZ1bmN0aW9uIiwic2VsZiIsImlzU3RyaW5nIiwibmFtZSIsIm1pZGRsZXdhcmVzIiwiTWV0ZW9yIiwic3RhdGUiLCJwYXJhbXMiLCJzZXQiLCJnZXQiLCJsYXRlc3RNaWRkbGV3YXJlIiwibWlkbGV3YXJlUHVibGlzaCIsIm90aGVyTWlkZGxld2FyZXMiLCJwdWJsaXNoUmVtb3ZlZCIsImxlbmd0aCIsInNsaWNlIiwiY29sbGVjdGlvbiIsImlkIiwiZmllbGRzIiwib25SZWFkeSIsIm9uU3RvcCIsIm9uRXJyb3IiLCJhcHBseSIsInVzZSIsIm1pZGRsZXdhcmUiLCJFcnJvciIsInB1c2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUFBLE1BQUEsQ0FBQUMsTUFBQTtBQUFBQyxp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RCxFQUFVaUMsVUFBVixFQUFzQkMsRUFBdEIsRUFBMEJDLE1BQTFCO0FDaUNQLFdEaENBbkMsT0FBTyxDQUFDSyxPQUFSLENBQWdCNEIsVUFBaEIsRUFBNEJDLEVBQTVCLEVBQWdDQyxNQUFoQyxDQ2dDQTtBRGpDTzs7QUFHVDVCLFNBQVMsQ0FBQ1AsT0FBRCxFQUFVaUMsVUFBVixFQUFzQkMsRUFBdEI7QUNrQ1AsV0RqQ0FsQyxPQUFPLENBQUNPLE9BQVIsQ0FBZ0IwQixVQUFoQixFQUE0QkMsRUFBNUIsQ0NpQ0E7QURsQ087O0FBR1RFLFNBQVMsQ0FBQ3BDLE9BQUQ7QUNtQ1AsV0RsQ0FBLE9BQU8sQ0FBQ1MsS0FBUixFQ2tDQTtBRG5DTzs7QUFHVDRCLFFBQVEsQ0FBQ3JDLE9BQUQ7QUNvQ04sV0RuQ0FBLE9BQU8sQ0FBQ1csSUFBUixFQ21DQTtBRHBDTTs7QUFHUjJCLFNBQVMsQ0FBQ3RDLE9BQUQsRUFBVWEsS0FBVjtBQ3FDUCxXRHBDQWIsT0FBTyxDQUFDYSxLQUFSLENBQWNBLEtBQWQsQ0NvQ0E7QURyQ087O0FBaEJKLENBQVAsQyIsImZpbGUiOiIvcGFja2FnZXMvcGVlcmxpYnJhcnlfbWlkZGxld2FyZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7X30gZnJvbSAnbWV0ZW9yL3VuZGVyc2NvcmUnXG5pbXBvcnQgRmliZXIgZnJvbSAnZmliZXJzJ1xuXG5zYXZlZFlpZWxkID0gRmliZXIueWllbGRcblxuIyBXaGVuIGluc2lkZSBNZXRlb3IuX25vWWllbGRzQWxsb3dlZCBGaWJlci55aWVsZCBpcyBvdmVycmlkZGVuIHdpdGhcbiMgYSBmdW5jdGlvbiB3aGljaCB0aHJvd3MgYW4gZXhjZXB0aW9uLCBzbyBpcyBub3Qgc2F2ZWRZaWVsZCBhbnltb3JlLlxuIyBBZnRlcndhcmRzIEZpYmVyLnlpZWxkIGlzIHJlc3RvcmVkIGJhY2sgdG8gc2F2ZWRZaWVsZC5cbmlzSW5zaWRlTm9ZaWVsZHNBbGxvd2VkID0gLT5cbiAgRmliZXIueWllbGQgaXNudCBzYXZlZFlpZWxkXG5cbmNsYXNzIE1pZGRsZXdhcmVQdWJsaXNoXG4gIGNvbnN0cnVjdG9yOiAoQHB1Ymxpc2gpIC0+XG4gICAgIyBXZSBzdG9yZSB0aG9zZSBtZXRob2RzIGF0IGNvbnN0cnVjdGlvbiB0aW1lIGJlY2F1c2VcbiAgICAjIHdlIG92ZXJyaWRlIHRoZW0gbGF0ZXIgb24gcHVibGlzaCBvYmplY3QuXG4gICAgQF9wdWJsaXNoQWRkZWQgPSBAcHVibGlzaC5hZGRlZC5iaW5kIEBwdWJsaXNoXG4gICAgQF9wdWJsaXNoQ2hhbmdlZCA9IEBwdWJsaXNoLmNoYW5nZWQuYmluZCBAcHVibGlzaFxuICAgIEBfcHVibGlzaFJlbW92ZWQgPSBAcHVibGlzaC5yZW1vdmVkLmJpbmQgQHB1Ymxpc2hcbiAgICBAX3B1Ymxpc2hSZWFkeSA9IEBwdWJsaXNoLnJlYWR5LmJpbmQgQHB1Ymxpc2hcbiAgICBAX3B1Ymxpc2hTdG9wID0gQHB1Ymxpc2guc3RvcC5iaW5kIEBwdWJsaXNoXG4gICAgQF9wdWJsaXNoRXJyb3IgPSBAcHVibGlzaC5lcnJvci5iaW5kIEBwdWJsaXNoXG5cbiAgICAjIFdlIGNvcHkgb3RoZXIgZmllbGRzIGFzIHRoZXkgYXJlXG4gICAgZm9yIG93biBrZXksIHZhbHVlIG9mIEBwdWJsaXNoIHdoZW4ga2V5IG5vdCBpbiBbJ2FkZGVkJywgJ2NoYW5nZWQnLCAncmVtb3ZlZCcsICdyZWFkeScsICdzdG9wJywgJ2Vycm9yJ11cbiAgICAgIEBba2V5XSA9IHZhbHVlXG5cbiAgYWRkZWQ6IChhcmdzLi4uKSAtPlxuICAgIEBfcHVibGlzaEFkZGVkIGFyZ3MuLi5cblxuICBjaGFuZ2VkOiAoYXJncy4uLikgLT5cbiAgICBAX3B1Ymxpc2hDaGFuZ2VkIGFyZ3MuLi5cblxuICByZW1vdmVkOiAoYXJncy4uLikgLT5cbiAgICBAX3B1Ymxpc2hSZW1vdmVkIGFyZ3MuLi5cblxuICByZWFkeTogKGFyZ3MuLi4pIC0+XG4gICAgQF9wdWJsaXNoUmVhZHkgYXJncy4uLlxuXG4gIHN0b3A6IChhcmdzLi4uKSAtPlxuICAgIEBfcHVibGlzaFN0b3AgYXJncy4uLlxuXG4gIGVycm9yOiAoYXJncy4uLikgLT5cbiAgICBAX3B1Ymxpc2hFcnJvciBhcmdzLi4uXG5cbmV4cG9ydCBjbGFzcyBQdWJsaXNoRW5kcG9pbnRcbiAgY29uc3RydWN0b3I6IChAb3B0aW9ucywgQHB1Ymxpc2hGdW5jdGlvbikgLT5cbiAgICAjIFRvIHBhc3MgbnVsbCAoYXV0b3B1Ymxpc2gpIG9yIHN0cmluZyBkaXJlY3RseSBmb3IgbmFtZVxuICAgIGlmIEBvcHRpb25zIGlzIG51bGwgb3IgXy5pc1N0cmluZyBAb3B0aW9uc1xuICAgICAgQG9wdGlvbnMgPVxuICAgICAgICBuYW1lOiBAb3B0aW9uc1xuXG4gICAgQG1pZGRsZXdhcmVzID0gW11cblxuICAgIHNlbGYgPSBAXG5cbiAgICBNZXRlb3IucHVibGlzaCBAb3B0aW9ucy5uYW1lLCAoYXJncy4uLikgLT5cbiAgICAgIHB1Ymxpc2ggPSBAXG5cbiAgICAgIHN0YXRlID0ge31cblxuICAgICAgcHVibGlzaC5wYXJhbXMgPSAtPlxuICAgICAgICBhcmdzXG5cbiAgICAgIHB1Ymxpc2guc2V0ID0gKGtleSwgdmFsdWUpIC0+XG4gICAgICAgIHN0YXRlW2tleV0gPSB2YWx1ZVxuXG4gICAgICBwdWJsaXNoLmdldCA9IChrZXkpIC0+XG4gICAgICAgIHN0YXRlW2tleV1cblxuICAgICAgc2VsZi5wdWJsaXNoIHNlbGYubWlkZGxld2FyZXMsIHB1Ymxpc2hcblxuICBwdWJsaXNoOiAobWlkZGxld2FyZXMsIHB1Ymxpc2gpIC0+XG4gICAgaWYgbWlkZGxld2FyZXMubGVuZ3RoXG4gICAgICBsYXRlc3RNaWRkbGV3YXJlID0gbWlkZGxld2FyZXNbbWlkZGxld2FyZXMubGVuZ3RoIC0gMV1cbiAgICAgIG90aGVyTWlkZGxld2FyZXMgPSBtaWRkbGV3YXJlc1swLi4ubWlkZGxld2FyZXMubGVuZ3RoIC0gMV1cblxuICAgICAgbWlkbGV3YXJlUHVibGlzaCA9IG5ldyBNaWRkbGV3YXJlUHVibGlzaCBwdWJsaXNoXG5cbiAgICAgIHB1Ymxpc2guYWRkZWQgPSAoY29sbGVjdGlvbiwgaWQsIGZpZWxkcykgLT5cbiAgICAgICAgbGF0ZXN0TWlkZGxld2FyZS5hZGRlZCBtaWRsZXdhcmVQdWJsaXNoLCBjb2xsZWN0aW9uLCBpZCwgZmllbGRzXG5cbiAgICAgIHB1Ymxpc2guY2hhbmdlZCA9IChjb2xsZWN0aW9uLCBpZCwgZmllbGRzKSAtPlxuICAgICAgICBsYXRlc3RNaWRkbGV3YXJlLmNoYW5nZWQgbWlkbGV3YXJlUHVibGlzaCwgY29sbGVjdGlvbiwgaWQsIGZpZWxkc1xuXG4gICAgICBwdWJsaXNoUmVtb3ZlZCA9IHB1Ymxpc2gucmVtb3ZlZFxuICAgICAgcHVibGlzaC5yZW1vdmVkID0gKGNvbGxlY3Rpb24sIGlkKSAtPlxuICAgICAgICAjIFdoZW4gdW5zdWJzY3JpYmluZywgTWV0ZW9yIHJlbW92ZXMgYWxsIGRvY3VtZW50cyBzbyB0aGlzIGNhbGxiYWNrIGlzIGNhbGxlZFxuICAgICAgICAjIGluc2lkZSBNZXRlb3IuX25vWWllbGRzQWxsb3dlZCB3aGljaCBtZWFucyBpbnNpZGUgdGhlIGNhbGxiYWNrIG5vIGZ1bmN0aW9uXG4gICAgICAgICMgd2hpY2ggY2FsbHMgeWllbGQgY2FuIGJlIGNhbGxlZC4gQmVjYXVzZSB0aGlzIGlzIG9mdGVuIG5vdCB0cnVlLCBpbiB0aGF0XG4gICAgICAgICMgc3BlY2lhbCBjYXNlIHdlIGFyZSBub3QgZ29pbmcgdGhyb3VnaCBtaWRkbGV3YXJlcyBidXQgYXJlIGRpcmVjdGx5IGNhbGxpbmdcbiAgICAgICAgIyBvcmlnaW5hbCByZW1vdmVkIGNhbGxiYWNrLlxuICAgICAgICBpZiBpc0luc2lkZU5vWWllbGRzQWxsb3dlZCgpXG4gICAgICAgICAgcHVibGlzaFJlbW92ZWQuY2FsbCBwdWJsaXNoLCBjb2xsZWN0aW9uLCBpZFxuICAgICAgICBlbHNlXG4gICAgICAgICAgbGF0ZXN0TWlkZGxld2FyZS5yZW1vdmVkIG1pZGxld2FyZVB1Ymxpc2gsIGNvbGxlY3Rpb24sIGlkXG5cbiAgICAgIHB1Ymxpc2gucmVhZHkgPSAtPlxuICAgICAgICBsYXRlc3RNaWRkbGV3YXJlLm9uUmVhZHkgbWlkbGV3YXJlUHVibGlzaFxuXG4gICAgICBwdWJsaXNoLnN0b3AgPSAtPlxuICAgICAgICBsYXRlc3RNaWRkbGV3YXJlLm9uU3RvcCBtaWRsZXdhcmVQdWJsaXNoXG5cbiAgICAgIHB1Ymxpc2guZXJyb3IgPSAoZXJyb3IpIC0+XG4gICAgICAgIGxhdGVzdE1pZGRsZXdhcmUub25FcnJvciBtaWRsZXdhcmVQdWJsaXNoLCBlcnJvclxuXG4gICAgICBAcHVibGlzaCBvdGhlck1pZGRsZXdhcmVzLCBwdWJsaXNoXG4gICAgZWxzZVxuICAgICAgQHB1Ymxpc2hGdW5jdGlvbi5hcHBseSBwdWJsaXNoLCBwdWJsaXNoLnBhcmFtcygpXG5cbiAgdXNlOiAobWlkZGxld2FyZSkgLT5cbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJNaWRkbGV3YXJlICcjeyBtaWRkbGV3YXJlIH0nIGlzIG5vdCBhbiBpbnN0YW5jZSBvZiBhIFB1Ymxpc2hNaWRkbGV3YXJlIGNsYXNzXCIgdW5sZXNzIG1pZGRsZXdhcmUgaW5zdGFuY2VvZiBQdWJsaXNoTWlkZGxld2FyZVxuXG4gICAgQG1pZGRsZXdhcmVzLnB1c2ggbWlkZGxld2FyZVxuXG5leHBvcnQgY2xhc3MgUHVibGlzaE1pZGRsZXdhcmVcbiAgYWRkZWQ6IChwdWJsaXNoLCBjb2xsZWN0aW9uLCBpZCwgZmllbGRzKSAtPlxuICAgIHB1Ymxpc2guYWRkZWQgY29sbGVjdGlvbiwgaWQsIGZpZWxkc1xuXG4gIGNoYW5nZWQ6IChwdWJsaXNoLCBjb2xsZWN0aW9uLCBpZCwgZmllbGRzKSAtPlxuICAgIHB1Ymxpc2guY2hhbmdlZCBjb2xsZWN0aW9uLCBpZCwgZmllbGRzXG5cbiAgcmVtb3ZlZDogKHB1Ymxpc2gsIGNvbGxlY3Rpb24sIGlkKSAtPlxuICAgIHB1Ymxpc2gucmVtb3ZlZCBjb2xsZWN0aW9uLCBpZFxuXG4gIG9uUmVhZHk6IChwdWJsaXNoKSAtPlxuICAgIHB1Ymxpc2gucmVhZHkoKVxuXG4gIG9uU3RvcDogKHB1Ymxpc2gpIC0+XG4gICAgcHVibGlzaC5zdG9wKClcblxuICBvbkVycm9yOiAocHVibGlzaCwgZXJyb3IpIC0+XG4gICAgcHVibGlzaC5lcnJvciBlcnJvclxuIiwidmFyIE1pZGRsZXdhcmVQdWJsaXNoLCBpc0luc2lkZU5vWWllbGRzQWxsb3dlZCwgc2F2ZWRZaWVsZCxcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG5pbXBvcnQge1xuICBfXG59IGZyb20gJ21ldGVvci91bmRlcnNjb3JlJztcblxuaW1wb3J0IEZpYmVyIGZyb20gJ2ZpYmVycyc7XG5cbnNhdmVkWWllbGQgPSBGaWJlci55aWVsZDtcblxuLy8gV2hlbiBpbnNpZGUgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQgRmliZXIueWllbGQgaXMgb3ZlcnJpZGRlbiB3aXRoXG4vLyBhIGZ1bmN0aW9uIHdoaWNoIHRocm93cyBhbiBleGNlcHRpb24sIHNvIGlzIG5vdCBzYXZlZFlpZWxkIGFueW1vcmUuXG4vLyBBZnRlcndhcmRzIEZpYmVyLnlpZWxkIGlzIHJlc3RvcmVkIGJhY2sgdG8gc2F2ZWRZaWVsZC5cbmlzSW5zaWRlTm9ZaWVsZHNBbGxvd2VkID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBGaWJlci55aWVsZCAhPT0gc2F2ZWRZaWVsZDtcbn07XG5cbk1pZGRsZXdhcmVQdWJsaXNoID0gY2xhc3MgTWlkZGxld2FyZVB1Ymxpc2gge1xuICBjb25zdHJ1Y3RvcihwdWJsaXNoMSkge1xuICAgIHZhciBrZXksIHJlZiwgdmFsdWU7XG4gICAgdGhpcy5wdWJsaXNoID0gcHVibGlzaDE7XG4gICAgLy8gV2Ugc3RvcmUgdGhvc2UgbWV0aG9kcyBhdCBjb25zdHJ1Y3Rpb24gdGltZSBiZWNhdXNlXG4gICAgLy8gd2Ugb3ZlcnJpZGUgdGhlbSBsYXRlciBvbiBwdWJsaXNoIG9iamVjdC5cbiAgICB0aGlzLl9wdWJsaXNoQWRkZWQgPSB0aGlzLnB1Ymxpc2guYWRkZWQuYmluZCh0aGlzLnB1Ymxpc2gpO1xuICAgIHRoaXMuX3B1Ymxpc2hDaGFuZ2VkID0gdGhpcy5wdWJsaXNoLmNoYW5nZWQuYmluZCh0aGlzLnB1Ymxpc2gpO1xuICAgIHRoaXMuX3B1Ymxpc2hSZW1vdmVkID0gdGhpcy5wdWJsaXNoLnJlbW92ZWQuYmluZCh0aGlzLnB1Ymxpc2gpO1xuICAgIHRoaXMuX3B1Ymxpc2hSZWFkeSA9IHRoaXMucHVibGlzaC5yZWFkeS5iaW5kKHRoaXMucHVibGlzaCk7XG4gICAgdGhpcy5fcHVibGlzaFN0b3AgPSB0aGlzLnB1Ymxpc2guc3RvcC5iaW5kKHRoaXMucHVibGlzaCk7XG4gICAgdGhpcy5fcHVibGlzaEVycm9yID0gdGhpcy5wdWJsaXNoLmVycm9yLmJpbmQodGhpcy5wdWJsaXNoKTtcbiAgICByZWYgPSB0aGlzLnB1Ymxpc2g7XG4gICAgZm9yIChrZXkgaW4gcmVmKSB7XG4gICAgICBpZiAoIWhhc1Byb3AuY2FsbChyZWYsIGtleSkpIGNvbnRpbnVlO1xuICAgICAgdmFsdWUgPSByZWZba2V5XTtcbiAgICAgIGlmIChrZXkgIT09ICdhZGRlZCcgJiYga2V5ICE9PSAnY2hhbmdlZCcgJiYga2V5ICE9PSAncmVtb3ZlZCcgJiYga2V5ICE9PSAncmVhZHknICYmIGtleSAhPT0gJ3N0b3AnICYmIGtleSAhPT0gJ2Vycm9yJykge1xuICAgICAgICB0aGlzW2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhZGRlZCguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuX3B1Ymxpc2hBZGRlZCguLi5hcmdzKTtcbiAgfVxuXG4gIGNoYW5nZWQoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLl9wdWJsaXNoQ2hhbmdlZCguLi5hcmdzKTtcbiAgfVxuXG4gIHJlbW92ZWQoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLl9wdWJsaXNoUmVtb3ZlZCguLi5hcmdzKTtcbiAgfVxuXG4gIHJlYWR5KC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5fcHVibGlzaFJlYWR5KC4uLmFyZ3MpO1xuICB9XG5cbiAgc3RvcCguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuX3B1Ymxpc2hTdG9wKC4uLmFyZ3MpO1xuICB9XG5cbiAgZXJyb3IoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLl9wdWJsaXNoRXJyb3IoLi4uYXJncyk7XG4gIH1cblxufTtcblxuZXhwb3J0IHZhciBQdWJsaXNoRW5kcG9pbnQgPSBjbGFzcyBQdWJsaXNoRW5kcG9pbnQge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zLCBwdWJsaXNoRnVuY3Rpb24pIHtcbiAgICB2YXIgc2VsZjtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMucHVibGlzaEZ1bmN0aW9uID0gcHVibGlzaEZ1bmN0aW9uO1xuICAgIC8vIFRvIHBhc3MgbnVsbCAoYXV0b3B1Ymxpc2gpIG9yIHN0cmluZyBkaXJlY3RseSBmb3IgbmFtZVxuICAgIGlmICh0aGlzLm9wdGlvbnMgPT09IG51bGwgfHwgXy5pc1N0cmluZyh0aGlzLm9wdGlvbnMpKSB7XG4gICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgIG5hbWU6IHRoaXMub3B0aW9uc1xuICAgICAgfTtcbiAgICB9XG4gICAgdGhpcy5taWRkbGV3YXJlcyA9IFtdO1xuICAgIHNlbGYgPSB0aGlzO1xuICAgIE1ldGVvci5wdWJsaXNoKHRoaXMub3B0aW9ucy5uYW1lLCBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICB2YXIgcHVibGlzaCwgc3RhdGU7XG4gICAgICBwdWJsaXNoID0gdGhpcztcbiAgICAgIHN0YXRlID0ge307XG4gICAgICBwdWJsaXNoLnBhcmFtcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJncztcbiAgICAgIH07XG4gICAgICBwdWJsaXNoLnNldCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlW2tleV0gPSB2YWx1ZTtcbiAgICAgIH07XG4gICAgICBwdWJsaXNoLmdldCA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgICByZXR1cm4gc3RhdGVba2V5XTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gc2VsZi5wdWJsaXNoKHNlbGYubWlkZGxld2FyZXMsIHB1Ymxpc2gpO1xuICAgIH0pO1xuICB9XG5cbiAgcHVibGlzaChtaWRkbGV3YXJlcywgcHVibGlzaCkge1xuICAgIHZhciBsYXRlc3RNaWRkbGV3YXJlLCBtaWRsZXdhcmVQdWJsaXNoLCBvdGhlck1pZGRsZXdhcmVzLCBwdWJsaXNoUmVtb3ZlZDtcbiAgICBpZiAobWlkZGxld2FyZXMubGVuZ3RoKSB7XG4gICAgICBsYXRlc3RNaWRkbGV3YXJlID0gbWlkZGxld2FyZXNbbWlkZGxld2FyZXMubGVuZ3RoIC0gMV07XG4gICAgICBvdGhlck1pZGRsZXdhcmVzID0gbWlkZGxld2FyZXMuc2xpY2UoMCwgbWlkZGxld2FyZXMubGVuZ3RoIC0gMSk7XG4gICAgICBtaWRsZXdhcmVQdWJsaXNoID0gbmV3IE1pZGRsZXdhcmVQdWJsaXNoKHB1Ymxpc2gpO1xuICAgICAgcHVibGlzaC5hZGRlZCA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIGlkLCBmaWVsZHMpIHtcbiAgICAgICAgcmV0dXJuIGxhdGVzdE1pZGRsZXdhcmUuYWRkZWQobWlkbGV3YXJlUHVibGlzaCwgY29sbGVjdGlvbiwgaWQsIGZpZWxkcyk7XG4gICAgICB9O1xuICAgICAgcHVibGlzaC5jaGFuZ2VkID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgaWQsIGZpZWxkcykge1xuICAgICAgICByZXR1cm4gbGF0ZXN0TWlkZGxld2FyZS5jaGFuZ2VkKG1pZGxld2FyZVB1Ymxpc2gsIGNvbGxlY3Rpb24sIGlkLCBmaWVsZHMpO1xuICAgICAgfTtcbiAgICAgIHB1Ymxpc2hSZW1vdmVkID0gcHVibGlzaC5yZW1vdmVkO1xuICAgICAgcHVibGlzaC5yZW1vdmVkID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgaWQpIHtcbiAgICAgICAgLy8gV2hlbiB1bnN1YnNjcmliaW5nLCBNZXRlb3IgcmVtb3ZlcyBhbGwgZG9jdW1lbnRzIHNvIHRoaXMgY2FsbGJhY2sgaXMgY2FsbGVkXG4gICAgICAgIC8vIGluc2lkZSBNZXRlb3IuX25vWWllbGRzQWxsb3dlZCB3aGljaCBtZWFucyBpbnNpZGUgdGhlIGNhbGxiYWNrIG5vIGZ1bmN0aW9uXG4gICAgICAgIC8vIHdoaWNoIGNhbGxzIHlpZWxkIGNhbiBiZSBjYWxsZWQuIEJlY2F1c2UgdGhpcyBpcyBvZnRlbiBub3QgdHJ1ZSwgaW4gdGhhdFxuICAgICAgICAvLyBzcGVjaWFsIGNhc2Ugd2UgYXJlIG5vdCBnb2luZyB0aHJvdWdoIG1pZGRsZXdhcmVzIGJ1dCBhcmUgZGlyZWN0bHkgY2FsbGluZ1xuICAgICAgICAvLyBvcmlnaW5hbCByZW1vdmVkIGNhbGxiYWNrLlxuICAgICAgICBpZiAoaXNJbnNpZGVOb1lpZWxkc0FsbG93ZWQoKSkge1xuICAgICAgICAgIHJldHVybiBwdWJsaXNoUmVtb3ZlZC5jYWxsKHB1Ymxpc2gsIGNvbGxlY3Rpb24sIGlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbGF0ZXN0TWlkZGxld2FyZS5yZW1vdmVkKG1pZGxld2FyZVB1Ymxpc2gsIGNvbGxlY3Rpb24sIGlkKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHB1Ymxpc2gucmVhZHkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGxhdGVzdE1pZGRsZXdhcmUub25SZWFkeShtaWRsZXdhcmVQdWJsaXNoKTtcbiAgICAgIH07XG4gICAgICBwdWJsaXNoLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGxhdGVzdE1pZGRsZXdhcmUub25TdG9wKG1pZGxld2FyZVB1Ymxpc2gpO1xuICAgICAgfTtcbiAgICAgIHB1Ymxpc2guZXJyb3IgPSBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICByZXR1cm4gbGF0ZXN0TWlkZGxld2FyZS5vbkVycm9yKG1pZGxld2FyZVB1Ymxpc2gsIGVycm9yKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gdGhpcy5wdWJsaXNoKG90aGVyTWlkZGxld2FyZXMsIHB1Ymxpc2gpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5wdWJsaXNoRnVuY3Rpb24uYXBwbHkocHVibGlzaCwgcHVibGlzaC5wYXJhbXMoKSk7XG4gICAgfVxuICB9XG5cbiAgdXNlKG1pZGRsZXdhcmUpIHtcbiAgICBpZiAoIShtaWRkbGV3YXJlIGluc3RhbmNlb2YgUHVibGlzaE1pZGRsZXdhcmUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE1pZGRsZXdhcmUgJyR7bWlkZGxld2FyZX0nIGlzIG5vdCBhbiBpbnN0YW5jZSBvZiBhIFB1Ymxpc2hNaWRkbGV3YXJlIGNsYXNzYCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm1pZGRsZXdhcmVzLnB1c2gobWlkZGxld2FyZSk7XG4gIH1cblxufTtcblxuZXhwb3J0IHZhciBQdWJsaXNoTWlkZGxld2FyZSA9IGNsYXNzIFB1Ymxpc2hNaWRkbGV3YXJlIHtcbiAgYWRkZWQocHVibGlzaCwgY29sbGVjdGlvbiwgaWQsIGZpZWxkcykge1xuICAgIHJldHVybiBwdWJsaXNoLmFkZGVkKGNvbGxlY3Rpb24sIGlkLCBmaWVsZHMpO1xuICB9XG5cbiAgY2hhbmdlZChwdWJsaXNoLCBjb2xsZWN0aW9uLCBpZCwgZmllbGRzKSB7XG4gICAgcmV0dXJuIHB1Ymxpc2guY2hhbmdlZChjb2xsZWN0aW9uLCBpZCwgZmllbGRzKTtcbiAgfVxuXG4gIHJlbW92ZWQocHVibGlzaCwgY29sbGVjdGlvbiwgaWQpIHtcbiAgICByZXR1cm4gcHVibGlzaC5yZW1vdmVkKGNvbGxlY3Rpb24sIGlkKTtcbiAgfVxuXG4gIG9uUmVhZHkocHVibGlzaCkge1xuICAgIHJldHVybiBwdWJsaXNoLnJlYWR5KCk7XG4gIH1cblxuICBvblN0b3AocHVibGlzaCkge1xuICAgIHJldHVybiBwdWJsaXNoLnN0b3AoKTtcbiAgfVxuXG4gIG9uRXJyb3IocHVibGlzaCwgZXJyb3IpIHtcbiAgICByZXR1cm4gcHVibGlzaC5lcnJvcihlcnJvcik7XG4gIH1cblxufTtcbiJdfQ==
