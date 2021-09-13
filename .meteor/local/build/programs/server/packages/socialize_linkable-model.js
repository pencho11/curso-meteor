(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var ECMAScript = Package.ecmascript.ECMAScript;
var Collection2 = Package['aldeed:collection2'].Collection2;
var CollectionHooks = Package['matb33:collection-hooks'].CollectionHooks;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"socialize:linkable-model":{"common":{"common.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/socialize_linkable-model/common/common.js                                                                //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  LinkableModel: () => LinkableModel,
  LinkParent: () => LinkParent
});
let BaseModel;
module.link("meteor/socialize:base-model", {
  BaseModel(v) {
    BaseModel = v;
  }

}, 0);
let LinkParentConstruct;
module.link("./link-parent.js", {
  default(v) {
    LinkParentConstruct = v;
  }

}, 1);
let LinkableModelConstruct;
module.link("./linkable-model.js", {
  default(v) {
    LinkableModelConstruct = v;
  }

}, 2);
const LinkParent = LinkParentConstruct(BaseModel);
const LinkableModel = LinkableModelConstruct();
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"link-parent.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/socialize_linkable-model/common/link-parent.js                                                           //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.exportDefault(BaseModel =>
/**
* A Model that is linked to by LinkableModel's
* @class LinkedModel
*/
class LinkParent extends BaseModel {
  getLinkObject() {
    return {
      linkedObjectId: this._id,
      objectType: this._objectType
    };
  }

});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"linkable-model.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/socialize_linkable-model/common/linkable-model.js                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 0);
module.exportDefault(() => {
  // a place to store references to the collections where the commentable objects are stored.
  const LinkableTypes = {};
  /**
  * A scaffold for creating models which can link records from one collection to records from many other collections
  * @mixin LinkableModel
  */

  const LinkableModel = Base => class extends Base {
    /**
    * getCollectionForParentLink - Get the collection for the ParentLink
    *
    * @return {Mongo.Collection} The Collection attached to the ParentLink
    */
    getCollectionForParentLink() {
      return LinkableTypes[this.objectType];
    }
    /**
    * linkedObject - Get the model for the linked record
    *
    * @return {Model}  A model of varying types depending on the linked objects type
    */


    linkedParent() {
      const collection = this.getCollectionForParentLink();
      return collection.findOne({
        _id: this.linkedObjectId
      });
    }

  };
  /**
  * Register a data type that can be linked to another model, storing its collection so we can find the object later
  * @param {BaseModel}           type       The name of the type
  * @param {Mongo.Collection} collection The collection where the type of data is stored
  */


  LinkableModel.registerParentModel = function registerParentModel(model) {
    const type = model.prototype.getCollectionName();
    model.prototype._objectType = type; // eslint-disable-line

    LinkableTypes[type] = model.prototype.getCollection();
  };

  LinkableModel.LinkableSchema = new SimpleSchema({
    linkedObjectId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      index: 1
    },
    objectType: {
      type: String,
      denyUpdate: true
    }
  });
  return LinkableModel;
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/socialize:linkable-model/common/common.js");

/* Exports */
Package._define("socialize:linkable-model", exports);

})();

//# sourceURL=meteor://💻app/packages/socialize_linkable-model.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc29jaWFsaXplOmxpbmthYmxlLW1vZGVsL2NvbW1vbi9jb21tb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3NvY2lhbGl6ZTpsaW5rYWJsZS1tb2RlbC9jb21tb24vbGluay1wYXJlbnQuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3NvY2lhbGl6ZTpsaW5rYWJsZS1tb2RlbC9jb21tb24vbGlua2FibGUtbW9kZWwuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0IiwiTGlua2FibGVNb2RlbCIsIkxpbmtQYXJlbnQiLCJCYXNlTW9kZWwiLCJsaW5rIiwidiIsIkxpbmtQYXJlbnRDb25zdHJ1Y3QiLCJkZWZhdWx0IiwiTGlua2FibGVNb2RlbENvbnN0cnVjdCIsImV4cG9ydERlZmF1bHQiLCJnZXRMaW5rT2JqZWN0IiwibGlua2VkT2JqZWN0SWQiLCJfaWQiLCJvYmplY3RUeXBlIiwiX29iamVjdFR5cGUiLCJTaW1wbGVTY2hlbWEiLCJMaW5rYWJsZVR5cGVzIiwiQmFzZSIsImdldENvbGxlY3Rpb25Gb3JQYXJlbnRMaW5rIiwibGlua2VkUGFyZW50IiwiY29sbGVjdGlvbiIsImZpbmRPbmUiLCJyZWdpc3RlclBhcmVudE1vZGVsIiwibW9kZWwiLCJ0eXBlIiwicHJvdG90eXBlIiwiZ2V0Q29sbGVjdGlvbk5hbWUiLCJnZXRDb2xsZWN0aW9uIiwiTGlua2FibGVTY2hlbWEiLCJTdHJpbmciLCJyZWdFeCIsIlJlZ0V4IiwiSWQiLCJpbmRleCIsImRlbnlVcGRhdGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsTUFBTSxDQUFDQyxNQUFQLENBQWM7QUFBQ0MsZUFBYSxFQUFDLE1BQUlBLGFBQW5CO0FBQWlDQyxZQUFVLEVBQUMsTUFBSUE7QUFBaEQsQ0FBZDtBQUEyRSxJQUFJQyxTQUFKO0FBQWNKLE1BQU0sQ0FBQ0ssSUFBUCxDQUFZLDZCQUFaLEVB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LW1vZGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgaW1wb3J0L25vLXVucmVzb2x2ZWQgKi9cbmltcG9ydCB7IEJhc2VNb2RlbCB9IGZyb20gJ21ldGVvci9zb2NpYWxpemU6YmFzZS1tb2RlbCc7XG4vKiBlc2xpbnQtZW5hYmxlIGltcG9ydC9uby11bnJlc29sdmVkICovXG5cbmltcG9ydCBMaW5rUGFyZW50Q29uc3RydWN0IGZyb20gJy4vbGluay1wYXJlbnQuanMnO1xuaW1wb3J0IExpbmthYmxlTW9kZWxDb25zdHJ1Y3QgZnJvbSAnLi9saW5rYWJsZS1tb2RlbC5qcyc7XG5cbmNvbnN0IExpbmtQYXJlbnQgPSBMaW5rUGFyZW50Q29uc3RydWN0KEJhc2VNb2RlbCk7XG5jb25zdCBMaW5rYWJsZU1vZGVsID0gTGlua2FibGVNb2RlbENvbnN0cnVjdCgpO1xuXG5leHBvcnQgeyBMaW5rYWJsZU1vZGVsLCBMaW5rUGFyZW50IH07XG4iLCJleHBvcnQgZGVmYXVsdCBCYXNlTW9kZWwgPT5cbiAgICAvKipcbiAgICAqIEEgTW9kZWwgdGhhdCBpcyBsaW5rZWQgdG8gYnkgTGlua2FibGVNb2RlbCdzXG4gICAgKiBAY2xhc3MgTGlua2VkTW9kZWxcbiAgICAqL1xuICAgIGNsYXNzIExpbmtQYXJlbnQgZXh0ZW5kcyBCYXNlTW9kZWwge1xuICAgICAgICBnZXRMaW5rT2JqZWN0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHsgbGlua2VkT2JqZWN0SWQ6IHRoaXMuX2lkLCBvYmplY3RUeXBlOiB0aGlzLl9vYmplY3RUeXBlIH07XG4gICAgICAgIH1cbiAgICB9XG47XG4iLCIvKiBlc2xpbnQtZGlzYWJsZSBpbXBvcnQvbm8tdW5yZXNvbHZlZCAqL1xuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuLyogZXNsaW50LWVuYWJsZSBpbXBvcnQvbm8tdW5yZXNvbHZlZCAqL1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7XG4gICAgLy8gYSBwbGFjZSB0byBzdG9yZSByZWZlcmVuY2VzIHRvIHRoZSBjb2xsZWN0aW9ucyB3aGVyZSB0aGUgY29tbWVudGFibGUgb2JqZWN0cyBhcmUgc3RvcmVkLlxuICAgIGNvbnN0IExpbmthYmxlVHlwZXMgPSB7fTtcblxuICAgIC8qKlxuICAgICogQSBzY2FmZm9sZCBmb3IgY3JlYXRpbmcgbW9kZWxzIHdoaWNoIGNhbiBsaW5rIHJlY29yZHMgZnJvbSBvbmUgY29sbGVjdGlvbiB0byByZWNvcmRzIGZyb20gbWFueSBvdGhlciBjb2xsZWN0aW9uc1xuICAgICogQG1peGluIExpbmthYmxlTW9kZWxcbiAgICAqL1xuICAgIGNvbnN0IExpbmthYmxlTW9kZWwgPSBCYXNlID0+IGNsYXNzIGV4dGVuZHMgQmFzZSB7XG4gICAgICAgIC8qKlxuICAgICAgICAqIGdldENvbGxlY3Rpb25Gb3JQYXJlbnRMaW5rIC0gR2V0IHRoZSBjb2xsZWN0aW9uIGZvciB0aGUgUGFyZW50TGlua1xuICAgICAgICAqXG4gICAgICAgICogQHJldHVybiB7TW9uZ28uQ29sbGVjdGlvbn0gVGhlIENvbGxlY3Rpb24gYXR0YWNoZWQgdG8gdGhlIFBhcmVudExpbmtcbiAgICAgICAgKi9cbiAgICAgICAgZ2V0Q29sbGVjdGlvbkZvclBhcmVudExpbmsoKSB7XG4gICAgICAgICAgICByZXR1cm4gTGlua2FibGVUeXBlc1t0aGlzLm9iamVjdFR5cGVdO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAqIGxpbmtlZE9iamVjdCAtIEdldCB0aGUgbW9kZWwgZm9yIHRoZSBsaW5rZWQgcmVjb3JkXG4gICAgICAgICpcbiAgICAgICAgKiBAcmV0dXJuIHtNb2RlbH0gIEEgbW9kZWwgb2YgdmFyeWluZyB0eXBlcyBkZXBlbmRpbmcgb24gdGhlIGxpbmtlZCBvYmplY3RzIHR5cGVcbiAgICAgICAgKi9cbiAgICAgICAgbGlua2VkUGFyZW50KCkge1xuICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IHRoaXMuZ2V0Q29sbGVjdGlvbkZvclBhcmVudExpbmsoKTtcbiAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uLmZpbmRPbmUoeyBfaWQ6IHRoaXMubGlua2VkT2JqZWN0SWQgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgKiBSZWdpc3RlciBhIGRhdGEgdHlwZSB0aGF0IGNhbiBiZSBsaW5rZWQgdG8gYW5vdGhlciBtb2RlbCwgc3RvcmluZyBpdHMgY29sbGVjdGlvbiBzbyB3ZSBjYW4gZmluZCB0aGUgb2JqZWN0IGxhdGVyXG4gICAgKiBAcGFyYW0ge0Jhc2VNb2RlbH0gICAgICAgICAgIHR5cGUgICAgICAgVGhlIG5hbWUgb2YgdGhlIHR5cGVcbiAgICAqIEBwYXJhbSB7TW9uZ28uQ29sbGVjdGlvbn0gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB3aGVyZSB0aGUgdHlwZSBvZiBkYXRhIGlzIHN0b3JlZFxuICAgICovXG4gICAgTGlua2FibGVNb2RlbC5yZWdpc3RlclBhcmVudE1vZGVsID0gZnVuY3Rpb24gcmVnaXN0ZXJQYXJlbnRNb2RlbChtb2RlbCkge1xuICAgICAgICBjb25zdCB0eXBlID0gbW9kZWwucHJvdG90eXBlLmdldENvbGxlY3Rpb25OYW1lKCk7XG5cbiAgICAgICAgbW9kZWwucHJvdG90eXBlLl9vYmplY3RUeXBlID0gdHlwZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXG4gICAgICAgIExpbmthYmxlVHlwZXNbdHlwZV0gPSBtb2RlbC5wcm90b3R5cGUuZ2V0Q29sbGVjdGlvbigpO1xuICAgIH07XG5cbiAgICBMaW5rYWJsZU1vZGVsLkxpbmthYmxlU2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XG4gICAgICAgIGxpbmtlZE9iamVjdElkOiB7XG4gICAgICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgICAgICByZWdFeDogU2ltcGxlU2NoZW1hLlJlZ0V4LklkLFxuICAgICAgICAgICAgaW5kZXg6IDEsXG4gICAgICAgIH0sXG4gICAgICAgIG9iamVjdFR5cGU6IHtcbiAgICAgICAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgICAgICAgIGRlbnlVcGRhdGU6IHRydWUsXG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICByZXR1cm4gTGlua2FibGVNb2RlbDtcbn07XG4iXX0=
