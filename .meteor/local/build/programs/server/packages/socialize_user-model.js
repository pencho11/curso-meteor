(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Accounts = Package['accounts-base'].Accounts;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var ECMAScript = Package.ecmascript.ECMAScript;
var Collection2 = Package['aldeed:collection2'].Collection2;
var CollectionHooks = Package['matb33:collection-hooks'].CollectionHooks;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"socialize:user-model":{"common":{"common.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/socialize_user-model/common/common.js                                                           //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
module.export({
  User: () => User,
  UsersCollection: () => UsersCollection
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let check;
module.link("meteor/check", {
  check(v) {
    check = v;
  }

}, 1);
let LinkableModel, LinkParent;
module.link("meteor/socialize:linkable-model", {
  LinkableModel(v) {
    LinkableModel = v;
  },

  LinkParent(v) {
    LinkParent = v;
  }

}, 2);
let construct;
module.link("./user-model.js", {
  default(v) {
    construct = v;
  }

}, 3);
const {
  User,
  UsersCollection
} = construct({
  Meteor,
  Package,
  check,
  LinkableModel,
  LinkParent
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"user-model.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/socialize_user-model/common/user-model.js                                                       //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 0);
module.exportDefault(_ref => {
  let {
    Meteor,
    Package,
    check,
    LinkableModel,
    LinkParent
  } = _ref;

  /**
  * Represents a User
  * @class User
  * @param {Object} document An object representing a user ususally a Mongo document
  */
  class User extends LinkParent {
    //eslint-disable-line
    static addFieldsToPublish(fieldsObj) {
      Object.assign(this.fieldsToPublish, fieldsObj);
    }
    /**
    * The personal name of the user account, You if the the user represents the
    * currently logged in user, or this.username otherwise
    * @returns {String} A name representation of the user account
    */


    displayName() {
      return this.isSelf() ? 'You' : this.username;
    }
    /**
    * Check if the this user is the current logged in user or the specified user
    * @param   {Object}  user The user to check against
    * @returns {Boolean} Whether or not this user is the same as the specified user
    */


    isSelf(user) {
      const userId = user && user._id || Meteor.userId();
      return this._id === userId;
    }

  }

  User.fieldsToPublish = {
    username: 1
  };
  User.attachCollection(Meteor.users);
  const UsersSchema = new SimpleSchema({
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
      setDefaultEmail(emailAddress) {
        check(emailAddress, String);

        if (this.userId) {
          const user = Meteor.users.findOne({
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
      setDefaultEmail(emailAddress) {
        if (Meteor.user().isSelf()) {
          Meteor.call('setDefaultEmail', emailAddress);
        }
      },

      /**
      * Get the default email address for the user
      * @returns {String} The users default email address
      */
      defaultEmail() {
        const obj = this.emails.find(rec => rec.default === true);
        return obj && obj.address || this.emails[0].address;
      }

    });
  }

  return {
    User,
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

//# sourceURL=meteor://💻app/packages/socialize_user-model.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc29jaWFsaXplOnVzZXItbW9kZWwvY29tbW9uL2NvbW1vbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc29jaWFsaXplOnVzZXItbW9kZWwvY29tbW9uL3VzZXItbW9kZWwuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0IiwiVXNlciIsIlVzZXJzQ29sbGVjdGlvbiIsIk1ldGVvciIsImxpbmsiLCJ2IiwiY2hlY2siLCJMaW5rYWJsZU1vZGVsIiwiTGlua1BhcmVudCIsImNvbnN0cnVjdCIsImRlZmF1bHQiLCJQYWNrYWdlIiwiU2ltcGxlU2NoZW1hIiwiZXhwb3J0RGVmYXVsdCIsImFkZEZpZWxkc1RvUHVibGlzaCIsImZpZWxkc09iaiIsIk9iamVjdCIsImFzc2lnbiIsImZpZWxkc1RvUHVibGlzaCIsImRpc3BsYXlOYW1lIiwiaXNTZWxmIiwidXNlcm5hbWUiLCJ1c2VyIiwidXNlcklkIiwiX2lkIiwiYXR0YWNoQ29sbGVjdGlvbiIsInVzZXJzIiwiVXNlcnNTY2hlbWEiLCJ0eXBlIiwiU3RyaW5nIiwib3B0aW9uYWwiLCJlbWFpbHMiLCJBcnJheSIsInJlZ0V4IiwiUmVnRXgiLCJFbWFpbCIsIkJvb2xlYW4iLCJjcmVhdGVkQXQiLCJEYXRlIiwic2VydmljZXMiLCJibGFja2JveCIsImhlYXJ0YmVhdCIsImF0dGFjaFNjaGVtYSIsInJlZ2lzdGVyUGFyZW50TW9kZWwiLCJtZXRob2RzIiwic2V0RGVmYXVsdEVtYWlsIiwiZW1haWxBZGRyZXNzIiwiZmluZE9uZSIsInVwZGF0ZSIsIiRzZXQiLCJFcnJvciIsImNhbGwiLCJkZWZhdWx0RW1haWwiLCJvYmoiLCJmaW5kIiwicmVjIiwiYWRkcmVzcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsTUFBTSxDQUFDQyxNQUFQLENBQWM7QUFBQ0MsTUFBSSxFQUFDLE1BQUlBLElBQVY7QUFBZUMsaUJBQWUsRUFB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a2FnZXMvc29jaWFsaXplX3VzZXItbW9kZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWwgUGFja2FnZSAqL1xuLyogZXNsaW50LWRpc2FibGUgaW1wb3J0L25vLXVucmVzb2x2ZWQgKi9cbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgY2hlY2sgfSBmcm9tICdtZXRlb3IvY2hlY2snO1xuaW1wb3J0IHsgTGlua2FibGVNb2RlbCwgTGlua1BhcmVudCB9IGZyb20gJ21ldGVvci9zb2NpYWxpemU6bGlua2FibGUtbW9kZWwnO1xuLyogZXNsaW50LWVuYWJsZSBpbXBvcnQvbm8tdW5yZXNvbHZlZCAqL1xuXG5pbXBvcnQgY29uc3RydWN0IGZyb20gJy4vdXNlci1tb2RlbC5qcyc7XG5cbmNvbnN0IHsgVXNlciwgVXNlcnNDb2xsZWN0aW9uIH0gPSBjb25zdHJ1Y3QoeyBNZXRlb3IsIFBhY2thZ2UsIGNoZWNrLCBMaW5rYWJsZU1vZGVsLCBMaW5rUGFyZW50IH0pO1xuXG5leHBvcnQgeyBVc2VyLCBVc2Vyc0NvbGxlY3Rpb24gfTtcbiIsIi8qIGVzbGludC1kaXNhYmxlIGltcG9ydC9uby11bnJlc29sdmVkICovXG5pbXBvcnQgU2ltcGxlU2NoZW1hIGZyb20gJ3NpbXBsLXNjaGVtYSc7XG4vKiBlc2xpbnQtZW5hYmxlIGltcG9ydC9uby11bnJlc29sdmVkICovXG5cblxuZXhwb3J0IGRlZmF1bHQgKHsgTWV0ZW9yLCBQYWNrYWdlLCBjaGVjaywgTGlua2FibGVNb2RlbCwgTGlua1BhcmVudCB9KSA9PiB7XG4gICAgLyoqXG4gICAgKiBSZXByZXNlbnRzIGEgVXNlclxuICAgICogQGNsYXNzIFVzZXJcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBkb2N1bWVudCBBbiBvYmplY3QgcmVwcmVzZW50aW5nIGEgdXNlciB1c3VzYWxseSBhIE1vbmdvIGRvY3VtZW50XG4gICAgKi9cbiAgICBjbGFzcyBVc2VyIGV4dGVuZHMgTGlua1BhcmVudCB7IC8vZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICBzdGF0aWMgZmllbGRzVG9QdWJsaXNoID0geyB1c2VybmFtZTogMSB9O1xuXG4gICAgICAgIHN0YXRpYyBhZGRGaWVsZHNUb1B1Ymxpc2goZmllbGRzT2JqKSB7XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMuZmllbGRzVG9QdWJsaXNoLCBmaWVsZHNPYmopO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogVGhlIHBlcnNvbmFsIG5hbWUgb2YgdGhlIHVzZXIgYWNjb3VudCwgWW91IGlmIHRoZSB0aGUgdXNlciByZXByZXNlbnRzIHRoZVxuICAgICAgICAqIGN1cnJlbnRseSBsb2dnZWQgaW4gdXNlciwgb3IgdGhpcy51c2VybmFtZSBvdGhlcndpc2VcbiAgICAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBBIG5hbWUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHVzZXIgYWNjb3VudFxuICAgICAgICAqL1xuICAgICAgICBkaXNwbGF5TmFtZSgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlzU2VsZigpID8gJ1lvdScgOiB0aGlzLnVzZXJuYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICogQ2hlY2sgaWYgdGhlIHRoaXMgdXNlciBpcyB0aGUgY3VycmVudCBsb2dnZWQgaW4gdXNlciBvciB0aGUgc3BlY2lmaWVkIHVzZXJcbiAgICAgICAgKiBAcGFyYW0gICB7T2JqZWN0fSAgdXNlciBUaGUgdXNlciB0byBjaGVjayBhZ2FpbnN0XG4gICAgICAgICogQHJldHVybnMge0Jvb2xlYW59IFdoZXRoZXIgb3Igbm90IHRoaXMgdXNlciBpcyB0aGUgc2FtZSBhcyB0aGUgc3BlY2lmaWVkIHVzZXJcbiAgICAgICAgKi9cbiAgICAgICAgaXNTZWxmKHVzZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9ICh1c2VyICYmIHVzZXIuX2lkKSB8fCBNZXRlb3IudXNlcklkKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pZCA9PT0gdXNlcklkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgVXNlci5hdHRhY2hDb2xsZWN0aW9uKE1ldGVvci51c2Vycyk7XG5cbiAgICBjb25zdCBVc2Vyc1NjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xuICAgICAgICB1c2VybmFtZToge1xuICAgICAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICAgICAgLy8gRm9yIGFjY291bnRzLXBhc3N3b3JkLCBlaXRoZXIgZW1haWxzIG9yIHVzZXJuYW1lIGlzIHJlcXVpcmVkLCBidXQgbm90IGJvdGguIEl0IGlzIE9LIHRvIG1ha2UgdGhpc1xuICAgICAgICAgICAgLy8gb3B0aW9uYWwgaGVyZSBiZWNhdXNlIHRoZSBhY2NvdW50cy1wYXNzd29yZCBwYWNrYWdlIGRvZXMgaXRzIG93biB2YWxpZGF0aW9uLlxuICAgICAgICAgICAgLy8gVGhpcmQtcGFydHkgbG9naW4gcGFja2FnZXMgbWF5IG5vdCByZXF1aXJlIGVpdGhlci4gQWRqdXN0IHRoaXMgc2NoZW1hIGFzIG5lY2Vzc2FyeSBmb3IgeW91ciB1c2FnZS5cbiAgICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBlbWFpbHM6IHtcbiAgICAgICAgICAgIHR5cGU6IEFycmF5LFxuICAgICAgICAgICAgLy8gRm9yIGFjY291bnRzLXBhc3N3b3JkLCBlaXRoZXIgZW1haWxzIG9yIHVzZXJuYW1lIGlzIHJlcXVpcmVkLCBidXQgbm90IGJvdGguIEl0IGlzIE9LIHRvIG1ha2UgdGhpc1xuICAgICAgICAgICAgLy8gb3B0aW9uYWwgaGVyZSBiZWNhdXNlIHRoZSBhY2NvdW50cy1wYXNzd29yZCBwYWNrYWdlIGRvZXMgaXRzIG93biB2YWxpZGF0aW9uLlxuICAgICAgICAgICAgLy8gVGhpcmQtcGFydHkgbG9naW4gcGFja2FnZXMgbWF5IG5vdCByZXF1aXJlIGVpdGhlci4gQWRqdXN0IHRoaXMgc2NoZW1hIGFzIG5lY2Vzc2FyeSBmb3IgeW91ciB1c2FnZS5cbiAgICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICAnZW1haWxzLiQnOiB7XG4gICAgICAgICAgICB0eXBlOiBPYmplY3QsXG4gICAgICAgIH0sXG4gICAgICAgICdlbWFpbHMuJC5hZGRyZXNzJzoge1xuICAgICAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICAgICAgcmVnRXg6IFNpbXBsZVNjaGVtYS5SZWdFeC5FbWFpbCxcbiAgICAgICAgfSxcbiAgICAgICAgJ2VtYWlscy4kLnZlcmlmaWVkJzoge1xuICAgICAgICAgICAgdHlwZTogQm9vbGVhbixcbiAgICAgICAgfSxcbiAgICAgICAgJ2VtYWlscy4kLmRlZmF1bHQnOiB7XG4gICAgICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICAgICAgb3B0aW9uYWw6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgdHlwZTogRGF0ZSxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoaXMgc2VydmljZXMgZmllbGQgaXMgaW4geW91ciBzY2hlbWEgaWYgeW91J3JlIHVzaW5nIGFueSBvZiB0aGUgYWNjb3VudHMgcGFja2FnZXNcbiAgICAgICAgc2VydmljZXM6IHtcbiAgICAgICAgICAgIHR5cGU6IE9iamVjdCxcbiAgICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICAgICAgYmxhY2tib3g6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIGhlYXJ0YmVhdDoge1xuICAgICAgICAgICAgdHlwZTogRGF0ZSxcbiAgICAgICAgICAgIG9wdGlvbmFsOiB0cnVlLFxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgVXNlci5hdHRhY2hTY2hlbWEoVXNlcnNTY2hlbWEpO1xuXG4gICAgTGlua2FibGVNb2RlbC5yZWdpc3RlclBhcmVudE1vZGVsKFVzZXIpO1xuXG5cbiAgICBpZiAoUGFja2FnZVsnYWNjb3VudHMtcGFzc3dvcmQnXSkge1xuICAgICAgICBNZXRlb3IubWV0aG9kcyAmJiBNZXRlb3IubWV0aG9kcyh7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogU2V0cyB0aGUgZGVmYXVsdCBlbWFpbCBmb3IgdGhlIGN1cnJlbnRseSBsb2dnZWQgaW4gdXNlcnNcbiAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGVtYWlsQWRkcmVzcyBUaGUgZW1haWwgYWRkcmVzcyB0byBzZXQgYXMgdGhlIGN1cnJlbnRcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBzZXREZWZhdWx0RW1haWwoZW1haWxBZGRyZXNzKSB7XG4gICAgICAgICAgICAgICAgY2hlY2soZW1haWxBZGRyZXNzLCBTdHJpbmcpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnVzZXJJZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyID0gTWV0ZW9yLnVzZXJzLmZpbmRPbmUoeyBfaWQ6IHRoaXMudXNlcklkLCAnZW1haWxzLmFkZHJlc3MnOiBlbWFpbEFkZHJlc3MgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBNZXRlb3IudXNlcnMudXBkYXRlKHsgX2lkOiB0aGlzLnVzZXJJZCwgJ2VtYWlscy5kZWZhdWx0JzogdHJ1ZSB9LCB7ICRzZXQ6IHsgJ2VtYWlscy4kLmRlZmF1bHQnOiBmYWxzZSB9IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7IF9pZDogdGhpcy51c2VySWQsICdlbWFpbHMuYWRkcmVzcyc6IGVtYWlsQWRkcmVzcyB9LCB7ICRzZXQ6IHsgJ2VtYWlscy4kLmRlZmF1bHQnOiB0cnVlIH0gfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKCdOb3RBdXRob3JpemVkJywgJ1lvdSBtdXN0IGJlIGxvZ2dlZCBpbiB0byBwZXJmb3JtIHRoaXMgb3BlcmF0aW9uLicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIFVzZXIubWV0aG9kcyh7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogU2V0IHRoZSBkZWZhdWx0IGVtYWlsIGFkZHJlc3MgZm9yIHRoZSB1c2VyXG4gICAgICAgICAgICAqIEBwYXJhbSB7W3R5cGVdfSBlbWFpbEFkZHJlc3MgW2Rlc2NyaXB0aW9uXVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHNldERlZmF1bHRFbWFpbChlbWFpbEFkZHJlc3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoTWV0ZW9yLnVzZXIoKS5pc1NlbGYoKSkge1xuICAgICAgICAgICAgICAgICAgICBNZXRlb3IuY2FsbCgnc2V0RGVmYXVsdEVtYWlsJywgZW1haWxBZGRyZXNzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEdldCB0aGUgZGVmYXVsdCBlbWFpbCBhZGRyZXNzIGZvciB0aGUgdXNlclxuICAgICAgICAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgdXNlcnMgZGVmYXVsdCBlbWFpbCBhZGRyZXNzXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgZGVmYXVsdEVtYWlsKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9iaiA9IHRoaXMuZW1haWxzLmZpbmQocmVjID0+IHJlYy5kZWZhdWx0ID09PSB0cnVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gKG9iaiAmJiBvYmouYWRkcmVzcykgfHwgdGhpcy5lbWFpbHNbMF0uYWRkcmVzcztcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7IFVzZXIsIFVzZXJzQ29sbGVjdGlvbjogTWV0ZW9yLnVzZXJzIH07XG59O1xuIl19
