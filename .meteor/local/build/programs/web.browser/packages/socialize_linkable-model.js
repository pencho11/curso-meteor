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
