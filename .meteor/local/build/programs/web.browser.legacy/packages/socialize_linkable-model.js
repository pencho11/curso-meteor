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
var meteorBabelHelpers = Package.modules.meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

var require = meteorInstall({"node_modules":{"meteor":{"socialize:linkable-model":{"common":{"common.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/socialize_linkable-model/common/common.js                                                                //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.export({
  LinkableModel: function () {
    return LinkableModel;
  },
  LinkParent: function () {
    return LinkParent;
  }
});
var BaseModel;
module.link("meteor/socialize:base-model", {
  BaseModel: function (v) {
    BaseModel = v;
  }
}, 0);
var LinkParentConstruct;
module.link("./link-parent.js", {
  "default": function (v) {
    LinkParentConstruct = v;
  }
}, 1);
var LinkableModelConstruct;
module.link("./linkable-model.js", {
  "default": function (v) {
    LinkableModelConstruct = v;
  }
}, 2);
var LinkParent = LinkParentConstruct(BaseModel);
var LinkableModel = LinkableModelConstruct();
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"link-parent.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/socialize_linkable-model/common/link-parent.js                                                           //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
var _inheritsLoose;

module.link("@babel/runtime/helpers/inheritsLoose", {
  default: function (v) {
    _inheritsLoose = v;
  }
}, 0);
module.exportDefault(function (BaseModel) {
  return (
    /*#__PURE__*/

    /**
    * A Model that is linked to by LinkableModel's
    * @class LinkedModel
    */
    function (_BaseModel) {
      _inheritsLoose(LinkParent, _BaseModel);

      function LinkParent() {
        return _BaseModel.apply(this, arguments) || this;
      }

      var _proto = LinkParent.prototype;

      _proto.getLinkObject = function () {
        function getLinkObject() {
          return {
            linkedObjectId: this._id,
            objectType: this._objectType
          };
        }

        return getLinkObject;
      }();

      return LinkParent;
    }(BaseModel)
  );
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"linkable-model.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/socialize_linkable-model/common/linkable-model.js                                                        //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
var _inheritsLoose;

module.link("@babel/runtime/helpers/inheritsLoose", {
  default: function (v) {
    _inheritsLoose = v;
  }
}, 0);
var SimpleSchema;
module.link("simpl-schema", {
  "default": function (v) {
    SimpleSchema = v;
  }
}, 0);
module.exportDefault(function () {
  // a place to store references to the collections where the commentable objects are stored.
  var LinkableTypes = {};
  /**
  * A scaffold for creating models which can link records from one collection to records from many other collections
  * @mixin LinkableModel
  */

  var LinkableModel = function (Base) {
    return /*#__PURE__*/function (_Base) {
      _inheritsLoose(_class, _Base);

      function _class() {
        return _Base.apply(this, arguments) || this;
      }

      var _proto = _class.prototype;

      /**
      * getCollectionForParentLink - Get the collection for the ParentLink
      *
      * @return {Mongo.Collection} The Collection attached to the ParentLink
      */
      _proto.getCollectionForParentLink = function () {
        function getCollectionForParentLink() {
          return LinkableTypes[this.objectType];
        }

        return getCollectionForParentLink;
      }()
      /**
      * linkedObject - Get the model for the linked record
      *
      * @return {Model}  A model of varying types depending on the linked objects type
      */
      ;

      _proto.linkedParent = function () {
        function linkedParent() {
          var collection = this.getCollectionForParentLink();
          return collection.findOne({
            _id: this.linkedObjectId
          });
        }

        return linkedParent;
      }();

      return _class;
    }(Base);
  };
  /**
  * Register a data type that can be linked to another model, storing its collection so we can find the object later
  * @param {BaseModel}           type       The name of the type
  * @param {Mongo.Collection} collection The collection where the type of data is stored
  */


  LinkableModel.registerParentModel = function () {
    function registerParentModel(model) {
      var type = model.prototype.getCollectionName();
      model.prototype._objectType = type; // eslint-disable-line

      LinkableTypes[type] = model.prototype.getCollection();
    }

    return registerParentModel;
  }();

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
