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
var Accounts = Package['accounts-base'].Accounts;
var Mongo = Package.mongo.Mongo;
var Collection2 = Package['aldeed:collection2'].Collection2;
var CollectionHooks = Package['matb33:collection-hooks'].CollectionHooks;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package.modules.meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

var require = meteorInstall({"node_modules":{"meteor":{"socialize:user-model":{"common":{"common.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/socialize_user-model/common/common.js                                                           //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
module.export({
  User: function () {
    return User;
  },
  UsersCollection: function () {
    return UsersCollection;
  }
});
var Meteor;
module.link("meteor/meteor", {
  Meteor: function (v) {
    Meteor = v;
  }
}, 0);
var check;
module.link("meteor/check", {
  check: function (v) {
    check = v;
  }
}, 1);
var LinkableModel, LinkParent;
module.link("meteor/socialize:linkable-model", {
  LinkableModel: function (v) {
    LinkableModel = v;
  },
  LinkParent: function (v) {
    LinkParent = v;
  }
}, 2);
var construct;
module.link("./user-model.js", {
  "default": function (v) {
    construct = v;
  }
}, 3);

var _construct = construct({
  Meteor: Meteor,
  Package: Package,
  check: check,
  LinkableModel: LinkableModel,
  LinkParent: LinkParent
}),
    User = _construct.User,
    UsersCollection = _construct.UsersCollection;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user-model.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/socialize_user-model/common/user-model.js                                                       //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
module.exportDefault(function (_ref) {
  var Meteor = _ref.Meteor,
      Package = _ref.Package,
      check = _ref.check,
      LinkableModel = _ref.LinkableModel,
      LinkParent = _ref.LinkParent;

  /**
  * Represents a User
  * @class User
  * @param {Object} document An object representing a user ususally a Mongo document
  */
  var User = /*#__PURE__*/function (_LinkParent) {
    _inheritsLoose(User, _LinkParent);

    function User() {
      return _LinkParent.apply(this, arguments) || this;
    }

    //eslint-disable-line
    User.addFieldsToPublish = function () {
      function addFieldsToPublish(fieldsObj) {
        Object.assign(this.fieldsToPublish, fieldsObj);
      }

      return addFieldsToPublish;
    }()
    /**
    * The personal name of the user account, You if the the user represents the
    * currently logged in user, or this.username otherwise
    * @returns {String} A name representation of the user account
    */
    ;

    var _proto = User.prototype;

    _proto.displayName = function () {
      function displayName() {
        return this.isSelf() ? 'You' : this.username;
      }

      return displayName;
    }()
    /**
    * Check if the this user is the current logged in user or the specified user
    * @param   {Object}  user The user to check against
    * @returns {Boolean} Whether or not this user is the same as the specified user
    */
    ;

    _proto.isSelf = function () {
      function isSelf(user) {
        var userId = user && user._id || Meteor.userId();
        return this._id === userId;
      }

      return isSelf;
    }();

    return User;
  }(LinkParent);

  User.fieldsToPublish = {
    username: 1
  };
  User.attachCollection(Meteor.users);
  var UsersSchema = new SimpleSchema({
    username: {
      type: String,
      // For accounts-password, either emails or username is required, but not both. It is OK to make this
      // optional here because the accounts-password package does its own validation.
      // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
      optional: true
    },
    emails: {
      type: Array,
      // For accounts-password, either emails or username is required, but not both. It is OK to make this
      // optional here because the accounts-password package does its own validation.
      // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
      optional: true
    },
    'emails.$': {
      type: Object
    },
    'emails.$.address': {
      type: String,
      regEx: SimpleSchema.RegEx.Email
    },
    'emails.$.verified': {
      type: Boolean
    },
    'emails.$.default': {
      type: Boolean,
      optional: true
    },
    createdAt: {
      type: Date
    },
    // Make sure this services field is in your schema if you're using any of the accounts packages
    services: {
      type: Object,
      optional: true,
      blackbox: true
    },
    heartbeat: {
      type: Date,
      optional: true
    }
  });
  User.attachSchema(UsersSchema);
  LinkableModel.registerParentModel(User);

  if (Package['accounts-password']) {
    Meteor.methods && Meteor.methods({
      /**
      * Sets the default email for the currently logged in users
      * @param {String} emailAddress The email address to set as the current
      */
      setDefaultEmail: function (emailAddress) {
        check(emailAddress, String);

        if (this.userId) {
          var user = Meteor.users.findOne({
            _id: this.userId,
            'emails.address': emailAddress
          });

          if (user) {
            Meteor.users.update({
              _id: this.userId,
              'emails.default': true
            }, {
              $set: {
                'emails.$.default': false
              }
            });
            Meteor.users.update({
              _id: this.userId,
              'emails.address': emailAddress
            }, {
              $set: {
                'emails.$.default': true
              }
            });
          }
        } else {
          throw new Meteor.Error('NotAuthorized', 'You must be logged in to perform this operation.');
        }
      }
    });
    User.methods({
      /**
      * Set the default email address for the user
      * @param {[type]} emailAddress [description]
      */
      setDefaultEmail: function (emailAddress) {
        if (Meteor.user().isSelf()) {
          Meteor.call('setDefaultEmail', emailAddress);
        }
      },

      /**
      * Get the default email address for the user
      * @returns {String} The users default email address
      */
      defaultEmail: function () {
        var obj = this.emails.find(function (rec) {
          return rec.default === true;
        });
        return obj && obj.address || this.emails[0].address;
      }
    });
  }

  return {
    User: User,
    UsersCollection: Meteor.users
  };
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/socialize:user-model/common/common.js");

/* Exports */
Package._define("socialize:user-model", exports);

})();
