(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var EJSON = Package.ejson.EJSON;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var CollectionHooks;

var require = meteorInstall({"node_modules":{"meteor":{"matb33:collection-hooks":{"server.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/server.js                                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  CollectionHooks: () => CollectionHooks
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks(v) {
    CollectionHooks = v;
  }

}, 1);
module.link("./advices");
const publishUserId = new Meteor.EnvironmentVariable();

CollectionHooks.getUserId = function getUserId() {
  let userId;

  try {
    // Will throw an error unless within method call.
    // Attempt to recover gracefully by catching:
    userId = Meteor.userId && Meteor.userId();
  } catch (e) {}

  if (userId == null) {
    // Get the userId if we are in a publish function.
    userId = publishUserId.get();
  }

  if (userId == null) {
    userId = CollectionHooks.defaultUserId;
  }

  return userId;
};

const _publish = Meteor.publish;

Meteor.publish = function (name, handler, options) {
  return _publish.call(this, name, function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    // This function is called repeatedly in publications
    return publishUserId.withValue(this && this.userId, () => handler.apply(this, args));
  }, options);
}; // Make the above available for packages with hooks that want to determine
// whether they are running inside a publish function or not.


CollectionHooks.isWithinPublish = () => publishUserId.get() !== undefined;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"advices.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/advices.js                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.link("./insert.js");
module.link("./update.js");
module.link("./remove.js");
module.link("./upsert.js");
module.link("./find.js");
module.link("./findone.js");
module.link("./users-compat.js");
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"collection-hooks.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/collection-hooks.js                                                              //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let _objectWithoutProperties;

module.link("@babel/runtime/helpers/objectWithoutProperties", {
  default(v) {
    _objectWithoutProperties = v;
  }

}, 0);

let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 1);
module.export({
  CollectionHooks: () => CollectionHooks
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
let EJSON;
module.link("meteor/ejson", {
  EJSON(v) {
    EJSON = v;
  }

}, 2);
let LocalCollection;
module.link("meteor/minimongo", {
  LocalCollection(v) {
    LocalCollection = v;
  }

}, 3);
// Relevant AOP terminology:
// Aspect: User code that runs before/after (hook)
// Advice: Wrapper code that knows when to call user code (aspects)
// Pointcut: before/after
const advices = {};
const CollectionHooks = {
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

  directOp(func) {
    return this.directEnv.withValue(true, func);
  },

  hookedOp(func) {
    return this.directEnv.withValue(false, func);
  }

};

CollectionHooks.extendCollectionInstance = function extendCollectionInstance(self, constructor) {
  // Offer a public API to allow the user to define aspects
  // Example: collection.before.insert(func);
  ['before', 'after'].forEach(function (pointcut) {
    Object.entries(advices).forEach(function (_ref) {
      let [method, advice] = _ref;
      if (advice === 'upsert' && pointcut === 'after') return;

      Meteor._ensure(self, pointcut, method);

      Meteor._ensure(self, '_hookAspects', method);

      self._hookAspects[method][pointcut] = [];

      self[pointcut][method] = function (aspect, options) {
        const len = self._hookAspects[method][pointcut].push({
          aspect,
          options: CollectionHooks.initOptions(options, pointcut, method)
        });

        return {
          replace(aspect, options) {
            self._hookAspects[method][pointcut].splice(len - 1, 1, {
              aspect,
              options: CollectionHooks.initOptions(options, pointcut, method)
            });
          },

          remove() {
            self._hookAspects[method][pointcut].splice(len - 1, 1);
          }

        };
      };
    });
  }); // Offer a publicly accessible object to allow the user to define
  // collection-wide hook options.
  // Example: collection.hookOptions.after.update = {fetchPrevious: false};

  self.hookOptions = EJSON.clone(CollectionHooks.defaults); // Wrap mutator methods, letting the defined advice do the work

  Object.entries(advices).forEach(function (_ref2) {
    let [method, advice] = _ref2;
    const collection = Meteor.isClient || method === 'upsert' ? self : self._collection; // Store a reference to the original mutator method

    const _super = collection[method];

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
};

CollectionHooks.defineAdvice = (method, advice) => {
  advices[method] = advice;
};

CollectionHooks.getAdvice = method => advices[method];

CollectionHooks.initOptions = (options, pointcut, method) => CollectionHooks.extendOptions(CollectionHooks.defaults, options, pointcut, method);

CollectionHooks.extendOptions = (source, options, pointcut, method) => _objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({}, options), source.all.all), source[pointcut].all), source.all[method]), source[pointcut][method]);

CollectionHooks.getDocs = function getDocs(collection, selector, options) {
  const findOptions = {
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

    const {
      multi,
      upsert
    } = options,
          rest = _objectWithoutProperties(options, ["multi", "upsert"]);

    Object.assign(findOptions, rest);
  } // Unlike validators, we iterate over multiple docs, so use
  // find instead of findOne:


  return collection.find(selector, findOptions);
}; // This function normalizes the selector (converting it to an Object)


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


CollectionHooks.getFields = function getFields(mutator) {
  // compute modified fields
  const fields = []; // ====ADDED START=======================

  const operators = ['$addToSet', '$bit', '$currentDate', '$inc', '$max', '$min', '$pop', '$pull', '$pullAll', '$push', '$rename', '$set', '$unset']; // ====ADDED END=========================

  Object.entries(mutator).forEach(function (_ref3) {
    let [op, params] = _ref3;

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
};

CollectionHooks.reassignPrototype = function reassignPrototype(instance, constr) {
  const hasSetPrototypeOf = typeof Object.setPrototypeOf === 'function';
  constr = constr || Mongo.Collection; // __proto__ is not available in < IE11
  // Note: Assigning a prototype dynamically has performance implications

  if (hasSetPrototypeOf) {
    Object.setPrototypeOf(instance, constr.prototype);
  } else if (instance.__proto__) {
    // eslint-disable-line no-proto
    instance.__proto__ = constr.prototype; // eslint-disable-line no-proto
  }
};

CollectionHooks.wrapCollection = function wrapCollection(ns, as) {
  if (!as._CollectionConstructor) as._CollectionConstructor = as.Collection;
  if (!as._CollectionPrototype) as._CollectionPrototype = new as.Collection(null);
  const constructor = ns._NewCollectionContructor || as._CollectionConstructor;
  const proto = as._CollectionPrototype;

  ns.Collection = function () {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    const ret = constructor.apply(this, args);
    CollectionHooks.extendCollectionInstance(this, constructor);
    return ret;
  }; // Retain a reference to the new constructor to allow further wrapping.


  ns._NewCollectionContructor = ns.Collection;
  ns.Collection.prototype = proto;
  ns.Collection.prototype.constructor = ns.Collection;

  for (const prop of Object.keys(constructor)) {
    ns.Collection[prop] = constructor[prop];
  } // Meteor overrides the apply method which is copied from the constructor in the loop above. Replace it with the
  // default method which we need if we were to further wrap ns.Collection.


  ns.Collection.apply = Function.prototype.apply;
};

CollectionHooks.modify = LocalCollection._modify;

if (typeof Mongo !== 'undefined') {
  CollectionHooks.wrapCollection(Meteor, Mongo);
  CollectionHooks.wrapCollection(Mongo, Mongo);
} else {
  CollectionHooks.wrapCollection(Meteor, Meteor);
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"find.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/find.js                                                                          //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks(v) {
    CollectionHooks = v;
  }

}, 0);
CollectionHooks.defineAdvice('find', function (userId, _super, instance, aspects, getTransform, args, suppressAspects) {
  const ctx = {
    context: this,
    _super,
    args
  };
  const selector = CollectionHooks.normalizeSelector(instance._getFindSelector(args));

  const options = instance._getFindOptions(args);

  let abort; // before

  if (!suppressAspects) {
    aspects.before.forEach(o => {
      const r = o.aspect.call(ctx, userId, selector, options);
      if (r === false) abort = true;
    });
    if (abort) return instance.find(undefined);
  }

  const after = cursor => {
    if (!suppressAspects) {
      aspects.after.forEach(o => {
        o.aspect.call(ctx, userId, selector, options, cursor);
      });
    }
  };

  const ret = _super.call(this, selector, options);

  after(ret);
  return ret;
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"findone.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/findone.js                                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks(v) {
    CollectionHooks = v;
  }

}, 0);
CollectionHooks.defineAdvice('findOne', function (userId, _super, instance, aspects, getTransform, args, suppressAspects) {
  const ctx = {
    context: this,
    _super,
    args
  };
  const selector = CollectionHooks.normalizeSelector(instance._getFindSelector(args));

  const options = instance._getFindOptions(args);

  let abort; // before

  if (!suppressAspects) {
    aspects.before.forEach(o => {
      const r = o.aspect.call(ctx, userId, selector, options);
      if (r === false) abort = true;
    });
    if (abort) return;
  }

  function after(doc) {
    if (!suppressAspects) {
      aspects.after.forEach(o => {
        o.aspect.call(ctx, userId, selector, options, doc);
      });
    }
  }

  const ret = _super.call(this, selector, options);

  after(ret);
  return ret;
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"insert.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/insert.js                                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
let EJSON;
module.link("meteor/ejson", {
  EJSON(v) {
    EJSON = v;
  }

}, 0);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 1);
let CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks(v) {
    CollectionHooks = v;
  }

}, 2);
CollectionHooks.defineAdvice('insert', function (userId, _super, instance, aspects, getTransform, args, suppressAspects) {
  const ctx = {
    context: this,
    _super,
    args
  };
  let [doc, callback] = args;
  const async = typeof callback === 'function';
  let abort;
  let ret; // before

  if (!suppressAspects) {
    try {
      aspects.before.forEach(o => {
        const r = o.aspect.call(_objectSpread({
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

  const after = (id, err) => {
    if (id) {
      // In some cases (namely Meteor.users on Meteor 1.4+), the _id property
      // is a raw mongo _id object. We need to extract the _id from this object
      if (typeof id === 'object' && id.ops) {
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
      const lctx = _objectSpread({
        transform: getTransform(doc),
        _id: id,
        err
      }, ctx);

      aspects.after.forEach(o => {
        o.aspect.call(lctx, userId, doc);
      });
    }

    return id;
  };

  if (async) {
    const wrappedCallback = function (err, obj) {
      after(obj && obj[0] && obj[0]._id || obj, err);

      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      return callback.call(this, err, obj, ...args);
    };

    return _super.call(this, doc, wrappedCallback);
  } else {
    ret = _super.call(this, doc, callback);
    return after(ret && ret[0] && ret[0]._id || ret);
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"remove.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/remove.js                                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
let EJSON;
module.link("meteor/ejson", {
  EJSON(v) {
    EJSON = v;
  }

}, 0);
let CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks(v) {
    CollectionHooks = v;
  }

}, 1);

const isEmpty = a => !Array.isArray(a) || !a.length;

CollectionHooks.defineAdvice('remove', function (userId, _super, instance, aspects, getTransform, args, suppressAspects) {
  const ctx = {
    context: this,
    _super,
    args
  };
  const [selector, callback] = args;
  const async = typeof callback === 'function';
  let docs;
  let abort;
  const prev = [];

  if (!suppressAspects) {
    try {
      if (!isEmpty(aspects.before) || !isEmpty(aspects.after)) {
        docs = CollectionHooks.getDocs.call(this, instance, selector).fetch();
      } // copy originals for convenience for the 'after' pointcut


      if (!isEmpty(aspects.after)) {
        docs.forEach(doc => prev.push(EJSON.clone(doc)));
      } // before


      aspects.before.forEach(o => {
        docs.forEach(doc => {
          const r = o.aspect.call(_objectSpread({
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
      aspects.after.forEach(o => {
        prev.forEach(doc => {
          o.aspect.call(_objectSpread({
            transform: getTransform(doc),
            err
          }, ctx), userId, doc);
        });
      });
    }
  }

  if (async) {
    const wrappedCallback = function (err) {
      after(err);

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return callback.call(this, err, ...args);
    };

    return _super.call(this, selector, wrappedCallback);
  } else {
    const result = _super.call(this, selector, callback);

    after();
    return result;
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"update.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/update.js                                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
let EJSON;
module.link("meteor/ejson", {
  EJSON(v) {
    EJSON = v;
  }

}, 0);
let CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks(v) {
    CollectionHooks = v;
  }

}, 1);

const isEmpty = a => !Array.isArray(a) || !a.length;

CollectionHooks.defineAdvice('update', function (userId, _super, instance, aspects, getTransform, args, suppressAspects) {
  const ctx = {
    context: this,
    _super,
    args
  };
  let [selector, mutator, options, callback] = args;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const async = typeof callback === 'function';
  let docs;
  let docIds;
  let fields;
  let abort;
  const prev = {};

  if (!suppressAspects) {
    try {
      if (!isEmpty(aspects.before) || !isEmpty(aspects.after)) {
        fields = CollectionHooks.getFields(mutator);
        docs = CollectionHooks.getDocs.call(this, instance, selector, options).fetch();
        docIds = docs.map(doc => doc._id);
      } // copy originals for convenience for the 'after' pointcut


      if (!isEmpty(aspects.after)) {
        prev.mutator = EJSON.clone(mutator);
        prev.options = EJSON.clone(options);

        if (aspects.after.some(o => o.options.fetchPrevious !== false) && CollectionHooks.extendOptions(instance.hookOptions, {}, 'after', 'update').fetchPrevious !== false) {
          prev.docs = {};
          docs.forEach(doc => {
            prev.docs[doc._id] = EJSON.clone(doc);
          });
        }
      } // before


      aspects.before.forEach(function (o) {
        docs.forEach(function (doc) {
          const r = o.aspect.call(_objectSpread({
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

  const after = (affected, err) => {
    if (!suppressAspects && !isEmpty(aspects.after)) {
      const fields = CollectionHooks.getFields(mutator);
      const docs = CollectionHooks.getDocs.call(this, instance, {
        _id: {
          $in: docIds
        }
      }, options).fetch();
      aspects.after.forEach(o => {
        docs.forEach(doc => {
          o.aspect.call(_objectSpread({
            transform: getTransform(doc),
            previous: prev.docs && prev.docs[doc._id],
            affected,
            err
          }, ctx), userId, doc, fields, prev.mutator, prev.options);
        });
      });
    }
  };

  if (async) {
    const wrappedCallback = function (err, affected) {
      after(affected, err);

      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      return callback.call(this, err, affected, ...args);
    };

    return _super.call(this, selector, mutator, options, wrappedCallback);
  } else {
    const affected = _super.call(this, selector, mutator, options, callback);

    after(affected);
    return affected;
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"upsert.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/upsert.js                                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
let EJSON;
module.link("meteor/ejson", {
  EJSON(v) {
    EJSON = v;
  }

}, 0);
let CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks(v) {
    CollectionHooks = v;
  }

}, 1);

const isEmpty = a => !Array.isArray(a) || !a.length;

CollectionHooks.defineAdvice('upsert', function (userId, _super, instance, aspectGroup, getTransform, args, suppressAspects) {
  args[0] = CollectionHooks.normalizeSelector(instance._getFindSelector(args));
  const ctx = {
    context: this,
    _super,
    args
  };
  let [selector, mutator, options, callback] = args;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const async = typeof callback === 'function';
  let docs;
  let docIds;
  let abort;
  const prev = {};

  if (!suppressAspects) {
    if (!isEmpty(aspectGroup.upsert.before) || !isEmpty(aspectGroup.update.after)) {
      docs = CollectionHooks.getDocs.call(this, instance, selector, options).fetch();
      docIds = docs.map(doc => doc._id);
    } // copy originals for convenience for the 'after' pointcut


    if (!isEmpty(aspectGroup.update.after)) {
      if (aspectGroup.update.after.some(o => o.options.fetchPrevious !== false) && CollectionHooks.extendOptions(instance.hookOptions, {}, 'after', 'update').fetchPrevious !== false) {
        prev.mutator = EJSON.clone(mutator);
        prev.options = EJSON.clone(options);
        prev.docs = {};
        docs.forEach(doc => {
          prev.docs[doc._id] = EJSON.clone(doc);
        });
      }
    } // before


    aspectGroup.upsert.before.forEach(o => {
      const r = o.aspect.call(ctx, userId, selector, mutator, options);
      if (r === false) abort = true;
    });
    if (abort) return {
      numberAffected: 0
    };
  }

  const afterUpdate = (affected, err) => {
    if (!suppressAspects && !isEmpty(aspectGroup.update.after)) {
      const fields = CollectionHooks.getFields(mutator);
      const docs = CollectionHooks.getDocs.call(this, instance, {
        _id: {
          $in: docIds
        }
      }, options).fetch();
      aspectGroup.update.after.forEach(o => {
        docs.forEach(doc => {
          o.aspect.call(_objectSpread({
            transform: getTransform(doc),
            previous: prev.docs && prev.docs[doc._id],
            affected,
            err
          }, ctx), userId, doc, fields, prev.mutator, prev.options);
        });
      });
    }
  };

  const afterInsert = (_id, err) => {
    if (!suppressAspects && !isEmpty(aspectGroup.insert.after)) {
      const doc = CollectionHooks.getDocs.call(this, instance, {
        _id
      }, selector, {}).fetch()[0]; // 3rd argument passes empty object which causes magic logic to imply limit:1

      const lctx = _objectSpread({
        transform: getTransform(doc),
        _id,
        err
      }, ctx);

      aspectGroup.insert.after.forEach(o => {
        o.aspect.call(lctx, userId, doc);
      });
    }
  };

  if (async) {
    const wrappedCallback = function (err, ret) {
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

    return CollectionHooks.directOp(() => _super.call(this, selector, mutator, options, wrappedCallback));
  } else {
    const ret = CollectionHooks.directOp(() => _super.call(this, selector, mutator, options, callback));

    if (ret && ret.insertedId) {
      afterInsert(ret.insertedId);
    } else {
      afterUpdate(ret && ret.numberAffected);
    }

    return ret;
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"users-compat.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/matb33_collection-hooks/users-compat.js                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
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
let CollectionHooks;
module.link("./collection-hooks", {
  CollectionHooks(v) {
    CollectionHooks = v;
  }

}, 2);

if (Meteor.users) {
  // If Meteor.users has been instantiated, attempt to re-assign its prototype:
  CollectionHooks.reassignPrototype(Meteor.users); // Next, give it the hook aspects:

  CollectionHooks.extendCollectionInstance(Meteor.users, Mongo.Collection);
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/matb33:collection-hooks/server.js");

/* Exports */
Package._define("matb33:collection-hooks", exports, {
  CollectionHooks: CollectionHooks
});

})();

//# sourceURL=meteor://💻app/packages/matb33_collection-hooks.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWF0YjMzOmNvbGxlY3Rpb24taG9va3Mvc2VydmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tYXRiMzM6Y29sbGVjdGlvbi1ob29rcy9hZHZpY2VzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tYXRiMzM6Y29sbGVjdGlvbi1ob29rcy9jb2xsZWN0aW9uLWhvb2tzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tYXRiMzM6Y29sbGVjdGlvbi1ob29rcy9maW5kLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tYXRiMzM6Y29sbGVjdGlvbi1ob29rcy9maW5kb25lLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tYXRiMzM6Y29sbGVjdGlvbi1ob29rcy9pbnNlcnQuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21hdGIzMzpjb2xsZWN0aW9uLWhvb2tzL3JlbW92ZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWF0YjMzOmNvbGxlY3Rpb24taG9va3MvdXBkYXRlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tYXRiMzM6Y29sbGVjdGlvbi1ob29rcy91cHNlcnQuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21hdGIzMzpjb2xsZWN0aW9uLWhvb2tzL3VzZXJzLWNvbXBhdC5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnQiLCJDb2xsZWN0aW9uSG9va3MiLCJNZXRlb3IiLCJsaW5rIiwidiIsInB1Ymxpc2hVc2VySWQiLCJFbnZpcm9ubWVudFZhcmlhYmxlIiwiZ2V0VXNlcklkIiwidXNlcklkIiwiZSIsImdldCIsImRlZmF1bHRVc2VySWQiLCJfcHVibGlzaCIsInB1Ymxpc2giLCJuYW1lIiwiaGFuZGxlciIsIm9wdGlvbnMiLCJjYWxsIiwiYXJncyIsIndpdGhWYWx1ZSIsImFwcGx5IiwiaXNXaXRoaW5QdWJsaXNoIiwidW5kZWZpbmVkIiwiX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzIiwiZGVmYXVsdCIsIl9vYmplY3RTcHJlYWQiLCJNb25nbyIsIkVKU09OIiwiTG9jYWxDb2xsZWN0aW9uIiwiYWR2aWNlcyIsImRlZmF1bHRzIiwiYmVmb3JlIiwiaW5zZXJ0IiwidXBkYXRlIiwicmVtb3ZlIiwidXBzZXJ0IiwiZmluZCIsImZpbmRPbmUiLCJhbGwiLCJhZnRlciIsImRpcmVjdEVudiIsImRpcmVjdE9wIiwiZnVuYyIsImhvb2tlZE9wIiwiZXh0ZW5kQ29sbGVjdGlvbkluc3RhbmNlIiwic2VsZiIsImNvbnN0cnVjdG9yIiwiZm9yRWFjaCIsInBvaW50Y3V0IiwiT2JqZWN0IiwiZW50cmllcyIsIm1ldGhvZCIsImFkdmljZSIsIl9lbnN1cmUiLCJfaG9va0FzcGVjdHMiLCJhc3BlY3QiLCJsZW4iLCJwdXNoIiwiaW5pdE9wdGlvbnMiLCJyZXBsYWNlIiwic3BsaWNlIiwiaG9va09wdGlvbnMiLCJjbG9uZSIsImNvbGxlY3Rpb24iLCJpc0NsaWVudCIsIl9jb2xsZWN0aW9uIiwiX3N1cGVyIiwiZGlyZWN0IiwicHJvdG90eXBlIiwiZG9jIiwiX3RyYW5zZm9ybSIsImQiLCJkZWZpbmVBZHZpY2UiLCJnZXRBZHZpY2UiLCJleHRlbmRPcHRpb25zIiwic291cmNlIiwiZ2V0RG9jcyIsInNlbGVjdG9yIiwiZmluZE9wdGlvbnMiLCJ0cmFuc2Zvcm0iLCJyZWFjdGl2ZSIsIm11bHRpIiwibGltaXQiLCJyZXN0IiwiYXNzaWduIiwibm9ybWFsaXplU2VsZWN0b3IiLCJPYmplY3RJRCIsIl9pZCIsImdldEZpZWxkcyIsIm11dGF0b3IiLCJmaWVsZHMiLCJvcGVyYXRvcnMiLCJvcCIsInBhcmFtcyIsImluY2x1ZGVzIiwia2V5cyIsImZpZWxkIiwiaW5kZXhPZiIsInN1YnN0cmluZyIsInJlYXNzaWduUHJvdG90eXBlIiwiaW5zdGFuY2UiLCJjb25zdHIiLCJoYXNTZXRQcm90b3R5cGVPZiIsInNldFByb3RvdHlwZU9mIiwiQ29sbGVjdGlvbiIsIl9fcHJvdG9fXyIsIndyYXBDb2xsZWN0aW9uIiwibnMiLCJhcyIsIl9Db2xsZWN0aW9uQ29uc3RydWN0b3IiLCJfQ29sbGVjdGlvblByb3RvdHlwZSIsIl9OZXdDb2xsZWN0aW9uQ29udHJ1Y3RvciIsInByb3RvIiwicmV0IiwicHJvcCIsIkZ1bmN0aW9uIiwibW9kaWZ5IiwiX21vZGlmeSIsImFzcGVjdHMiLCJnZXRUcmFuc2Zvcm0iLCJzdXBwcmVzc0FzcGVjdHMiLCJjdHgiLCJjb250ZXh0IiwiX2dldEZpbmRTZWxlY3RvciIsIl9nZXRGaW5kT3B0aW9ucyIsImFib3J0IiwibyIsInIiLCJjdXJzb3IiLCJjYWxsYmFjayIsImFzeW5jIiwiaWQiLCJlcnIiLCJvcHMiLCJfc3RyIiwidG9TdHJpbmciLCJsY3R4Iiwid3JhcHBlZENhbGxiYWNrIiwib2JqIiwiaXNFbXB0eSIsImEiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJkb2NzIiwicHJldiIsImZldGNoIiwicmVzdWx0IiwiZG9jSWRzIiwibWFwIiwic29tZSIsImZldGNoUHJldmlvdXMiLCJhZmZlY3RlZCIsIiRpbiIsInByZXZpb3VzIiwiYXNwZWN0R3JvdXAiLCJudW1iZXJBZmZlY3RlZCIsImFmdGVyVXBkYXRlIiwiYWZ0ZXJJbnNlcnQiLCJpbnNlcnRlZElkIiwidXNlcnMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsTUFBTSxDQUFDQyxNQUFQLENBQWM7QUFBQ0MsaUJBQWUsRUFBQyxNQUFJQTtBQUFyQixDQUFkO0FBQXFELElBQUlDLE1BQUo7QUFBV0gsTUFBTSxDQUFDSSxJQUFQLENBQVksZUFBWixFQUE0QjtBQUFDRCxRQUFNLENBQUNFLENBQUQsRUFBRztBQUFDRixVQUFNLEdBQUNFLENBQVA7QUFBUzs7QUFBcEIsQ0FBNUIsRUFBa0QsQ0FBbEQ7QUFBcUQsSUFBSUgsZUFBSjtBQUFvQkYsTUFBTSxDQUFDSSxJQUFQLENBQVksb0JBQVosRUFB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LENBQWhCO0FBQWtCOztBQUF0QyxDQUFqQyxFQUF5RSxDQUF6RTs7QUFJaEosSUFBSUYsTUFBTSxDQUFDOEosS0FBWCxFQUFrQjtBQUNoQjtBQUNBL0osaUJBQWUsQ0FBQ2tHLGlCQUFoQixDQUFrQ2pHLE1BQU0sQ0FBQzhKLEtBQXpDLEVBRmdCLENBSWhCOztBQUNBL0osaUJBQWUsQ0FBQzJDLHdCQUFoQixDQUF5QzFDLE1BQU0sQ0FBQzhKLEtBQWhELEVBQXVEdEksS0FBSyxDQUFDOEUsVUFBN0Q7QUFDRCxDIiwiZmlsZSI6Ii9wYWNrYWdlcy9tYXRiMzNfY29sbGVjdGlvbi1ob29rcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InXG5pbXBvcnQgeyBDb2xsZWN0aW9uSG9va3MgfSBmcm9tICcuL2NvbGxlY3Rpb24taG9va3MnXG5cbmltcG9ydCAnLi9hZHZpY2VzJ1xuXG5jb25zdCBwdWJsaXNoVXNlcklkID0gbmV3IE1ldGVvci5FbnZpcm9ubWVudFZhcmlhYmxlKClcblxuQ29sbGVjdGlvbkhvb2tzLmdldFVzZXJJZCA9IGZ1bmN0aW9uIGdldFVzZXJJZCAoKSB7XG4gIGxldCB1c2VySWRcblxuICB0cnkge1xuICAgIC8vIFdpbGwgdGhyb3cgYW4gZXJyb3IgdW5sZXNzIHdpdGhpbiBtZXRob2QgY2FsbC5cbiAgICAvLyBBdHRlbXB0IHRvIHJlY292ZXIgZ3JhY2VmdWxseSBieSBjYXRjaGluZzpcbiAgICB1c2VySWQgPSBNZXRlb3IudXNlcklkICYmIE1ldGVvci51c2VySWQoKVxuICB9IGNhdGNoIChlKSB7fVxuXG4gIGlmICh1c2VySWQgPT0gbnVsbCkge1xuICAgIC8vIEdldCB0aGUgdXNlcklkIGlmIHdlIGFyZSBpbiBhIHB1Ymxpc2ggZnVuY3Rpb24uXG4gICAgdXNlcklkID0gcHVibGlzaFVzZXJJZC5nZXQoKVxuICB9XG5cbiAgaWYgKHVzZXJJZCA9PSBudWxsKSB7XG4gICAgdXNlcklkID0gQ29sbGVjdGlvbkhvb2tzLmRlZmF1bHRVc2VySWRcbiAgfVxuXG4gIHJldHVybiB1c2VySWRcbn1cblxuY29uc3QgX3B1Ymxpc2ggPSBNZXRlb3IucHVibGlzaFxuTWV0ZW9yLnB1Ymxpc2ggPSBmdW5jdGlvbiAobmFtZSwgaGFuZGxlciwgb3B0aW9ucykge1xuICByZXR1cm4gX3B1Ymxpc2guY2FsbCh0aGlzLCBuYW1lLCBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHJlcGVhdGVkbHkgaW4gcHVibGljYXRpb25zXG4gICAgcmV0dXJuIHB1Ymxpc2hVc2VySWQud2l0aFZhbHVlKHRoaXMgJiYgdGhpcy51c2VySWQsICgpID0+IGhhbmRsZXIuYXBwbHkodGhpcywgYXJncykpXG4gIH0sIG9wdGlvbnMpXG59XG5cbi8vIE1ha2UgdGhlIGFib3ZlIGF2YWlsYWJsZSBmb3IgcGFja2FnZXMgd2l0aCBob29rcyB0aGF0IHdhbnQgdG8gZGV0ZXJtaW5lXG4vLyB3aGV0aGVyIHRoZXkgYXJlIHJ1bm5pbmcgaW5zaWRlIGEgcHVibGlzaCBmdW5jdGlvbiBvciBub3QuXG5Db2xsZWN0aW9uSG9va3MuaXNXaXRoaW5QdWJsaXNoID0gKCkgPT4gcHVibGlzaFVzZXJJZC5nZXQoKSAhPT0gdW5kZWZpbmVkXG5cbmV4cG9ydCB7XG4gIENvbGxlY3Rpb25Ib29rc1xufVxuIiwiaW1wb3J0ICcuL2luc2VydC5qcydcbmltcG9ydCAnLi91cGRhdGUuanMnXG5pbXBvcnQgJy4vcmVtb3ZlLmpzJ1xuaW1wb3J0ICcuL3Vwc2VydC5qcydcbmltcG9ydCAnLi9maW5kLmpzJ1xuaW1wb3J0ICcuL2ZpbmRvbmUuanMnXG5cbi8vIExvYWQgYWZ0ZXIgYWxsIGFkdmljZXMgaGF2ZSBiZWVuIGRlZmluZWRcbmltcG9ydCAnLi91c2Vycy1jb21wYXQuanMnXG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJ1xuaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nXG5pbXBvcnQgeyBFSlNPTiB9IGZyb20gJ21ldGVvci9lanNvbidcbmltcG9ydCB7IExvY2FsQ29sbGVjdGlvbiB9IGZyb20gJ21ldGVvci9taW5pbW9uZ28nXG5cbi8vIFJlbGV2YW50IEFPUCB0ZXJtaW5vbG9neTpcbi8vIEFzcGVjdDogVXNlciBjb2RlIHRoYXQgcnVucyBiZWZvcmUvYWZ0ZXIgKGhvb2spXG4vLyBBZHZpY2U6IFdyYXBwZXIgY29kZSB0aGF0IGtub3dzIHdoZW4gdG8gY2FsbCB1c2VyIGNvZGUgKGFzcGVjdHMpXG4vLyBQb2ludGN1dDogYmVmb3JlL2FmdGVyXG5jb25zdCBhZHZpY2VzID0ge31cblxuZXhwb3J0IGNvbnN0IENvbGxlY3Rpb25Ib29rcyA9IHtcbiAgZGVmYXVsdHM6IHtcbiAgICBiZWZvcmU6IHsgaW5zZXJ0OiB7fSwgdXBkYXRlOiB7fSwgcmVtb3ZlOiB7fSwgdXBzZXJ0OiB7fSwgZmluZDoge30sIGZpbmRPbmU6IHt9LCBhbGw6IHt9IH0sXG4gICAgYWZ0ZXI6IHsgaW5zZXJ0OiB7fSwgdXBkYXRlOiB7fSwgcmVtb3ZlOiB7fSwgZmluZDoge30sIGZpbmRPbmU6IHt9LCBhbGw6IHt9IH0sXG4gICAgYWxsOiB7IGluc2VydDoge30sIHVwZGF0ZToge30sIHJlbW92ZToge30sIGZpbmQ6IHt9LCBmaW5kT25lOiB7fSwgYWxsOiB7fSB9XG4gIH0sXG4gIGRpcmVjdEVudjogbmV3IE1ldGVvci5FbnZpcm9ubWVudFZhcmlhYmxlKCksXG4gIGRpcmVjdE9wIChmdW5jKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlyZWN0RW52LndpdGhWYWx1ZSh0cnVlLCBmdW5jKVxuICB9LFxuICBob29rZWRPcCAoZnVuYykge1xuICAgIHJldHVybiB0aGlzLmRpcmVjdEVudi53aXRoVmFsdWUoZmFsc2UsIGZ1bmMpXG4gIH1cbn1cblxuQ29sbGVjdGlvbkhvb2tzLmV4dGVuZENvbGxlY3Rpb25JbnN0YW5jZSA9IGZ1bmN0aW9uIGV4dGVuZENvbGxlY3Rpb25JbnN0YW5jZSAoc2VsZiwgY29uc3RydWN0b3IpIHtcbiAgLy8gT2ZmZXIgYSBwdWJsaWMgQVBJIHRvIGFsbG93IHRoZSB1c2VyIHRvIGRlZmluZSBhc3BlY3RzXG4gIC8vIEV4YW1wbGU6IGNvbGxlY3Rpb24uYmVmb3JlLmluc2VydChmdW5jKTtcbiAgWydiZWZvcmUnLCAnYWZ0ZXInXS5mb3JFYWNoKGZ1bmN0aW9uIChwb2ludGN1dCkge1xuICAgIE9iamVjdC5lbnRyaWVzKGFkdmljZXMpLmZvckVhY2goZnVuY3Rpb24gKFttZXRob2QsIGFkdmljZV0pIHtcbiAgICAgIGlmIChhZHZpY2UgPT09ICd1cHNlcnQnICYmIHBvaW50Y3V0ID09PSAnYWZ0ZXInKSByZXR1cm5cblxuICAgICAgTWV0ZW9yLl9lbnN1cmUoc2VsZiwgcG9pbnRjdXQsIG1ldGhvZClcbiAgICAgIE1ldGVvci5fZW5zdXJlKHNlbGYsICdfaG9va0FzcGVjdHMnLCBtZXRob2QpXG5cbiAgICAgIHNlbGYuX2hvb2tBc3BlY3RzW21ldGhvZF1bcG9pbnRjdXRdID0gW11cbiAgICAgIHNlbGZbcG9pbnRjdXRdW21ldGhvZF0gPSBmdW5jdGlvbiAoYXNwZWN0LCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGxlbiA9IHNlbGYuX2hvb2tBc3BlY3RzW21ldGhvZF1bcG9pbnRjdXRdLnB1c2goe1xuICAgICAgICAgIGFzcGVjdCxcbiAgICAgICAgICBvcHRpb25zOiBDb2xsZWN0aW9uSG9va3MuaW5pdE9wdGlvbnMob3B0aW9ucywgcG9pbnRjdXQsIG1ldGhvZClcbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlcGxhY2UgKGFzcGVjdCwgb3B0aW9ucykge1xuICAgICAgICAgICAgc2VsZi5faG9va0FzcGVjdHNbbWV0aG9kXVtwb2ludGN1dF0uc3BsaWNlKGxlbiAtIDEsIDEsIHtcbiAgICAgICAgICAgICAgYXNwZWN0LFxuICAgICAgICAgICAgICBvcHRpb25zOiBDb2xsZWN0aW9uSG9va3MuaW5pdE9wdGlvbnMob3B0aW9ucywgcG9pbnRjdXQsIG1ldGhvZClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSxcbiAgICAgICAgICByZW1vdmUgKCkge1xuICAgICAgICAgICAgc2VsZi5faG9va0FzcGVjdHNbbWV0aG9kXVtwb2ludGN1dF0uc3BsaWNlKGxlbiAtIDEsIDEpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfSlcblxuICAvLyBPZmZlciBhIHB1YmxpY2x5IGFjY2Vzc2libGUgb2JqZWN0IHRvIGFsbG93IHRoZSB1c2VyIHRvIGRlZmluZVxuICAvLyBjb2xsZWN0aW9uLXdpZGUgaG9vayBvcHRpb25zLlxuICAvLyBFeGFtcGxlOiBjb2xsZWN0aW9uLmhvb2tPcHRpb25zLmFmdGVyLnVwZGF0ZSA9IHtmZXRjaFByZXZpb3VzOiBmYWxzZX07XG4gIHNlbGYuaG9va09wdGlvbnMgPSBFSlNPTi5jbG9uZShDb2xsZWN0aW9uSG9va3MuZGVmYXVsdHMpXG5cbiAgLy8gV3JhcCBtdXRhdG9yIG1ldGhvZHMsIGxldHRpbmcgdGhlIGRlZmluZWQgYWR2aWNlIGRvIHRoZSB3b3JrXG4gIE9iamVjdC5lbnRyaWVzKGFkdmljZXMpLmZvckVhY2goZnVuY3Rpb24gKFttZXRob2QsIGFkdmljZV0pIHtcbiAgICBjb25zdCBjb2xsZWN0aW9uID0gTWV0ZW9yLmlzQ2xpZW50IHx8IG1ldGhvZCA9PT0gJ3Vwc2VydCcgPyBzZWxmIDogc2VsZi5fY29sbGVjdGlvblxuXG4gICAgLy8gU3RvcmUgYSByZWZlcmVuY2UgdG8gdGhlIG9yaWdpbmFsIG11dGF0b3IgbWV0aG9kXG4gICAgY29uc3QgX3N1cGVyID0gY29sbGVjdGlvblttZXRob2RdXG5cbiAgICBNZXRlb3IuX2Vuc3VyZShzZWxmLCAnZGlyZWN0JywgbWV0aG9kKVxuICAgIHNlbGYuZGlyZWN0W21ldGhvZF0gPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgcmV0dXJuIENvbGxlY3Rpb25Ib29rcy5kaXJlY3RPcChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBjb25zdHJ1Y3Rvci5wcm90b3R5cGVbbWV0aG9kXS5hcHBseShzZWxmLCBhcmdzKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb2xsZWN0aW9uW21ldGhvZF0gPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgaWYgKENvbGxlY3Rpb25Ib29rcy5kaXJlY3RFbnYuZ2V0KCkgPT09IHRydWUpIHtcbiAgICAgICAgcmV0dXJuIF9zdXBlci5hcHBseShjb2xsZWN0aW9uLCBhcmdzKVxuICAgICAgfVxuXG4gICAgICAvLyBOT1RFOiBzaG91bGQgd2UgZGVjaWRlIHRvIGZvcmNlIGB1cGRhdGVgIHdpdGggYHt1cHNlcnQ6dHJ1ZX1gIHRvIHVzZVxuICAgICAgLy8gdGhlIGB1cHNlcnRgIGhvb2tzLCB0aGlzIGlzIHdoYXQgd2lsbCBhY2NvbXBsaXNoIGl0LiBJdCdzIGltcG9ydGFudCB0b1xuICAgICAgLy8gcmVhbGl6ZSB0aGF0IE1ldGVvciB3b24ndCBkaXN0aW5ndWlzaCBiZXR3ZWVuIGFuIGB1cGRhdGVgIGFuZCBhblxuICAgICAgLy8gYGluc2VydGAgdGhvdWdoLCBzbyB3ZSdsbCBlbmQgdXAgd2l0aCBgYWZ0ZXIudXBkYXRlYCBnZXR0aW5nIGNhbGxlZFxuICAgICAgLy8gZXZlbiBvbiBhbiBgaW5zZXJ0YC4gVGhhdCdzIHdoeSB3ZSd2ZSBjaG9zZW4gdG8gZGlzYWJsZSB0aGlzIGZvciBub3cuXG4gICAgICAvLyBpZiAobWV0aG9kID09PSBcInVwZGF0ZVwiICYmIE9iamVjdChhcmdzWzJdKSA9PT0gYXJnc1syXSAmJiBhcmdzWzJdLnVwc2VydCkge1xuICAgICAgLy8gICBtZXRob2QgPSBcInVwc2VydFwiO1xuICAgICAgLy8gICBhZHZpY2UgPSBDb2xsZWN0aW9uSG9va3MuZ2V0QWR2aWNlKG1ldGhvZCk7XG4gICAgICAvLyB9XG5cbiAgICAgIHJldHVybiBhZHZpY2UuY2FsbCh0aGlzLFxuICAgICAgICBDb2xsZWN0aW9uSG9va3MuZ2V0VXNlcklkKCksXG4gICAgICAgIF9zdXBlcixcbiAgICAgICAgc2VsZixcbiAgICAgICAgbWV0aG9kID09PSAndXBzZXJ0JyA/IHtcbiAgICAgICAgICBpbnNlcnQ6IHNlbGYuX2hvb2tBc3BlY3RzLmluc2VydCB8fCB7fSxcbiAgICAgICAgICB1cGRhdGU6IHNlbGYuX2hvb2tBc3BlY3RzLnVwZGF0ZSB8fCB7fSxcbiAgICAgICAgICB1cHNlcnQ6IHNlbGYuX2hvb2tBc3BlY3RzLnVwc2VydCB8fCB7fVxuICAgICAgICB9IDogc2VsZi5faG9va0FzcGVjdHNbbWV0aG9kXSB8fCB7fSxcbiAgICAgICAgZnVuY3Rpb24gKGRvYykge1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICB0eXBlb2Ygc2VsZi5fdHJhbnNmb3JtID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgID8gZnVuY3Rpb24gKGQpIHsgcmV0dXJuIHNlbGYuX3RyYW5zZm9ybShkIHx8IGRvYykgfVxuICAgICAgICAgICAgICA6IGZ1bmN0aW9uIChkKSB7IHJldHVybiBkIHx8IGRvYyB9XG4gICAgICAgICAgKVxuICAgICAgICB9LFxuICAgICAgICBhcmdzLFxuICAgICAgICBmYWxzZVxuICAgICAgKVxuICAgIH1cbiAgfSlcbn1cblxuQ29sbGVjdGlvbkhvb2tzLmRlZmluZUFkdmljZSA9IChtZXRob2QsIGFkdmljZSkgPT4ge1xuICBhZHZpY2VzW21ldGhvZF0gPSBhZHZpY2Vcbn1cblxuQ29sbGVjdGlvbkhvb2tzLmdldEFkdmljZSA9IG1ldGhvZCA9PiBhZHZpY2VzW21ldGhvZF1cblxuQ29sbGVjdGlvbkhvb2tzLmluaXRPcHRpb25zID0gKG9wdGlvbnMsIHBvaW50Y3V0LCBtZXRob2QpID0+XG4gIENvbGxlY3Rpb25Ib29rcy5leHRlbmRPcHRpb25zKENvbGxlY3Rpb25Ib29rcy5kZWZhdWx0cywgb3B0aW9ucywgcG9pbnRjdXQsIG1ldGhvZClcblxuQ29sbGVjdGlvbkhvb2tzLmV4dGVuZE9wdGlvbnMgPSAoc291cmNlLCBvcHRpb25zLCBwb2ludGN1dCwgbWV0aG9kKSA9PlxuICAoeyAuLi5vcHRpb25zLCAuLi5zb3VyY2UuYWxsLmFsbCwgLi4uc291cmNlW3BvaW50Y3V0XS5hbGwsIC4uLnNvdXJjZS5hbGxbbWV0aG9kXSwgLi4uc291cmNlW3BvaW50Y3V0XVttZXRob2RdIH0pXG5cbkNvbGxlY3Rpb25Ib29rcy5nZXREb2NzID0gZnVuY3Rpb24gZ2V0RG9jcyAoY29sbGVjdGlvbiwgc2VsZWN0b3IsIG9wdGlvbnMpIHtcbiAgY29uc3QgZmluZE9wdGlvbnMgPSB7IHRyYW5zZm9ybTogbnVsbCwgcmVhY3RpdmU6IGZhbHNlIH0gLy8gYWRkZWQgcmVhY3RpdmU6IGZhbHNlXG5cbiAgLypcbiAgLy8gTm8gXCJmZXRjaFwiIHN1cHBvcnQgYXQgdGhpcyB0aW1lLlxuICBpZiAoIXRoaXMuX3ZhbGlkYXRvcnMuZmV0Y2hBbGxGaWVsZHMpIHtcbiAgICBmaW5kT3B0aW9ucy5maWVsZHMgPSB7fTtcbiAgICB0aGlzLl92YWxpZGF0b3JzLmZldGNoLmZvckVhY2goZnVuY3Rpb24oZmllbGROYW1lKSB7XG4gICAgICBmaW5kT3B0aW9ucy5maWVsZHNbZmllbGROYW1lXSA9IDE7XG4gICAgfSk7XG4gIH1cbiAgKi9cblxuICAvLyBCaXQgb2YgYSBtYWdpYyBjb25kaXRpb24gaGVyZS4uLiBvbmx5IFwidXBkYXRlXCIgcGFzc2VzIG9wdGlvbnMsIHNvIHRoaXMgaXNcbiAgLy8gb25seSByZWxldmFudCB0byB3aGVuIHVwZGF0ZSBjYWxscyBnZXREb2NzOlxuICBpZiAob3B0aW9ucykge1xuICAgIC8vIFRoaXMgd2FzIGFkZGVkIGJlY2F1c2UgaW4gb3VyIGNhc2UsIHdlIGFyZSBwb3RlbnRpYWxseSBpdGVyYXRpbmcgb3ZlclxuICAgIC8vIG11bHRpcGxlIGRvY3MuIElmIG11bHRpIGlzbid0IGVuYWJsZWQsIGZvcmNlIGEgbGltaXQgKGFsbW9zdCBsaWtlXG4gICAgLy8gZmluZE9uZSksIGFzIHRoZSBkZWZhdWx0IGZvciB1cGRhdGUgd2l0aG91dCBtdWx0aSBlbmFibGVkIGlzIHRvIGFmZmVjdFxuICAgIC8vIG9ubHkgdGhlIGZpcnN0IG1hdGNoZWQgZG9jdW1lbnQ6XG4gICAgaWYgKCFvcHRpb25zLm11bHRpKSB7XG4gICAgICBmaW5kT3B0aW9ucy5saW1pdCA9IDFcbiAgICB9XG4gICAgY29uc3QgeyBtdWx0aSwgdXBzZXJ0LCAuLi5yZXN0IH0gPSBvcHRpb25zXG4gICAgT2JqZWN0LmFzc2lnbihmaW5kT3B0aW9ucywgcmVzdClcbiAgfVxuXG4gIC8vIFVubGlrZSB2YWxpZGF0b3JzLCB3ZSBpdGVyYXRlIG92ZXIgbXVsdGlwbGUgZG9jcywgc28gdXNlXG4gIC8vIGZpbmQgaW5zdGVhZCBvZiBmaW5kT25lOlxuICByZXR1cm4gY29sbGVjdGlvbi5maW5kKHNlbGVjdG9yLCBmaW5kT3B0aW9ucylcbn1cblxuLy8gVGhpcyBmdW5jdGlvbiBub3JtYWxpemVzIHRoZSBzZWxlY3RvciAoY29udmVydGluZyBpdCB0byBhbiBPYmplY3QpXG5Db2xsZWN0aW9uSG9va3Mubm9ybWFsaXplU2VsZWN0b3IgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ3N0cmluZycgfHwgKHNlbGVjdG9yICYmIHNlbGVjdG9yLmNvbnN0cnVjdG9yID09PSBNb25nby5PYmplY3RJRCkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgX2lkOiBzZWxlY3RvclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc2VsZWN0b3JcbiAgfVxufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIGNvbnRhaW5zIGEgc25pcHBldCBvZiBjb2RlIHB1bGxlZCBhbmQgbW9kaWZpZWQgZnJvbTpcbi8vIH4vLm1ldGVvci9wYWNrYWdlcy9tb25nby1saXZlZGF0YS9jb2xsZWN0aW9uLmpzXG4vLyBJdCdzIGNvbnRhaW5lZCBpbiB0aGVzZSB1dGlsaXR5IGZ1bmN0aW9ucyB0byBtYWtlIHVwZGF0ZXMgZWFzaWVyIGZvciB1cyBpblxuLy8gY2FzZSB0aGlzIGNvZGUgY2hhbmdlcy5cbkNvbGxlY3Rpb25Ib29rcy5nZXRGaWVsZHMgPSBmdW5jdGlvbiBnZXRGaWVsZHMgKG11dGF0b3IpIHtcbiAgLy8gY29tcHV0ZSBtb2RpZmllZCBmaWVsZHNcbiAgY29uc3QgZmllbGRzID0gW11cbiAgLy8gPT09PUFEREVEIFNUQVJUPT09PT09PT09PT09PT09PT09PT09PT1cbiAgY29uc3Qgb3BlcmF0b3JzID0gW1xuICAgICckYWRkVG9TZXQnLFxuICAgICckYml0JyxcbiAgICAnJGN1cnJlbnREYXRlJyxcbiAgICAnJGluYycsXG4gICAgJyRtYXgnLFxuICAgICckbWluJyxcbiAgICAnJHBvcCcsXG4gICAgJyRwdWxsJyxcbiAgICAnJHB1bGxBbGwnLFxuICAgICckcHVzaCcsXG4gICAgJyRyZW5hbWUnLFxuICAgICckc2V0JyxcbiAgICAnJHVuc2V0J1xuICBdXG4gIC8vID09PT1BRERFRCBFTkQ9PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgT2JqZWN0LmVudHJpZXMobXV0YXRvcikuZm9yRWFjaChmdW5jdGlvbiAoW29wLCBwYXJhbXNdKSB7XG4gICAgLy8gPT09PUFEREVEIFNUQVJUPT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBpZiAob3BlcmF0b3JzLmluY2x1ZGVzKG9wKSkge1xuICAgIC8vID09PT1BRERFRCBFTkQ9PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICBPYmplY3Qua2V5cyhwYXJhbXMpLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICAgIC8vIHRyZWF0IGRvdHRlZCBmaWVsZHMgYXMgaWYgdGhleSBhcmUgcmVwbGFjaW5nIHRoZWlyXG4gICAgICAgIC8vIHRvcC1sZXZlbCBwYXJ0XG4gICAgICAgIGlmIChmaWVsZC5pbmRleE9mKCcuJykgIT09IC0xKSB7XG4gICAgICAgICAgZmllbGQgPSBmaWVsZC5zdWJzdHJpbmcoMCwgZmllbGQuaW5kZXhPZignLicpKVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVjb3JkIHRoZSBmaWVsZCB3ZSBhcmUgdHJ5aW5nIHRvIGNoYW5nZVxuICAgICAgICBpZiAoIWZpZWxkcy5pbmNsdWRlcyhmaWVsZCkpIHtcbiAgICAgICAgICBmaWVsZHMucHVzaChmaWVsZClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC8vID09PT1BRERFRCBTVEFSVD09PT09PT09PT09PT09PT09PT09PT09XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpZWxkcy5wdXNoKG9wKVxuICAgIH1cbiAgICAvLyA9PT09QURERUQgRU5EPT09PT09PT09PT09PT09PT09PT09PT09PVxuICB9KVxuXG4gIHJldHVybiBmaWVsZHNcbn1cblxuQ29sbGVjdGlvbkhvb2tzLnJlYXNzaWduUHJvdG90eXBlID0gZnVuY3Rpb24gcmVhc3NpZ25Qcm90b3R5cGUgKGluc3RhbmNlLCBjb25zdHIpIHtcbiAgY29uc3QgaGFzU2V0UHJvdG90eXBlT2YgPSB0eXBlb2YgT2JqZWN0LnNldFByb3RvdHlwZU9mID09PSAnZnVuY3Rpb24nXG4gIGNvbnN0ciA9IGNvbnN0ciB8fCBNb25nby5Db2xsZWN0aW9uXG5cbiAgLy8gX19wcm90b19fIGlzIG5vdCBhdmFpbGFibGUgaW4gPCBJRTExXG4gIC8vIE5vdGU6IEFzc2lnbmluZyBhIHByb3RvdHlwZSBkeW5hbWljYWxseSBoYXMgcGVyZm9ybWFuY2UgaW1wbGljYXRpb25zXG4gIGlmIChoYXNTZXRQcm90b3R5cGVPZikge1xuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihpbnN0YW5jZSwgY29uc3RyLnByb3RvdHlwZSlcbiAgfSBlbHNlIGlmIChpbnN0YW5jZS5fX3Byb3RvX18pIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b1xuICAgIGluc3RhbmNlLl9fcHJvdG9fXyA9IGNvbnN0ci5wcm90b3R5cGUgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b1xuICB9XG59XG5cbkNvbGxlY3Rpb25Ib29rcy53cmFwQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIHdyYXBDb2xsZWN0aW9uIChucywgYXMpIHtcbiAgaWYgKCFhcy5fQ29sbGVjdGlvbkNvbnN0cnVjdG9yKSBhcy5fQ29sbGVjdGlvbkNvbnN0cnVjdG9yID0gYXMuQ29sbGVjdGlvblxuICBpZiAoIWFzLl9Db2xsZWN0aW9uUHJvdG90eXBlKSBhcy5fQ29sbGVjdGlvblByb3RvdHlwZSA9IG5ldyBhcy5Db2xsZWN0aW9uKG51bGwpXG5cbiAgY29uc3QgY29uc3RydWN0b3IgPSBucy5fTmV3Q29sbGVjdGlvbkNvbnRydWN0b3IgfHwgYXMuX0NvbGxlY3Rpb25Db25zdHJ1Y3RvclxuICBjb25zdCBwcm90byA9IGFzLl9Db2xsZWN0aW9uUHJvdG90eXBlXG5cbiAgbnMuQ29sbGVjdGlvbiA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgY29uc3QgcmV0ID0gY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJncylcbiAgICBDb2xsZWN0aW9uSG9va3MuZXh0ZW5kQ29sbGVjdGlvbkluc3RhbmNlKHRoaXMsIGNvbnN0cnVjdG9yKVxuICAgIHJldHVybiByZXRcbiAgfVxuICAvLyBSZXRhaW4gYSByZWZlcmVuY2UgdG8gdGhlIG5ldyBjb25zdHJ1Y3RvciB0byBhbGxvdyBmdXJ0aGVyIHdyYXBwaW5nLlxuICBucy5fTmV3Q29sbGVjdGlvbkNvbnRydWN0b3IgPSBucy5Db2xsZWN0aW9uXG5cbiAgbnMuQ29sbGVjdGlvbi5wcm90b3R5cGUgPSBwcm90b1xuICBucy5Db2xsZWN0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IG5zLkNvbGxlY3Rpb25cblxuICBmb3IgKGNvbnN0IHByb3Agb2YgT2JqZWN0LmtleXMoY29uc3RydWN0b3IpKSB7XG4gICAgbnMuQ29sbGVjdGlvbltwcm9wXSA9IGNvbnN0cnVjdG9yW3Byb3BdXG4gIH1cblxuICAvLyBNZXRlb3Igb3ZlcnJpZGVzIHRoZSBhcHBseSBtZXRob2Qgd2hpY2ggaXMgY29waWVkIGZyb20gdGhlIGNvbnN0cnVjdG9yIGluIHRoZSBsb29wIGFib3ZlLiBSZXBsYWNlIGl0IHdpdGggdGhlXG4gIC8vIGRlZmF1bHQgbWV0aG9kIHdoaWNoIHdlIG5lZWQgaWYgd2Ugd2VyZSB0byBmdXJ0aGVyIHdyYXAgbnMuQ29sbGVjdGlvbi5cbiAgbnMuQ29sbGVjdGlvbi5hcHBseSA9IEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseVxufVxuXG5Db2xsZWN0aW9uSG9va3MubW9kaWZ5ID0gTG9jYWxDb2xsZWN0aW9uLl9tb2RpZnlcblxuaWYgKHR5cGVvZiBNb25nbyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgQ29sbGVjdGlvbkhvb2tzLndyYXBDb2xsZWN0aW9uKE1ldGVvciwgTW9uZ28pXG4gIENvbGxlY3Rpb25Ib29rcy53cmFwQ29sbGVjdGlvbihNb25nbywgTW9uZ28pXG59IGVsc2Uge1xuICBDb2xsZWN0aW9uSG9va3Mud3JhcENvbGxlY3Rpb24oTWV0ZW9yLCBNZXRlb3IpXG59XG4iLCJpbXBvcnQgeyBDb2xsZWN0aW9uSG9va3MgfSBmcm9tICcuL2NvbGxlY3Rpb24taG9va3MnXG5cbkNvbGxlY3Rpb25Ib29rcy5kZWZpbmVBZHZpY2UoJ2ZpbmQnLCBmdW5jdGlvbiAodXNlcklkLCBfc3VwZXIsIGluc3RhbmNlLCBhc3BlY3RzLCBnZXRUcmFuc2Zvcm0sIGFyZ3MsIHN1cHByZXNzQXNwZWN0cykge1xuICBjb25zdCBjdHggPSB7IGNvbnRleHQ6IHRoaXMsIF9zdXBlciwgYXJncyB9XG4gIGNvbnN0IHNlbGVjdG9yID0gQ29sbGVjdGlvbkhvb2tzLm5vcm1hbGl6ZVNlbGVjdG9yKGluc3RhbmNlLl9nZXRGaW5kU2VsZWN0b3IoYXJncykpXG4gIGNvbnN0IG9wdGlvbnMgPSBpbnN0YW5jZS5fZ2V0RmluZE9wdGlvbnMoYXJncylcbiAgbGV0IGFib3J0XG4gIC8vIGJlZm9yZVxuICBpZiAoIXN1cHByZXNzQXNwZWN0cykge1xuICAgIGFzcGVjdHMuYmVmb3JlLmZvckVhY2goKG8pID0+IHtcbiAgICAgIGNvbnN0IHIgPSBvLmFzcGVjdC5jYWxsKGN0eCwgdXNlcklkLCBzZWxlY3Rvciwgb3B0aW9ucylcbiAgICAgIGlmIChyID09PSBmYWxzZSkgYWJvcnQgPSB0cnVlXG4gICAgfSlcblxuICAgIGlmIChhYm9ydCkgcmV0dXJuIGluc3RhbmNlLmZpbmQodW5kZWZpbmVkKVxuICB9XG5cbiAgY29uc3QgYWZ0ZXIgPSAoY3Vyc29yKSA9PiB7XG4gICAgaWYgKCFzdXBwcmVzc0FzcGVjdHMpIHtcbiAgICAgIGFzcGVjdHMuYWZ0ZXIuZm9yRWFjaCgobykgPT4ge1xuICAgICAgICBvLmFzcGVjdC5jYWxsKGN0eCwgdXNlcklkLCBzZWxlY3Rvciwgb3B0aW9ucywgY3Vyc29yKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXQgPSBfc3VwZXIuY2FsbCh0aGlzLCBzZWxlY3Rvciwgb3B0aW9ucylcbiAgYWZ0ZXIocmV0KVxuXG4gIHJldHVybiByZXRcbn0pXG4iLCJpbXBvcnQgeyBDb2xsZWN0aW9uSG9va3MgfSBmcm9tICcuL2NvbGxlY3Rpb24taG9va3MnXG5cbkNvbGxlY3Rpb25Ib29rcy5kZWZpbmVBZHZpY2UoJ2ZpbmRPbmUnLCBmdW5jdGlvbiAodXNlcklkLCBfc3VwZXIsIGluc3RhbmNlLCBhc3BlY3RzLCBnZXRUcmFuc2Zvcm0sIGFyZ3MsIHN1cHByZXNzQXNwZWN0cykge1xuICBjb25zdCBjdHggPSB7IGNvbnRleHQ6IHRoaXMsIF9zdXBlciwgYXJncyB9XG4gIGNvbnN0IHNlbGVjdG9yID0gQ29sbGVjdGlvbkhvb2tzLm5vcm1hbGl6ZVNlbGVjdG9yKGluc3RhbmNlLl9nZXRGaW5kU2VsZWN0b3IoYXJncykpXG4gIGNvbnN0IG9wdGlvbnMgPSBpbnN0YW5jZS5fZ2V0RmluZE9wdGlvbnMoYXJncylcbiAgbGV0IGFib3J0XG5cbiAgLy8gYmVmb3JlXG4gIGlmICghc3VwcHJlc3NBc3BlY3RzKSB7XG4gICAgYXNwZWN0cy5iZWZvcmUuZm9yRWFjaCgobykgPT4ge1xuICAgICAgY29uc3QgciA9IG8uYXNwZWN0LmNhbGwoY3R4LCB1c2VySWQsIHNlbGVjdG9yLCBvcHRpb25zKVxuICAgICAgaWYgKHIgPT09IGZhbHNlKSBhYm9ydCA9IHRydWVcbiAgICB9KVxuXG4gICAgaWYgKGFib3J0KSByZXR1cm5cbiAgfVxuXG4gIGZ1bmN0aW9uIGFmdGVyIChkb2MpIHtcbiAgICBpZiAoIXN1cHByZXNzQXNwZWN0cykge1xuICAgICAgYXNwZWN0cy5hZnRlci5mb3JFYWNoKChvKSA9PiB7XG4gICAgICAgIG8uYXNwZWN0LmNhbGwoY3R4LCB1c2VySWQsIHNlbGVjdG9yLCBvcHRpb25zLCBkb2MpXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJldCA9IF9zdXBlci5jYWxsKHRoaXMsIHNlbGVjdG9yLCBvcHRpb25zKVxuICBhZnRlcihyZXQpXG5cbiAgcmV0dXJuIHJldFxufSlcbiIsImltcG9ydCB7IEVKU09OIH0gZnJvbSAnbWV0ZW9yL2Vqc29uJ1xuaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nXG5pbXBvcnQgeyBDb2xsZWN0aW9uSG9va3MgfSBmcm9tICcuL2NvbGxlY3Rpb24taG9va3MnXG5cbkNvbGxlY3Rpb25Ib29rcy5kZWZpbmVBZHZpY2UoJ2luc2VydCcsIGZ1bmN0aW9uICh1c2VySWQsIF9zdXBlciwgaW5zdGFuY2UsIGFzcGVjdHMsIGdldFRyYW5zZm9ybSwgYXJncywgc3VwcHJlc3NBc3BlY3RzKSB7XG4gIGNvbnN0IGN0eCA9IHsgY29udGV4dDogdGhpcywgX3N1cGVyLCBhcmdzIH1cbiAgbGV0IFtkb2MsIGNhbGxiYWNrXSA9IGFyZ3NcbiAgY29uc3QgYXN5bmMgPSB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbidcbiAgbGV0IGFib3J0XG4gIGxldCByZXRcblxuICAvLyBiZWZvcmVcbiAgaWYgKCFzdXBwcmVzc0FzcGVjdHMpIHtcbiAgICB0cnkge1xuICAgICAgYXNwZWN0cy5iZWZvcmUuZm9yRWFjaCgobykgPT4ge1xuICAgICAgICBjb25zdCByID0gby5hc3BlY3QuY2FsbCh7IHRyYW5zZm9ybTogZ2V0VHJhbnNmb3JtKGRvYyksIC4uLmN0eCB9LCB1c2VySWQsIGRvYylcbiAgICAgICAgaWYgKHIgPT09IGZhbHNlKSBhYm9ydCA9IHRydWVcbiAgICAgIH0pXG5cbiAgICAgIGlmIChhYm9ydCkgcmV0dXJuXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGFzeW5jKSByZXR1cm4gY2FsbGJhY2suY2FsbCh0aGlzLCBlKVxuICAgICAgdGhyb3cgZVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGFmdGVyID0gKGlkLCBlcnIpID0+IHtcbiAgICBpZiAoaWQpIHtcbiAgICAgIC8vIEluIHNvbWUgY2FzZXMgKG5hbWVseSBNZXRlb3IudXNlcnMgb24gTWV0ZW9yIDEuNCspLCB0aGUgX2lkIHByb3BlcnR5XG4gICAgICAvLyBpcyBhIHJhdyBtb25nbyBfaWQgb2JqZWN0LiBXZSBuZWVkIHRvIGV4dHJhY3QgdGhlIF9pZCBmcm9tIHRoaXMgb2JqZWN0XG4gICAgICBpZiAodHlwZW9mIGlkID09PSAnb2JqZWN0JyAmJiBpZC5vcHMpIHtcbiAgICAgICAgLy8gSWYgX3N0ciB0aGVuIGNvbGxlY3Rpb24gaXMgdXNpbmcgTW9uZ28uT2JqZWN0SUQgYXMgaWRzXG4gICAgICAgIGlmIChkb2MuX2lkLl9zdHIpIHtcbiAgICAgICAgICBpZCA9IG5ldyBNb25nby5PYmplY3RJRChkb2MuX2lkLl9zdHIudG9TdHJpbmcoKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZCA9IGlkLm9wcyAmJiBpZC5vcHNbMF0gJiYgaWQub3BzWzBdLl9pZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBkb2MgPSBFSlNPTi5jbG9uZShkb2MpXG4gICAgICBkb2MuX2lkID0gaWRcbiAgICB9XG4gICAgaWYgKCFzdXBwcmVzc0FzcGVjdHMpIHtcbiAgICAgIGNvbnN0IGxjdHggPSB7IHRyYW5zZm9ybTogZ2V0VHJhbnNmb3JtKGRvYyksIF9pZDogaWQsIGVyciwgLi4uY3R4IH1cbiAgICAgIGFzcGVjdHMuYWZ0ZXIuZm9yRWFjaCgobykgPT4ge1xuICAgICAgICBvLmFzcGVjdC5jYWxsKGxjdHgsIHVzZXJJZCwgZG9jKVxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIGlkXG4gIH1cblxuICBpZiAoYXN5bmMpIHtcbiAgICBjb25zdCB3cmFwcGVkQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZXJyLCBvYmosIC4uLmFyZ3MpIHtcbiAgICAgIGFmdGVyKChvYmogJiYgb2JqWzBdICYmIG9ialswXS5faWQpIHx8IG9iaiwgZXJyKVxuICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpcywgZXJyLCBvYmosIC4uLmFyZ3MpXG4gICAgfVxuICAgIHJldHVybiBfc3VwZXIuY2FsbCh0aGlzLCBkb2MsIHdyYXBwZWRDYWxsYmFjaylcbiAgfSBlbHNlIHtcbiAgICByZXQgPSBfc3VwZXIuY2FsbCh0aGlzLCBkb2MsIGNhbGxiYWNrKVxuICAgIHJldHVybiBhZnRlcigocmV0ICYmIHJldFswXSAmJiByZXRbMF0uX2lkKSB8fCByZXQpXG4gIH1cbn0pXG4iLCJpbXBvcnQgeyBFSlNPTiB9IGZyb20gJ21ldGVvci9lanNvbidcbmltcG9ydCB7IENvbGxlY3Rpb25Ib29rcyB9IGZyb20gJy4vY29sbGVjdGlvbi1ob29rcydcblxuY29uc3QgaXNFbXB0eSA9IGEgPT4gIUFycmF5LmlzQXJyYXkoYSkgfHwgIWEubGVuZ3RoXG5cbkNvbGxlY3Rpb25Ib29rcy5kZWZpbmVBZHZpY2UoJ3JlbW92ZScsIGZ1bmN0aW9uICh1c2VySWQsIF9zdXBlciwgaW5zdGFuY2UsIGFzcGVjdHMsIGdldFRyYW5zZm9ybSwgYXJncywgc3VwcHJlc3NBc3BlY3RzKSB7XG4gIGNvbnN0IGN0eCA9IHsgY29udGV4dDogdGhpcywgX3N1cGVyLCBhcmdzIH1cbiAgY29uc3QgW3NlbGVjdG9yLCBjYWxsYmFja10gPSBhcmdzXG4gIGNvbnN0IGFzeW5jID0gdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nXG4gIGxldCBkb2NzXG4gIGxldCBhYm9ydFxuICBjb25zdCBwcmV2ID0gW11cblxuICBpZiAoIXN1cHByZXNzQXNwZWN0cykge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWlzRW1wdHkoYXNwZWN0cy5iZWZvcmUpIHx8ICFpc0VtcHR5KGFzcGVjdHMuYWZ0ZXIpKSB7XG4gICAgICAgIGRvY3MgPSBDb2xsZWN0aW9uSG9va3MuZ2V0RG9jcy5jYWxsKHRoaXMsIGluc3RhbmNlLCBzZWxlY3RvcikuZmV0Y2goKVxuICAgICAgfVxuXG4gICAgICAvLyBjb3B5IG9yaWdpbmFscyBmb3IgY29udmVuaWVuY2UgZm9yIHRoZSAnYWZ0ZXInIHBvaW50Y3V0XG4gICAgICBpZiAoIWlzRW1wdHkoYXNwZWN0cy5hZnRlcikpIHtcbiAgICAgICAgZG9jcy5mb3JFYWNoKGRvYyA9PiBwcmV2LnB1c2goRUpTT04uY2xvbmUoZG9jKSkpXG4gICAgICB9XG5cbiAgICAgIC8vIGJlZm9yZVxuICAgICAgYXNwZWN0cy5iZWZvcmUuZm9yRWFjaCgobykgPT4ge1xuICAgICAgICBkb2NzLmZvckVhY2goKGRvYykgPT4ge1xuICAgICAgICAgIGNvbnN0IHIgPSBvLmFzcGVjdC5jYWxsKHsgdHJhbnNmb3JtOiBnZXRUcmFuc2Zvcm0oZG9jKSwgLi4uY3R4IH0sIHVzZXJJZCwgZG9jKVxuICAgICAgICAgIGlmIChyID09PSBmYWxzZSkgYWJvcnQgPSB0cnVlXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpZiAoYWJvcnQpIHJldHVybiAwXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGFzeW5jKSByZXR1cm4gY2FsbGJhY2suY2FsbCh0aGlzLCBlKVxuICAgICAgdGhyb3cgZVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFmdGVyIChlcnIpIHtcbiAgICBpZiAoIXN1cHByZXNzQXNwZWN0cykge1xuICAgICAgYXNwZWN0cy5hZnRlci5mb3JFYWNoKChvKSA9PiB7XG4gICAgICAgIHByZXYuZm9yRWFjaCgoZG9jKSA9PiB7XG4gICAgICAgICAgby5hc3BlY3QuY2FsbCh7IHRyYW5zZm9ybTogZ2V0VHJhbnNmb3JtKGRvYyksIGVyciwgLi4uY3R4IH0sIHVzZXJJZCwgZG9jKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBpZiAoYXN5bmMpIHtcbiAgICBjb25zdCB3cmFwcGVkQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZXJyLCAuLi5hcmdzKSB7XG4gICAgICBhZnRlcihlcnIpXG4gICAgICByZXR1cm4gY2FsbGJhY2suY2FsbCh0aGlzLCBlcnIsIC4uLmFyZ3MpXG4gICAgfVxuICAgIHJldHVybiBfc3VwZXIuY2FsbCh0aGlzLCBzZWxlY3Rvciwgd3JhcHBlZENhbGxiYWNrKVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IHJlc3VsdCA9IF9zdXBlci5jYWxsKHRoaXMsIHNlbGVjdG9yLCBjYWxsYmFjaylcbiAgICBhZnRlcigpXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG59KVxuIiwiaW1wb3J0IHsgRUpTT04gfSBmcm9tICdtZXRlb3IvZWpzb24nXG5pbXBvcnQgeyBDb2xsZWN0aW9uSG9va3MgfSBmcm9tICcuL2NvbGxlY3Rpb24taG9va3MnXG5cbmNvbnN0IGlzRW1wdHkgPSBhID0+ICFBcnJheS5pc0FycmF5KGEpIHx8ICFhLmxlbmd0aFxuXG5Db2xsZWN0aW9uSG9va3MuZGVmaW5lQWR2aWNlKCd1cGRhdGUnLCBmdW5jdGlvbiAodXNlcklkLCBfc3VwZXIsIGluc3RhbmNlLCBhc3BlY3RzLCBnZXRUcmFuc2Zvcm0sIGFyZ3MsIHN1cHByZXNzQXNwZWN0cykge1xuICBjb25zdCBjdHggPSB7IGNvbnRleHQ6IHRoaXMsIF9zdXBlciwgYXJncyB9XG4gIGxldCBbc2VsZWN0b3IsIG11dGF0b3IsIG9wdGlvbnMsIGNhbGxiYWNrXSA9IGFyZ3NcbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2FsbGJhY2sgPSBvcHRpb25zXG4gICAgb3B0aW9ucyA9IHt9XG4gIH1cbiAgY29uc3QgYXN5bmMgPSB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbidcbiAgbGV0IGRvY3NcbiAgbGV0IGRvY0lkc1xuICBsZXQgZmllbGRzXG4gIGxldCBhYm9ydFxuICBjb25zdCBwcmV2ID0ge31cblxuICBpZiAoIXN1cHByZXNzQXNwZWN0cykge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWlzRW1wdHkoYXNwZWN0cy5iZWZvcmUpIHx8ICFpc0VtcHR5KGFzcGVjdHMuYWZ0ZXIpKSB7XG4gICAgICAgIGZpZWxkcyA9IENvbGxlY3Rpb25Ib29rcy5nZXRGaWVsZHMobXV0YXRvcilcbiAgICAgICAgZG9jcyA9IENvbGxlY3Rpb25Ib29rcy5nZXREb2NzLmNhbGwodGhpcywgaW5zdGFuY2UsIHNlbGVjdG9yLCBvcHRpb25zKS5mZXRjaCgpXG4gICAgICAgIGRvY0lkcyA9IGRvY3MubWFwKGRvYyA9PiBkb2MuX2lkKVxuICAgICAgfVxuXG4gICAgICAvLyBjb3B5IG9yaWdpbmFscyBmb3IgY29udmVuaWVuY2UgZm9yIHRoZSAnYWZ0ZXInIHBvaW50Y3V0XG4gICAgICBpZiAoIWlzRW1wdHkoYXNwZWN0cy5hZnRlcikpIHtcbiAgICAgICAgcHJldi5tdXRhdG9yID0gRUpTT04uY2xvbmUobXV0YXRvcilcbiAgICAgICAgcHJldi5vcHRpb25zID0gRUpTT04uY2xvbmUob3B0aW9ucylcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGFzcGVjdHMuYWZ0ZXIuc29tZShvID0+IG8ub3B0aW9ucy5mZXRjaFByZXZpb3VzICE9PSBmYWxzZSkgJiZcbiAgICAgICAgICBDb2xsZWN0aW9uSG9va3MuZXh0ZW5kT3B0aW9ucyhpbnN0YW5jZS5ob29rT3B0aW9ucywge30sICdhZnRlcicsICd1cGRhdGUnKS5mZXRjaFByZXZpb3VzICE9PSBmYWxzZVxuICAgICAgICApIHtcbiAgICAgICAgICBwcmV2LmRvY3MgPSB7fVxuICAgICAgICAgIGRvY3MuZm9yRWFjaCgoZG9jKSA9PiB7XG4gICAgICAgICAgICBwcmV2LmRvY3NbZG9jLl9pZF0gPSBFSlNPTi5jbG9uZShkb2MpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBiZWZvcmVcbiAgICAgIGFzcGVjdHMuYmVmb3JlLmZvckVhY2goZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgZG9jcy5mb3JFYWNoKGZ1bmN0aW9uIChkb2MpIHtcbiAgICAgICAgICBjb25zdCByID0gby5hc3BlY3QuY2FsbCh7IHRyYW5zZm9ybTogZ2V0VHJhbnNmb3JtKGRvYyksIC4uLmN0eCB9LCB1c2VySWQsIGRvYywgZmllbGRzLCBtdXRhdG9yLCBvcHRpb25zKVxuICAgICAgICAgIGlmIChyID09PSBmYWxzZSkgYWJvcnQgPSB0cnVlXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpZiAoYWJvcnQpIHJldHVybiAwXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGFzeW5jKSByZXR1cm4gY2FsbGJhY2suY2FsbCh0aGlzLCBlKVxuICAgICAgdGhyb3cgZVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGFmdGVyID0gKGFmZmVjdGVkLCBlcnIpID0+IHtcbiAgICBpZiAoIXN1cHByZXNzQXNwZWN0cyAmJiAhaXNFbXB0eShhc3BlY3RzLmFmdGVyKSkge1xuICAgICAgY29uc3QgZmllbGRzID0gQ29sbGVjdGlvbkhvb2tzLmdldEZpZWxkcyhtdXRhdG9yKVxuICAgICAgY29uc3QgZG9jcyA9IENvbGxlY3Rpb25Ib29rcy5nZXREb2NzLmNhbGwodGhpcywgaW5zdGFuY2UsIHsgX2lkOiB7ICRpbjogZG9jSWRzIH0gfSwgb3B0aW9ucykuZmV0Y2goKVxuXG4gICAgICBhc3BlY3RzLmFmdGVyLmZvckVhY2goKG8pID0+IHtcbiAgICAgICAgZG9jcy5mb3JFYWNoKChkb2MpID0+IHtcbiAgICAgICAgICBvLmFzcGVjdC5jYWxsKHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogZ2V0VHJhbnNmb3JtKGRvYyksXG4gICAgICAgICAgICBwcmV2aW91czogcHJldi5kb2NzICYmIHByZXYuZG9jc1tkb2MuX2lkXSxcbiAgICAgICAgICAgIGFmZmVjdGVkLFxuICAgICAgICAgICAgZXJyLFxuICAgICAgICAgICAgLi4uY3R4XG4gICAgICAgICAgfSwgdXNlcklkLCBkb2MsIGZpZWxkcywgcHJldi5tdXRhdG9yLCBwcmV2Lm9wdGlvbnMpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGlmIChhc3luYykge1xuICAgIGNvbnN0IHdyYXBwZWRDYWxsYmFjayA9IGZ1bmN0aW9uIChlcnIsIGFmZmVjdGVkLCAuLi5hcmdzKSB7XG4gICAgICBhZnRlcihhZmZlY3RlZCwgZXJyKVxuICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpcywgZXJyLCBhZmZlY3RlZCwgLi4uYXJncylcbiAgICB9XG4gICAgcmV0dXJuIF9zdXBlci5jYWxsKHRoaXMsIHNlbGVjdG9yLCBtdXRhdG9yLCBvcHRpb25zLCB3cmFwcGVkQ2FsbGJhY2spXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgYWZmZWN0ZWQgPSBfc3VwZXIuY2FsbCh0aGlzLCBzZWxlY3RvciwgbXV0YXRvciwgb3B0aW9ucywgY2FsbGJhY2spXG4gICAgYWZ0ZXIoYWZmZWN0ZWQpXG4gICAgcmV0dXJuIGFmZmVjdGVkXG4gIH1cbn0pXG4iLCJpbXBvcnQgeyBFSlNPTiB9IGZyb20gJ21ldGVvci9lanNvbidcbmltcG9ydCB7IENvbGxlY3Rpb25Ib29rcyB9IGZyb20gJy4vY29sbGVjdGlvbi1ob29rcydcblxuY29uc3QgaXNFbXB0eSA9IGEgPT4gIUFycmF5LmlzQXJyYXkoYSkgfHwgIWEubGVuZ3RoXG5cbkNvbGxlY3Rpb25Ib29rcy5kZWZpbmVBZHZpY2UoJ3Vwc2VydCcsIGZ1bmN0aW9uICh1c2VySWQsIF9zdXBlciwgaW5zdGFuY2UsIGFzcGVjdEdyb3VwLCBnZXRUcmFuc2Zvcm0sIGFyZ3MsIHN1cHByZXNzQXNwZWN0cykge1xuICBhcmdzWzBdID0gQ29sbGVjdGlvbkhvb2tzLm5vcm1hbGl6ZVNlbGVjdG9yKGluc3RhbmNlLl9nZXRGaW5kU2VsZWN0b3IoYXJncykpXG5cbiAgY29uc3QgY3R4ID0geyBjb250ZXh0OiB0aGlzLCBfc3VwZXIsIGFyZ3MgfVxuICBsZXQgW3NlbGVjdG9yLCBtdXRhdG9yLCBvcHRpb25zLCBjYWxsYmFja10gPSBhcmdzXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNhbGxiYWNrID0gb3B0aW9uc1xuICAgIG9wdGlvbnMgPSB7fVxuICB9XG5cbiAgY29uc3QgYXN5bmMgPSB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbidcbiAgbGV0IGRvY3NcbiAgbGV0IGRvY0lkc1xuICBsZXQgYWJvcnRcbiAgY29uc3QgcHJldiA9IHt9XG5cbiAgaWYgKCFzdXBwcmVzc0FzcGVjdHMpIHtcbiAgICBpZiAoIWlzRW1wdHkoYXNwZWN0R3JvdXAudXBzZXJ0LmJlZm9yZSkgfHwgIWlzRW1wdHkoYXNwZWN0R3JvdXAudXBkYXRlLmFmdGVyKSkge1xuICAgICAgZG9jcyA9IENvbGxlY3Rpb25Ib29rcy5nZXREb2NzLmNhbGwodGhpcywgaW5zdGFuY2UsIHNlbGVjdG9yLCBvcHRpb25zKS5mZXRjaCgpXG4gICAgICBkb2NJZHMgPSBkb2NzLm1hcChkb2MgPT4gZG9jLl9pZClcbiAgICB9XG5cbiAgICAvLyBjb3B5IG9yaWdpbmFscyBmb3IgY29udmVuaWVuY2UgZm9yIHRoZSAnYWZ0ZXInIHBvaW50Y3V0XG4gICAgaWYgKCFpc0VtcHR5KGFzcGVjdEdyb3VwLnVwZGF0ZS5hZnRlcikpIHtcbiAgICAgIGlmIChhc3BlY3RHcm91cC51cGRhdGUuYWZ0ZXIuc29tZShvID0+IG8ub3B0aW9ucy5mZXRjaFByZXZpb3VzICE9PSBmYWxzZSkgJiZcbiAgICAgICAgQ29sbGVjdGlvbkhvb2tzLmV4dGVuZE9wdGlvbnMoaW5zdGFuY2UuaG9va09wdGlvbnMsIHt9LCAnYWZ0ZXInLCAndXBkYXRlJykuZmV0Y2hQcmV2aW91cyAhPT0gZmFsc2UpIHtcbiAgICAgICAgcHJldi5tdXRhdG9yID0gRUpTT04uY2xvbmUobXV0YXRvcilcbiAgICAgICAgcHJldi5vcHRpb25zID0gRUpTT04uY2xvbmUob3B0aW9ucylcblxuICAgICAgICBwcmV2LmRvY3MgPSB7fVxuICAgICAgICBkb2NzLmZvckVhY2goKGRvYykgPT4ge1xuICAgICAgICAgIHByZXYuZG9jc1tkb2MuX2lkXSA9IEVKU09OLmNsb25lKGRvYylcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBiZWZvcmVcbiAgICBhc3BlY3RHcm91cC51cHNlcnQuYmVmb3JlLmZvckVhY2goKG8pID0+IHtcbiAgICAgIGNvbnN0IHIgPSBvLmFzcGVjdC5jYWxsKGN0eCwgdXNlcklkLCBzZWxlY3RvciwgbXV0YXRvciwgb3B0aW9ucylcbiAgICAgIGlmIChyID09PSBmYWxzZSkgYWJvcnQgPSB0cnVlXG4gICAgfSlcblxuICAgIGlmIChhYm9ydCkgcmV0dXJuIHsgbnVtYmVyQWZmZWN0ZWQ6IDAgfVxuICB9XG5cbiAgY29uc3QgYWZ0ZXJVcGRhdGUgPSAoYWZmZWN0ZWQsIGVycikgPT4ge1xuICAgIGlmICghc3VwcHJlc3NBc3BlY3RzICYmICFpc0VtcHR5KGFzcGVjdEdyb3VwLnVwZGF0ZS5hZnRlcikpIHtcbiAgICAgIGNvbnN0IGZpZWxkcyA9IENvbGxlY3Rpb25Ib29rcy5nZXRGaWVsZHMobXV0YXRvcilcbiAgICAgIGNvbnN0IGRvY3MgPSBDb2xsZWN0aW9uSG9va3MuZ2V0RG9jcy5jYWxsKHRoaXMsIGluc3RhbmNlLCB7IF9pZDogeyAkaW46IGRvY0lkcyB9IH0sIG9wdGlvbnMpLmZldGNoKClcblxuICAgICAgYXNwZWN0R3JvdXAudXBkYXRlLmFmdGVyLmZvckVhY2goKG8pID0+IHtcbiAgICAgICAgZG9jcy5mb3JFYWNoKChkb2MpID0+IHtcbiAgICAgICAgICBvLmFzcGVjdC5jYWxsKHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogZ2V0VHJhbnNmb3JtKGRvYyksXG4gICAgICAgICAgICBwcmV2aW91czogcHJldi5kb2NzICYmIHByZXYuZG9jc1tkb2MuX2lkXSxcbiAgICAgICAgICAgIGFmZmVjdGVkLFxuICAgICAgICAgICAgZXJyLFxuICAgICAgICAgICAgLi4uY3R4XG4gICAgICAgICAgfSwgdXNlcklkLCBkb2MsIGZpZWxkcywgcHJldi5tdXRhdG9yLCBwcmV2Lm9wdGlvbnMpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGFmdGVySW5zZXJ0ID0gKF9pZCwgZXJyKSA9PiB7XG4gICAgaWYgKCFzdXBwcmVzc0FzcGVjdHMgJiYgIWlzRW1wdHkoYXNwZWN0R3JvdXAuaW5zZXJ0LmFmdGVyKSkge1xuICAgICAgY29uc3QgZG9jID0gQ29sbGVjdGlvbkhvb2tzLmdldERvY3MuY2FsbCh0aGlzLCBpbnN0YW5jZSwgeyBfaWQgfSwgc2VsZWN0b3IsIHt9KS5mZXRjaCgpWzBdIC8vIDNyZCBhcmd1bWVudCBwYXNzZXMgZW1wdHkgb2JqZWN0IHdoaWNoIGNhdXNlcyBtYWdpYyBsb2dpYyB0byBpbXBseSBsaW1pdDoxXG4gICAgICBjb25zdCBsY3R4ID0geyB0cmFuc2Zvcm06IGdldFRyYW5zZm9ybShkb2MpLCBfaWQsIGVyciwgLi4uY3R4IH1cblxuICAgICAgYXNwZWN0R3JvdXAuaW5zZXJ0LmFmdGVyLmZvckVhY2goKG8pID0+IHtcbiAgICAgICAgby5hc3BlY3QuY2FsbChsY3R4LCB1c2VySWQsIGRvYylcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgaWYgKGFzeW5jKSB7XG4gICAgY29uc3Qgd3JhcHBlZENhbGxiYWNrID0gZnVuY3Rpb24gKGVyciwgcmV0KSB7XG4gICAgICBpZiAoZXJyIHx8IChyZXQgJiYgcmV0Lmluc2VydGVkSWQpKSB7XG4gICAgICAgIC8vIFNlbmQgYW55IGVycm9ycyB0byBhZnRlckluc2VydFxuICAgICAgICBhZnRlckluc2VydChyZXQuaW5zZXJ0ZWRJZCwgZXJyKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWZ0ZXJVcGRhdGUocmV0ICYmIHJldC5udW1iZXJBZmZlY3RlZCwgZXJyKSAvLyBOb3RlIHRoYXQgZXJyIGNhbiBuZXZlciByZWFjaCBoZXJlXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb2xsZWN0aW9uSG9va3MuaG9va2VkT3AoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2suY2FsbCh0aGlzLCBlcnIsIHJldClcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIENvbGxlY3Rpb25Ib29rcy5kaXJlY3RPcCgoKSA9PiBfc3VwZXIuY2FsbCh0aGlzLCBzZWxlY3RvciwgbXV0YXRvciwgb3B0aW9ucywgd3JhcHBlZENhbGxiYWNrKSlcbiAgfSBlbHNlIHtcbiAgICBjb25zdCByZXQgPSBDb2xsZWN0aW9uSG9va3MuZGlyZWN0T3AoKCkgPT4gX3N1cGVyLmNhbGwodGhpcywgc2VsZWN0b3IsIG11dGF0b3IsIG9wdGlvbnMsIGNhbGxiYWNrKSlcblxuICAgIGlmIChyZXQgJiYgcmV0Lmluc2VydGVkSWQpIHtcbiAgICAgIGFmdGVySW5zZXJ0KHJldC5pbnNlcnRlZElkKVxuICAgIH0gZWxzZSB7XG4gICAgICBhZnRlclVwZGF0ZShyZXQgJiYgcmV0Lm51bWJlckFmZmVjdGVkKVxuICAgIH1cblxuICAgIHJldHVybiByZXRcbiAgfVxufSlcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InXG5pbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbydcbmltcG9ydCB7IENvbGxlY3Rpb25Ib29rcyB9IGZyb20gJy4vY29sbGVjdGlvbi1ob29rcydcblxuaWYgKE1ldGVvci51c2Vycykge1xuICAvLyBJZiBNZXRlb3IudXNlcnMgaGFzIGJlZW4gaW5zdGFudGlhdGVkLCBhdHRlbXB0IHRvIHJlLWFzc2lnbiBpdHMgcHJvdG90eXBlOlxuICBDb2xsZWN0aW9uSG9va3MucmVhc3NpZ25Qcm90b3R5cGUoTWV0ZW9yLnVzZXJzKVxuXG4gIC8vIE5leHQsIGdpdmUgaXQgdGhlIGhvb2sgYXNwZWN0czpcbiAgQ29sbGVjdGlvbkhvb2tzLmV4dGVuZENvbGxlY3Rpb25JbnN0YW5jZShNZXRlb3IudXNlcnMsIE1vbmdvLkNvbGxlY3Rpb24pXG59XG4iXX0=
