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
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var EJSON = Package.ejson.EJSON;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package.modules.meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

/* Package-scope variables */
var CollectionHooks;

var require = meteorInstall({"node_modules":{"meteor":{"matb33:collection-hooks":{"client.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/matb33_collection-hooks/client.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  CollectionHooks: function () {
    return CollectionHooks;
  }
});
var Meteor;
module.link("meteor/meteor", {
  Meteor: function (v) {
    Meteor = v;
  }
}, 0);
var Tracker;
module.link("meteor/tracker", {
  Tracker: function (v) {
    Tracker = v;
  }
}, 1);
var CollectionHooks;
module.link("./collection-hooks.js", {
  CollectionHooks: function (v) {
    CollectionHooks = v;
  }
}, 2);
module.link("./advices");

CollectionHooks.getUserId = function () {
  function getUserId() {
    var userId;
    Tracker.nonreactive(function () {
      userId = Meteor.userId && Meteor.userId();
    });

    if (userId == null) {
      userId = CollectionHooks.defaultUserId;
    }

    return userId;
  }

  return getUserId;
}();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"advices.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/matb33_collection-hooks/advices.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.link("./insert.js");
module.link("./update.js");
module.link("./remove.js");
module.link("./upsert.js");
module.link("./find.js");
module.link("./findone.js");
module.link("./users-compat.js");
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"collection-hooks.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/matb33_collection-hooks/collection-hooks.js                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _objectWithoutProperties;

module.link("@babel/runtime/helpers/objectWithoutProperties", {
  default: function (v) {
    _objectWithoutProperties = v;
  }
}, 0);

var _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default: function (v) {
    _objectSpread = v;
  }
}, 1);

var _slicedToArray;

module.link("@babel/runtime/helpers/slicedToArray", {
  default: function (v) {
    _slicedToArray = v;
  }
}, 2);
module.export({
  CollectionHooks: function () {
    return CollectionHooks;
  }
});
var Meteor;
module.link("meteor/meteor", {
  Meteor: function (v) {
    Meteor = v;
  }
}, 0);
var Mongo;
module.link("meteor/mongo", {
  Mongo: function (v) {
    Mongo = v;
  }
}, 1);
var EJSON;
module.link("meteor/ejson", {
  EJSON: function (v) {
    EJSON = v;
  }
}, 2);
var LocalCollection;
module.link("meteor/minimongo", {
  LocalCollection: function (v) {
    LocalCollection = v;
  }
}, 3);
// Relevant AOP terminology:
// Aspect: User code that runs before/after (hook)
// Advice: Wrapper code that knows when to call user code (aspects)
// Pointcut: before/after
var advices = {};
var CollectionHooks = {
  defaults: {
    before: {
      insert: {},
      update: {},
      remove: {},
      upsert: {},
      find: {},
      findOne: {},
      all: {}
    },
    after: {
      insert: {},
      update: {},
      remove: {},
      find: {},
      findOne: {},
      all: {}
    },
    all: {
      insert: {},
      update: {},
      remove: {},
      find: {},
      findOne: {},
      all: {}
    }
  },
  directEnv: new Meteor.EnvironmentVariable(),
  directOp: function (func) {
    return this.directEnv.withValue(true, func);
  },
  hookedOp: function (func) {
    return this.directEnv.withValue(false, func);
  }
};

CollectionHooks.extendCollectionInstance = function () {
  function extendCollectionInstance(self, constructor) {
    // Offer a public API to allow the user to define aspects
    // Example: collection.before.insert(func);
    ['before', 'after'].forEach(function (pointcut) {
      Object.entries(advices).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            method = _ref2[0],
            advice = _ref2[1];

        if (advice === 'upsert' && pointcut === 'after') return;

        Meteor._ensure(self, pointcut, method);

        Meteor._ensure(self, '_hookAspects', method);

        self._hookAspects[method][pointcut] = [];

        self[pointcut][method] = function (aspect, options) {
          var len = self._hookAspects[method][pointcut].push({
            aspect: aspect,
            options: CollectionHooks.initOptions(options, pointcut, method)
          });

          return {
            replace: function (aspect, options) {
              self._hookAspects[method][pointcut].splice(len - 1, 1, {
                aspect: aspect,
                options: CollectionHooks.initOptions(options, pointcut, method)
              });
            },
            remove: function () {
              self._hookAspects[method][pointcut].splice(len - 1, 1);
            }
          };
        };
      });
    }); // Offer a publicly accessible object to allow the user to define
    // collection-wide hook options.
    // Example: collection.hookOptions.after.update = {fetchPrevious: false};

    self.hookOptions = EJSON.clone(CollectionHooks.defaults); // Wrap mutator methods, letting the defined advice do the work

    Object.entries(advices).forEach(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          method = _ref4[0],
          advice = _ref4[1];

      var collection = Meteor.isClient || method === 'upsert' ? self : self._collection; // Store a reference to the original mutator method

      var _super = collection[method];

      Meteor._ensure(self, 'direct', method);

      self.direct[method] = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return CollectionHooks.directOp(function () {
          return constructor.prototype[method].apply(self, args);
        });
      };

      collection[method] = function () {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        if (CollectionHooks.directEnv.get() === true) {
          return _super.apply(collection, args);
        } // NOTE: should we decide to force `update` with `{upsert:true}` to use
        // the `upsert` hooks, this is what will accomplish it. It's important to
        // realize that Meteor won't distinguish between an `update` and an
        // `insert` though, so we'll end up with `after.update` getting called
        // even on an `insert`. That's why we've chosen to disable this for now.
        // if (method === "update" && Object(args[2]) === args[2] && args[2].upsert) {
        //   method = "upsert";
        //   advice = CollectionHooks.getAdvice(method);
        // }


        return advice.call(this, CollectionHooks.getUserId(), _super, self, method === 'upsert' ? {
          insert: self._hookAspects.insert || {},
          update: self._hookAspects.update || {},
          upsert: self._hookAspects.upsert || {}
        } : self._hookAspects[method] || {}, function (doc) {
          return typeof self._transform === 'function' ? function (d) {
            return self._transform(d || doc);
          } : function (d) {
            return d || doc;
          };
        }, args, false);
      };
    });
  }

  return extendCollectionInstance;
}();

CollectionHooks.defineAdvice = function (method, advice) {
  advices[method] = advice;
};

CollectionHooks.getAdvice = function (method) {
  return advices[method];
};

CollectionHooks.initOptions = function (options, pointcut, method) {
  return CollectionHooks.extendOptions(CollectionHooks.defaults, options, pointcut, method);
};

CollectionHooks.extendOptions = function (source, options, pointcut, method) {
  return _objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({}, options), source.all.all), source[pointcut].all), source.all[method]), source[pointcut][method]);
};

CollectionHooks.getDocs = function () {
  function getDocs(collection, selector, options) {
    var findOptions = {
      transform: null,
      reactive: false
    }; // added reactive: false

    /*
    // No "fetch" support at this time.
    if (!this._validators.fetchAllFields) {
      findOptions.fields = {};
      this._validators.fetch.forEach(function(fieldName) {
        findOptions.fields[fieldName] = 1;
      });
    }
    */
    // Bit of a magic condition here... only "update" passes options, so this is
    // only relevant to when update calls getDocs:

    if (options) {
      // This was added because in our case, we are potentially iterating over
      // multiple docs. If multi isn't enabled, force a limit (almost like
      // findOne), as the default for update without multi enabled is to affect
      // only the first matched document:
      if (!options.multi) {
        findOptions.limit = 1;
      }

      var multi = options.multi,
          upsert = options.upsert,
          rest = _objectWithoutProperties(options, ["multi", "upsert"]);

      Object.assign(findOptions, rest);
    } // Unlike validators, we iterate over multiple docs, so use
    // find instead of findOne:


    return collection.find(selector, findOptions);
  }

  return getDocs;
}(); // This function normalizes the selector (converting it to an Object)


CollectionHooks.normalizeSelector = function (selector) {
  if (typeof selector === 'string' || selector && selector.constructor === Mongo.ObjectID) {
    return {
      _id: selector
    };
  } else {
    return selector;
  }
}; // This function contains a snippet of code pulled and modified from:
// ~/.meteor/packages/mongo-livedata/collection.js
// It's contained in these utility functions to make updates easier for us in
// case this code changes.


CollectionHooks.getFields = function () {
  function getFields(mutator) {
    // compute modified fields
    var fields = []; // ====ADDED START=======================

    var operators = ['$addToSet', '$bit', '$currentDate', '$inc', '$max', '$min', '$pop', '$pull', '$pullAll', '$push', '$rename', '$set', '$unset']; // ====ADDED END=========================

    Object.entries(mutator).forEach(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
          op = _ref6[0],
          params = _ref6[1];

      // ====ADDED START=======================
      if (operators.includes(op)) {
        // ====ADDED END=========================
        Object.keys(params).forEach(function (field) {
          // treat dotted fields as if they are replacing their
          // top-level part
          if (field.indexOf('.') !== -1) {
            field = field.substring(0, field.indexOf('.'));
          } // record the field we are trying to change


          if (!fields.includes(field)) {
            fields.push(field);
          }
        }); // ====ADDED START=======================
      } else {
        fields.push(op);
      } // ====ADDED END=========================

    });
    return fields;
  }

  return getFields;
}();

CollectionHooks.reassignPrototype = function () {
  function reassignPrototype(instance, constr) {
    var hasSetPrototypeOf = typeof Object.setPrototypeOf === 'function';
    constr = constr || Mongo.Collection; // __proto__ is not available in < IE11
    // Note: Assigning a prototype dynamically has performance implications

    if (hasSetPrototypeOf) {
      Object.setPrototypeOf(instance, constr.prototype);
    } else if (instance.__proto__) {
      // eslint-disable-line no-proto
      instance.__proto__ = constr.prototype; // eslint-disable-line no-proto
    }
  }

  return reassignPrototype;
}();

CollectionHooks.wrapCollection = function () {
  function wrapCollection(ns, as) {
    if (!as._CollectionConstructor) as._CollectionConstructor = as.Collection;
    if (!as._CollectionPrototype) as._CollectionPrototype = new as.Collection(null);
    var constructor = ns._NewCollectionContructor || as._CollectionConstructor;
    var proto = as._CollectionPrototype;

    ns.Collection = function () {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      var ret = constructor.apply(this, args);
      CollectionHooks.extendCollectionInstance(this, constructor);
      return ret;
    }; // Retain a reference to the new constructor to allow further wrapping.


    ns._NewCollectionContructor = ns.Collection;
    ns.Collection.prototype = proto;
    ns.Collection.prototype.constructor = ns.Collection;

    for (var _i = 0, _Object$keys = Object.keys(constructor); _i < _Object$keys.length; _i++) {
      var prop = _Object$keys[_i];
      ns.Collection[prop] = constructor[prop];
    } // Meteor overrides the apply method which is copied from the constructor in the loop above. Replace it with the
    // default method which we need if we were to further wrap ns.Collection.


    ns.Collection.apply = Function.prototype.apply;
  }

  return wrapCollection;
}();

CollectionHooks.modify = LocalCollection._modify;

if (typeof Mongo !== 'undefined') {
  CollectionHooks.wrapCollection(Meteor, Mongo);
  CollectionHooks.wrapCollection(Mongo, Mongo);
} else {
  CollectionHooks.wrapCollection(Meteor, Meteor);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"find.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/matb33_collection-hooks/find.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks: function (v) {
    CollectionHooks = v;
  }
}, 0);
CollectionHooks.defineAdvice('find', function (userId, _super, instance, aspects, getTransform, args, suppressAspects) {
  var ctx = {
    context: this,
    _super: _super,
    args: args
  };
  var selector = CollectionHooks.normalizeSelector(instance._getFindSelector(args));

  var options = instance._getFindOptions(args);

  var abort; // before

  if (!suppressAspects) {
    aspects.before.forEach(function (o) {
      var r = o.aspect.call(ctx, userId, selector, options);
      if (r === false) abort = true;
    });
    if (abort) return instance.find(undefined);
  }

  var after = function (cursor) {
    if (!suppressAspects) {
      aspects.after.forEach(function (o) {
        o.aspect.call(ctx, userId, selector, options, cursor);
      });
    }
  };

  var ret = _super.call(this, selector, options);

  after(ret);
  return ret;
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"findone.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/matb33_collection-hooks/findone.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks: function (v) {
    CollectionHooks = v;
  }
}, 0);
CollectionHooks.defineAdvice('findOne', function (userId, _super, instance, aspects, getTransform, args, suppressAspects) {
  var ctx = {
    context: this,
    _super: _super,
    args: args
  };
  var selector = CollectionHooks.normalizeSelector(instance._getFindSelector(args));

  var options = instance._getFindOptions(args);

  var abort; // before

  if (!suppressAspects) {
    aspects.before.forEach(function (o) {
      var r = o.aspect.call(ctx, userId, selector, options);
      if (r === false) abort = true;
    });
    if (abort) return;
  }

  function after(doc) {
    if (!suppressAspects) {
      aspects.after.forEach(function (o) {
        o.aspect.call(ctx, userId, selector, options, doc);
      });
    }
  }

  var ret = _super.call(this, selector, options);

  after(ret);
  return ret;
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"insert.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/matb33_collection-hooks/insert.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _typeof;

module.link("@babel/runtime/helpers/typeof", {
  default: function (v) {
    _typeof = v;
  }
}, 0);

var _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default: function (v) {
    _objectSpread = v;
  }
}, 1);

var _slicedToArray;

module.link("@babel/runtime/helpers/slicedToArray", {
  default: function (v) {
    _slicedToArray = v;
  }
}, 2);
var EJSON;
module.link("meteor/ejson", {
  EJSON: function (v) {
    EJSON = v;
  }
}, 0);
var Mongo;
module.link("meteor/mongo", {
  Mongo: function (v) {
    Mongo = v;
  }
}, 1);
var CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks: function (v) {
    CollectionHooks = v;
  }
}, 2);
CollectionHooks.defineAdvice('insert', function (userId, _super, instance, aspects, getTransform, args, suppressAspects) {
  var ctx = {
    context: this,
    _super: _super,
    args: args
  };

  var _args = _slicedToArray(args, 2),
      doc = _args[0],
      callback = _args[1];

  var async = typeof callback === 'function';
  var abort;
  var ret; // before

  if (!suppressAspects) {
    try {
      aspects.before.forEach(function (o) {
        var r = o.aspect.call(_objectSpread({
          transform: getTransform(doc)
        }, ctx), userId, doc);
        if (r === false) abort = true;
      });
      if (abort) return;
    } catch (e) {
      if (async) return callback.call(this, e);
      throw e;
    }
  }

  var after = function (id, err) {
    if (id) {
      // In some cases (namely Meteor.users on Meteor 1.4+), the _id property
      // is a raw mongo _id object. We need to extract the _id from this object
      if (_typeof(id) === 'object' && id.ops) {
        // If _str then collection is using Mongo.ObjectID as ids
        if (doc._id._str) {
          id = new Mongo.ObjectID(doc._id._str.toString());
        } else {
          id = id.ops && id.ops[0] && id.ops[0]._id;
        }
      }

      doc = EJSON.clone(doc);
      doc._id = id;
    }

    if (!suppressAspects) {
      var lctx = _objectSpread({
        transform: getTransform(doc),
        _id: id,
        err: err
      }, ctx);

      aspects.after.forEach(function (o) {
        o.aspect.call(lctx, userId, doc);
      });
    }

    return id;
  };

  if (async) {
    var wrappedCallback = function (err, obj) {
      after(obj && obj[0] && obj[0]._id || obj, err);

      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      return callback.call.apply(callback, [this, err, obj].concat(args));
    };

    return _super.call(this, doc, wrappedCallback);
  } else {
    ret = _super.call(this, doc, callback);
    return after(ret && ret[0] && ret[0]._id || ret);
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"remove.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/matb33_collection-hooks/remove.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default: function (v) {
    _objectSpread = v;
  }
}, 0);

var _slicedToArray;

module.link("@babel/runtime/helpers/slicedToArray", {
  default: function (v) {
    _slicedToArray = v;
  }
}, 1);
var EJSON;
module.link("meteor/ejson", {
  EJSON: function (v) {
    EJSON = v;
  }
}, 0);
var CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks: function (v) {
    CollectionHooks = v;
  }
}, 1);

var isEmpty = function (a) {
  return !Array.isArray(a) || !a.length;
};

CollectionHooks.defineAdvice('remove', function (userId, _super, instance, aspects, getTransform, args, suppressAspects) {
  var ctx = {
    context: this,
    _super: _super,
    args: args
  };

  var _args = _slicedToArray(args, 2),
      selector = _args[0],
      callback = _args[1];

  var async = typeof callback === 'function';
  var docs;
  var abort;
  var prev = [];

  if (!suppressAspects) {
    try {
      if (!isEmpty(aspects.before) || !isEmpty(aspects.after)) {
        docs = CollectionHooks.getDocs.call(this, instance, selector).fetch();
      } // copy originals for convenience for the 'after' pointcut


      if (!isEmpty(aspects.after)) {
        docs.forEach(function (doc) {
          return prev.push(EJSON.clone(doc));
        });
      } // before


      aspects.before.forEach(function (o) {
        docs.forEach(function (doc) {
          var r = o.aspect.call(_objectSpread({
            transform: getTransform(doc)
          }, ctx), userId, doc);
          if (r === false) abort = true;
        });
      });
      if (abort) return 0;
    } catch (e) {
      if (async) return callback.call(this, e);
      throw e;
    }
  }

  function after(err) {
    if (!suppressAspects) {
      aspects.after.forEach(function (o) {
        prev.forEach(function (doc) {
          o.aspect.call(_objectSpread({
            transform: getTransform(doc),
            err: err
          }, ctx), userId, doc);
        });
      });
    }
  }

  if (async) {
    var wrappedCallback = function (err) {
      after(err);

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return callback.call.apply(callback, [this, err].concat(args));
    };

    return _super.call(this, selector, wrappedCallback);
  } else {
    var result = _super.call(this, selector, callback);

    after();
    return result;
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"update.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/matb33_collection-hooks/update.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default: function (v) {
    _objectSpread = v;
  }
}, 0);

var _slicedToArray;

module.link("@babel/runtime/helpers/slicedToArray", {
  default: function (v) {
    _slicedToArray = v;
  }
}, 1);
var EJSON;
module.link("meteor/ejson", {
  EJSON: function (v) {
    EJSON = v;
  }
}, 0);
var CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks: function (v) {
    CollectionHooks = v;
  }
}, 1);

var isEmpty = function (a) {
  return !Array.isArray(a) || !a.length;
};

CollectionHooks.defineAdvice('update', function (userId, _super, instance, aspects, getTransform, args, suppressAspects) {
  var _this = this;

  var ctx = {
    context: this,
    _super: _super,
    args: args
  };

  var _args = _slicedToArray(args, 4),
      selector = _args[0],
      mutator = _args[1],
      options = _args[2],
      callback = _args[3];

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var async = typeof callback === 'function';
  var docs;
  var docIds;
  var fields;
  var abort;
  var prev = {};

  if (!suppressAspects) {
    try {
      if (!isEmpty(aspects.before) || !isEmpty(aspects.after)) {
        fields = CollectionHooks.getFields(mutator);
        docs = CollectionHooks.getDocs.call(this, instance, selector, options).fetch();
        docIds = docs.map(function (doc) {
          return doc._id;
        });
      } // copy originals for convenience for the 'after' pointcut


      if (!isEmpty(aspects.after)) {
        prev.mutator = EJSON.clone(mutator);
        prev.options = EJSON.clone(options);

        if (aspects.after.some(function (o) {
          return o.options.fetchPrevious !== false;
        }) && CollectionHooks.extendOptions(instance.hookOptions, {}, 'after', 'update').fetchPrevious !== false) {
          prev.docs = {};
          docs.forEach(function (doc) {
            prev.docs[doc._id] = EJSON.clone(doc);
          });
        }
      } // before


      aspects.before.forEach(function (o) {
        docs.forEach(function (doc) {
          var r = o.aspect.call(_objectSpread({
            transform: getTransform(doc)
          }, ctx), userId, doc, fields, mutator, options);
          if (r === false) abort = true;
        });
      });
      if (abort) return 0;
    } catch (e) {
      if (async) return callback.call(this, e);
      throw e;
    }
  }

  var after = function (affected, err) {
    if (!suppressAspects && !isEmpty(aspects.after)) {
      var _fields = CollectionHooks.getFields(mutator);

      var _docs = CollectionHooks.getDocs.call(_this, instance, {
        _id: {
          $in: docIds
        }
      }, options).fetch();

      aspects.after.forEach(function (o) {
        _docs.forEach(function (doc) {
          o.aspect.call(_objectSpread({
            transform: getTransform(doc),
            previous: prev.docs && prev.docs[doc._id],
            affected: affected,
            err: err
          }, ctx), userId, doc, _fields, prev.mutator, prev.options);
        });
      });
    }
  };

  if (async) {
    var wrappedCallback = function (err, affected) {
      var _callback;

      after(affected, err);

      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      return (_callback = callback).call.apply(_callback, [this, err, affected].concat(args));
    };

    return _super.call(this, selector, mutator, options, wrappedCallback);
  } else {
    var affected = _super.call(this, selector, mutator, options, callback);

    after(affected);
    return affected;
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"upsert.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/matb33_collection-hooks/upsert.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default: function (v) {
    _objectSpread = v;
  }
}, 0);

var _slicedToArray;

module.link("@babel/runtime/helpers/slicedToArray", {
  default: function (v) {
    _slicedToArray = v;
  }
}, 1);
var EJSON;
module.link("meteor/ejson", {
  EJSON: function (v) {
    EJSON = v;
  }
}, 0);
var CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks: function (v) {
    CollectionHooks = v;
  }
}, 1);

var isEmpty = function (a) {
  return !Array.isArray(a) || !a.length;
};

CollectionHooks.defineAdvice('upsert', function (userId, _super, instance, aspectGroup, getTransform, args, suppressAspects) {
  var _this = this;

  args[0] = CollectionHooks.normalizeSelector(instance._getFindSelector(args));
  var ctx = {
    context: this,
    _super: _super,
    args: args
  };

  var _args = _slicedToArray(args, 4),
      selector = _args[0],
      mutator = _args[1],
      options = _args[2],
      callback = _args[3];

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var async = typeof callback === 'function';
  var docs;
  var docIds;
  var abort;
  var prev = {};

  if (!suppressAspects) {
    if (!isEmpty(aspectGroup.upsert.before) || !isEmpty(aspectGroup.update.after)) {
      docs = CollectionHooks.getDocs.call(this, instance, selector, options).fetch();
      docIds = docs.map(function (doc) {
        return doc._id;
      });
    } // copy originals for convenience for the 'after' pointcut


    if (!isEmpty(aspectGroup.update.after)) {
      if (aspectGroup.update.after.some(function (o) {
        return o.options.fetchPrevious !== false;
      }) && CollectionHooks.extendOptions(instance.hookOptions, {}, 'after', 'update').fetchPrevious !== false) {
        prev.mutator = EJSON.clone(mutator);
        prev.options = EJSON.clone(options);
        prev.docs = {};
        docs.forEach(function (doc) {
          prev.docs[doc._id] = EJSON.clone(doc);
        });
      }
    } // before


    aspectGroup.upsert.before.forEach(function (o) {
      var r = o.aspect.call(ctx, userId, selector, mutator, options);
      if (r === false) abort = true;
    });
    if (abort) return {
      numberAffected: 0
    };
  }

  var afterUpdate = function (affected, err) {
    if (!suppressAspects && !isEmpty(aspectGroup.update.after)) {
      var fields = CollectionHooks.getFields(mutator);

      var _docs = CollectionHooks.getDocs.call(_this, instance, {
        _id: {
          $in: docIds
        }
      }, options).fetch();

      aspectGroup.update.after.forEach(function (o) {
        _docs.forEach(function (doc) {
          o.aspect.call(_objectSpread({
            transform: getTransform(doc),
            previous: prev.docs && prev.docs[doc._id],
            affected: affected,
            err: err
          }, ctx), userId, doc, fields, prev.mutator, prev.options);
        });
      });
    }
  };

  var afterInsert = function (_id, err) {
    if (!suppressAspects && !isEmpty(aspectGroup.insert.after)) {
      var doc = CollectionHooks.getDocs.call(_this, instance, {
        _id: _id
      }, selector, {}).fetch()[0]; // 3rd argument passes empty object which causes magic logic to imply limit:1

      var lctx = _objectSpread({
        transform: getTransform(doc),
        _id: _id,
        err: err
      }, ctx);

      aspectGroup.insert.after.forEach(function (o) {
        o.aspect.call(lctx, userId, doc);
      });
    }
  };

  if (async) {
    var wrappedCallback = function (err, ret) {
      if (err || ret && ret.insertedId) {
        // Send any errors to afterInsert
        afterInsert(ret.insertedId, err);
      } else {
        afterUpdate(ret && ret.numberAffected, err); // Note that err can never reach here
      }

      return CollectionHooks.hookedOp(function () {
        return callback.call(this, err, ret);
      });
    };

    return CollectionHooks.directOp(function () {
      return _super.call(_this, selector, mutator, options, wrappedCallback);
    });
  } else {
    var ret = CollectionHooks.directOp(function () {
      return _super.call(_this, selector, mutator, options, callback);
    });

    if (ret && ret.insertedId) {
      afterInsert(ret.insertedId);
    } else {
      afterUpdate(ret && ret.numberAffected);
    }

    return ret;
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"users-compat.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/matb33_collection-hooks/users-compat.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var Meteor;
module.link("meteor/meteor", {
  Meteor: function (v) {
    Meteor = v;
  }
}, 0);
var Mongo;
module.link("meteor/mongo", {
  Mongo: function (v) {
    Mongo = v;
  }
}, 1);
var CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks: function (v) {
    CollectionHooks = v;
  }
}, 2);

if (Meteor.users) {
  // If Meteor.users has been instantiated, attempt to re-assign its prototype:
  CollectionHooks.reassignPrototype(Meteor.users); // Next, give it the hook aspects:

  CollectionHooks.extendCollectionInstance(Meteor.users, Mongo.Collection);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/matb33:collection-hooks/client.js");

/* Exports */
Package._define("matb33:collection-hooks", exports, {
  CollectionHooks: CollectionHooks
});

})();
