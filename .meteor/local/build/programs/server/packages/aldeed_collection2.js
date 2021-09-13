(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var EJSON = Package.ejson.EJSON;
var EventEmitter = Package['raix:eventemitter'].EventEmitter;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Collection2;

var require = meteorInstall({"node_modules":{"meteor":{"aldeed:collection2":{"collection2.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/aldeed_collection2/collection2.js                                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
let EventEmitter;
module.link("meteor/raix:eventemitter", {
  EventEmitter(v) {
    EventEmitter = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
let Mongo;
module.link("meteor/mongo", {
  Mongo(v) {
    Mongo = v;
  }

}, 2);
let checkNpmVersions;
module.link("meteor/tmeasday:check-npm-versions", {
  checkNpmVersions(v) {
    checkNpmVersions = v;
  }

}, 3);
let EJSON;
module.link("meteor/ejson", {
  EJSON(v) {
    EJSON = v;
  }

}, 4);
let isEmpty;
module.link("lodash.isempty", {
  default(v) {
    isEmpty = v;
  }

}, 5);
let isEqual;
module.link("lodash.isequal", {
  default(v) {
    isEqual = v;
  }

}, 6);
let isObject;
module.link("lodash.isobject", {
  default(v) {
    isObject = v;
  }

}, 7);
let flattenSelector;
module.link("./lib", {
  flattenSelector(v) {
    flattenSelector = v;
  }

}, 8);
checkNpmVersions({
  'simpl-schema': '>=0.0.0'
}, 'aldeed:collection2');

const SimpleSchema = require('simpl-schema').default; // Exported only for listening to events


const Collection2 = new EventEmitter();
const defaultCleanOptions = {
  filter: true,
  autoConvert: true,
  removeEmptyStrings: true,
  trimStrings: true,
  removeNullsFromArrays: false
};
/**
 * Mongo.Collection.prototype.attachSchema
 * @param {SimpleSchema|Object} ss - SimpleSchema instance or a schema definition object
 *    from which to create a new SimpleSchema instance
 * @param {Object} [options]
 * @param {Boolean} [options.transform=false] Set to `true` if your document must be passed
 *    through the collection's transform to properly validate.
 * @param {Boolean} [options.replace=false] Set to `true` to replace any existing schema instead of combining
 * @return {undefined}
 *
 * Use this method to attach a schema to a collection created by another package,
 * such as Meteor.users. It is most likely unsafe to call this method more than
 * once for a single collection, or to call this for a collection that had a
 * schema object passed to its constructor.
 */

Mongo.Collection.prototype.attachSchema = function c2AttachSchema(ss, options) {
  options = options || {}; // Allow passing just the schema object

  if (!SimpleSchema.isSimpleSchema(ss)) {
    ss = new SimpleSchema(ss);
  }

  function attachTo(obj) {
    // we need an array to hold multiple schemas
    // position 0 is reserved for the "base" schema
    obj._c2 = obj._c2 || {};
    obj._c2._simpleSchemas = obj._c2._simpleSchemas || [null];

    if (typeof options.selector === "object") {
      // Selector Schemas
      // Extend selector schema with base schema
      const baseSchema = obj._c2._simpleSchemas[0];

      if (baseSchema) {
        ss = extendSchema(baseSchema.schema, ss);
      } // Index of existing schema with identical selector


      let schemaIndex; // Loop through existing schemas with selectors,

      for (schemaIndex = obj._c2._simpleSchemas.length - 1; 0 < schemaIndex; schemaIndex--) {
        const schema = obj._c2._simpleSchemas[schemaIndex];
        if (schema && isEqual(schema.selector, options.selector)) break;
      }

      if (schemaIndex <= 0) {
        // We didn't find the schema in our array - push it into the array
        obj._c2._simpleSchemas.push({
          schema: ss,
          selector: options.selector
        });
      } else {
        // We found a schema with an identical selector in our array,
        if (options.replace === true) {
          // Replace existing selector schema with new selector schema
          obj._c2._simpleSchemas[schemaIndex].schema = ss;
        } else {
          // Extend existing selector schema with new selector schema.
          obj._c2._simpleSchemas[schemaIndex].schema = extendSchema(obj._c2._simpleSchemas[schemaIndex].schema, ss);
        }
      }
    } else {
      // Base Schema
      if (options.replace === true) {
        // Replace base schema and delete all other schemas
        obj._c2._simpleSchemas = [{
          schema: ss,
          selector: options.selector
        }];
      } else {
        // Set base schema if not yet set
        if (!obj._c2._simpleSchemas[0]) {
          return obj._c2._simpleSchemas[0] = {
            schema: ss,
            selector: undefined
          };
        } // Extend base schema and therefore extend all schemas


        obj._c2._simpleSchemas.forEach((schema, index) => {
          if (obj._c2._simpleSchemas[index]) {
            obj._c2._simpleSchemas[index].schema = extendSchema(obj._c2._simpleSchemas[index].schema, ss);
          }
        });
      }
    }
  }

  attachTo(this); // Attach the schema to the underlying LocalCollection, too

  if (this._collection instanceof LocalCollection) {
    this._collection._c2 = this._collection._c2 || {};
    attachTo(this._collection);
  }

  defineDeny(this, options);
  keepInsecure(this);
  Collection2.emit('schema.attached', this, ss, options);
};

[Mongo.Collection, LocalCollection].forEach(obj => {
  /**
   * simpleSchema
   * @description function detect the correct schema by given params. If it
   * detect multi-schema presence in the collection, then it made an attempt to find a
   * `selector` in args
   * @param {Object} doc - It could be <update> on update/upsert or document
   * itself on insert/remove
   * @param {Object} [options] - It could be <update> on update/upsert etc
   * @param {Object} [query] - it could be <query> on update/upsert
   * @return {Object} Schema
   */
  obj.prototype.simpleSchema = function (doc, options, query) {
    if (!this._c2) return null;
    if (this._c2._simpleSchema) return this._c2._simpleSchema;
    const schemas = this._c2._simpleSchemas;

    if (schemas && schemas.length > 0) {
      let schema, selector, target; // Position 0 reserved for base schema

      for (var i = 1; i < schemas.length; i++) {
        schema = schemas[i];
        selector = Object.keys(schema.selector)[0]; // We will set this to undefined because in theory you might want to select
        // on a null value.

        target = undefined; // here we are looking for selector in different places
        // $set should have more priority here

        if (doc.$set && typeof doc.$set[selector] !== 'undefined') {
          target = doc.$set[selector];
        } else if (typeof doc[selector] !== 'undefined') {
          target = doc[selector];
        } else if (options && options.selector) {
          target = options.selector[selector];
        } else if (query && query[selector]) {
          // on upsert/update operations
          target = query[selector];
        } // we need to compare given selector with doc property or option to
        // find right schema


        if (target !== undefined && target === schema.selector[selector]) {
          return schema.schema;
        }
      }

      if (schemas[0]) {
        return schemas[0].schema;
      } else {
        throw new Error("No default schema");
      }
    }

    return null;
  };
}); // Wrap DB write operation methods

['insert', 'update'].forEach(methodName => {
  const _super = Mongo.Collection.prototype[methodName];

  Mongo.Collection.prototype[methodName] = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    let options = methodName === "insert" ? args[1] : args[2]; // Support missing options arg

    if (!options || typeof options === "function") {
      options = {};
    }

    if (this._c2 && options.bypassCollection2 !== true) {
      let userId = null;

      try {
        // https://github.com/aldeed/meteor-collection2/issues/175
        userId = Meteor.userId();
      } catch (err) {}

      args = doValidate(this, methodName, args, Meteor.isServer || this._connection === null, // getAutoValues
      userId, Meteor.isServer // isFromTrustedCode
      );

      if (!args) {
        // doValidate already called the callback or threw the error so we're done.
        // But insert should always return an ID to match core behavior.
        return methodName === "insert" ? this._makeNewID() : undefined;
      }
    } else {
      // We still need to adjust args because insert does not take options
      if (methodName === "insert" && typeof args[1] !== 'function') args.splice(1, 1);
    }

    return _super.apply(this, args);
  };
});
/*
 * Private
 */

function doValidate(collection, type, args, getAutoValues, userId, isFromTrustedCode) {
  let doc, callback, error, options, isUpsert, selector, last, hasCallback;

  if (!args.length) {
    throw new Error(type + " requires an argument");
  } // Gather arguments and cache the selector


  if (type === "insert") {
    doc = args[0];
    options = args[1];
    callback = args[2]; // The real insert doesn't take options

    if (typeof options === "function") {
      args = [doc, options];
    } else if (typeof callback === "function") {
      args = [doc, callback];
    } else {
      args = [doc];
    }
  } else if (type === "update") {
    selector = args[0];
    doc = args[1];
    options = args[2];
    callback = args[3];
  } else {
    throw new Error("invalid type argument");
  }

  const validatedObjectWasInitiallyEmpty = isEmpty(doc); // Support missing options arg

  if (!callback && typeof options === "function") {
    callback = options;
    options = {};
  }

  options = options || {};
  last = args.length - 1;
  hasCallback = typeof args[last] === 'function'; // If update was called with upsert:true, flag as an upsert

  isUpsert = type === "update" && options.upsert === true; // we need to pass `doc` and `options` to `simpleSchema` method, that's why
  // schema declaration moved here

  let schema = collection.simpleSchema(doc, options, selector);
  const isLocalCollection = collection._connection === null; // On the server and for local collections, we allow passing `getAutoValues: false` to disable autoValue functions

  if ((Meteor.isServer || isLocalCollection) && options.getAutoValues === false) {
    getAutoValues = false;
  } // Process pick/omit options if they are present


  const picks = Array.isArray(options.pick) ? options.pick : null;
  const omits = Array.isArray(options.omit) ? options.omit : null;

  if (picks && omits) {
    // Pick and omit cannot both be present in the options
    throw new Error('pick and omit options are mutually exclusive');
  } else if (picks) {
    schema = schema.pick(...picks);
  } else if (omits) {
    schema = schema.omit(...omits);
  } // Determine validation context


  let validationContext = options.validationContext;

  if (validationContext) {
    if (typeof validationContext === 'string') {
      validationContext = schema.namedContext(validationContext);
    }
  } else {
    validationContext = schema.namedContext();
  } // Add a default callback function if we're on the client and no callback was given


  if (Meteor.isClient && !callback) {
    // Client can't block, so it can't report errors by exception,
    // only by callback. If they forget the callback, give them a
    // default one that logs the error, so they aren't totally
    // baffled if their writes don't work because their database is
    // down.
    callback = function (err) {
      if (err) {
        Meteor._debug(type + " failed: " + (err.reason || err.stack));
      }
    };
  } // If client validation is fine or is skipped but then something
  // is found to be invalid on the server, we get that error back
  // as a special Meteor.Error that we need to parse.


  if (Meteor.isClient && hasCallback) {
    callback = args[last] = wrapCallbackForParsingServerErrors(validationContext, callback);
  }

  const schemaAllowsId = schema.allowsKey("_id");

  if (type === "insert" && !doc._id && schemaAllowsId) {
    doc._id = collection._makeNewID();
  } // Get the docId for passing in the autoValue/custom context


  let docId;

  if (type === 'insert') {
    docId = doc._id; // might be undefined
  } else if (type === "update" && selector) {
    docId = typeof selector === 'string' || selector instanceof Mongo.ObjectID ? selector : selector._id;
  } // If _id has already been added, remove it temporarily if it's
  // not explicitly defined in the schema.


  let cachedId;

  if (doc._id && !schemaAllowsId) {
    cachedId = doc._id;
    delete doc._id;
  }

  const autoValueContext = {
    isInsert: type === "insert",
    isUpdate: type === "update" && options.upsert !== true,
    isUpsert,
    userId,
    isFromTrustedCode,
    docId,
    isLocalCollection
  };

  const extendAutoValueContext = _objectSpread(_objectSpread(_objectSpread({}, (schema._cleanOptions || {}).extendAutoValueContext || {}), autoValueContext), options.extendAutoValueContext);

  const cleanOptionsForThisOperation = {};
  ["autoConvert", "filter", "removeEmptyStrings", "removeNullsFromArrays", "trimStrings"].forEach(prop => {
    if (typeof options[prop] === "boolean") {
      cleanOptionsForThisOperation[prop] = options[prop];
    }
  }); // Preliminary cleaning on both client and server. On the server and for local
  // collections, automatic values will also be set at this point.

  schema.clean(doc, _objectSpread(_objectSpread(_objectSpread(_objectSpread({
    mutate: true,
    // Clean the doc/modifier in place
    isModifier: type !== "insert"
  }, defaultCleanOptions), schema._cleanOptions || {}), cleanOptionsForThisOperation), {}, {
    extendAutoValueContext,
    // This was extended separately above
    getAutoValues // Force this override

  })); // We clone before validating because in some cases we need to adjust the
  // object a bit before validating it. If we adjusted `doc` itself, our
  // changes would persist into the database.

  let docToValidate = {};

  for (var prop in doc) {
    // We omit prototype properties when cloning because they will not be valid
    // and mongo omits them when saving to the database anyway.
    if (Object.prototype.hasOwnProperty.call(doc, prop)) {
      docToValidate[prop] = doc[prop];
    }
  } // On the server, upserts are possible; SimpleSchema handles upserts pretty
  // well by default, but it will not know about the fields in the selector,
  // which are also stored in the database if an insert is performed. So we
  // will allow these fields to be considered for validation by adding them
  // to the $set in the modifier, while stripping out query selectors as these
  // don't make it into the upserted document and break validation.
  // This is no doubt prone to errors, but there probably isn't any better way
  // right now.


  if (Meteor.isServer && isUpsert && isObject(selector)) {
    const set = docToValidate.$set || {};
    docToValidate.$set = flattenSelector(selector);
    if (!schemaAllowsId) delete docToValidate.$set._id;
    Object.assign(docToValidate.$set, set);
  } // Set automatic values for validation on the client.
  // On the server, we already updated doc with auto values, but on the client,
  // we will add them to docToValidate for validation purposes only.
  // This is because we want all actual values generated on the server.


  if (Meteor.isClient && !isLocalCollection) {
    schema.clean(docToValidate, {
      autoConvert: false,
      extendAutoValueContext,
      filter: false,
      getAutoValues: true,
      isModifier: type !== "insert",
      mutate: true,
      // Clean the doc/modifier in place
      removeEmptyStrings: false,
      removeNullsFromArrays: false,
      trimStrings: false
    });
  } // XXX Maybe move this into SimpleSchema


  if (!validatedObjectWasInitiallyEmpty && isEmpty(docToValidate)) {
    throw new Error('After filtering out keys not in the schema, your ' + (type === 'update' ? 'modifier' : 'object') + ' is now empty');
  } // Validate doc


  let isValid;

  if (options.validate === false) {
    isValid = true;
  } else {
    isValid = validationContext.validate(docToValidate, {
      modifier: type === "update" || type === "upsert",
      upsert: isUpsert,
      extendedCustomContext: _objectSpread({
        isInsert: type === "insert",
        isUpdate: type === "update" && options.upsert !== true,
        isUpsert,
        userId,
        isFromTrustedCode,
        docId,
        isLocalCollection
      }, options.extendedCustomContext || {})
    });
  }

  if (isValid) {
    // Add the ID back
    if (cachedId) {
      doc._id = cachedId;
    } // Update the args to reflect the cleaned doc
    // XXX not sure this is necessary since we mutate


    if (type === "insert") {
      args[0] = doc;
    } else {
      args[1] = doc;
    } // If callback, set invalidKey when we get a mongo unique error


    if (Meteor.isServer && hasCallback) {
      args[last] = wrapCallbackForParsingMongoValidationErrors(validationContext, args[last]);
    }

    return args;
  } else {
    var _Meteor$settings, _Meteor$settings$pack, _Meteor$settings$pack2;

    error = getErrorObject(validationContext, (_Meteor$settings = Meteor.settings) !== null && _Meteor$settings !== void 0 && (_Meteor$settings$pack = _Meteor$settings.packages) !== null && _Meteor$settings$pack !== void 0 && (_Meteor$settings$pack2 = _Meteor$settings$pack.collection2) !== null && _Meteor$settings$pack2 !== void 0 && _Meteor$settings$pack2.disableCollectionNamesInValidation ? '' : "in ".concat(collection._name, " ").concat(type));

    if (callback) {
      // insert/update/upsert pass `false` when there's an error, so we do that
      callback(error, false);
    } else {
      throw error;
    }
  }
}

function getErrorObject(context) {
  let appendToMessage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  let message;
  const invalidKeys = typeof context.validationErrors === 'function' ? context.validationErrors() : context.invalidKeys();

  if (invalidKeys.length) {
    const firstErrorKey = invalidKeys[0].name;
    const firstErrorMessage = context.keyErrorMessage(firstErrorKey); // If the error is in a nested key, add the full key to the error message
    // to be more helpful.

    if (firstErrorKey.indexOf('.') === -1) {
      message = firstErrorMessage;
    } else {
      message = "".concat(firstErrorMessage, " (").concat(firstErrorKey, ")");
    }
  } else {
    message = "Failed validation";
  }

  message = "".concat(message, " ").concat(appendToMessage).trim();
  const error = new Error(message);
  error.invalidKeys = invalidKeys;
  error.validationContext = context; // If on the server, we add a sanitized error, too, in case we're
  // called from a method.

  if (Meteor.isServer) {
    error.sanitizedError = new Meteor.Error(400, message, EJSON.stringify(error.invalidKeys));
  }

  return error;
}

function addUniqueError(context, errorMessage) {
  const name = errorMessage.split('c2_')[1].split(' ')[0];
  const val = errorMessage.split('dup key:')[1].split('"')[1];
  const addValidationErrorsPropName = typeof context.addValidationErrors === 'function' ? 'addValidationErrors' : 'addInvalidKeys';
  context[addValidationErrorsPropName]([{
    name: name,
    type: 'notUnique',
    value: val
  }]);
}

function wrapCallbackForParsingMongoValidationErrors(validationContext, cb) {
  return function wrappedCallbackForParsingMongoValidationErrors() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    const error = args[0];

    if (error && (error.name === "MongoError" && error.code === 11001 || error.message.indexOf('MongoError: E11000') !== -1) && error.message.indexOf('c2_') !== -1) {
      addUniqueError(validationContext, error.message);
      args[0] = getErrorObject(validationContext);
    }

    return cb.apply(this, args);
  };
}

function wrapCallbackForParsingServerErrors(validationContext, cb) {
  const addValidationErrorsPropName = typeof validationContext.addValidationErrors === 'function' ? 'addValidationErrors' : 'addInvalidKeys';
  return function wrappedCallbackForParsingServerErrors() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    const error = args[0]; // Handle our own validation errors

    if (error instanceof Meteor.Error && error.error === 400 && error.reason === "INVALID" && typeof error.details === "string") {
      const invalidKeysFromServer = EJSON.parse(error.details);
      validationContext[addValidationErrorsPropName](invalidKeysFromServer);
      args[0] = getErrorObject(validationContext);
    } // Handle Mongo unique index errors, which are forwarded to the client as 409 errors
    else if (error instanceof Meteor.Error && error.error === 409 && error.reason && error.reason.indexOf('E11000') !== -1 && error.reason.indexOf('c2_') !== -1) {
        addUniqueError(validationContext, error.reason);
        args[0] = getErrorObject(validationContext);
      }

    return cb.apply(this, args);
  };
}

let alreadyInsecure = {};

function keepInsecure(c) {
  // If insecure package is in use, we need to add allow rules that return
  // true. Otherwise, it would seemingly turn off insecure mode.
  if (Package && Package.insecure && !alreadyInsecure[c._name]) {
    c.allow({
      insert: function () {
        return true;
      },
      update: function () {
        return true;
      },
      remove: function () {
        return true;
      },
      fetch: [],
      transform: null
    });
    alreadyInsecure[c._name] = true;
  } // If insecure package is NOT in use, then adding the two deny functions
  // does not have any effect on the main app's security paradigm. The
  // user will still be required to add at least one allow function of her
  // own for each operation for this collection. And the user may still add
  // additional deny functions, but does not have to.

}

let alreadyDefined = {};

function defineDeny(c, options) {
  if (!alreadyDefined[c._name]) {
    const isLocalCollection = c._connection === null; // First define deny functions to extend doc with the results of clean
    // and auto-values. This must be done with "transform: null" or we would be
    // extending a clone of doc and therefore have no effect.

    c.deny({
      insert: function (userId, doc) {
        // Referenced doc is cleaned in place
        c.simpleSchema(doc).clean(doc, {
          mutate: true,
          isModifier: false,
          // We don't do these here because they are done on the client if desired
          filter: false,
          autoConvert: false,
          removeEmptyStrings: false,
          trimStrings: false,
          extendAutoValueContext: {
            isInsert: true,
            isUpdate: false,
            isUpsert: false,
            userId: userId,
            isFromTrustedCode: false,
            docId: doc._id,
            isLocalCollection: isLocalCollection
          }
        });
        return false;
      },
      update: function (userId, doc, fields, modifier) {
        // Referenced modifier is cleaned in place
        c.simpleSchema(modifier).clean(modifier, {
          mutate: true,
          isModifier: true,
          // We don't do these here because they are done on the client if desired
          filter: false,
          autoConvert: false,
          removeEmptyStrings: false,
          trimStrings: false,
          extendAutoValueContext: {
            isInsert: false,
            isUpdate: true,
            isUpsert: false,
            userId: userId,
            isFromTrustedCode: false,
            docId: doc && doc._id,
            isLocalCollection: isLocalCollection
          }
        });
        return false;
      },
      fetch: ['_id'],
      transform: null
    }); // Second define deny functions to validate again on the server
    // for client-initiated inserts and updates. These should be
    // called after the clean/auto-value functions since we're adding
    // them after. These must *not* have "transform: null" if options.transform is true because
    // we need to pass the doc through any transforms to be sure
    // that custom types are properly recognized for type validation.

    c.deny(_objectSpread({
      insert: function (userId, doc) {
        // We pass the false options because we will have done them on client if desired
        doValidate(c, "insert", [doc, {
          trimStrings: false,
          removeEmptyStrings: false,
          filter: false,
          autoConvert: false
        }, function (error) {
          if (error) {
            throw new Meteor.Error(400, 'INVALID', EJSON.stringify(error.invalidKeys));
          }
        }], false, // getAutoValues
        userId, false // isFromTrustedCode
        );
        return false;
      },
      update: function (userId, doc, fields, modifier) {
        // NOTE: This will never be an upsert because client-side upserts
        // are not allowed once you define allow/deny functions.
        // We pass the false options because we will have done them on client if desired
        doValidate(c, "update", [{
          _id: doc && doc._id
        }, modifier, {
          trimStrings: false,
          removeEmptyStrings: false,
          filter: false,
          autoConvert: false
        }, function (error) {
          if (error) {
            throw new Meteor.Error(400, 'INVALID', EJSON.stringify(error.invalidKeys));
          }
        }], false, // getAutoValues
        userId, false // isFromTrustedCode
        );
        return false;
      },
      fetch: ['_id']
    }, options.transform === true ? {} : {
      transform: null
    })); // note that we've already done this collection so that we don't do it again
    // if attachSchema is called again

    alreadyDefined[c._name] = true;
  }
}

function extendSchema(s1, s2) {
  if (s2.version >= 2) {
    const ss = new SimpleSchema(s1);
    ss.extend(s2);
    return ss;
  } else {
    return new SimpleSchema([s1, s2]);
  }
}

module.exportDefault(Collection2);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"lib.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/aldeed_collection2/lib.js                                                                                //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  flattenSelector: () => flattenSelector
});

function flattenSelector(selector) {
  // If selector uses $and format, convert to plain object selector
  if (Array.isArray(selector.$and)) {
    selector.$and.forEach(sel => {
      Object.assign(selector, flattenSelector(sel));
    });
    delete selector.$and;
  }

  const obj = {};
  Object.entries(selector).forEach(_ref => {
    let [key, value] = _ref;

    // Ignoring logical selectors (https://docs.mongodb.com/manual/reference/operator/query/#logical)
    if (!key.startsWith("$")) {
      if (typeof value === 'object' && value !== null) {
        if (value.$eq !== undefined) {
          obj[key] = value.$eq;
        } else if (Array.isArray(value.$in) && value.$in.length === 1) {
          obj[key] = value.$in[0];
        } else if (Object.keys(value).every(v => !(typeof v === "string" && v.startsWith("$")))) {
          obj[key] = value;
        }
      } else {
        obj[key] = value;
      }
    }
  });
  return obj;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"lodash.isempty":{"package.json":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// node_modules/meteor/aldeed_collection2/node_modules/lodash.isempty/package.json                                   //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.exports = {
  "name": "lodash.isempty",
  "version": "4.4.0"
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// node_modules/meteor/aldeed_collection2/node_modules/lodash.isempty/index.js                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.useNode();
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.isequal":{"package.json":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// node_modules/meteor/aldeed_collection2/node_modules/lodash.isequal/package.json                                   //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.exports = {
  "name": "lodash.isequal",
  "version": "4.5.0"
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// node_modules/meteor/aldeed_collection2/node_modules/lodash.isequal/index.js                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.useNode();
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.isobject":{"package.json":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// node_modules/meteor/aldeed_collection2/node_modules/lodash.isobject/package.json                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.exports = {
  "name": "lodash.isobject",
  "version": "3.0.2"
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// node_modules/meteor/aldeed_collection2/node_modules/lodash.isobject/index.js                                      //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.useNode();
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/aldeed:collection2/collection2.js");

/* Exports */
Package._define("aldeed:collection2", exports, {
  Collection2: Collection2
});

})();

//# sourceURL=meteor://💻app/packages/aldeed_collection2.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWxkZWVkOmNvbGxlY3Rpb24yL2NvbGxlY3Rpb24yLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hbGRlZWQ6Y29sbGVjdGlvbjIvbGliLmpzIl0sIm5hbWVzIjpbIl9vYmplY3RTcHJlYWQiLCJtb2R1bGUiLCJsaW5rIiwiZGVmYXVsdCIsInYiLCJFdmVudEVtaXR0ZXIiLCJNZXRlb3IiLCJNb25nbyIsImNoZWNrTnBtVmVyc2lvbnMiLCJFSlNPTiIsImlzRW1wdHkiLCJpc0VxdWFsIiwiaXNPYmplY3QiLCJmbGF0dGVuU2VsZWN0b3IiLCJTaW1wbGVTY2hlbWEiLCJyZXF1aXJlIiwiQ29sbGVjdGlvbjIiLCJkZWZhdWx0Q2xlYW5PcHRpb25zIiwiZmlsdGVyIiwiYXV0b0NvbnZlcnQiLCJyZW1vdmVFbXB0eVN0cmluZ3MiLCJ0cmltU3RyaW5ncyIsInJlbW92ZU51bGxzRnJvbUFycmF5cyIsIkNvbGxlY3Rpb24iLCJwcm90b3R5cGUiLCJhdHRhY2hTY2hlbWEiLCJjMkF0dGFjaFNjaGVtYSIsInNzIiwib3B0aW9ucyIsImlzU2ltcGxlU2NoZW1hIiwiYXR0YWNoVG8iLCJvYmoiLCJfYzIiLCJfc2ltcGxlU2NoZW1hcyIsInNlbGVjdG9yIiwiYmFzZVNjaGVtYSIsImV4dGVuZFNjaGVtYSIsInNjaGVtYSIsInNjaGVtYUluZGV4IiwibGVuZ3RoIiwicHVzaCIsInJlcGxhY2UiLCJ1bmRlZmluZWQiLCJmb3JFYWNoIiwiaW5kZXgiLCJfY29sbGVjdGlvbiIsIkxvY2FsQ29sbGVjdGlvbiIsImRlZmluZURlbnkiLCJrZWVwSW5zZWN1cmUiLCJlbWl0Iiwic2ltcGxlU2NoZW1hIiwiZG9jIiwicXVlcnkiLCJfc2ltcGxlU2NoZW1hIiwic2NoZW1hcyIsInRhcmdldCIsImkiLCJPYmplY3QiLCJrZXlzIiwiJHNldCIsIkVycm9yIiwibWV0aG9kTmFtZSIsIl9zdXBlciIsImFyZ3MiLCJieXBhc3NDb2xsZWN0aW9uMiIsInVzZXJJZCIsImVyciIsImRvVmFsaWRhdGUiLCJpc1NlcnZlciIsIl9jb25uZWN0aW9uIiwiX21ha2VOZXdJRCIsInNwbGljZSIsImFwcGx5IiwiY29sbGVjdGlvbiIsInR5cGUiLCJnZXRBdXRvVmFsdWVzIiwiaXNGcm9tVHJ1c3RlZENvZGUiLCJjYWxsYmFjayIsImVycm9yIiwiaXNVcHNlcnQiLCJsYXN0IiwiaGFzQ2FsbGJhY2siLCJ2YWxpZGF0ZWRPYmplY3RXYXNJbml0aWFsbHlFbXB0eSIsInVwc2VydCIsImlzTG9jYWxDb2xsZWN0aW9uIiwicGlja3MiLCJBcnJheSIsImlzQXJyYXkiLCJwaWNrIiwib21pdHMiLCJvbWl0IiwidmFsaWRhdGlvbkNvbnRleHQiLCJuYW1lZENvbnRleHQiLCJpc0NsaWVudCIsIl9kZWJ1ZyIsInJlYXNvbiIsInN0YWNrIiwid3JhcENhbGxiYWNrRm9yUGFyc2luZ1NlcnZlckVycm9ycyIsInNjaGVtYUFsbG93c0lkIiwiYWxsb3dzS2V5IiwiX2lkIiwiZG9jSWQiLCJPYmplY3RJRCIsImNhY2hlZElkIiwiYXV0b1ZhbHVlQ29udGV4dCIsImlzSW5zZXJ0IiwiaXNVcGRhdGUiLCJleHRlbmRBdXRvVmFsdWVDb250ZXh0IiwiX2NsZWFuT3B0aW9ucyIsImNsZWFuT3B0aW9uc0ZvclRoaXNPcGVyYXRpb24iLCJwcm9wIiwiY2xlYW4iLCJtdXRhdGUiLCJpc01vZGlmaWVyIiwiZG9jVG9WYWxpZGF0ZSIsImhhc093blByb3BlcnR5IiwiY2FsbCIsInNldCIsImFzc2lnbiIsImlzVmFsaWQiLCJ2YWxpZGF0ZSIsIm1vZGlmaWVyIiwiZXh0ZW5kZWRDdXN0b21Db250ZXh0Iiwid3JhcENhbGxiYWNrRm9yUGFyc2luZ01vbmdvVmFsaWRhdGlvbkVycm9ycyIsImdldEVycm9yT2JqZWN0Iiwic2V0dGluZ3MiLCJwYWNrYWdlcyIsImNvbGxlY3Rpb24yIiwiZGlzYWJsZUNvbGxlY3Rpb25OYW1lc0luVmFsaWRhdGlvbiIsIl9uYW1lIiwiY29udGV4dCIsImFwcGVuZFRvTWVzc2FnZSIsIm1lc3NhZ2UiLCJpbnZhbGlkS2V5cyIsInZhbGlkYXRpb25FcnJvcnMiLCJmaXJzdEVycm9yS2V5IiwibmFtZSIsImZpcnN0RXJyb3JNZXNzYWdlIiwia2V5RXJyb3JNZXNzYWdlIiwiaW5kZXhPZiIsInRyaW0iLCJzYW5pdGl6ZWRFcnJvciIsInN0cmluZ2lmeSIsImFkZFVuaXF1ZUVycm9yIiwiZXJyb3JNZXNzYWdlIiwic3BsaXQiLCJ2YWwiLCJhZGRWYWxpZGF0aW9uRXJyb3JzUHJvcE5hbWUiLCJhZGRWYWxpZGF0aW9uRXJyb3JzIiwidmFsdWUiLCJjYiIsIndyYXBwZWRDYWxsYmFja0ZvclBhcnNpbmdNb25nb1ZhbGlkYXRpb25FcnJvcnMiLCJjb2RlIiwid3JhcHBlZENhbGxiYWNrRm9yUGFyc2luZ1NlcnZlckVycm9ycyIsImRldGFpbHMiLCJpbnZhbGlkS2V5c0Zyb21TZXJ2ZXIiLCJwYXJzZSIsImFscmVhZHlJbnNlY3VyZSIsImMiLCJQYWNrYWdlIiwiaW5zZWN1cmUiLCJhbGxvdyIsImluc2VydCIsInVwZGF0ZSIsInJlbW92ZSIsImZldGNoIiwidHJhbnNmb3JtIiwiYWxyZWFkeURlZmluZWQiLCJkZW55IiwiZmllbGRzIiwiczEiLCJzMiIsInZlcnNpb24iLCJleHRlbmQiLCJleHBvcnREZWZhdWx0IiwiZXhwb3J0IiwiJGFuZCIsInNlbCIsImVudHJpZXMiLCJrZXkiLCJzdGFydHNXaXRoIiwiJGVxIiwiJGluIiwiZXZlcnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQUlBLGFBQUo7O0FBQWtCQyxNQUFNLENBQUNDLElBQVAsQ0FBWSxzQ0FBWixFQUFtRDtBQUFDQyxTQUFPLENBQUNDLENBQUQsRUFBRztBQUFDSixpQkFBYSxHQUFDSSxDQUFkO0FBQWdCOztBQUE1QixDQUFuRCxFQUFpRixDQUFqRjtBQUFsQixJQUFJQyxZQUFKO0FBQWlCSixNQUFNLENBQUNDLElBQVAsQ0FBWSwwQkFBWixFQUF1QztB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QUFHLENBQUNvSixHQUFELENBQUgsR0FBVzlCLEtBQUssQ0FBQ2dDLEdBQWpCO0FBQ0QsU0FGRCxNQUVPLElBQUkvRixLQUFLLENBQUNDLE9BQU4sQ0FBYzhELEtBQUssQ0FBQ2lDLEdBQXBCLEtBQTRCakMsS0FBSyxDQUFDaUMsR0FBTixDQUFVL0ksTUFBVixLQUFxQixDQUFyRCxFQUF3RDtBQUM3RFIsYUFBRyxDQUFDb0osR0FBRCxDQUFILEdBQVc5QixLQUFLLENBQUNpQyxHQUFOLENBQVUsQ0FBVixDQUFYO0FBQ0QsU0FGTSxNQUVBLElBQUk3SCxNQUFNLENBQUNDLElBQVAsQ0FBWTJGLEtBQVosRUFBbUJrQyxLQUFuQixDQUF5Qm5MLENBQUMsSUFBSSxFQUFFLE9BQU9BLENBQVAsS0FBYSxRQUFiLElBQXlCQSxDQUFDLENBQUNnTCxVQUFGLENBQWEsR0FBYixDQUEzQixDQUE5QixDQUFKLEVBQWtGO0FBQ3ZGckosYUFBRyxDQUFDb0osR0FBRCxDQUFILEdBQVc5QixLQUFYO0FBQ0Q7QUFDRixPQVJELE1BUU87QUFDTHRILFdBQUcsQ0FBQ29KLEdBQUQsQ0FBSCxHQUFXOUIsS0FBWDtBQUNEO0FBQ0Y7QUFDRixHQWZEO0FBaUJBLFNBQU90SCxHQUFQO0FBQ0QsQyIsImZpbGUiOiIvcGFja2FnZXMvYWxkZWVkX2NvbGxlY3Rpb24yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnbWV0ZW9yL3JhaXg6ZXZlbnRlbWl0dGVyJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgTW9uZ28gfSBmcm9tICdtZXRlb3IvbW9uZ28nO1xuaW1wb3J0IHsgY2hlY2tOcG1WZXJzaW9ucyB9IGZyb20gJ21ldGVvci90bWVhc2RheTpjaGVjay1ucG0tdmVyc2lvbnMnO1xuaW1wb3J0IHsgRUpTT04gfSBmcm9tICdtZXRlb3IvZWpzb24nO1xuaW1wb3J0IGlzRW1wdHkgZnJvbSAnbG9kYXNoLmlzZW1wdHknO1xuaW1wb3J0IGlzRXF1YWwgZnJvbSAnbG9kYXNoLmlzZXF1YWwnO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJ2xvZGFzaC5pc29iamVjdCc7XG5pbXBvcnQgeyBmbGF0dGVuU2VsZWN0b3IgfSBmcm9tICcuL2xpYic7XG5cbmNoZWNrTnBtVmVyc2lvbnMoeyAnc2ltcGwtc2NoZW1hJzogJz49MC4wLjAnIH0sICdhbGRlZWQ6Y29sbGVjdGlvbjInKTtcblxuY29uc3QgU2ltcGxlU2NoZW1hID0gcmVxdWlyZSgnc2ltcGwtc2NoZW1hJykuZGVmYXVsdDtcblxuLy8gRXhwb3J0ZWQgb25seSBmb3IgbGlzdGVuaW5nIHRvIGV2ZW50c1xuY29uc3QgQ29sbGVjdGlvbjIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbmNvbnN0IGRlZmF1bHRDbGVhbk9wdGlvbnMgPSB7XG4gIGZpbHRlcjogdHJ1ZSxcbiAgYXV0b0NvbnZlcnQ6IHRydWUsXG4gIHJlbW92ZUVtcHR5U3RyaW5nczogdHJ1ZSxcbiAgdHJpbVN0cmluZ3M6IHRydWUsXG4gIHJlbW92ZU51bGxzRnJvbUFycmF5czogZmFsc2UsXG59O1xuXG4vKipcbiAqIE1vbmdvLkNvbGxlY3Rpb24ucHJvdG90eXBlLmF0dGFjaFNjaGVtYVxuICogQHBhcmFtIHtTaW1wbGVTY2hlbWF8T2JqZWN0fSBzcyAtIFNpbXBsZVNjaGVtYSBpbnN0YW5jZSBvciBhIHNjaGVtYSBkZWZpbml0aW9uIG9iamVjdFxuICogICAgZnJvbSB3aGljaCB0byBjcmVhdGUgYSBuZXcgU2ltcGxlU2NoZW1hIGluc3RhbmNlXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLnRyYW5zZm9ybT1mYWxzZV0gU2V0IHRvIGB0cnVlYCBpZiB5b3VyIGRvY3VtZW50IG11c3QgYmUgcGFzc2VkXG4gKiAgICB0aHJvdWdoIHRoZSBjb2xsZWN0aW9uJ3MgdHJhbnNmb3JtIHRvIHByb3Blcmx5IHZhbGlkYXRlLlxuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5yZXBsYWNlPWZhbHNlXSBTZXQgdG8gYHRydWVgIHRvIHJlcGxhY2UgYW55IGV4aXN0aW5nIHNjaGVtYSBpbnN0ZWFkIG9mIGNvbWJpbmluZ1xuICogQHJldHVybiB7dW5kZWZpbmVkfVxuICpcbiAqIFVzZSB0aGlzIG1ldGhvZCB0byBhdHRhY2ggYSBzY2hlbWEgdG8gYSBjb2xsZWN0aW9uIGNyZWF0ZWQgYnkgYW5vdGhlciBwYWNrYWdlLFxuICogc3VjaCBhcyBNZXRlb3IudXNlcnMuIEl0IGlzIG1vc3QgbGlrZWx5IHVuc2FmZSB0byBjYWxsIHRoaXMgbWV0aG9kIG1vcmUgdGhhblxuICogb25jZSBmb3IgYSBzaW5nbGUgY29sbGVjdGlvbiwgb3IgdG8gY2FsbCB0aGlzIGZvciBhIGNvbGxlY3Rpb24gdGhhdCBoYWQgYVxuICogc2NoZW1hIG9iamVjdCBwYXNzZWQgdG8gaXRzIGNvbnN0cnVjdG9yLlxuICovXG5Nb25nby5Db2xsZWN0aW9uLnByb3RvdHlwZS5hdHRhY2hTY2hlbWEgPSBmdW5jdGlvbiBjMkF0dGFjaFNjaGVtYShzcywgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAvLyBBbGxvdyBwYXNzaW5nIGp1c3QgdGhlIHNjaGVtYSBvYmplY3RcbiAgaWYgKCFTaW1wbGVTY2hlbWEuaXNTaW1wbGVTY2hlbWEoc3MpKSB7XG4gICAgc3MgPSBuZXcgU2ltcGxlU2NoZW1hKHNzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGF0dGFjaFRvKG9iaikge1xuICAgIC8vIHdlIG5lZWQgYW4gYXJyYXkgdG8gaG9sZCBtdWx0aXBsZSBzY2hlbWFzXG4gICAgLy8gcG9zaXRpb24gMCBpcyByZXNlcnZlZCBmb3IgdGhlIFwiYmFzZVwiIHNjaGVtYVxuICAgIG9iai5fYzIgPSBvYmouX2MyIHx8IHt9O1xuICAgIG9iai5fYzIuX3NpbXBsZVNjaGVtYXMgPSBvYmouX2MyLl9zaW1wbGVTY2hlbWFzIHx8IFsgbnVsbCBdO1xuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLnNlbGVjdG9yID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAvLyBTZWxlY3RvciBTY2hlbWFzXG5cbiAgICAgIC8vIEV4dGVuZCBzZWxlY3RvciBzY2hlbWEgd2l0aCBiYXNlIHNjaGVtYVxuICAgICAgY29uc3QgYmFzZVNjaGVtYSA9IG9iai5fYzIuX3NpbXBsZVNjaGVtYXNbMF07XG4gICAgICBpZiAoYmFzZVNjaGVtYSkge1xuICAgICAgICBzcyA9IGV4dGVuZFNjaGVtYShiYXNlU2NoZW1hLnNjaGVtYSwgc3MpO1xuICAgICAgfVxuXG4gICAgICAvLyBJbmRleCBvZiBleGlzdGluZyBzY2hlbWEgd2l0aCBpZGVudGljYWwgc2VsZWN0b3JcbiAgICAgIGxldCBzY2hlbWFJbmRleDtcblxuICAgICAgLy8gTG9vcCB0aHJvdWdoIGV4aXN0aW5nIHNjaGVtYXMgd2l0aCBzZWxlY3RvcnMsXG4gICAgICBmb3IgKHNjaGVtYUluZGV4ID0gb2JqLl9jMi5fc2ltcGxlU2NoZW1hcy5sZW5ndGggLSAxOyAwIDwgc2NoZW1hSW5kZXg7IHNjaGVtYUluZGV4LS0pIHtcbiAgICAgICAgY29uc3Qgc2NoZW1hID0gb2JqLl9jMi5fc2ltcGxlU2NoZW1hc1tzY2hlbWFJbmRleF07XG4gICAgICAgIGlmIChzY2hlbWEgJiYgaXNFcXVhbChzY2hlbWEuc2VsZWN0b3IsIG9wdGlvbnMuc2VsZWN0b3IpKSBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKHNjaGVtYUluZGV4IDw9IDApIHtcbiAgICAgICAgLy8gV2UgZGlkbid0IGZpbmQgdGhlIHNjaGVtYSBpbiBvdXIgYXJyYXkgLSBwdXNoIGl0IGludG8gdGhlIGFycmF5XG4gICAgICAgIG9iai5fYzIuX3NpbXBsZVNjaGVtYXMucHVzaCh7XG4gICAgICAgICAgc2NoZW1hOiBzcyxcbiAgICAgICAgICBzZWxlY3Rvcjogb3B0aW9ucy5zZWxlY3RvcixcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBXZSBmb3VuZCBhIHNjaGVtYSB3aXRoIGFuIGlkZW50aWNhbCBzZWxlY3RvciBpbiBvdXIgYXJyYXksXG4gICAgICAgIGlmIChvcHRpb25zLnJlcGxhY2UgPT09IHRydWUpIHtcbiAgICAgICAgICAvLyBSZXBsYWNlIGV4aXN0aW5nIHNlbGVjdG9yIHNjaGVtYSB3aXRoIG5ldyBzZWxlY3RvciBzY2hlbWFcbiAgICAgICAgICBvYmouX2MyLl9zaW1wbGVTY2hlbWFzW3NjaGVtYUluZGV4XS5zY2hlbWEgPSBzcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBFeHRlbmQgZXhpc3Rpbmcgc2VsZWN0b3Igc2NoZW1hIHdpdGggbmV3IHNlbGVjdG9yIHNjaGVtYS5cbiAgICAgICAgICBvYmouX2MyLl9zaW1wbGVTY2hlbWFzW3NjaGVtYUluZGV4XS5zY2hlbWEgPSBleHRlbmRTY2hlbWEob2JqLl9jMi5fc2ltcGxlU2NoZW1hc1tzY2hlbWFJbmRleF0uc2NoZW1hLCBzcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQmFzZSBTY2hlbWFcbiAgICAgIGlmIChvcHRpb25zLnJlcGxhY2UgPT09IHRydWUpIHtcbiAgICAgICAgLy8gUmVwbGFjZSBiYXNlIHNjaGVtYSBhbmQgZGVsZXRlIGFsbCBvdGhlciBzY2hlbWFzXG4gICAgICAgIG9iai5fYzIuX3NpbXBsZVNjaGVtYXMgPSBbe1xuICAgICAgICAgIHNjaGVtYTogc3MsXG4gICAgICAgICAgc2VsZWN0b3I6IG9wdGlvbnMuc2VsZWN0b3IsXG4gICAgICAgIH1dO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2V0IGJhc2Ugc2NoZW1hIGlmIG5vdCB5ZXQgc2V0XG4gICAgICAgIGlmICghb2JqLl9jMi5fc2ltcGxlU2NoZW1hc1swXSkge1xuICAgICAgICAgIHJldHVybiBvYmouX2MyLl9zaW1wbGVTY2hlbWFzWzBdID0geyBzY2hlbWE6IHNzLCBzZWxlY3RvcjogdW5kZWZpbmVkIH07XG4gICAgICAgIH1cbiAgICAgICAgLy8gRXh0ZW5kIGJhc2Ugc2NoZW1hIGFuZCB0aGVyZWZvcmUgZXh0ZW5kIGFsbCBzY2hlbWFzXG4gICAgICAgIG9iai5fYzIuX3NpbXBsZVNjaGVtYXMuZm9yRWFjaCgoc2NoZW1hLCBpbmRleCkgPT4ge1xuICAgICAgICAgIGlmIChvYmouX2MyLl9zaW1wbGVTY2hlbWFzW2luZGV4XSkge1xuICAgICAgICAgICAgb2JqLl9jMi5fc2ltcGxlU2NoZW1hc1tpbmRleF0uc2NoZW1hID0gZXh0ZW5kU2NoZW1hKG9iai5fYzIuX3NpbXBsZVNjaGVtYXNbaW5kZXhdLnNjaGVtYSwgc3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXR0YWNoVG8odGhpcyk7XG4gIC8vIEF0dGFjaCB0aGUgc2NoZW1hIHRvIHRoZSB1bmRlcmx5aW5nIExvY2FsQ29sbGVjdGlvbiwgdG9vXG4gIGlmICh0aGlzLl9jb2xsZWN0aW9uIGluc3RhbmNlb2YgTG9jYWxDb2xsZWN0aW9uKSB7XG4gICAgdGhpcy5fY29sbGVjdGlvbi5fYzIgPSB0aGlzLl9jb2xsZWN0aW9uLl9jMiB8fCB7fTtcbiAgICBhdHRhY2hUbyh0aGlzLl9jb2xsZWN0aW9uKTtcbiAgfVxuXG4gIGRlZmluZURlbnkodGhpcywgb3B0aW9ucyk7XG4gIGtlZXBJbnNlY3VyZSh0aGlzKTtcblxuICBDb2xsZWN0aW9uMi5lbWl0KCdzY2hlbWEuYXR0YWNoZWQnLCB0aGlzLCBzcywgb3B0aW9ucyk7XG59O1xuXG5bTW9uZ28uQ29sbGVjdGlvbiwgTG9jYWxDb2xsZWN0aW9uXS5mb3JFYWNoKChvYmopID0+IHtcbiAgLyoqXG4gICAqIHNpbXBsZVNjaGVtYVxuICAgKiBAZGVzY3JpcHRpb24gZnVuY3Rpb24gZGV0ZWN0IHRoZSBjb3JyZWN0IHNjaGVtYSBieSBnaXZlbiBwYXJhbXMuIElmIGl0XG4gICAqIGRldGVjdCBtdWx0aS1zY2hlbWEgcHJlc2VuY2UgaW4gdGhlIGNvbGxlY3Rpb24sIHRoZW4gaXQgbWFkZSBhbiBhdHRlbXB0IHRvIGZpbmQgYVxuICAgKiBgc2VsZWN0b3JgIGluIGFyZ3NcbiAgICogQHBhcmFtIHtPYmplY3R9IGRvYyAtIEl0IGNvdWxkIGJlIDx1cGRhdGU+IG9uIHVwZGF0ZS91cHNlcnQgb3IgZG9jdW1lbnRcbiAgICogaXRzZWxmIG9uIGluc2VydC9yZW1vdmVcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIEl0IGNvdWxkIGJlIDx1cGRhdGU+IG9uIHVwZGF0ZS91cHNlcnQgZXRjXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcXVlcnldIC0gaXQgY291bGQgYmUgPHF1ZXJ5PiBvbiB1cGRhdGUvdXBzZXJ0XG4gICAqIEByZXR1cm4ge09iamVjdH0gU2NoZW1hXG4gICAqL1xuICBvYmoucHJvdG90eXBlLnNpbXBsZVNjaGVtYSA9IGZ1bmN0aW9uIChkb2MsIG9wdGlvbnMsIHF1ZXJ5KSB7XG4gICAgaWYgKCF0aGlzLl9jMikgcmV0dXJuIG51bGw7XG4gICAgaWYgKHRoaXMuX2MyLl9zaW1wbGVTY2hlbWEpIHJldHVybiB0aGlzLl9jMi5fc2ltcGxlU2NoZW1hO1xuXG4gICAgY29uc3Qgc2NoZW1hcyA9IHRoaXMuX2MyLl9zaW1wbGVTY2hlbWFzO1xuICAgIGlmIChzY2hlbWFzICYmIHNjaGVtYXMubGVuZ3RoID4gMCkge1xuXG4gICAgICBsZXQgc2NoZW1hLCBzZWxlY3RvciwgdGFyZ2V0O1xuICAgICAgLy8gUG9zaXRpb24gMCByZXNlcnZlZCBmb3IgYmFzZSBzY2hlbWFcbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgc2NoZW1hcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBzY2hlbWEgPSBzY2hlbWFzW2ldO1xuICAgICAgICBzZWxlY3RvciA9IE9iamVjdC5rZXlzKHNjaGVtYS5zZWxlY3RvcilbMF07XG5cbiAgICAgICAgLy8gV2Ugd2lsbCBzZXQgdGhpcyB0byB1bmRlZmluZWQgYmVjYXVzZSBpbiB0aGVvcnkgeW91IG1pZ2h0IHdhbnQgdG8gc2VsZWN0XG4gICAgICAgIC8vIG9uIGEgbnVsbCB2YWx1ZS5cbiAgICAgICAgdGFyZ2V0ID0gdW5kZWZpbmVkO1xuICAgICAgICAvLyBoZXJlIHdlIGFyZSBsb29raW5nIGZvciBzZWxlY3RvciBpbiBkaWZmZXJlbnQgcGxhY2VzXG4gICAgICAgIC8vICRzZXQgc2hvdWxkIGhhdmUgbW9yZSBwcmlvcml0eSBoZXJlXG4gICAgICAgIGlmIChkb2MuJHNldCAmJiB0eXBlb2YgZG9jLiRzZXRbc2VsZWN0b3JdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHRhcmdldCA9IGRvYy4kc2V0W3NlbGVjdG9yXTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jW3NlbGVjdG9yXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB0YXJnZXQgPSBkb2Nbc2VsZWN0b3JdO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5zZWxlY3Rvcikge1xuICAgICAgICAgIHRhcmdldCA9IG9wdGlvbnMuc2VsZWN0b3Jbc2VsZWN0b3JdO1xuICAgICAgICB9IGVsc2UgaWYgKHF1ZXJ5ICYmIHF1ZXJ5W3NlbGVjdG9yXSkgeyAvLyBvbiB1cHNlcnQvdXBkYXRlIG9wZXJhdGlvbnNcbiAgICAgICAgICB0YXJnZXQgPSBxdWVyeVtzZWxlY3Rvcl07XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3ZSBuZWVkIHRvIGNvbXBhcmUgZ2l2ZW4gc2VsZWN0b3Igd2l0aCBkb2MgcHJvcGVydHkgb3Igb3B0aW9uIHRvXG4gICAgICAgIC8vIGZpbmQgcmlnaHQgc2NoZW1hXG4gICAgICAgIGlmICh0YXJnZXQgIT09IHVuZGVmaW5lZCAmJiB0YXJnZXQgPT09IHNjaGVtYS5zZWxlY3RvcltzZWxlY3Rvcl0pIHtcbiAgICAgICAgICByZXR1cm4gc2NoZW1hLnNjaGVtYTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHNjaGVtYXNbMF0pIHtcbiAgICAgICAgcmV0dXJuIHNjaGVtYXNbMF0uc2NoZW1hO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gZGVmYXVsdCBzY2hlbWFcIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG59KTtcblxuLy8gV3JhcCBEQiB3cml0ZSBvcGVyYXRpb24gbWV0aG9kc1xuWydpbnNlcnQnLCAndXBkYXRlJ10uZm9yRWFjaCgobWV0aG9kTmFtZSkgPT4ge1xuICBjb25zdCBfc3VwZXIgPSBNb25nby5Db2xsZWN0aW9uLnByb3RvdHlwZVttZXRob2ROYW1lXTtcbiAgTW9uZ28uQ29sbGVjdGlvbi5wcm90b3R5cGVbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgbGV0IG9wdGlvbnMgPSAobWV0aG9kTmFtZSA9PT0gXCJpbnNlcnRcIikgPyBhcmdzWzFdIDogYXJnc1syXTtcblxuICAgIC8vIFN1cHBvcnQgbWlzc2luZyBvcHRpb25zIGFyZ1xuICAgIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2MyICYmIG9wdGlvbnMuYnlwYXNzQ29sbGVjdGlvbjIgIT09IHRydWUpIHtcbiAgICAgIGxldCB1c2VySWQgPSBudWxsO1xuICAgICAgdHJ5IHsgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FsZGVlZC9tZXRlb3ItY29sbGVjdGlvbjIvaXNzdWVzLzE3NVxuICAgICAgICB1c2VySWQgPSBNZXRlb3IudXNlcklkKCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHt9XG5cbiAgICAgIGFyZ3MgPSBkb1ZhbGlkYXRlKFxuICAgICAgICB0aGlzLFxuICAgICAgICBtZXRob2ROYW1lLFxuICAgICAgICBhcmdzLFxuICAgICAgICBNZXRlb3IuaXNTZXJ2ZXIgfHwgdGhpcy5fY29ubmVjdGlvbiA9PT0gbnVsbCwgLy8gZ2V0QXV0b1ZhbHVlc1xuICAgICAgICB1c2VySWQsXG4gICAgICAgIE1ldGVvci5pc1NlcnZlciAvLyBpc0Zyb21UcnVzdGVkQ29kZVxuICAgICAgKTtcbiAgICAgIGlmICghYXJncykge1xuICAgICAgICAvLyBkb1ZhbGlkYXRlIGFscmVhZHkgY2FsbGVkIHRoZSBjYWxsYmFjayBvciB0aHJldyB0aGUgZXJyb3Igc28gd2UncmUgZG9uZS5cbiAgICAgICAgLy8gQnV0IGluc2VydCBzaG91bGQgYWx3YXlzIHJldHVybiBhbiBJRCB0byBtYXRjaCBjb3JlIGJlaGF2aW9yLlxuICAgICAgICByZXR1cm4gbWV0aG9kTmFtZSA9PT0gXCJpbnNlcnRcIiA/IHRoaXMuX21ha2VOZXdJRCgpIDogdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBXZSBzdGlsbCBuZWVkIHRvIGFkanVzdCBhcmdzIGJlY2F1c2UgaW5zZXJ0IGRvZXMgbm90IHRha2Ugb3B0aW9uc1xuICAgICAgaWYgKG1ldGhvZE5hbWUgPT09IFwiaW5zZXJ0XCIgJiYgdHlwZW9mIGFyZ3NbMV0gIT09ICdmdW5jdGlvbicpIGFyZ3Muc3BsaWNlKDEsIDEpO1xuICAgIH1cblxuICAgIHJldHVybiBfc3VwZXIuYXBwbHkodGhpcywgYXJncyk7XG4gIH07XG59KTtcblxuLypcbiAqIFByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBkb1ZhbGlkYXRlKGNvbGxlY3Rpb24sIHR5cGUsIGFyZ3MsIGdldEF1dG9WYWx1ZXMsIHVzZXJJZCwgaXNGcm9tVHJ1c3RlZENvZGUpIHtcbiAgbGV0IGRvYywgY2FsbGJhY2ssIGVycm9yLCBvcHRpb25zLCBpc1Vwc2VydCwgc2VsZWN0b3IsIGxhc3QsIGhhc0NhbGxiYWNrO1xuXG4gIGlmICghYXJncy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IodHlwZSArIFwiIHJlcXVpcmVzIGFuIGFyZ3VtZW50XCIpO1xuICB9XG5cbiAgLy8gR2F0aGVyIGFyZ3VtZW50cyBhbmQgY2FjaGUgdGhlIHNlbGVjdG9yXG4gIGlmICh0eXBlID09PSBcImluc2VydFwiKSB7XG4gICAgZG9jID0gYXJnc1swXTtcbiAgICBvcHRpb25zID0gYXJnc1sxXTtcbiAgICBjYWxsYmFjayA9IGFyZ3NbMl07XG5cbiAgICAvLyBUaGUgcmVhbCBpbnNlcnQgZG9lc24ndCB0YWtlIG9wdGlvbnNcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgYXJncyA9IFtkb2MsIG9wdGlvbnNdO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGFyZ3MgPSBbZG9jLCBjYWxsYmFja107XG4gICAgfSBlbHNlIHtcbiAgICAgIGFyZ3MgPSBbZG9jXTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJ1cGRhdGVcIikge1xuICAgIHNlbGVjdG9yID0gYXJnc1swXTtcbiAgICBkb2MgPSBhcmdzWzFdO1xuICAgIG9wdGlvbnMgPSBhcmdzWzJdO1xuICAgIGNhbGxiYWNrID0gYXJnc1szXTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIHR5cGUgYXJndW1lbnRcIik7XG4gIH1cblxuICBjb25zdCB2YWxpZGF0ZWRPYmplY3RXYXNJbml0aWFsbHlFbXB0eSA9IGlzRW1wdHkoZG9jKTtcblxuICAvLyBTdXBwb3J0IG1pc3Npbmcgb3B0aW9ucyBhcmdcbiAgaWYgKCFjYWxsYmFjayAmJiB0eXBlb2Ygb3B0aW9ucyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgY2FsbGJhY2sgPSBvcHRpb25zO1xuICAgIG9wdGlvbnMgPSB7fTtcbiAgfVxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICBsYXN0ID0gYXJncy5sZW5ndGggLSAxO1xuXG4gIGhhc0NhbGxiYWNrID0gKHR5cGVvZiBhcmdzW2xhc3RdID09PSAnZnVuY3Rpb24nKTtcblxuICAvLyBJZiB1cGRhdGUgd2FzIGNhbGxlZCB3aXRoIHVwc2VydDp0cnVlLCBmbGFnIGFzIGFuIHVwc2VydFxuICBpc1Vwc2VydCA9ICh0eXBlID09PSBcInVwZGF0ZVwiICYmIG9wdGlvbnMudXBzZXJ0ID09PSB0cnVlKTtcblxuICAvLyB3ZSBuZWVkIHRvIHBhc3MgYGRvY2AgYW5kIGBvcHRpb25zYCB0byBgc2ltcGxlU2NoZW1hYCBtZXRob2QsIHRoYXQncyB3aHlcbiAgLy8gc2NoZW1hIGRlY2xhcmF0aW9uIG1vdmVkIGhlcmVcbiAgbGV0IHNjaGVtYSA9IGNvbGxlY3Rpb24uc2ltcGxlU2NoZW1hKGRvYywgb3B0aW9ucywgc2VsZWN0b3IpO1xuICBjb25zdCBpc0xvY2FsQ29sbGVjdGlvbiA9IChjb2xsZWN0aW9uLl9jb25uZWN0aW9uID09PSBudWxsKTtcblxuICAvLyBPbiB0aGUgc2VydmVyIGFuZCBmb3IgbG9jYWwgY29sbGVjdGlvbnMsIHdlIGFsbG93IHBhc3NpbmcgYGdldEF1dG9WYWx1ZXM6IGZhbHNlYCB0byBkaXNhYmxlIGF1dG9WYWx1ZSBmdW5jdGlvbnNcbiAgaWYgKChNZXRlb3IuaXNTZXJ2ZXIgfHwgaXNMb2NhbENvbGxlY3Rpb24pICYmIG9wdGlvbnMuZ2V0QXV0b1ZhbHVlcyA9PT0gZmFsc2UpIHtcbiAgICBnZXRBdXRvVmFsdWVzID0gZmFsc2U7XG4gIH1cblxuICAvLyBQcm9jZXNzIHBpY2svb21pdCBvcHRpb25zIGlmIHRoZXkgYXJlIHByZXNlbnRcbiAgY29uc3QgcGlja3MgPSBBcnJheS5pc0FycmF5KG9wdGlvbnMucGljaykgPyBvcHRpb25zLnBpY2sgOiBudWxsO1xuICBjb25zdCBvbWl0cyA9IEFycmF5LmlzQXJyYXkob3B0aW9ucy5vbWl0KSA/IG9wdGlvbnMub21pdCA6IG51bGw7XG5cbiAgaWYgKHBpY2tzICYmIG9taXRzKSB7XG4gICAgLy8gUGljayBhbmQgb21pdCBjYW5ub3QgYm90aCBiZSBwcmVzZW50IGluIHRoZSBvcHRpb25zXG4gICAgdGhyb3cgbmV3IEVycm9yKCdwaWNrIGFuZCBvbWl0IG9wdGlvbnMgYXJlIG11dHVhbGx5IGV4Y2x1c2l2ZScpO1xuICB9IGVsc2UgaWYgKHBpY2tzKSB7XG4gICAgc2NoZW1hID0gc2NoZW1hLnBpY2soLi4ucGlja3MpO1xuICB9IGVsc2UgaWYgKG9taXRzKSB7XG4gICAgc2NoZW1hID0gc2NoZW1hLm9taXQoLi4ub21pdHMpO1xuICB9XG5cbiAgLy8gRGV0ZXJtaW5lIHZhbGlkYXRpb24gY29udGV4dFxuICBsZXQgdmFsaWRhdGlvbkNvbnRleHQgPSBvcHRpb25zLnZhbGlkYXRpb25Db250ZXh0O1xuICBpZiAodmFsaWRhdGlvbkNvbnRleHQpIHtcbiAgICBpZiAodHlwZW9mIHZhbGlkYXRpb25Db250ZXh0ID09PSAnc3RyaW5nJykge1xuICAgICAgdmFsaWRhdGlvbkNvbnRleHQgPSBzY2hlbWEubmFtZWRDb250ZXh0KHZhbGlkYXRpb25Db250ZXh0KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFsaWRhdGlvbkNvbnRleHQgPSBzY2hlbWEubmFtZWRDb250ZXh0KCk7XG4gIH1cblxuICAvLyBBZGQgYSBkZWZhdWx0IGNhbGxiYWNrIGZ1bmN0aW9uIGlmIHdlJ3JlIG9uIHRoZSBjbGllbnQgYW5kIG5vIGNhbGxiYWNrIHdhcyBnaXZlblxuICBpZiAoTWV0ZW9yLmlzQ2xpZW50ICYmICFjYWxsYmFjaykge1xuICAgIC8vIENsaWVudCBjYW4ndCBibG9jaywgc28gaXQgY2FuJ3QgcmVwb3J0IGVycm9ycyBieSBleGNlcHRpb24sXG4gICAgLy8gb25seSBieSBjYWxsYmFjay4gSWYgdGhleSBmb3JnZXQgdGhlIGNhbGxiYWNrLCBnaXZlIHRoZW0gYVxuICAgIC8vIGRlZmF1bHQgb25lIHRoYXQgbG9ncyB0aGUgZXJyb3IsIHNvIHRoZXkgYXJlbid0IHRvdGFsbHlcbiAgICAvLyBiYWZmbGVkIGlmIHRoZWlyIHdyaXRlcyBkb24ndCB3b3JrIGJlY2F1c2UgdGhlaXIgZGF0YWJhc2UgaXNcbiAgICAvLyBkb3duLlxuICAgIGNhbGxiYWNrID0gZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIE1ldGVvci5fZGVidWcodHlwZSArIFwiIGZhaWxlZDogXCIgKyAoZXJyLnJlYXNvbiB8fCBlcnIuc3RhY2spKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gSWYgY2xpZW50IHZhbGlkYXRpb24gaXMgZmluZSBvciBpcyBza2lwcGVkIGJ1dCB0aGVuIHNvbWV0aGluZ1xuICAvLyBpcyBmb3VuZCB0byBiZSBpbnZhbGlkIG9uIHRoZSBzZXJ2ZXIsIHdlIGdldCB0aGF0IGVycm9yIGJhY2tcbiAgLy8gYXMgYSBzcGVjaWFsIE1ldGVvci5FcnJvciB0aGF0IHdlIG5lZWQgdG8gcGFyc2UuXG4gIGlmIChNZXRlb3IuaXNDbGllbnQgJiYgaGFzQ2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IGFyZ3NbbGFzdF0gPSB3cmFwQ2FsbGJhY2tGb3JQYXJzaW5nU2VydmVyRXJyb3JzKHZhbGlkYXRpb25Db250ZXh0LCBjYWxsYmFjayk7XG4gIH1cblxuICBjb25zdCBzY2hlbWFBbGxvd3NJZCA9IHNjaGVtYS5hbGxvd3NLZXkoXCJfaWRcIik7XG4gIGlmICh0eXBlID09PSBcImluc2VydFwiICYmICFkb2MuX2lkICYmIHNjaGVtYUFsbG93c0lkKSB7XG4gICAgZG9jLl9pZCA9IGNvbGxlY3Rpb24uX21ha2VOZXdJRCgpO1xuICB9XG5cbiAgLy8gR2V0IHRoZSBkb2NJZCBmb3IgcGFzc2luZyBpbiB0aGUgYXV0b1ZhbHVlL2N1c3RvbSBjb250ZXh0XG4gIGxldCBkb2NJZDtcbiAgaWYgKHR5cGUgPT09ICdpbnNlcnQnKSB7XG4gICAgZG9jSWQgPSBkb2MuX2lkOyAvLyBtaWdodCBiZSB1bmRlZmluZWRcbiAgfSBlbHNlIGlmICh0eXBlID09PSBcInVwZGF0ZVwiICYmIHNlbGVjdG9yKSB7XG4gICAgZG9jSWQgPSB0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnIHx8IHNlbGVjdG9yIGluc3RhbmNlb2YgTW9uZ28uT2JqZWN0SUQgPyBzZWxlY3RvciA6IHNlbGVjdG9yLl9pZDtcbiAgfVxuXG4gIC8vIElmIF9pZCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkLCByZW1vdmUgaXQgdGVtcG9yYXJpbHkgaWYgaXQnc1xuICAvLyBub3QgZXhwbGljaXRseSBkZWZpbmVkIGluIHRoZSBzY2hlbWEuXG4gIGxldCBjYWNoZWRJZDtcbiAgaWYgKGRvYy5faWQgJiYgIXNjaGVtYUFsbG93c0lkKSB7XG4gICAgY2FjaGVkSWQgPSBkb2MuX2lkO1xuICAgIGRlbGV0ZSBkb2MuX2lkO1xuICB9XG5cbiAgY29uc3QgYXV0b1ZhbHVlQ29udGV4dCA9IHtcbiAgICBpc0luc2VydDogKHR5cGUgPT09IFwiaW5zZXJ0XCIpLFxuICAgIGlzVXBkYXRlOiAodHlwZSA9PT0gXCJ1cGRhdGVcIiAmJiBvcHRpb25zLnVwc2VydCAhPT0gdHJ1ZSksXG4gICAgaXNVcHNlcnQsXG4gICAgdXNlcklkLFxuICAgIGlzRnJvbVRydXN0ZWRDb2RlLFxuICAgIGRvY0lkLFxuICAgIGlzTG9jYWxDb2xsZWN0aW9uXG4gIH07XG5cbiAgY29uc3QgZXh0ZW5kQXV0b1ZhbHVlQ29udGV4dCA9IHtcbiAgICAuLi4oKHNjaGVtYS5fY2xlYW5PcHRpb25zIHx8IHt9KS5leHRlbmRBdXRvVmFsdWVDb250ZXh0IHx8IHt9KSxcbiAgICAuLi5hdXRvVmFsdWVDb250ZXh0LFxuICAgIC4uLm9wdGlvbnMuZXh0ZW5kQXV0b1ZhbHVlQ29udGV4dCxcbiAgfTtcblxuICBjb25zdCBjbGVhbk9wdGlvbnNGb3JUaGlzT3BlcmF0aW9uID0ge307XG4gIFtcImF1dG9Db252ZXJ0XCIsIFwiZmlsdGVyXCIsIFwicmVtb3ZlRW1wdHlTdHJpbmdzXCIsIFwicmVtb3ZlTnVsbHNGcm9tQXJyYXlzXCIsIFwidHJpbVN0cmluZ3NcIl0uZm9yRWFjaChwcm9wID0+IHtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnNbcHJvcF0gPT09IFwiYm9vbGVhblwiKSB7XG4gICAgICBjbGVhbk9wdGlvbnNGb3JUaGlzT3BlcmF0aW9uW3Byb3BdID0gb3B0aW9uc1twcm9wXTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIFByZWxpbWluYXJ5IGNsZWFuaW5nIG9uIGJvdGggY2xpZW50IGFuZCBzZXJ2ZXIuIE9uIHRoZSBzZXJ2ZXIgYW5kIGZvciBsb2NhbFxuICAvLyBjb2xsZWN0aW9ucywgYXV0b21hdGljIHZhbHVlcyB3aWxsIGFsc28gYmUgc2V0IGF0IHRoaXMgcG9pbnQuXG4gIHNjaGVtYS5jbGVhbihkb2MsIHtcbiAgICBtdXRhdGU6IHRydWUsIC8vIENsZWFuIHRoZSBkb2MvbW9kaWZpZXIgaW4gcGxhY2VcbiAgICBpc01vZGlmaWVyOiAodHlwZSAhPT0gXCJpbnNlcnRcIiksXG4gICAgLy8gU3RhcnQgd2l0aCBzb21lIENvbGxlY3Rpb24yIGRlZmF1bHRzLCB3aGljaCB3aWxsIHVzdWFsbHkgYmUgb3ZlcndyaXR0ZW5cbiAgICAuLi5kZWZhdWx0Q2xlYW5PcHRpb25zLFxuICAgIC8vIFRoZSBleHRlbmQgd2l0aCB0aGUgc2NoZW1hLWxldmVsIGRlZmF1bHRzIChmcm9tIFNpbXBsZVNjaGVtYSBjb25zdHJ1Y3RvciBvcHRpb25zKVxuICAgIC4uLihzY2hlbWEuX2NsZWFuT3B0aW9ucyB8fCB7fSksXG4gICAgLy8gRmluYWxseSwgb3B0aW9ucyBmb3IgdGhpcyBzcGVjaWZpYyBvcGVyYXRpb24gc2hvdWxkIHRha2UgcHJlY2VkZW5jZVxuICAgIC4uLmNsZWFuT3B0aW9uc0ZvclRoaXNPcGVyYXRpb24sXG4gICAgZXh0ZW5kQXV0b1ZhbHVlQ29udGV4dCwgLy8gVGhpcyB3YXMgZXh0ZW5kZWQgc2VwYXJhdGVseSBhYm92ZVxuICAgIGdldEF1dG9WYWx1ZXMsIC8vIEZvcmNlIHRoaXMgb3ZlcnJpZGVcbiAgfSk7XG5cbiAgLy8gV2UgY2xvbmUgYmVmb3JlIHZhbGlkYXRpbmcgYmVjYXVzZSBpbiBzb21lIGNhc2VzIHdlIG5lZWQgdG8gYWRqdXN0IHRoZVxuICAvLyBvYmplY3QgYSBiaXQgYmVmb3JlIHZhbGlkYXRpbmcgaXQuIElmIHdlIGFkanVzdGVkIGBkb2NgIGl0c2VsZiwgb3VyXG4gIC8vIGNoYW5nZXMgd291bGQgcGVyc2lzdCBpbnRvIHRoZSBkYXRhYmFzZS5cbiAgbGV0IGRvY1RvVmFsaWRhdGUgPSB7fTtcbiAgZm9yICh2YXIgcHJvcCBpbiBkb2MpIHtcbiAgICAvLyBXZSBvbWl0IHByb3RvdHlwZSBwcm9wZXJ0aWVzIHdoZW4gY2xvbmluZyBiZWNhdXNlIHRoZXkgd2lsbCBub3QgYmUgdmFsaWRcbiAgICAvLyBhbmQgbW9uZ28gb21pdHMgdGhlbSB3aGVuIHNhdmluZyB0byB0aGUgZGF0YWJhc2UgYW55d2F5LlxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZG9jLCBwcm9wKSkge1xuICAgICAgZG9jVG9WYWxpZGF0ZVtwcm9wXSA9IGRvY1twcm9wXTtcbiAgICB9XG4gIH1cblxuICAvLyBPbiB0aGUgc2VydmVyLCB1cHNlcnRzIGFyZSBwb3NzaWJsZTsgU2ltcGxlU2NoZW1hIGhhbmRsZXMgdXBzZXJ0cyBwcmV0dHlcbiAgLy8gd2VsbCBieSBkZWZhdWx0LCBidXQgaXQgd2lsbCBub3Qga25vdyBhYm91dCB0aGUgZmllbGRzIGluIHRoZSBzZWxlY3RvcixcbiAgLy8gd2hpY2ggYXJlIGFsc28gc3RvcmVkIGluIHRoZSBkYXRhYmFzZSBpZiBhbiBpbnNlcnQgaXMgcGVyZm9ybWVkLiBTbyB3ZVxuICAvLyB3aWxsIGFsbG93IHRoZXNlIGZpZWxkcyB0byBiZSBjb25zaWRlcmVkIGZvciB2YWxpZGF0aW9uIGJ5IGFkZGluZyB0aGVtXG4gIC8vIHRvIHRoZSAkc2V0IGluIHRoZSBtb2RpZmllciwgd2hpbGUgc3RyaXBwaW5nIG91dCBxdWVyeSBzZWxlY3RvcnMgYXMgdGhlc2VcbiAgLy8gZG9uJ3QgbWFrZSBpdCBpbnRvIHRoZSB1cHNlcnRlZCBkb2N1bWVudCBhbmQgYnJlYWsgdmFsaWRhdGlvbi5cbiAgLy8gVGhpcyBpcyBubyBkb3VidCBwcm9uZSB0byBlcnJvcnMsIGJ1dCB0aGVyZSBwcm9iYWJseSBpc24ndCBhbnkgYmV0dGVyIHdheVxuICAvLyByaWdodCBub3cuXG4gIGlmIChNZXRlb3IuaXNTZXJ2ZXIgJiYgaXNVcHNlcnQgJiYgaXNPYmplY3Qoc2VsZWN0b3IpKSB7XG4gICAgY29uc3Qgc2V0ID0gZG9jVG9WYWxpZGF0ZS4kc2V0IHx8IHt9O1xuICAgIGRvY1RvVmFsaWRhdGUuJHNldCA9IGZsYXR0ZW5TZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgICBpZiAoIXNjaGVtYUFsbG93c0lkKSBkZWxldGUgZG9jVG9WYWxpZGF0ZS4kc2V0Ll9pZDtcbiAgICBPYmplY3QuYXNzaWduKGRvY1RvVmFsaWRhdGUuJHNldCwgc2V0KTtcbiAgfVxuICAvLyBTZXQgYXV0b21hdGljIHZhbHVlcyBmb3IgdmFsaWRhdGlvbiBvbiB0aGUgY2xpZW50LlxuICAvLyBPbiB0aGUgc2VydmVyLCB3ZSBhbHJlYWR5IHVwZGF0ZWQgZG9jIHdpdGggYXV0byB2YWx1ZXMsIGJ1dCBvbiB0aGUgY2xpZW50LFxuICAvLyB3ZSB3aWxsIGFkZCB0aGVtIHRvIGRvY1RvVmFsaWRhdGUgZm9yIHZhbGlkYXRpb24gcHVycG9zZXMgb25seS5cbiAgLy8gVGhpcyBpcyBiZWNhdXNlIHdlIHdhbnQgYWxsIGFjdHVhbCB2YWx1ZXMgZ2VuZXJhdGVkIG9uIHRoZSBzZXJ2ZXIuXG4gIGlmIChNZXRlb3IuaXNDbGllbnQgJiYgIWlzTG9jYWxDb2xsZWN0aW9uKSB7XG4gICAgc2NoZW1hLmNsZWFuKGRvY1RvVmFsaWRhdGUsIHtcbiAgICAgIGF1dG9Db252ZXJ0OiBmYWxzZSxcbiAgICAgIGV4dGVuZEF1dG9WYWx1ZUNvbnRleHQsXG4gICAgICBmaWx0ZXI6IGZhbHNlLFxuICAgICAgZ2V0QXV0b1ZhbHVlczogdHJ1ZSxcbiAgICAgIGlzTW9kaWZpZXI6ICh0eXBlICE9PSBcImluc2VydFwiKSxcbiAgICAgIG11dGF0ZTogdHJ1ZSwgLy8gQ2xlYW4gdGhlIGRvYy9tb2RpZmllciBpbiBwbGFjZVxuICAgICAgcmVtb3ZlRW1wdHlTdHJpbmdzOiBmYWxzZSxcbiAgICAgIHJlbW92ZU51bGxzRnJvbUFycmF5czogZmFsc2UsXG4gICAgICB0cmltU3RyaW5nczogZmFsc2UsXG4gICAgfSk7XG4gIH1cblxuICAvLyBYWFggTWF5YmUgbW92ZSB0aGlzIGludG8gU2ltcGxlU2NoZW1hXG4gIGlmICghdmFsaWRhdGVkT2JqZWN0V2FzSW5pdGlhbGx5RW1wdHkgJiYgaXNFbXB0eShkb2NUb1ZhbGlkYXRlKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignQWZ0ZXIgZmlsdGVyaW5nIG91dCBrZXlzIG5vdCBpbiB0aGUgc2NoZW1hLCB5b3VyICcgK1xuICAgICAgKHR5cGUgPT09ICd1cGRhdGUnID8gJ21vZGlmaWVyJyA6ICdvYmplY3QnKSArXG4gICAgICAnIGlzIG5vdyBlbXB0eScpO1xuICB9XG5cbiAgLy8gVmFsaWRhdGUgZG9jXG4gIGxldCBpc1ZhbGlkO1xuICBpZiAob3B0aW9ucy52YWxpZGF0ZSA9PT0gZmFsc2UpIHtcbiAgICBpc1ZhbGlkID0gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICBpc1ZhbGlkID0gdmFsaWRhdGlvbkNvbnRleHQudmFsaWRhdGUoZG9jVG9WYWxpZGF0ZSwge1xuICAgICAgbW9kaWZpZXI6ICh0eXBlID09PSBcInVwZGF0ZVwiIHx8IHR5cGUgPT09IFwidXBzZXJ0XCIpLFxuICAgICAgdXBzZXJ0OiBpc1Vwc2VydCxcbiAgICAgIGV4dGVuZGVkQ3VzdG9tQ29udGV4dDoge1xuICAgICAgICBpc0luc2VydDogKHR5cGUgPT09IFwiaW5zZXJ0XCIpLFxuICAgICAgICBpc1VwZGF0ZTogKHR5cGUgPT09IFwidXBkYXRlXCIgJiYgb3B0aW9ucy51cHNlcnQgIT09IHRydWUpLFxuICAgICAgICBpc1Vwc2VydCxcbiAgICAgICAgdXNlcklkLFxuICAgICAgICBpc0Zyb21UcnVzdGVkQ29kZSxcbiAgICAgICAgZG9jSWQsXG4gICAgICAgIGlzTG9jYWxDb2xsZWN0aW9uLFxuICAgICAgICAuLi4ob3B0aW9ucy5leHRlbmRlZEN1c3RvbUNvbnRleHQgfHwge30pLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChpc1ZhbGlkKSB7XG4gICAgLy8gQWRkIHRoZSBJRCBiYWNrXG4gICAgaWYgKGNhY2hlZElkKSB7XG4gICAgICBkb2MuX2lkID0gY2FjaGVkSWQ7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHRoZSBhcmdzIHRvIHJlZmxlY3QgdGhlIGNsZWFuZWQgZG9jXG4gICAgLy8gWFhYIG5vdCBzdXJlIHRoaXMgaXMgbmVjZXNzYXJ5IHNpbmNlIHdlIG11dGF0ZVxuICAgIGlmICh0eXBlID09PSBcImluc2VydFwiKSB7XG4gICAgICBhcmdzWzBdID0gZG9jO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcmdzWzFdID0gZG9jO1xuICAgIH1cblxuICAgIC8vIElmIGNhbGxiYWNrLCBzZXQgaW52YWxpZEtleSB3aGVuIHdlIGdldCBhIG1vbmdvIHVuaXF1ZSBlcnJvclxuICAgIGlmIChNZXRlb3IuaXNTZXJ2ZXIgJiYgaGFzQ2FsbGJhY2spIHtcbiAgICAgIGFyZ3NbbGFzdF0gPSB3cmFwQ2FsbGJhY2tGb3JQYXJzaW5nTW9uZ29WYWxpZGF0aW9uRXJyb3JzKHZhbGlkYXRpb25Db250ZXh0LCBhcmdzW2xhc3RdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJncztcbiAgfSBlbHNlIHtcbiAgICBlcnJvciA9IGdldEVycm9yT2JqZWN0KHZhbGlkYXRpb25Db250ZXh0LCBNZXRlb3Iuc2V0dGluZ3M/LnBhY2thZ2VzPy5jb2xsZWN0aW9uMj8uZGlzYWJsZUNvbGxlY3Rpb25OYW1lc0luVmFsaWRhdGlvbiA/ICcnIDogYGluICR7Y29sbGVjdGlvbi5fbmFtZX0gJHt0eXBlfWApO1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgLy8gaW5zZXJ0L3VwZGF0ZS91cHNlcnQgcGFzcyBgZmFsc2VgIHdoZW4gdGhlcmUncyBhbiBlcnJvciwgc28gd2UgZG8gdGhhdFxuICAgICAgY2FsbGJhY2soZXJyb3IsIGZhbHNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldEVycm9yT2JqZWN0KGNvbnRleHQsIGFwcGVuZFRvTWVzc2FnZSA9ICcnKSB7XG4gIGxldCBtZXNzYWdlO1xuICBjb25zdCBpbnZhbGlkS2V5cyA9ICh0eXBlb2YgY29udGV4dC52YWxpZGF0aW9uRXJyb3JzID09PSAnZnVuY3Rpb24nKSA/IGNvbnRleHQudmFsaWRhdGlvbkVycm9ycygpIDogY29udGV4dC5pbnZhbGlkS2V5cygpO1xuICBpZiAoaW52YWxpZEtleXMubGVuZ3RoKSB7XG4gICAgY29uc3QgZmlyc3RFcnJvcktleSA9IGludmFsaWRLZXlzWzBdLm5hbWU7XG4gICAgY29uc3QgZmlyc3RFcnJvck1lc3NhZ2UgPSBjb250ZXh0LmtleUVycm9yTWVzc2FnZShmaXJzdEVycm9yS2V5KTtcblxuICAgIC8vIElmIHRoZSBlcnJvciBpcyBpbiBhIG5lc3RlZCBrZXksIGFkZCB0aGUgZnVsbCBrZXkgdG8gdGhlIGVycm9yIG1lc3NhZ2VcbiAgICAvLyB0byBiZSBtb3JlIGhlbHBmdWwuXG4gICAgaWYgKGZpcnN0RXJyb3JLZXkuaW5kZXhPZignLicpID09PSAtMSkge1xuICAgICAgbWVzc2FnZSA9IGZpcnN0RXJyb3JNZXNzYWdlO1xuICAgIH0gZWxzZSB7XG4gICAgICBtZXNzYWdlID0gYCR7Zmlyc3RFcnJvck1lc3NhZ2V9ICgke2ZpcnN0RXJyb3JLZXl9KWA7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIG1lc3NhZ2UgPSBcIkZhaWxlZCB2YWxpZGF0aW9uXCI7XG4gIH1cbiAgbWVzc2FnZSA9IGAke21lc3NhZ2V9ICR7YXBwZW5kVG9NZXNzYWdlfWAudHJpbSgpO1xuICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgZXJyb3IuaW52YWxpZEtleXMgPSBpbnZhbGlkS2V5cztcbiAgZXJyb3IudmFsaWRhdGlvbkNvbnRleHQgPSBjb250ZXh0O1xuICAvLyBJZiBvbiB0aGUgc2VydmVyLCB3ZSBhZGQgYSBzYW5pdGl6ZWQgZXJyb3IsIHRvbywgaW4gY2FzZSB3ZSdyZVxuICAvLyBjYWxsZWQgZnJvbSBhIG1ldGhvZC5cbiAgaWYgKE1ldGVvci5pc1NlcnZlcikge1xuICAgIGVycm9yLnNhbml0aXplZEVycm9yID0gbmV3IE1ldGVvci5FcnJvcig0MDAsIG1lc3NhZ2UsIEVKU09OLnN0cmluZ2lmeShlcnJvci5pbnZhbGlkS2V5cykpO1xuICB9XG4gIHJldHVybiBlcnJvcjtcbn1cblxuZnVuY3Rpb24gYWRkVW5pcXVlRXJyb3IoY29udGV4dCwgZXJyb3JNZXNzYWdlKSB7XG4gIGNvbnN0IG5hbWUgPSBlcnJvck1lc3NhZ2Uuc3BsaXQoJ2MyXycpWzFdLnNwbGl0KCcgJylbMF07XG4gIGNvbnN0IHZhbCA9IGVycm9yTWVzc2FnZS5zcGxpdCgnZHVwIGtleTonKVsxXS5zcGxpdCgnXCInKVsxXTtcblxuICBjb25zdCBhZGRWYWxpZGF0aW9uRXJyb3JzUHJvcE5hbWUgPSAodHlwZW9mIGNvbnRleHQuYWRkVmFsaWRhdGlvbkVycm9ycyA9PT0gJ2Z1bmN0aW9uJykgPyAnYWRkVmFsaWRhdGlvbkVycm9ycycgOiAnYWRkSW52YWxpZEtleXMnO1xuICBjb250ZXh0W2FkZFZhbGlkYXRpb25FcnJvcnNQcm9wTmFtZV0oW3tcbiAgICBuYW1lOiBuYW1lLFxuICAgIHR5cGU6ICdub3RVbmlxdWUnLFxuICAgIHZhbHVlOiB2YWxcbiAgfV0pO1xufVxuXG5mdW5jdGlvbiB3cmFwQ2FsbGJhY2tGb3JQYXJzaW5nTW9uZ29WYWxpZGF0aW9uRXJyb3JzKHZhbGlkYXRpb25Db250ZXh0LCBjYikge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcHBlZENhbGxiYWNrRm9yUGFyc2luZ01vbmdvVmFsaWRhdGlvbkVycm9ycyguLi5hcmdzKSB7XG4gICAgY29uc3QgZXJyb3IgPSBhcmdzWzBdO1xuICAgIGlmIChlcnJvciAmJlxuICAgICAgICAoKGVycm9yLm5hbWUgPT09IFwiTW9uZ29FcnJvclwiICYmIGVycm9yLmNvZGUgPT09IDExMDAxKSB8fCBlcnJvci5tZXNzYWdlLmluZGV4T2YoJ01vbmdvRXJyb3I6IEUxMTAwMCcpICE9PSAtMSkgJiZcbiAgICAgICAgZXJyb3IubWVzc2FnZS5pbmRleE9mKCdjMl8nKSAhPT0gLTEpIHtcbiAgICAgIGFkZFVuaXF1ZUVycm9yKHZhbGlkYXRpb25Db250ZXh0LCBlcnJvci5tZXNzYWdlKTtcbiAgICAgIGFyZ3NbMF0gPSBnZXRFcnJvck9iamVjdCh2YWxpZGF0aW9uQ29udGV4dCk7XG4gICAgfVxuICAgIHJldHVybiBjYi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gd3JhcENhbGxiYWNrRm9yUGFyc2luZ1NlcnZlckVycm9ycyh2YWxpZGF0aW9uQ29udGV4dCwgY2IpIHtcbiAgY29uc3QgYWRkVmFsaWRhdGlvbkVycm9yc1Byb3BOYW1lID0gKHR5cGVvZiB2YWxpZGF0aW9uQ29udGV4dC5hZGRWYWxpZGF0aW9uRXJyb3JzID09PSAnZnVuY3Rpb24nKSA/ICdhZGRWYWxpZGF0aW9uRXJyb3JzJyA6ICdhZGRJbnZhbGlkS2V5cyc7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwcGVkQ2FsbGJhY2tGb3JQYXJzaW5nU2VydmVyRXJyb3JzKC4uLmFyZ3MpIHtcbiAgICBjb25zdCBlcnJvciA9IGFyZ3NbMF07XG4gICAgLy8gSGFuZGxlIG91ciBvd24gdmFsaWRhdGlvbiBlcnJvcnNcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBNZXRlb3IuRXJyb3IgJiZcbiAgICAgICAgZXJyb3IuZXJyb3IgPT09IDQwMCAmJlxuICAgICAgICBlcnJvci5yZWFzb24gPT09IFwiSU5WQUxJRFwiICYmXG4gICAgICAgIHR5cGVvZiBlcnJvci5kZXRhaWxzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBjb25zdCBpbnZhbGlkS2V5c0Zyb21TZXJ2ZXIgPSBFSlNPTi5wYXJzZShlcnJvci5kZXRhaWxzKTtcbiAgICAgIHZhbGlkYXRpb25Db250ZXh0W2FkZFZhbGlkYXRpb25FcnJvcnNQcm9wTmFtZV0oaW52YWxpZEtleXNGcm9tU2VydmVyKTtcbiAgICAgIGFyZ3NbMF0gPSBnZXRFcnJvck9iamVjdCh2YWxpZGF0aW9uQ29udGV4dCk7XG4gICAgfVxuICAgIC8vIEhhbmRsZSBNb25nbyB1bmlxdWUgaW5kZXggZXJyb3JzLCB3aGljaCBhcmUgZm9yd2FyZGVkIHRvIHRoZSBjbGllbnQgYXMgNDA5IGVycm9yc1xuICAgIGVsc2UgaWYgKGVycm9yIGluc3RhbmNlb2YgTWV0ZW9yLkVycm9yICYmXG4gICAgICAgICAgICAgZXJyb3IuZXJyb3IgPT09IDQwOSAmJlxuICAgICAgICAgICAgIGVycm9yLnJlYXNvbiAmJlxuICAgICAgICAgICAgIGVycm9yLnJlYXNvbi5pbmRleE9mKCdFMTEwMDAnKSAhPT0gLTEgJiZcbiAgICAgICAgICAgICBlcnJvci5yZWFzb24uaW5kZXhPZignYzJfJykgIT09IC0xKSB7XG4gICAgICBhZGRVbmlxdWVFcnJvcih2YWxpZGF0aW9uQ29udGV4dCwgZXJyb3IucmVhc29uKTtcbiAgICAgIGFyZ3NbMF0gPSBnZXRFcnJvck9iamVjdCh2YWxpZGF0aW9uQ29udGV4dCk7XG4gICAgfVxuICAgIHJldHVybiBjYi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfTtcbn1cblxubGV0IGFscmVhZHlJbnNlY3VyZSA9IHt9O1xuZnVuY3Rpb24ga2VlcEluc2VjdXJlKGMpIHtcbiAgLy8gSWYgaW5zZWN1cmUgcGFja2FnZSBpcyBpbiB1c2UsIHdlIG5lZWQgdG8gYWRkIGFsbG93IHJ1bGVzIHRoYXQgcmV0dXJuXG4gIC8vIHRydWUuIE90aGVyd2lzZSwgaXQgd291bGQgc2VlbWluZ2x5IHR1cm4gb2ZmIGluc2VjdXJlIG1vZGUuXG4gIGlmIChQYWNrYWdlICYmIFBhY2thZ2UuaW5zZWN1cmUgJiYgIWFscmVhZHlJbnNlY3VyZVtjLl9uYW1lXSkge1xuICAgIGMuYWxsb3coe1xuICAgICAgaW5zZXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9LFxuICAgICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcbiAgICAgIGZldGNoOiBbXSxcbiAgICAgIHRyYW5zZm9ybTogbnVsbFxuICAgIH0pO1xuICAgIGFscmVhZHlJbnNlY3VyZVtjLl9uYW1lXSA9IHRydWU7XG4gIH1cbiAgLy8gSWYgaW5zZWN1cmUgcGFja2FnZSBpcyBOT1QgaW4gdXNlLCB0aGVuIGFkZGluZyB0aGUgdHdvIGRlbnkgZnVuY3Rpb25zXG4gIC8vIGRvZXMgbm90IGhhdmUgYW55IGVmZmVjdCBvbiB0aGUgbWFpbiBhcHAncyBzZWN1cml0eSBwYXJhZGlnbS4gVGhlXG4gIC8vIHVzZXIgd2lsbCBzdGlsbCBiZSByZXF1aXJlZCB0byBhZGQgYXQgbGVhc3Qgb25lIGFsbG93IGZ1bmN0aW9uIG9mIGhlclxuICAvLyBvd24gZm9yIGVhY2ggb3BlcmF0aW9uIGZvciB0aGlzIGNvbGxlY3Rpb24uIEFuZCB0aGUgdXNlciBtYXkgc3RpbGwgYWRkXG4gIC8vIGFkZGl0aW9uYWwgZGVueSBmdW5jdGlvbnMsIGJ1dCBkb2VzIG5vdCBoYXZlIHRvLlxufVxuXG5sZXQgYWxyZWFkeURlZmluZWQgPSB7fTtcbmZ1bmN0aW9uIGRlZmluZURlbnkoYywgb3B0aW9ucykge1xuICBpZiAoIWFscmVhZHlEZWZpbmVkW2MuX25hbWVdKSB7XG5cbiAgICBjb25zdCBpc0xvY2FsQ29sbGVjdGlvbiA9IChjLl9jb25uZWN0aW9uID09PSBudWxsKTtcblxuICAgIC8vIEZpcnN0IGRlZmluZSBkZW55IGZ1bmN0aW9ucyB0byBleHRlbmQgZG9jIHdpdGggdGhlIHJlc3VsdHMgb2YgY2xlYW5cbiAgICAvLyBhbmQgYXV0by12YWx1ZXMuIFRoaXMgbXVzdCBiZSBkb25lIHdpdGggXCJ0cmFuc2Zvcm06IG51bGxcIiBvciB3ZSB3b3VsZCBiZVxuICAgIC8vIGV4dGVuZGluZyBhIGNsb25lIG9mIGRvYyBhbmQgdGhlcmVmb3JlIGhhdmUgbm8gZWZmZWN0LlxuICAgIGMuZGVueSh7XG4gICAgICBpbnNlcnQ6IGZ1bmN0aW9uKHVzZXJJZCwgZG9jKSB7XG4gICAgICAgIC8vIFJlZmVyZW5jZWQgZG9jIGlzIGNsZWFuZWQgaW4gcGxhY2VcbiAgICAgICAgYy5zaW1wbGVTY2hlbWEoZG9jKS5jbGVhbihkb2MsIHtcbiAgICAgICAgICBtdXRhdGU6IHRydWUsXG4gICAgICAgICAgaXNNb2RpZmllcjogZmFsc2UsXG4gICAgICAgICAgLy8gV2UgZG9uJ3QgZG8gdGhlc2UgaGVyZSBiZWNhdXNlIHRoZXkgYXJlIGRvbmUgb24gdGhlIGNsaWVudCBpZiBkZXNpcmVkXG4gICAgICAgICAgZmlsdGVyOiBmYWxzZSxcbiAgICAgICAgICBhdXRvQ29udmVydDogZmFsc2UsXG4gICAgICAgICAgcmVtb3ZlRW1wdHlTdHJpbmdzOiBmYWxzZSxcbiAgICAgICAgICB0cmltU3RyaW5nczogZmFsc2UsXG4gICAgICAgICAgZXh0ZW5kQXV0b1ZhbHVlQ29udGV4dDoge1xuICAgICAgICAgICAgaXNJbnNlcnQ6IHRydWUsXG4gICAgICAgICAgICBpc1VwZGF0ZTogZmFsc2UsXG4gICAgICAgICAgICBpc1Vwc2VydDogZmFsc2UsXG4gICAgICAgICAgICB1c2VySWQ6IHVzZXJJZCxcbiAgICAgICAgICAgIGlzRnJvbVRydXN0ZWRDb2RlOiBmYWxzZSxcbiAgICAgICAgICAgIGRvY0lkOiBkb2MuX2lkLFxuICAgICAgICAgICAgaXNMb2NhbENvbGxlY3Rpb246IGlzTG9jYWxDb2xsZWN0aW9uXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgdXBkYXRlOiBmdW5jdGlvbih1c2VySWQsIGRvYywgZmllbGRzLCBtb2RpZmllcikge1xuICAgICAgICAvLyBSZWZlcmVuY2VkIG1vZGlmaWVyIGlzIGNsZWFuZWQgaW4gcGxhY2VcbiAgICAgICAgYy5zaW1wbGVTY2hlbWEobW9kaWZpZXIpLmNsZWFuKG1vZGlmaWVyLCB7XG4gICAgICAgICAgbXV0YXRlOiB0cnVlLFxuICAgICAgICAgIGlzTW9kaWZpZXI6IHRydWUsXG4gICAgICAgICAgLy8gV2UgZG9uJ3QgZG8gdGhlc2UgaGVyZSBiZWNhdXNlIHRoZXkgYXJlIGRvbmUgb24gdGhlIGNsaWVudCBpZiBkZXNpcmVkXG4gICAgICAgICAgZmlsdGVyOiBmYWxzZSxcbiAgICAgICAgICBhdXRvQ29udmVydDogZmFsc2UsXG4gICAgICAgICAgcmVtb3ZlRW1wdHlTdHJpbmdzOiBmYWxzZSxcbiAgICAgICAgICB0cmltU3RyaW5nczogZmFsc2UsXG4gICAgICAgICAgZXh0ZW5kQXV0b1ZhbHVlQ29udGV4dDoge1xuICAgICAgICAgICAgaXNJbnNlcnQ6IGZhbHNlLFxuICAgICAgICAgICAgaXNVcGRhdGU6IHRydWUsXG4gICAgICAgICAgICBpc1Vwc2VydDogZmFsc2UsXG4gICAgICAgICAgICB1c2VySWQ6IHVzZXJJZCxcbiAgICAgICAgICAgIGlzRnJvbVRydXN0ZWRDb2RlOiBmYWxzZSxcbiAgICAgICAgICAgIGRvY0lkOiBkb2MgJiYgZG9jLl9pZCxcbiAgICAgICAgICAgIGlzTG9jYWxDb2xsZWN0aW9uOiBpc0xvY2FsQ29sbGVjdGlvblxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcbiAgICAgIGZldGNoOiBbJ19pZCddLFxuICAgICAgdHJhbnNmb3JtOiBudWxsXG4gICAgfSk7XG5cbiAgICAvLyBTZWNvbmQgZGVmaW5lIGRlbnkgZnVuY3Rpb25zIHRvIHZhbGlkYXRlIGFnYWluIG9uIHRoZSBzZXJ2ZXJcbiAgICAvLyBmb3IgY2xpZW50LWluaXRpYXRlZCBpbnNlcnRzIGFuZCB1cGRhdGVzLiBUaGVzZSBzaG91bGQgYmVcbiAgICAvLyBjYWxsZWQgYWZ0ZXIgdGhlIGNsZWFuL2F1dG8tdmFsdWUgZnVuY3Rpb25zIHNpbmNlIHdlJ3JlIGFkZGluZ1xuICAgIC8vIHRoZW0gYWZ0ZXIuIFRoZXNlIG11c3QgKm5vdCogaGF2ZSBcInRyYW5zZm9ybTogbnVsbFwiIGlmIG9wdGlvbnMudHJhbnNmb3JtIGlzIHRydWUgYmVjYXVzZVxuICAgIC8vIHdlIG5lZWQgdG8gcGFzcyB0aGUgZG9jIHRocm91Z2ggYW55IHRyYW5zZm9ybXMgdG8gYmUgc3VyZVxuICAgIC8vIHRoYXQgY3VzdG9tIHR5cGVzIGFyZSBwcm9wZXJseSByZWNvZ25pemVkIGZvciB0eXBlIHZhbGlkYXRpb24uXG4gICAgYy5kZW55KHtcbiAgICAgIGluc2VydDogZnVuY3Rpb24odXNlcklkLCBkb2MpIHtcbiAgICAgICAgLy8gV2UgcGFzcyB0aGUgZmFsc2Ugb3B0aW9ucyBiZWNhdXNlIHdlIHdpbGwgaGF2ZSBkb25lIHRoZW0gb24gY2xpZW50IGlmIGRlc2lyZWRcbiAgICAgICAgZG9WYWxpZGF0ZShcbiAgICAgICAgICBjLFxuICAgICAgICAgIFwiaW5zZXJ0XCIsXG4gICAgICAgICAgW1xuICAgICAgICAgICAgZG9jLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0cmltU3RyaW5nczogZmFsc2UsXG4gICAgICAgICAgICAgIHJlbW92ZUVtcHR5U3RyaW5nczogZmFsc2UsXG4gICAgICAgICAgICAgIGZpbHRlcjogZmFsc2UsXG4gICAgICAgICAgICAgIGF1dG9Db252ZXJ0OiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAwLCAnSU5WQUxJRCcsIEVKU09OLnN0cmluZ2lmeShlcnJvci5pbnZhbGlkS2V5cykpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICBmYWxzZSwgLy8gZ2V0QXV0b1ZhbHVlc1xuICAgICAgICAgIHVzZXJJZCxcbiAgICAgICAgICBmYWxzZSAvLyBpc0Zyb21UcnVzdGVkQ29kZVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uKHVzZXJJZCwgZG9jLCBmaWVsZHMsIG1vZGlmaWVyKSB7XG4gICAgICAgIC8vIE5PVEU6IFRoaXMgd2lsbCBuZXZlciBiZSBhbiB1cHNlcnQgYmVjYXVzZSBjbGllbnQtc2lkZSB1cHNlcnRzXG4gICAgICAgIC8vIGFyZSBub3QgYWxsb3dlZCBvbmNlIHlvdSBkZWZpbmUgYWxsb3cvZGVueSBmdW5jdGlvbnMuXG4gICAgICAgIC8vIFdlIHBhc3MgdGhlIGZhbHNlIG9wdGlvbnMgYmVjYXVzZSB3ZSB3aWxsIGhhdmUgZG9uZSB0aGVtIG9uIGNsaWVudCBpZiBkZXNpcmVkXG4gICAgICAgIGRvVmFsaWRhdGUoXG4gICAgICAgICAgYyxcbiAgICAgICAgICBcInVwZGF0ZVwiLFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIHtfaWQ6IGRvYyAmJiBkb2MuX2lkfSxcbiAgICAgICAgICAgIG1vZGlmaWVyLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0cmltU3RyaW5nczogZmFsc2UsXG4gICAgICAgICAgICAgIHJlbW92ZUVtcHR5U3RyaW5nczogZmFsc2UsXG4gICAgICAgICAgICAgIGZpbHRlcjogZmFsc2UsXG4gICAgICAgICAgICAgIGF1dG9Db252ZXJ0OiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAwLCAnSU5WQUxJRCcsIEVKU09OLnN0cmluZ2lmeShlcnJvci5pbnZhbGlkS2V5cykpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSxcbiAgICAgICAgICBmYWxzZSwgLy8gZ2V0QXV0b1ZhbHVlc1xuICAgICAgICAgIHVzZXJJZCxcbiAgICAgICAgICBmYWxzZSAvLyBpc0Zyb21UcnVzdGVkQ29kZVxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sXG4gICAgICBmZXRjaDogWydfaWQnXSxcbiAgICAgIC4uLihvcHRpb25zLnRyYW5zZm9ybSA9PT0gdHJ1ZSA/IHt9IDoge3RyYW5zZm9ybTogbnVsbH0pLFxuICAgIH0pO1xuXG4gICAgLy8gbm90ZSB0aGF0IHdlJ3ZlIGFscmVhZHkgZG9uZSB0aGlzIGNvbGxlY3Rpb24gc28gdGhhdCB3ZSBkb24ndCBkbyBpdCBhZ2FpblxuICAgIC8vIGlmIGF0dGFjaFNjaGVtYSBpcyBjYWxsZWQgYWdhaW5cbiAgICBhbHJlYWR5RGVmaW5lZFtjLl9uYW1lXSA9IHRydWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXh0ZW5kU2NoZW1hKHMxLCBzMikge1xuICBpZiAoczIudmVyc2lvbiA+PSAyKSB7XG4gICAgY29uc3Qgc3MgPSBuZXcgU2ltcGxlU2NoZW1hKHMxKTtcbiAgICBzcy5leHRlbmQoczIpO1xuICAgIHJldHVybiBzcztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IFNpbXBsZVNjaGVtYShbIHMxLCBzMiBdKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb2xsZWN0aW9uMjtcbiIsImV4cG9ydCBmdW5jdGlvbiBmbGF0dGVuU2VsZWN0b3Ioc2VsZWN0b3IpIHtcbiAgLy8gSWYgc2VsZWN0b3IgdXNlcyAkYW5kIGZvcm1hdCwgY29udmVydCB0byBwbGFpbiBvYmplY3Qgc2VsZWN0b3JcbiAgaWYgKEFycmF5LmlzQXJyYXkoc2VsZWN0b3IuJGFuZCkpIHtcbiAgICBzZWxlY3Rvci4kYW5kLmZvckVhY2goc2VsID0+IHtcbiAgICAgIE9iamVjdC5hc3NpZ24oc2VsZWN0b3IsIGZsYXR0ZW5TZWxlY3RvcihzZWwpKTtcbiAgICB9KTtcblxuICAgIGRlbGV0ZSBzZWxlY3Rvci4kYW5kXG4gIH1cblxuICBjb25zdCBvYmogPSB7fVxuXG4gIE9iamVjdC5lbnRyaWVzKHNlbGVjdG9yKS5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAvLyBJZ25vcmluZyBsb2dpY2FsIHNlbGVjdG9ycyAoaHR0cHM6Ly9kb2NzLm1vbmdvZGIuY29tL21hbnVhbC9yZWZlcmVuY2Uvb3BlcmF0b3IvcXVlcnkvI2xvZ2ljYWwpXG4gICAgaWYgKCFrZXkuc3RhcnRzV2l0aChcIiRcIikpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgIGlmICh2YWx1ZS4kZXEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG9ialtrZXldID0gdmFsdWUuJGVxXG4gICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZS4kaW4pICYmIHZhbHVlLiRpbi5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICBvYmpba2V5XSA9IHZhbHVlLiRpblswXVxuICAgICAgICB9IGVsc2UgaWYgKE9iamVjdC5rZXlzKHZhbHVlKS5ldmVyeSh2ID0+ICEodHlwZW9mIHYgPT09IFwic3RyaW5nXCIgJiYgdi5zdGFydHNXaXRoKFwiJFwiKSkpKSB7XG4gICAgICAgICAgb2JqW2tleV0gPSB2YWx1ZVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvYmpba2V5XSA9IHZhbHVlXG4gICAgICB9XG4gICAgfVxuICB9KVxuICBcbiAgcmV0dXJuIG9ialxufVxuIl19
