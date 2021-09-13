(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var DDPRateLimiter = Package['ddp-rate-limiter'].DDPRateLimiter;
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var Hook = Package['callback-hook'].Hook;
var URL = Package.url.URL;
var URLSearchParams = Package.url.URLSearchParams;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Accounts, options, stampedLoginToken, handler, name, query, oldestValidDate, user;

var require = meteorInstall({"node_modules":{"meteor":{"accounts-base":{"server_main.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/accounts-base/server_main.js                                                                            //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
!function (module1) {
  module1.export({
    AccountsServer: () => AccountsServer
  });
  let AccountsServer;
  module1.link("./accounts_server.js", {
    AccountsServer(v) {
      AccountsServer = v;
    }

  }, 0);

  /**
   * @namespace Accounts
   * @summary The namespace for all server-side accounts-related methods.
   */
  Accounts = new AccountsServer(Meteor.server); // Users table. Don't use the normal autopublish, since we want to hide
  // some fields. Code to autopublish this is in accounts_server.js.
  // XXX Allow users to configure this collection name.

  /**
   * @summary A [Mongo.Collection](#collections) containing user documents.
   * @locus Anywhere
   * @type {Mongo.Collection}
   * @importFromPackage meteor
  */

  Meteor.users = Accounts.users;
}.call(this, module);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"accounts_common.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/accounts-base/accounts_common.js                                                                        //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
module.export({
  AccountsCommon: () => AccountsCommon,
  EXPIRE_TOKENS_INTERVAL_MS: () => EXPIRE_TOKENS_INTERVAL_MS,
  CONNECTION_CLOSE_DELAY_MS: () => CONNECTION_CLOSE_DELAY_MS
});

class AccountsCommon {
  constructor(options) {
    // Currently this is read directly by packages like accounts-password
    // and accounts-ui-unstyled.
    this._options = {}; // Note that setting this.connection = null causes this.users to be a
    // LocalCollection, which is not what we want.

    this.connection = undefined;

    this._initConnection(options || {}); // There is an allow call in accounts_server.js that restricts writes to
    // this collection.


    this.users = new Mongo.Collection("users", {
      _preventAutopublish: true,
      connection: this.connection
    }); // Callback exceptions are printed with Meteor._debug and ignored.

    this._onLoginHook = new Hook({
      bindEnvironment: false,
      debugPrintExceptions: "onLogin callback"
    });
    this._onLoginFailureHook = new Hook({
      bindEnvironment: false,
      debugPrintExceptions: "onLoginFailure callback"
    });
    this._onLogoutHook = new Hook({
      bindEnvironment: false,
      debugPrintExceptions: "onLogout callback"
    }); // Expose for testing.

    this.DEFAULT_LOGIN_EXPIRATION_DAYS = DEFAULT_LOGIN_EXPIRATION_DAYS;
    this.LOGIN_UNEXPIRING_TOKEN_DAYS = LOGIN_UNEXPIRING_TOKEN_DAYS; // Thrown when the user cancels the login process (eg, closes an oauth
    // popup, declines retina scan, etc)

    const lceName = 'Accounts.LoginCancelledError';
    this.LoginCancelledError = Meteor.makeErrorType(lceName, function (description) {
      this.message = description;
    });
    this.LoginCancelledError.prototype.name = lceName; // This is used to transmit specific subclass errors over the wire. We
    // should come up with a more generic way to do this (eg, with some sort of
    // symbolic error code rather than a number).

    this.LoginCancelledError.numericError = 0x8acdc2f; // loginServiceConfiguration and ConfigError are maintained for backwards compatibility

    Meteor.startup(() => {
      const {
        ServiceConfiguration
      } = Package['service-configuration'];
      this.loginServiceConfiguration = ServiceConfiguration.configurations;
      this.ConfigError = ServiceConfiguration.ConfigError;
    });
  }
  /**
   * @summary Get the current user id, or `null` if no user is logged in. A reactive data source.
   * @locus Anywhere
   */


  userId() {
    throw new Error("userId method not implemented");
  } // merge the defaultFieldSelector with an existing options object


  _addDefaultFieldSelector() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    // this will be the most common case for most people, so make it quick
    if (!this._options.defaultFieldSelector) return options; // if no field selector then just use defaultFieldSelector

    if (!options.fields) return _objectSpread(_objectSpread({}, options), {}, {
      fields: this._options.defaultFieldSelector
    }); // if empty field selector then the full user object is explicitly requested, so obey

    const keys = Object.keys(options.fields);
    if (!keys.length) return options; // if the requested fields are +ve then ignore defaultFieldSelector
    // assume they are all either +ve or -ve because Mongo doesn't like mixed

    if (!!options.fields[keys[0]]) return options; // The requested fields are -ve.
    // If the defaultFieldSelector is +ve then use requested fields, otherwise merge them

    const keys2 = Object.keys(this._options.defaultFieldSelector);
    return this._options.defaultFieldSelector[keys2[0]] ? options : _objectSpread(_objectSpread({}, options), {}, {
      fields: _objectSpread(_objectSpread({}, options.fields), this._options.defaultFieldSelector)
    });
  }
  /**
   * @summary Get the current user record, or `null` if no user is logged in. A reactive data source.
   * @locus Anywhere
   * @param {Object} [options]
   * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
   */


  user(options) {
    const userId = this.userId();
    return userId ? this.users.findOne(userId, this._addDefaultFieldSelector(options)) : null;
  } // Set up config for the accounts system. Call this on both the client
  // and the server.
  //
  // Note that this method gets overridden on AccountsServer.prototype, but
  // the overriding method calls the overridden method.
  //
  // XXX we should add some enforcement that this is called on both the
  // client and the server. Otherwise, a user can
  // 'forbidClientAccountCreation' only on the client and while it looks
  // like their app is secure, the server will still accept createUser
  // calls. https://github.com/meteor/meteor/issues/828
  //
  // @param options {Object} an object with fields:
  // - sendVerificationEmail {Boolean}
  //     Send email address verification emails to new users created from
  //     client signups.
  // - forbidClientAccountCreation {Boolean}
  //     Do not allow clients to create accounts directly.
  // - restrictCreationByEmailDomain {Function or String}
  //     Require created users to have an email matching the function or
  //     having the string as domain.
  // - loginExpirationInDays {Number}
  //     Number of days since login until a user is logged out (login token
  //     expires).
  // - passwordResetTokenExpirationInDays {Number}
  //     Number of days since password reset token creation until the
  //     token cannt be used any longer (password reset token expires).
  // - ambiguousErrorMessages {Boolean}
  //     Return ambiguous error messages from login failures to prevent
  //     user enumeration.
  // - bcryptRounds {Number}
  //     Allows override of number of bcrypt rounds (aka work factor) used
  //     to store passwords.

  /**
   * @summary Set global accounts options.
   * @locus Anywhere
   * @param {Object} options
   * @param {Boolean} options.sendVerificationEmail New users with an email address will receive an address verification email.
   * @param {Boolean} options.forbidClientAccountCreation Calls to [`createUser`](#accounts_createuser) from the client will be rejected. In addition, if you are using [accounts-ui](#accountsui), the "Create account" link will not be available.
   * @param {String | Function} options.restrictCreationByEmailDomain If set to a string, only allows new users if the domain part of their email address matches the string. If set to a function, only allows new users if the function returns true.  The function is passed the full email address of the proposed new user.  Works with password-based sign-in and external services that expose email addresses (Google, Facebook, GitHub). All existing users still can log in after enabling this option. Example: `Accounts.config({ restrictCreationByEmailDomain: 'school.edu' })`.
   * @param {Number} options.loginExpirationInDays The number of days from when a user logs in until their token expires and they are logged out. Defaults to 90. Set to `null` to disable login expiration.
   * @param {Number} options.loginExpiration The number of milliseconds from when a user logs in until their token expires and they are logged out, for a more granular control. If `loginExpirationInDays` is set, it takes precedent.
   * @param {String} options.oauthSecretKey When using the `oauth-encryption` package, the 16 byte key using to encrypt sensitive account credentials in the database, encoded in base64.  This option may only be specified on the server.  See packages/oauth-encryption/README.md for details.
   * @param {Number} options.passwordResetTokenExpirationInDays The number of days from when a link to reset password is sent until token expires and user can't reset password with the link anymore. Defaults to 3.
   * @param {Number} options.passwordResetTokenExpiration The number of milliseconds from when a link to reset password is sent until token expires and user can't reset password with the link anymore. If `passwordResetTokenExpirationInDays` is set, it takes precedent.
   * @param {Number} options.passwordEnrollTokenExpirationInDays The number of days from when a link to set initial password is sent until token expires and user can't set password with the link anymore. Defaults to 30.
   * @param {Number} options.passwordEnrollTokenExpiration The number of milliseconds from when a link to set initial password is sent until token expires and user can't set password with the link anymore. If `passwordEnrollTokenExpirationInDays` is set, it takes precedent.
   * @param {Boolean} options.ambiguousErrorMessages Return ambiguous error messages from login failures to prevent user enumeration. Defaults to false.
   * @param {MongoFieldSpecifier} options.defaultFieldSelector To exclude by default large custom fields from `Meteor.user()` and `Meteor.findUserBy...()` functions when called without a field selector, and all `onLogin`, `onLoginFailure` and `onLogout` callbacks.  Example: `Accounts.config({ defaultFieldSelector: { myBigArray: 0 }})`. Beware when using this. If, for instance, you do not include `email` when excluding the fields, you can have problems with functions like `forgotPassword` that will break because they won't have the required data available. It's recommend that you always keep the fields `_id`, `username`, and `email`.
   */


  config(options) {
    // We don't want users to accidentally only call Accounts.config on the
    // client, where some of the options will have partial effects (eg removing
    // the "create account" button from accounts-ui if forbidClientAccountCreation
    // is set, or redirecting Google login to a specific-domain page) without
    // having their full effects.
    if (Meteor.isServer) {
      __meteor_runtime_config__.accountsConfigCalled = true;
    } else if (!__meteor_runtime_config__.accountsConfigCalled) {
      // XXX would be nice to "crash" the client and replace the UI with an error
      // message, but there's no trivial way to do this.
      Meteor._debug("Accounts.config was called on the client but not on the " + "server; some configuration options may not take effect.");
    } // We need to validate the oauthSecretKey option at the time
    // Accounts.config is called. We also deliberately don't store the
    // oauthSecretKey in Accounts._options.


    if (Object.prototype.hasOwnProperty.call(options, 'oauthSecretKey')) {
      if (Meteor.isClient) {
        throw new Error("The oauthSecretKey option may only be specified on the server");
      }

      if (!Package["oauth-encryption"]) {
        throw new Error("The oauth-encryption package must be loaded to set oauthSecretKey");
      }

      Package["oauth-encryption"].OAuthEncryption.loadKey(options.oauthSecretKey);
      options = _objectSpread({}, options);
      delete options.oauthSecretKey;
    } // validate option keys


    const VALID_KEYS = ["sendVerificationEmail", "forbidClientAccountCreation", "passwordEnrollTokenExpiration", "passwordEnrollTokenExpirationInDays", "restrictCreationByEmailDomain", "loginExpirationInDays", "loginExpiration", "passwordResetTokenExpirationInDays", "passwordResetTokenExpiration", "ambiguousErrorMessages", "bcryptRounds", "defaultFieldSelector"];
    Object.keys(options).forEach(key => {
      if (!VALID_KEYS.includes(key)) {
        throw new Error("Accounts.config: Invalid key: ".concat(key));
      }
    }); // set values in Accounts._options

    VALID_KEYS.forEach(key => {
      if (key in options) {
        if (key in this._options) {
          throw new Error("Can't set `".concat(key, "` more than once"));
        }

        this._options[key] = options[key];
      }
    });
  }
  /**
   * @summary Register a callback to be called after a login attempt succeeds.
   * @locus Anywhere
   * @param {Function} func The callback to be called when login is successful.
   *                        The callback receives a single object that
   *                        holds login details. This object contains the login
   *                        result type (password, resume, etc.) on both the
   *                        client and server. `onLogin` callbacks registered
   *                        on the server also receive extra data, such
   *                        as user details, connection information, etc.
   */


  onLogin(func) {
    let ret = this._onLoginHook.register(func); // call the just registered callback if already logged in


    this._startupCallback(ret.callback);

    return ret;
  }
  /**
   * @summary Register a callback to be called after a login attempt fails.
   * @locus Anywhere
   * @param {Function} func The callback to be called after the login has failed.
   */


  onLoginFailure(func) {
    return this._onLoginFailureHook.register(func);
  }
  /**
   * @summary Register a callback to be called after a logout attempt succeeds.
   * @locus Anywhere
   * @param {Function} func The callback to be called when logout is successful.
   */


  onLogout(func) {
    return this._onLogoutHook.register(func);
  }

  _initConnection(options) {
    if (!Meteor.isClient) {
      return;
    } // The connection used by the Accounts system. This is the connection
    // that will get logged in by Meteor.login(), and this is the
    // connection whose login state will be reflected by Meteor.userId().
    //
    // It would be much preferable for this to be in accounts_client.js,
    // but it has to be here because it's needed to create the
    // Meteor.users collection.


    if (options.connection) {
      this.connection = options.connection;
    } else if (options.ddpUrl) {
      this.connection = DDP.connect(options.ddpUrl);
    } else if (typeof __meteor_runtime_config__ !== "undefined" && __meteor_runtime_config__.ACCOUNTS_CONNECTION_URL) {
      // Temporary, internal hook to allow the server to point the client
      // to a different authentication server. This is for a very
      // particular use case that comes up when implementing a oauth
      // server. Unsupported and may go away at any point in time.
      //
      // We will eventually provide a general way to use account-base
      // against any DDP connection, not just one special one.
      this.connection = DDP.connect(__meteor_runtime_config__.ACCOUNTS_CONNECTION_URL);
    } else {
      this.connection = Meteor.connection;
    }
  }

  _getTokenLifetimeMs() {
    // When loginExpirationInDays is set to null, we'll use a really high
    // number of days (LOGIN_UNEXPIRABLE_TOKEN_DAYS) to simulate an
    // unexpiring token.
    const loginExpirationInDays = this._options.loginExpirationInDays === null ? LOGIN_UNEXPIRING_TOKEN_DAYS : this._options.loginExpirationInDays;
    return this._options.loginExpiration || (loginExpirationInDays || DEFAULT_LOGIN_EXPIRATION_DAYS) * 86400000;
  }

  _getPasswordResetTokenLifetimeMs() {
    return this._options.passwordResetTokenExpiration || (this._options.passwordResetTokenExpirationInDays || DEFAULT_PASSWORD_RESET_TOKEN_EXPIRATION_DAYS) * 86400000;
  }

  _getPasswordEnrollTokenLifetimeMs() {
    return this._options.passwordEnrollTokenExpiration || (this._options.passwordEnrollTokenExpirationInDays || DEFAULT_PASSWORD_ENROLL_TOKEN_EXPIRATION_DAYS) * 86400000;
  }

  _tokenExpiration(when) {
    // We pass when through the Date constructor for backwards compatibility;
    // `when` used to be a number.
    return new Date(new Date(when).getTime() + this._getTokenLifetimeMs());
  }

  _tokenExpiresSoon(when) {
    let minLifetimeMs = .1 * this._getTokenLifetimeMs();

    const minLifetimeCapMs = MIN_TOKEN_LIFETIME_CAP_SECS * 1000;

    if (minLifetimeMs > minLifetimeCapMs) {
      minLifetimeMs = minLifetimeCapMs;
    }

    return new Date() > new Date(when) - minLifetimeMs;
  } // No-op on the server, overridden on the client.


  _startupCallback(callback) {}

}

// Note that Accounts is defined separately in accounts_client.js and
// accounts_server.js.

/**
 * @summary Get the current user id, or `null` if no user is logged in. A reactive data source.
 * @locus Anywhere but publish functions
 * @importFromPackage meteor
 */
Meteor.userId = () => Accounts.userId();
/**
 * @summary Get the current user record, or `null` if no user is logged in. A reactive data source.
 * @locus Anywhere but publish functions
 * @importFromPackage meteor
 * @param {Object} [options]
 * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
 */


Meteor.user = options => Accounts.user(options); // how long (in days) until a login token expires


const DEFAULT_LOGIN_EXPIRATION_DAYS = 90; // how long (in days) until reset password token expires

const DEFAULT_PASSWORD_RESET_TOKEN_EXPIRATION_DAYS = 3; // how long (in days) until enrol password token expires

const DEFAULT_PASSWORD_ENROLL_TOKEN_EXPIRATION_DAYS = 30; // Clients don't try to auto-login with a token that is going to expire within
// .1 * DEFAULT_LOGIN_EXPIRATION_DAYS, capped at MIN_TOKEN_LIFETIME_CAP_SECS.
// Tries to avoid abrupt disconnects from expiring tokens.

const MIN_TOKEN_LIFETIME_CAP_SECS = 3600; // one hour
// how often (in milliseconds) we check for expired tokens

const EXPIRE_TOKENS_INTERVAL_MS = 600 * 1000;
const CONNECTION_CLOSE_DELAY_MS = 10 * 1000;
// A large number of expiration days (approximately 100 years worth) that is
// used when creating unexpiring tokens.
const LOGIN_UNEXPIRING_TOKEN_DAYS = 365 * 100;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"accounts_server.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/accounts-base/accounts_server.js                                                                        //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
  AccountsServer: () => AccountsServer
});
let crypto;
module.link("crypto", {
  default(v) {
    crypto = v;
  }

}, 0);
let AccountsCommon, EXPIRE_TOKENS_INTERVAL_MS, CONNECTION_CLOSE_DELAY_MS;
module.link("./accounts_common.js", {
  AccountsCommon(v) {
    AccountsCommon = v;
  },

  EXPIRE_TOKENS_INTERVAL_MS(v) {
    EXPIRE_TOKENS_INTERVAL_MS = v;
  },

  CONNECTION_CLOSE_DELAY_MS(v) {
    CONNECTION_CLOSE_DELAY_MS = v;
  }

}, 1);
let URL;
module.link("meteor/url", {
  URL(v) {
    URL = v;
  }

}, 2);
const hasOwn = Object.prototype.hasOwnProperty;
/**
 * @summary Constructor for the `Accounts` namespace on the server.
 * @locus Server
 * @class AccountsServer
 * @extends AccountsCommon
 * @instancename accountsServer
 * @param {Object} server A server object such as `Meteor.server`.
 */

class AccountsServer extends AccountsCommon {
  // Note that this constructor is less likely to be instantiated multiple
  // times than the `AccountsClient` constructor, because a single server
  // can provide only one set of methods.
  constructor(server) {
    super();
    this._server = server || Meteor.server; // Set up the server's methods, as if by calling Meteor.methods.

    this._initServerMethods();

    this._initAccountDataHooks(); // If autopublish is on, publish these user fields. Login service
    // packages (eg accounts-google) add to these by calling
    // addAutopublishFields.  Notably, this isn't implemented with multiple
    // publishes since DDP only merges only across top-level fields, not
    // subfields (such as 'services.facebook.accessToken')


    this._autopublishFields = {
      loggedInUser: ['profile', 'username', 'emails'],
      otherUsers: ['profile', 'username']
    }; // use object to keep the reference when used in functions
    // where _defaultPublishFields is destructured into lexical scope
    // for publish callbacks that need `this`

    this._defaultPublishFields = {
      projection: {
        profile: 1,
        username: 1,
        emails: 1
      }
    };

    this._initServerPublications(); // connectionId -> {connection, loginToken}


    this._accountData = {}; // connection id -> observe handle for the login token that this connection is
    // currently associated with, or a number. The number indicates that we are in
    // the process of setting up the observe (using a number instead of a single
    // sentinel allows multiple attempts to set up the observe to identify which
    // one was theirs).

    this._userObservesForConnections = {};
    this._nextUserObserveNumber = 1; // for the number described above.
    // list of all registered handlers.

    this._loginHandlers = [];
    setupUsersCollection(this.users);
    setupDefaultLoginHandlers(this);
    setExpireTokensInterval(this);
    this._validateLoginHook = new Hook({
      bindEnvironment: false
    });
    this._validateNewUserHooks = [defaultValidateNewUserHook.bind(this)];

    this._deleteSavedTokensForAllUsersOnStartup();

    this._skipCaseInsensitiveChecksForTest = {};
    this.urls = {
      resetPassword: (token, extraParams) => this.buildEmailUrl("#/reset-password/".concat(token), extraParams),
      verifyEmail: (token, extraParams) => this.buildEmailUrl("#/verify-email/".concat(token), extraParams),
      enrollAccount: (token, extraParams) => this.buildEmailUrl("#/enroll-account/".concat(token), extraParams)
    };
    this.addDefaultRateLimit();

    this.buildEmailUrl = function (path) {
      let extraParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      const url = new URL(Meteor.absoluteUrl(path));
      const params = Object.entries(extraParams);

      if (params.length > 0) {
        // Add additional parameters to the url
        for (const [key, value] of params) {
          url.searchParams.append(key, value);
        }
      }

      return url.toString();
    };
  } ///
  /// CURRENT USER
  ///
  // @override of "abstract" non-implementation in accounts_common.js


  userId() {
    // This function only works if called inside a method or a pubication.
    // Using any of the information from Meteor.user() in a method or
    // publish function will always use the value from when the function first
    // runs. This is likely not what the user expects. The way to make this work
    // in a method or publish function is to do Meteor.find(this.userId).observe
    // and recompute when the user record changes.
    const currentInvocation = DDP._CurrentMethodInvocation.get() || DDP._CurrentPublicationInvocation.get();

    if (!currentInvocation) throw new Error("Meteor.userId can only be invoked in method calls or publications.");
    return currentInvocation.userId;
  } ///
  /// LOGIN HOOKS
  ///

  /**
   * @summary Validate login attempts.
   * @locus Server
   * @param {Function} func Called whenever a login is attempted (either successful or unsuccessful).  A login can be aborted by returning a falsy value or throwing an exception.
   */


  validateLoginAttempt(func) {
    // Exceptions inside the hook callback are passed up to us.
    return this._validateLoginHook.register(func);
  }
  /**
   * @summary Set restrictions on new user creation.
   * @locus Server
   * @param {Function} func Called whenever a new user is created. Takes the new user object, and returns true to allow the creation or false to abort.
   */


  validateNewUser(func) {
    this._validateNewUserHooks.push(func);
  }
  /**
   * @summary Validate login from external service
   * @locus Server
   * @param {Function} func Called whenever login/user creation from external service is attempted. Login or user creation based on this login can be aborted by passing a falsy value or throwing an exception.
   */


  beforeExternalLogin(func) {
    if (this._beforeExternalLoginHook) {
      throw new Error("Can only call beforeExternalLogin once");
    }

    this._beforeExternalLoginHook = func;
  } ///
  /// CREATE USER HOOKS
  ///

  /**
   * @summary Customize new user creation.
   * @locus Server
   * @param {Function} func Called whenever a new user is created. Return the new user object, or throw an `Error` to abort the creation.
   */


  onCreateUser(func) {
    if (this._onCreateUserHook) {
      throw new Error("Can only call onCreateUser once");
    }

    this._onCreateUserHook = func;
  }
  /**
   * @summary Customize oauth user profile updates
   * @locus Server
   * @param {Function} func Called whenever a user is logged in via oauth. Return the profile object to be merged, or throw an `Error` to abort the creation.
   */


  onExternalLogin(func) {
    if (this._onExternalLoginHook) {
      throw new Error("Can only call onExternalLogin once");
    }

    this._onExternalLoginHook = func;
  }
  /**
   * @summary Customize user selection on external logins
   * @locus Server
   * @param {Function} func Called whenever a user is logged in via oauth and a
   * user is not found with the service id. Return the user or undefined.
   */


  setAdditionalFindUserOnExternalLogin(func) {
    if (this._additionalFindUserOnExternalLogin) {
      throw new Error("Can only call setAdditionalFindUserOnExternalLogin once");
    }

    this._additionalFindUserOnExternalLogin = func;
  }

  _validateLogin(connection, attempt) {
    this._validateLoginHook.each(callback => {
      let ret;

      try {
        ret = callback(cloneAttemptWithConnection(connection, attempt));
      } catch (e) {
        attempt.allowed = false; // XXX this means the last thrown error overrides previous error
        // messages. Maybe this is surprising to users and we should make
        // overriding errors more explicit. (see
        // https://github.com/meteor/meteor/issues/1960)

        attempt.error = e;
        return true;
      }

      if (!ret) {
        attempt.allowed = false; // don't override a specific error provided by a previous
        // validator or the initial attempt (eg "incorrect password").

        if (!attempt.error) attempt.error = new Meteor.Error(403, "Login forbidden");
      }

      return true;
    });
  }

  _successfulLogin(connection, attempt) {
    this._onLoginHook.each(callback => {
      callback(cloneAttemptWithConnection(connection, attempt));
      return true;
    });
  }

  _failedLogin(connection, attempt) {
    this._onLoginFailureHook.each(callback => {
      callback(cloneAttemptWithConnection(connection, attempt));
      return true;
    });
  }

  _successfulLogout(connection, userId) {
    // don't fetch the user object unless there are some callbacks registered
    let user;

    this._onLogoutHook.each(callback => {
      if (!user && userId) user = this.users.findOne(userId, {
        fields: this._options.defaultFieldSelector
      });
      callback({
        user,
        connection
      });
      return true;
    });
  }

  ///
  /// LOGIN METHODS
  ///
  // Login methods return to the client an object containing these
  // fields when the user was logged in successfully:
  //
  //   id: userId
  //   token: *
  //   tokenExpires: *
  //
  // tokenExpires is optional and intends to provide a hint to the
  // client as to when the token will expire. If not provided, the
  // client will call Accounts._tokenExpiration, passing it the date
  // that it received the token.
  //
  // The login method will throw an error back to the client if the user
  // failed to log in.
  //
  //
  // Login handlers and service specific login methods such as
  // `createUser` internally return a `result` object containing these
  // fields:
  //
  //   type:
  //     optional string; the service name, overrides the handler
  //     default if present.
  //
  //   error:
  //     exception; if the user is not allowed to login, the reason why.
  //
  //   userId:
  //     string; the user id of the user attempting to login (if
  //     known), required for an allowed login.
  //
  //   options:
  //     optional object merged into the result returned by the login
  //     method; used by HAMK from SRP.
  //
  //   stampedLoginToken:
  //     optional object with `token` and `when` indicating the login
  //     token is already present in the database, returned by the
  //     "resume" login handler.
  //
  // For convenience, login methods can also throw an exception, which
  // is converted into an {error} result.  However, if the id of the
  // user attempting the login is known, a {userId, error} result should
  // be returned instead since the user id is not captured when an
  // exception is thrown.
  //
  // This internal `result` object is automatically converted into the
  // public {id, token, tokenExpires} object returned to the client.
  // Try a login method, converting thrown exceptions into an {error}
  // result.  The `type` argument is a default, inserted into the result
  // object if not explicitly returned.
  //
  // Log in a user on a connection.
  //
  // We use the method invocation to set the user id on the connection,
  // not the connection object directly. setUserId is tied to methods to
  // enforce clear ordering of method application (using wait methods on
  // the client, and a no setUserId after unblock restriction on the
  // server)
  //
  // The `stampedLoginToken` parameter is optional.  When present, it
  // indicates that the login token has already been inserted into the
  // database and doesn't need to be inserted again.  (It's used by the
  // "resume" login handler).
  _loginUser(methodInvocation, userId, stampedLoginToken) {
    if (!stampedLoginToken) {
      stampedLoginToken = this._generateStampedLoginToken();

      this._insertLoginToken(userId, stampedLoginToken);
    } // This order (and the avoidance of yields) is important to make
    // sure that when publish functions are rerun, they see a
    // consistent view of the world: the userId is set and matches
    // the login token on the connection (not that there is
    // currently a public API for reading the login token on a
    // connection).


    Meteor._noYieldsAllowed(() => this._setLoginToken(userId, methodInvocation.connection, this._hashLoginToken(stampedLoginToken.token)));

    methodInvocation.setUserId(userId);
    return {
      id: userId,
      token: stampedLoginToken.token,
      tokenExpires: this._tokenExpiration(stampedLoginToken.when)
    };
  }

  // After a login method has completed, call the login hooks.  Note
  // that `attemptLogin` is called for *all* login attempts, even ones
  // which aren't successful (such as an invalid password, etc).
  //
  // If the login is allowed and isn't aborted by a validate login hook
  // callback, log in the user.
  //
  _attemptLogin(methodInvocation, methodName, methodArgs, result) {
    if (!result) throw new Error("result is required"); // XXX A programming error in a login handler can lead to this occurring, and
    // then we don't call onLogin or onLoginFailure callbacks. Should
    // tryLoginMethod catch this case and turn it into an error?

    if (!result.userId && !result.error) throw new Error("A login method must specify a userId or an error");
    let user;
    if (result.userId) user = this.users.findOne(result.userId, {
      fields: this._options.defaultFieldSelector
    });
    const attempt = {
      type: result.type || "unknown",
      allowed: !!(result.userId && !result.error),
      methodName: methodName,
      methodArguments: Array.from(methodArgs)
    };

    if (result.error) {
      attempt.error = result.error;
    }

    if (user) {
      attempt.user = user;
    } // _validateLogin may mutate `attempt` by adding an error and changing allowed
    // to false, but that's the only change it can make (and the user's callbacks
    // only get a clone of `attempt`).


    this._validateLogin(methodInvocation.connection, attempt);

    if (attempt.allowed) {
      const ret = _objectSpread(_objectSpread({}, this._loginUser(methodInvocation, result.userId, result.stampedLoginToken)), result.options);

      ret.type = attempt.type;

      this._successfulLogin(methodInvocation.connection, attempt);

      return ret;
    } else {
      this._failedLogin(methodInvocation.connection, attempt);

      throw attempt.error;
    }
  }

  // All service specific login methods should go through this function.
  // Ensure that thrown exceptions are caught and that login hook
  // callbacks are still called.
  //
  _loginMethod(methodInvocation, methodName, methodArgs, type, fn) {
    return this._attemptLogin(methodInvocation, methodName, methodArgs, tryLoginMethod(type, fn));
  }

  // Report a login attempt failed outside the context of a normal login
  // method. This is for use in the case where there is a multi-step login
  // procedure (eg SRP based password login). If a method early in the
  // chain fails, it should call this function to report a failure. There
  // is no corresponding method for a successful login; methods that can
  // succeed at logging a user in should always be actual login methods
  // (using either Accounts._loginMethod or Accounts.registerLoginHandler).
  _reportLoginFailure(methodInvocation, methodName, methodArgs, result) {
    const attempt = {
      type: result.type || "unknown",
      allowed: false,
      error: result.error,
      methodName: methodName,
      methodArguments: Array.from(methodArgs)
    };

    if (result.userId) {
      attempt.user = this.users.findOne(result.userId, {
        fields: this._options.defaultFieldSelector
      });
    }

    this._validateLogin(methodInvocation.connection, attempt);

    this._failedLogin(methodInvocation.connection, attempt); // _validateLogin may mutate attempt to set a new error message. Return
    // the modified version.


    return attempt;
  }

  ///
  /// LOGIN HANDLERS
  ///
  // The main entry point for auth packages to hook in to login.
  //
  // A login handler is a login method which can return `undefined` to
  // indicate that the login request is not handled by this handler.
  //
  // @param name {String} Optional.  The service name, used by default
  // if a specific service name isn't returned in the result.
  //
  // @param handler {Function} A function that receives an options object
  // (as passed as an argument to the `login` method) and returns one of:
  // - `undefined`, meaning don't handle;
  // - a login method result object
  registerLoginHandler(name, handler) {
    if (!handler) {
      handler = name;
      name = null;
    }

    this._loginHandlers.push({
      name: name,
      handler: handler
    });
  }

  // Checks a user's credentials against all the registered login
  // handlers, and returns a login token if the credentials are valid. It
  // is like the login method, except that it doesn't set the logged-in
  // user on the connection. Throws a Meteor.Error if logging in fails,
  // including the case where none of the login handlers handled the login
  // request. Otherwise, returns {id: userId, token: *, tokenExpires: *}.
  //
  // For example, if you want to login with a plaintext password, `options` could be
  //   { user: { username: <username> }, password: <password> }, or
  //   { user: { email: <email> }, password: <password> }.
  // Try all of the registered login handlers until one of them doesn't
  // return `undefined`, meaning it handled this call to `login`. Return
  // that return value.
  _runLoginHandlers(methodInvocation, options) {
    for (let handler of this._loginHandlers) {
      const result = tryLoginMethod(handler.name, () => handler.handler.call(methodInvocation, options));

      if (result) {
        return result;
      }

      if (result !== undefined) {
        throw new Meteor.Error(400, "A login handler should return a result or undefined");
      }
    }

    return {
      type: null,
      error: new Meteor.Error(400, "Unrecognized options for login request")
    };
  }

  // Deletes the given loginToken from the database.
  //
  // For new-style hashed token, this will cause all connections
  // associated with the token to be closed.
  //
  // Any connections associated with old-style unhashed tokens will be
  // in the process of becoming associated with hashed tokens and then
  // they'll get closed.
  destroyToken(userId, loginToken) {
    this.users.update(userId, {
      $pull: {
        "services.resume.loginTokens": {
          $or: [{
            hashedToken: loginToken
          }, {
            token: loginToken
          }]
        }
      }
    });
  }

  _initServerMethods() {
    // The methods created in this function need to be created here so that
    // this variable is available in their scope.
    const accounts = this; // This object will be populated with methods and then passed to
    // accounts._server.methods further below.

    const methods = {}; // @returns {Object|null}
    //   If successful, returns {token: reconnectToken, id: userId}
    //   If unsuccessful (for example, if the user closed the oauth login popup),
    //     throws an error describing the reason

    methods.login = function (options) {
      // Login handlers should really also check whatever field they look at in
      // options, but we don't enforce it.
      check(options, Object);

      const result = accounts._runLoginHandlers(this, options);

      return accounts._attemptLogin(this, "login", arguments, result);
    };

    methods.logout = function () {
      const token = accounts._getLoginToken(this.connection.id);

      accounts._setLoginToken(this.userId, this.connection, null);

      if (token && this.userId) {
        accounts.destroyToken(this.userId, token);
      }

      accounts._successfulLogout(this.connection, this.userId);

      this.setUserId(null);
    }; // Generates a new login token with the same expiration as the
    // connection's current token and saves it to the database. Associates
    // the connection with this new token and returns it. Throws an error
    // if called on a connection that isn't logged in.
    //
    // @returns Object
    //   If successful, returns { token: <new token>, id: <user id>,
    //   tokenExpires: <expiration date> }.


    methods.getNewToken = function () {
      const user = accounts.users.findOne(this.userId, {
        fields: {
          "services.resume.loginTokens": 1
        }
      });

      if (!this.userId || !user) {
        throw new Meteor.Error("You are not logged in.");
      } // Be careful not to generate a new token that has a later
      // expiration than the curren token. Otherwise, a bad guy with a
      // stolen token could use this method to stop his stolen token from
      // ever expiring.


      const currentHashedToken = accounts._getLoginToken(this.connection.id);

      const currentStampedToken = user.services.resume.loginTokens.find(stampedToken => stampedToken.hashedToken === currentHashedToken);

      if (!currentStampedToken) {
        // safety belt: this should never happen
        throw new Meteor.Error("Invalid login token");
      }

      const newStampedToken = accounts._generateStampedLoginToken();

      newStampedToken.when = currentStampedToken.when;

      accounts._insertLoginToken(this.userId, newStampedToken);

      return accounts._loginUser(this, this.userId, newStampedToken);
    }; // Removes all tokens except the token associated with the current
    // connection. Throws an error if the connection is not logged
    // in. Returns nothing on success.


    methods.removeOtherTokens = function () {
      if (!this.userId) {
        throw new Meteor.Error("You are not logged in.");
      }

      const currentToken = accounts._getLoginToken(this.connection.id);

      accounts.users.update(this.userId, {
        $pull: {
          "services.resume.loginTokens": {
            hashedToken: {
              $ne: currentToken
            }
          }
        }
      });
    }; // Allow a one-time configuration for a login service. Modifications
    // to this collection are also allowed in insecure mode.


    methods.configureLoginService = options => {
      check(options, Match.ObjectIncluding({
        service: String
      })); // Don't let random users configure a service we haven't added yet (so
      // that when we do later add it, it's set up with their configuration
      // instead of ours).
      // XXX if service configuration is oauth-specific then this code should
      //     be in accounts-oauth; if it's not then the registry should be
      //     in this package

      if (!(accounts.oauth && accounts.oauth.serviceNames().includes(options.service))) {
        throw new Meteor.Error(403, "Service unknown");
      }

      const {
        ServiceConfiguration
      } = Package['service-configuration'];
      if (ServiceConfiguration.configurations.findOne({
        service: options.service
      })) throw new Meteor.Error(403, "Service ".concat(options.service, " already configured"));
      if (hasOwn.call(options, 'secret') && usingOAuthEncryption()) options.secret = OAuthEncryption.seal(options.secret);
      ServiceConfiguration.configurations.insert(options);
    };

    accounts._server.methods(methods);
  }

  _initAccountDataHooks() {
    this._server.onConnection(connection => {
      this._accountData[connection.id] = {
        connection: connection
      };
      connection.onClose(() => {
        this._removeTokenFromConnection(connection.id);

        delete this._accountData[connection.id];
      });
    });
  }

  _initServerPublications() {
    // Bring into lexical scope for publish callbacks that need `this`
    const {
      users,
      _autopublishFields,
      _defaultPublishFields
    } = this; // Publish all login service configuration fields other than secret.

    this._server.publish("meteor.loginServiceConfiguration", () => {
      const {
        ServiceConfiguration
      } = Package['service-configuration'];
      return ServiceConfiguration.configurations.find({}, {
        fields: {
          secret: 0
        }
      });
    }, {
      is_auto: true
    }); // not technically autopublish, but stops the warning.
    // Use Meteor.startup to give other packages a chance to call
    // setDefaultPublishFields.


    Meteor.startup(() => {
      // Publish the current user's record to the client.
      this._server.publish(null, function () {
        if (this.userId) {
          return users.find({
            _id: this.userId
          }, {
            fields: _defaultPublishFields.projection
          });
        } else {
          return null;
        }
      },
      /*suppress autopublish warning*/
      {
        is_auto: true
      });
    }); // Use Meteor.startup to give other packages a chance to call
    // addAutopublishFields.

    Package.autopublish && Meteor.startup(() => {
      // ['profile', 'username'] -> {profile: 1, username: 1}
      const toFieldSelector = fields => fields.reduce((prev, field) => _objectSpread(_objectSpread({}, prev), {}, {
        [field]: 1
      }), {});

      this._server.publish(null, function () {
        if (this.userId) {
          return users.find({
            _id: this.userId
          }, {
            fields: toFieldSelector(_autopublishFields.loggedInUser)
          });
        } else {
          return null;
        }
      },
      /*suppress autopublish warning*/
      {
        is_auto: true
      }); // XXX this publish is neither dedup-able nor is it optimized by our special
      // treatment of queries on a specific _id. Therefore this will have O(n^2)
      // run-time performance every time a user document is changed (eg someone
      // logging in). If this is a problem, we can instead write a manual publish
      // function which filters out fields based on 'this.userId'.


      this._server.publish(null, function () {
        const selector = this.userId ? {
          _id: {
            $ne: this.userId
          }
        } : {};
        return users.find(selector, {
          fields: toFieldSelector(_autopublishFields.otherUsers)
        });
      },
      /*suppress autopublish warning*/
      {
        is_auto: true
      });
    });
  }

  // Add to the list of fields or subfields to be automatically
  // published if autopublish is on. Must be called from top-level
  // code (ie, before Meteor.startup hooks run).
  //
  // @param opts {Object} with:
  //   - forLoggedInUser {Array} Array of fields published to the logged-in user
  //   - forOtherUsers {Array} Array of fields published to users that aren't logged in
  addAutopublishFields(opts) {
    this._autopublishFields.loggedInUser.push.apply(this._autopublishFields.loggedInUser, opts.forLoggedInUser);

    this._autopublishFields.otherUsers.push.apply(this._autopublishFields.otherUsers, opts.forOtherUsers);
  }

  // Replaces the fields to be automatically
  // published when the user logs in
  //
  // @param {MongoFieldSpecifier} fields Dictionary of fields to return or exclude.
  setDefaultPublishFields(fields) {
    this._defaultPublishFields.projection = fields;
  }

  ///
  /// ACCOUNT DATA
  ///
  // HACK: This is used by 'meteor-accounts' to get the loginToken for a
  // connection. Maybe there should be a public way to do that.
  _getAccountData(connectionId, field) {
    const data = this._accountData[connectionId];
    return data && data[field];
  }

  _setAccountData(connectionId, field, value) {
    const data = this._accountData[connectionId]; // safety belt. shouldn't happen. accountData is set in onConnection,
    // we don't have a connectionId until it is set.

    if (!data) return;
    if (value === undefined) delete data[field];else data[field] = value;
  }

  ///
  /// RECONNECT TOKENS
  ///
  /// support reconnecting using a meteor login token
  _hashLoginToken(loginToken) {
    const hash = crypto.createHash('sha256');
    hash.update(loginToken);
    return hash.digest('base64');
  }

  // {token, when} => {hashedToken, when}
  _hashStampedToken(stampedToken) {
    const {
      token
    } = stampedToken,
          hashedStampedToken = _objectWithoutProperties(stampedToken, ["token"]);

    return _objectSpread(_objectSpread({}, hashedStampedToken), {}, {
      hashedToken: this._hashLoginToken(token)
    });
  }

  // Using $addToSet avoids getting an index error if another client
  // logging in simultaneously has already inserted the new hashed
  // token.
  _insertHashedLoginToken(userId, hashedToken, query) {
    query = query ? _objectSpread({}, query) : {};
    query._id = userId;
    this.users.update(query, {
      $addToSet: {
        "services.resume.loginTokens": hashedToken
      }
    });
  }

  // Exported for tests.
  _insertLoginToken(userId, stampedToken, query) {
    this._insertHashedLoginToken(userId, this._hashStampedToken(stampedToken), query);
  }

  _clearAllLoginTokens(userId) {
    this.users.update(userId, {
      $set: {
        'services.resume.loginTokens': []
      }
    });
  }

  // test hook
  _getUserObserve(connectionId) {
    return this._userObservesForConnections[connectionId];
  }

  // Clean up this connection's association with the token: that is, stop
  // the observe that we started when we associated the connection with
  // this token.
  _removeTokenFromConnection(connectionId) {
    if (hasOwn.call(this._userObservesForConnections, connectionId)) {
      const observe = this._userObservesForConnections[connectionId];

      if (typeof observe === 'number') {
        // We're in the process of setting up an observe for this connection. We
        // can't clean up that observe yet, but if we delete the placeholder for
        // this connection, then the observe will get cleaned up as soon as it has
        // been set up.
        delete this._userObservesForConnections[connectionId];
      } else {
        delete this._userObservesForConnections[connectionId];
        observe.stop();
      }
    }
  }

  _getLoginToken(connectionId) {
    return this._getAccountData(connectionId, 'loginToken');
  }

  // newToken is a hashed token.
  _setLoginToken(userId, connection, newToken) {
    this._removeTokenFromConnection(connection.id);

    this._setAccountData(connection.id, 'loginToken', newToken);

    if (newToken) {
      // Set up an observe for this token. If the token goes away, we need
      // to close the connection.  We defer the observe because there's
      // no need for it to be on the critical path for login; we just need
      // to ensure that the connection will get closed at some point if
      // the token gets deleted.
      //
      // Initially, we set the observe for this connection to a number; this
      // signifies to other code (which might run while we yield) that we are in
      // the process of setting up an observe for this connection. Once the
      // observe is ready to go, we replace the number with the real observe
      // handle (unless the placeholder has been deleted or replaced by a
      // different placehold number, signifying that the connection was closed
      // already -- in this case we just clean up the observe that we started).
      const myObserveNumber = ++this._nextUserObserveNumber;
      this._userObservesForConnections[connection.id] = myObserveNumber;
      Meteor.defer(() => {
        // If something else happened on this connection in the meantime (it got
        // closed, or another call to _setLoginToken happened), just do
        // nothing. We don't need to start an observe for an old connection or old
        // token.
        if (this._userObservesForConnections[connection.id] !== myObserveNumber) {
          return;
        }

        let foundMatchingUser; // Because we upgrade unhashed login tokens to hashed tokens at
        // login time, sessions will only be logged in with a hashed
        // token. Thus we only need to observe hashed tokens here.

        const observe = this.users.find({
          _id: userId,
          'services.resume.loginTokens.hashedToken': newToken
        }, {
          fields: {
            _id: 1
          }
        }).observeChanges({
          added: () => {
            foundMatchingUser = true;
          },
          removed: connection.close // The onClose callback for the connection takes care of
          // cleaning up the observe handle and any other state we have
          // lying around.

        }, {
          nonMutatingCallbacks: true
        }); // If the user ran another login or logout command we were waiting for the
        // defer or added to fire (ie, another call to _setLoginToken occurred),
        // then we let the later one win (start an observe, etc) and just stop our
        // observe now.
        //
        // Similarly, if the connection was already closed, then the onClose
        // callback would have called _removeTokenFromConnection and there won't
        // be an entry in _userObservesForConnections. We can stop the observe.

        if (this._userObservesForConnections[connection.id] !== myObserveNumber) {
          observe.stop();
          return;
        }

        this._userObservesForConnections[connection.id] = observe;

        if (!foundMatchingUser) {
          // We've set up an observe on the user associated with `newToken`,
          // so if the new token is removed from the database, we'll close
          // the connection. But the token might have already been deleted
          // before we set up the observe, which wouldn't have closed the
          // connection because the observe wasn't running yet.
          connection.close();
        }
      });
    }
  }

  // (Also used by Meteor Accounts server and tests).
  //
  _generateStampedLoginToken() {
    return {
      token: Random.secret(),
      when: new Date()
    };
  }

  ///
  /// TOKEN EXPIRATION
  ///
  // Deletes expired password reset tokens from the database.
  //
  // Exported for tests. Also, the arguments are only used by
  // tests. oldestValidDate is simulate expiring tokens without waiting
  // for them to actually expire. userId is used by tests to only expire
  // tokens for the test user.
  _expirePasswordResetTokens(oldestValidDate, userId) {
    const tokenLifetimeMs = this._getPasswordResetTokenLifetimeMs(); // when calling from a test with extra arguments, you must specify both!


    if (oldestValidDate && !userId || !oldestValidDate && userId) {
      throw new Error("Bad test. Must specify both oldestValidDate and userId.");
    }

    oldestValidDate = oldestValidDate || new Date(new Date() - tokenLifetimeMs);
    const tokenFilter = {
      $or: [{
        "services.password.reset.reason": "reset"
      }, {
        "services.password.reset.reason": {
          $exists: false
        }
      }]
    };
    expirePasswordToken(this, oldestValidDate, tokenFilter, userId);
  } // Deletes expired password enroll tokens from the database.
  //
  // Exported for tests. Also, the arguments are only used by
  // tests. oldestValidDate is simulate expiring tokens without waiting
  // for them to actually expire. userId is used by tests to only expire
  // tokens for the test user.


  _expirePasswordEnrollTokens(oldestValidDate, userId) {
    const tokenLifetimeMs = this._getPasswordEnrollTokenLifetimeMs(); // when calling from a test with extra arguments, you must specify both!


    if (oldestValidDate && !userId || !oldestValidDate && userId) {
      throw new Error("Bad test. Must specify both oldestValidDate and userId.");
    }

    oldestValidDate = oldestValidDate || new Date(new Date() - tokenLifetimeMs);
    const tokenFilter = {
      "services.password.enroll.reason": "enroll"
    };
    expirePasswordToken(this, oldestValidDate, tokenFilter, userId);
  } // Deletes expired tokens from the database and closes all open connections
  // associated with these tokens.
  //
  // Exported for tests. Also, the arguments are only used by
  // tests. oldestValidDate is simulate expiring tokens without waiting
  // for them to actually expire. userId is used by tests to only expire
  // tokens for the test user.


  _expireTokens(oldestValidDate, userId) {
    const tokenLifetimeMs = this._getTokenLifetimeMs(); // when calling from a test with extra arguments, you must specify both!


    if (oldestValidDate && !userId || !oldestValidDate && userId) {
      throw new Error("Bad test. Must specify both oldestValidDate and userId.");
    }

    oldestValidDate = oldestValidDate || new Date(new Date() - tokenLifetimeMs);
    const userFilter = userId ? {
      _id: userId
    } : {}; // Backwards compatible with older versions of meteor that stored login token
    // timestamps as numbers.

    this.users.update(_objectSpread(_objectSpread({}, userFilter), {}, {
      $or: [{
        "services.resume.loginTokens.when": {
          $lt: oldestValidDate
        }
      }, {
        "services.resume.loginTokens.when": {
          $lt: +oldestValidDate
        }
      }]
    }), {
      $pull: {
        "services.resume.loginTokens": {
          $or: [{
            when: {
              $lt: oldestValidDate
            }
          }, {
            when: {
              $lt: +oldestValidDate
            }
          }]
        }
      }
    }, {
      multi: true
    }); // The observe on Meteor.users will take care of closing connections for
    // expired tokens.
  }

  // @override from accounts_common.js
  config(options) {
    // Call the overridden implementation of the method.
    const superResult = AccountsCommon.prototype.config.apply(this, arguments); // If the user set loginExpirationInDays to null, then we need to clear the
    // timer that periodically expires tokens.

    if (hasOwn.call(this._options, 'loginExpirationInDays') && this._options.loginExpirationInDays === null && this.expireTokenInterval) {
      Meteor.clearInterval(this.expireTokenInterval);
      this.expireTokenInterval = null;
    }

    return superResult;
  }

  // Called by accounts-password
  insertUserDoc(options, user) {
    // - clone user document, to protect from modification
    // - add createdAt timestamp
    // - prepare an _id, so that you can modify other collections (eg
    // create a first task for every new user)
    //
    // XXX If the onCreateUser or validateNewUser hooks fail, we might
    // end up having modified some other collection
    // inappropriately. The solution is probably to have onCreateUser
    // accept two callbacks - one that gets called before inserting
    // the user document (in which you can modify its contents), and
    // one that gets called after (in which you should change other
    // collections)
    user = _objectSpread({
      createdAt: new Date(),
      _id: Random.id()
    }, user);

    if (user.services) {
      Object.keys(user.services).forEach(service => pinEncryptedFieldsToUser(user.services[service], user._id));
    }

    let fullUser;

    if (this._onCreateUserHook) {
      fullUser = this._onCreateUserHook(options, user); // This is *not* part of the API. We need this because we can't isolate
      // the global server environment between tests, meaning we can't test
      // both having a create user hook set and not having one set.

      if (fullUser === 'TEST DEFAULT HOOK') fullUser = defaultCreateUserHook(options, user);
    } else {
      fullUser = defaultCreateUserHook(options, user);
    }

    this._validateNewUserHooks.forEach(hook => {
      if (!hook(fullUser)) throw new Meteor.Error(403, "User validation failed");
    });

    let userId;

    try {
      userId = this.users.insert(fullUser);
    } catch (e) {
      // XXX string parsing sucks, maybe
      // https://jira.mongodb.org/browse/SERVER-3069 will get fixed one day
      // https://jira.mongodb.org/browse/SERVER-4637
      if (!e.errmsg) throw e;
      if (e.errmsg.includes('emails.address')) throw new Meteor.Error(403, "Email already exists.");
      if (e.errmsg.includes('username')) throw new Meteor.Error(403, "Username already exists.");
      throw e;
    }

    return userId;
  }

  // Helper function: returns false if email does not match company domain from
  // the configuration.
  _testEmailDomain(email) {
    const domain = this._options.restrictCreationByEmailDomain;
    return !domain || typeof domain === 'function' && domain(email) || typeof domain === 'string' && new RegExp("@".concat(Meteor._escapeRegExp(domain), "$"), 'i').test(email);
  }

  ///
  /// CLEAN UP FOR `logoutOtherClients`
  ///
  _deleteSavedTokensForUser(userId, tokensToDelete) {
    if (tokensToDelete) {
      this.users.update(userId, {
        $unset: {
          "services.resume.haveLoginTokensToDelete": 1,
          "services.resume.loginTokensToDelete": 1
        },
        $pullAll: {
          "services.resume.loginTokens": tokensToDelete
        }
      });
    }
  }

  _deleteSavedTokensForAllUsersOnStartup() {
    // If we find users who have saved tokens to delete on startup, delete
    // them now. It's possible that the server could have crashed and come
    // back up before new tokens are found in localStorage, but this
    // shouldn't happen very often. We shouldn't put a delay here because
    // that would give a lot of power to an attacker with a stolen login
    // token and the ability to crash the server.
    Meteor.startup(() => {
      this.users.find({
        "services.resume.haveLoginTokensToDelete": true
      }, {
        fields: {
          "services.resume.loginTokensToDelete": 1
        }
      }).forEach(user => {
        this._deleteSavedTokensForUser(user._id, user.services.resume.loginTokensToDelete);
      });
    });
  }

  ///
  /// MANAGING USER OBJECTS
  ///
  // Updates or creates a user after we authenticate with a 3rd party.
  //
  // @param serviceName {String} Service name (eg, twitter).
  // @param serviceData {Object} Data to store in the user's record
  //        under services[serviceName]. Must include an "id" field
  //        which is a unique identifier for the user in the service.
  // @param options {Object, optional} Other options to pass to insertUserDoc
  //        (eg, profile)
  // @returns {Object} Object with token and id keys, like the result
  //        of the "login" method.
  //
  updateOrCreateUserFromExternalService(serviceName, serviceData, options) {
    options = _objectSpread({}, options);

    if (serviceName === "password" || serviceName === "resume") {
      throw new Error("Can't use updateOrCreateUserFromExternalService with internal service " + serviceName);
    }

    if (!hasOwn.call(serviceData, 'id')) {
      throw new Error("Service data for service ".concat(serviceName, " must include id"));
    } // Look for a user with the appropriate service user id.


    const selector = {};
    const serviceIdKey = "services.".concat(serviceName, ".id"); // XXX Temporary special case for Twitter. (Issue #629)
    //   The serviceData.id will be a string representation of an integer.
    //   We want it to match either a stored string or int representation.
    //   This is to cater to earlier versions of Meteor storing twitter
    //   user IDs in number form, and recent versions storing them as strings.
    //   This can be removed once migration technology is in place, and twitter
    //   users stored with integer IDs have been migrated to string IDs.

    if (serviceName === "twitter" && !isNaN(serviceData.id)) {
      selector["$or"] = [{}, {}];
      selector["$or"][0][serviceIdKey] = serviceData.id;
      selector["$or"][1][serviceIdKey] = parseInt(serviceData.id, 10);
    } else {
      selector[serviceIdKey] = serviceData.id;
    }

    let user = this.users.findOne(selector, {
      fields: this._options.defaultFieldSelector
    }); // Check to see if the developer has a custom way to find the user outside
    // of the general selectors above.

    if (!user && this._additionalFindUserOnExternalLogin) {
      user = this._additionalFindUserOnExternalLogin({
        serviceName,
        serviceData,
        options
      });
    } // Before continuing, run user hook to see if we should continue


    if (this._beforeExternalLoginHook && !this._beforeExternalLoginHook(serviceName, serviceData, user)) {
      throw new Meteor.Error(403, "Login forbidden");
    } // When creating a new user we pass through all options. When updating an
    // existing user, by default we only process/pass through the serviceData
    // (eg, so that we keep an unexpired access token and don't cache old email
    // addresses in serviceData.email). The onExternalLogin hook can be used when
    // creating or updating a user, to modify or pass through more options as
    // needed.


    let opts = user ? {} : options;

    if (this._onExternalLoginHook) {
      opts = this._onExternalLoginHook(options, user);
    }

    if (user) {
      pinEncryptedFieldsToUser(serviceData, user._id);
      let setAttrs = {};
      Object.keys(serviceData).forEach(key => setAttrs["services.".concat(serviceName, ".").concat(key)] = serviceData[key]); // XXX Maybe we should re-use the selector above and notice if the update
      //     touches nothing?

      setAttrs = _objectSpread(_objectSpread({}, setAttrs), opts);
      this.users.update(user._id, {
        $set: setAttrs
      });
      return {
        type: serviceName,
        userId: user._id
      };
    } else {
      // Create a new user with the service data.
      user = {
        services: {}
      };
      user.services[serviceName] = serviceData;
      return {
        type: serviceName,
        userId: this.insertUserDoc(opts, user)
      };
    }
  }

  // Removes default rate limiting rule
  removeDefaultRateLimit() {
    const resp = DDPRateLimiter.removeRule(this.defaultRateLimiterRuleId);
    this.defaultRateLimiterRuleId = null;
    return resp;
  }

  // Add a default rule of limiting logins, creating new users and password reset
  // to 5 times every 10 seconds per connection.
  addDefaultRateLimit() {
    if (!this.defaultRateLimiterRuleId) {
      this.defaultRateLimiterRuleId = DDPRateLimiter.addRule({
        userId: null,
        clientAddress: null,
        type: 'method',
        name: name => ['login', 'createUser', 'resetPassword', 'forgotPassword'].includes(name),
        connectionId: connectionId => true
      }, 5, 10000);
    }
  }

}

// Give each login hook callback a fresh cloned copy of the attempt
// object, but don't clone the connection.
//
const cloneAttemptWithConnection = (connection, attempt) => {
  const clonedAttempt = EJSON.clone(attempt);
  clonedAttempt.connection = connection;
  return clonedAttempt;
};

const tryLoginMethod = (type, fn) => {
  let result;

  try {
    result = fn();
  } catch (e) {
    result = {
      error: e
    };
  }

  if (result && !result.type && type) result.type = type;
  return result;
};

const setupDefaultLoginHandlers = accounts => {
  accounts.registerLoginHandler("resume", function (options) {
    return defaultResumeLoginHandler.call(this, accounts, options);
  });
}; // Login handler for resume tokens.


const defaultResumeLoginHandler = (accounts, options) => {
  if (!options.resume) return undefined;
  check(options.resume, String);

  const hashedToken = accounts._hashLoginToken(options.resume); // First look for just the new-style hashed login token, to avoid
  // sending the unhashed token to the database in a query if we don't
  // need to.


  let user = accounts.users.findOne({
    "services.resume.loginTokens.hashedToken": hashedToken
  }, {
    fields: {
      "services.resume.loginTokens.$": 1
    }
  });

  if (!user) {
    // If we didn't find the hashed login token, try also looking for
    // the old-style unhashed token.  But we need to look for either
    // the old-style token OR the new-style token, because another
    // client connection logging in simultaneously might have already
    // converted the token.
    user = accounts.users.findOne({
      $or: [{
        "services.resume.loginTokens.hashedToken": hashedToken
      }, {
        "services.resume.loginTokens.token": options.resume
      }]
    }, // Note: Cannot use ...loginTokens.$ positional operator with $or query.
    {
      fields: {
        "services.resume.loginTokens": 1
      }
    });
  }

  if (!user) return {
    error: new Meteor.Error(403, "You've been logged out by the server. Please log in again.")
  }; // Find the token, which will either be an object with fields
  // {hashedToken, when} for a hashed token or {token, when} for an
  // unhashed token.

  let oldUnhashedStyleToken;
  let token = user.services.resume.loginTokens.find(token => token.hashedToken === hashedToken);

  if (token) {
    oldUnhashedStyleToken = false;
  } else {
    token = user.services.resume.loginTokens.find(token => token.token === options.resume);
    oldUnhashedStyleToken = true;
  }

  const tokenExpires = accounts._tokenExpiration(token.when);

  if (new Date() >= tokenExpires) return {
    userId: user._id,
    error: new Meteor.Error(403, "Your session has expired. Please log in again.")
  }; // Update to a hashed token when an unhashed token is encountered.

  if (oldUnhashedStyleToken) {
    // Only add the new hashed token if the old unhashed token still
    // exists (this avoids resurrecting the token if it was deleted
    // after we read it).  Using $addToSet avoids getting an index
    // error if another client logging in simultaneously has already
    // inserted the new hashed token.
    accounts.users.update({
      _id: user._id,
      "services.resume.loginTokens.token": options.resume
    }, {
      $addToSet: {
        "services.resume.loginTokens": {
          "hashedToken": hashedToken,
          "when": token.when
        }
      }
    }); // Remove the old token *after* adding the new, since otherwise
    // another client trying to login between our removing the old and
    // adding the new wouldn't find a token to login with.

    accounts.users.update(user._id, {
      $pull: {
        "services.resume.loginTokens": {
          "token": options.resume
        }
      }
    });
  }

  return {
    userId: user._id,
    stampedLoginToken: {
      token: options.resume,
      when: token.when
    }
  };
};

const expirePasswordToken = (accounts, oldestValidDate, tokenFilter, userId) => {
  // boolean value used to determine if this method was called from enroll account workflow
  let isEnroll = false;
  const userFilter = userId ? {
    _id: userId
  } : {}; // check if this method was called from enroll account workflow

  if (tokenFilter['services.password.enroll.reason']) {
    isEnroll = true;
  }

  let resetRangeOr = {
    $or: [{
      "services.password.reset.when": {
        $lt: oldestValidDate
      }
    }, {
      "services.password.reset.when": {
        $lt: +oldestValidDate
      }
    }]
  };

  if (isEnroll) {
    resetRangeOr = {
      $or: [{
        "services.password.enroll.when": {
          $lt: oldestValidDate
        }
      }, {
        "services.password.enroll.when": {
          $lt: +oldestValidDate
        }
      }]
    };
  }

  const expireFilter = {
    $and: [tokenFilter, resetRangeOr]
  };

  if (isEnroll) {
    accounts.users.update(_objectSpread(_objectSpread({}, userFilter), expireFilter), {
      $unset: {
        "services.password.enroll": ""
      }
    }, {
      multi: true
    });
  } else {
    accounts.users.update(_objectSpread(_objectSpread({}, userFilter), expireFilter), {
      $unset: {
        "services.password.reset": ""
      }
    }, {
      multi: true
    });
  }
};

const setExpireTokensInterval = accounts => {
  accounts.expireTokenInterval = Meteor.setInterval(() => {
    accounts._expireTokens();

    accounts._expirePasswordResetTokens();

    accounts._expirePasswordEnrollTokens();
  }, EXPIRE_TOKENS_INTERVAL_MS);
}; ///
/// OAuth Encryption Support
///


const OAuthEncryption = Package["oauth-encryption"] && Package["oauth-encryption"].OAuthEncryption;

const usingOAuthEncryption = () => {
  return OAuthEncryption && OAuthEncryption.keyIsLoaded();
}; // OAuth service data is temporarily stored in the pending credentials
// collection during the oauth authentication process.  Sensitive data
// such as access tokens are encrypted without the user id because
// we don't know the user id yet.  We re-encrypt these fields with the
// user id included when storing the service data permanently in
// the users collection.
//


const pinEncryptedFieldsToUser = (serviceData, userId) => {
  Object.keys(serviceData).forEach(key => {
    let value = serviceData[key];
    if (OAuthEncryption && OAuthEncryption.isSealed(value)) value = OAuthEncryption.seal(OAuthEncryption.open(value), userId);
    serviceData[key] = value;
  });
}; // Encrypt unencrypted login service secrets when oauth-encryption is
// added.
//
// XXX For the oauthSecretKey to be available here at startup, the
// developer must call Accounts.config({oauthSecretKey: ...}) at load
// time, instead of in a Meteor.startup block, because the startup
// block in the app code will run after this accounts-base startup
// block.  Perhaps we need a post-startup callback?


Meteor.startup(() => {
  if (!usingOAuthEncryption()) {
    return;
  }

  const {
    ServiceConfiguration
  } = Package['service-configuration'];
  ServiceConfiguration.configurations.find({
    $and: [{
      secret: {
        $exists: true
      }
    }, {
      "secret.algorithm": {
        $exists: false
      }
    }]
  }).forEach(config => {
    ServiceConfiguration.configurations.update(config._id, {
      $set: {
        secret: OAuthEncryption.seal(config.secret)
      }
    });
  });
}); // XXX see comment on Accounts.createUser in passwords_server about adding a
// second "server options" argument.

const defaultCreateUserHook = (options, user) => {
  if (options.profile) user.profile = options.profile;
  return user;
}; // Validate new user's email or Google/Facebook/GitHub account's email


function defaultValidateNewUserHook(user) {
  const domain = this._options.restrictCreationByEmailDomain;

  if (!domain) {
    return true;
  }

  let emailIsGood = false;

  if (user.emails && user.emails.length > 0) {
    emailIsGood = user.emails.reduce((prev, email) => prev || this._testEmailDomain(email.address), false);
  } else if (user.services && Object.values(user.services).length > 0) {
    // Find any email of any service and check it
    emailIsGood = Object.values(user.services).reduce((prev, service) => service.email && this._testEmailDomain(service.email), false);
  }

  if (emailIsGood) {
    return true;
  }

  if (typeof domain === 'string') {
    throw new Meteor.Error(403, "@".concat(domain, " email required"));
  } else {
    throw new Meteor.Error(403, "Email doesn't match the criteria.");
  }
}

const setupUsersCollection = users => {
  ///
  /// RESTRICTING WRITES TO USER OBJECTS
  ///
  users.allow({
    // clients can modify the profile field of their own document, and
    // nothing else.
    update: (userId, user, fields, modifier) => {
      // make sure it is our record
      if (user._id !== userId) {
        return false;
      } // user can only modify the 'profile' field. sets to multiple
      // sub-keys (eg profile.foo and profile.bar) are merged into entry
      // in the fields list.


      if (fields.length !== 1 || fields[0] !== 'profile') {
        return false;
      }

      return true;
    },
    fetch: ['_id'] // we only look at _id.

  }); /// DEFAULT INDEXES ON USERS

  users._ensureIndex('username', {
    unique: true,
    sparse: true
  });

  users._ensureIndex('emails.address', {
    unique: true,
    sparse: true
  });

  users._ensureIndex('services.resume.loginTokens.hashedToken', {
    unique: true,
    sparse: true
  });

  users._ensureIndex('services.resume.loginTokens.token', {
    unique: true,
    sparse: true
  }); // For taking care of logoutOtherClients calls that crashed before the
  // tokens were deleted.


  users._ensureIndex('services.resume.haveLoginTokensToDelete', {
    sparse: true
  }); // For expiring login tokens


  users._ensureIndex("services.resume.loginTokens.when", {
    sparse: true
  }); // For expiring password tokens


  users._ensureIndex('services.password.reset.when', {
    sparse: true
  });
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/accounts-base/server_main.js");

/* Exports */
Package._define("accounts-base", exports, {
  Accounts: Accounts
});

})();

//# sourceURL=meteor://💻app/packages/accounts-base.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtYmFzZS9zZXJ2ZXJfbWFpbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtYmFzZS9hY2NvdW50c19jb21tb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FjY291bnRzLWJhc2UvYWNjb3VudHNfc2VydmVyLmpzIl0sIm5hbWVzIjpbIm1vZHVsZTEiLCJleHBvcnQiLCJBY2NvdW50c1NlcnZlciIsImxpbmsiLCJ2IiwiQWNjb3VudHMiLCJNZXRlb3IiLCJzZXJ2ZXIiLCJ1c2VycyIsIl9vYmplY3RTcHJlYWQiLCJtb2R1bGUiLCJkZWZhdWx0IiwiQWNjb3VudHNDb21tb24iLCJFWFBJUkVfVE9LRU5TX0lOVEVSVkFMX01TIiwiQ09OTkVDVElPTl9DTE9TRV9ERUxBWV9NUyIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsIl9vcHRpb25zIiwiY29ubmVjdGlvbiIsInVuZGVmaW5lZCIsIl9pbml0Q29ubmVjdGlvbiIsIk1vbmdvIiwiQ29sbGVjdGlvbiIsIl9wcmV2ZW50QXV0b3B1Ymxpc2giLCJfb25Mb2dpbkhvb2siLCJIb29rIiwiYmluZEVudmlyb25tZW50IiwiZGVidWdQcmludEV4Y2VwdGlvbnMiLCJfb25Mb2dpbkZhaWx1cmVIb29rIiwiX29uTG9nb3V0SG9vayIsIkRFRkFVTFRfTE9HSU5fRVhQSVJBVElPTl9EQVlTIiwiTE9HSU5fVU5FWFBJUklOR19UT0tFTl9EQVlTIiwibGNlTmFtZSIsIkxvZ2luQ2FuY2VsbGVkRXJyb3IiLCJtYWtlRXJyb3JUeXBlIiwiZGVzY3JpcHRpb24iLCJtZXNzYWdlIiwicHJvdG90eXBlIiwibmFtZSIsIm51bWVyaWNFcnJvciIsInN0YXJ0dXAiLCJTZXJ2aWNlQ29uZmlndXJhdGlvbiIsIlBhY2thZ2UiLCJsb2dpblNlcnZpY2VDb25maWd1cmF0aW9uIiwiY29uZmlndXJhdGlvbnMiLCJDb25maWdFcnJvciIsInVzZXJJZCIsIkVycm9yIiwiX2FkZERlZmF1bHRGaWVsZFNlbGVjdG9yIiwiZGVmYXVsdEZpZWxkU2VsZWN0b3IiLCJmaWVsZHMiLCJrZXlzIiwiT2JqZWN0IiwibGVuZ3RoIiwia2V5czIiLCJ1c2VyIiwiZmluZE9uZSIsImNvbmZpZyIsImlzU2VydmVyIiwiX19tZXRlb3JfcnVudGltZV9jb25maWdfXyIsImFjY291bnRzQ29uZmlnQ2FsbGVkIiwiX2RlYnVnIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiaXNDbGllbnQiLCJPQXV0aEVuY3J5cHRpb24iLCJsb2FkS2V5Iiwib2F1dGhTZWNyZXRLZXkiLCJWQUxJRF9LRVlTIiwiZm9yRWFjaCIsImtleSIsImluY2x1ZGVzIiwib25Mb2dpbiIsImZ1bmMiLCJyZXQiLCJyZWdpc3RlciIsIl9zdGFydHVwQ2FsbGJhY2siLCJjYWxsYmFjayIsIm9uTG9naW5GYWlsdXJlIiwib25Mb2dvdXQiLCJkZHBVcmwiLCJERFAiLCJjb25uZWN0IiwiQUNDT1VOVFNfQ09OTkVDVElPTl9VUkwiLCJfZ2V0VG9rZW5MaWZldGltZU1zIiwibG9naW5FeHBpcmF0aW9uSW5EYXlzIiwibG9naW5FeHBpcmF0aW9uIiwiX2dldFBhc3N3b3JkUmVzZXRUb2tlbkxpZmV0aW1lTXMiLCJwYXNzd29yZFJlc2V0VG9rZW5FeHBpcmF0aW9uIiwicGFzc3dvcmRSZXNldFRva2VuRXhwaXJhdGlvbkluRGF5cyIsIkRFRkFVTFRfUEFTU1dPUkRfUkVTRVRfVE9LRU5fRVhQSVJBVElPTl9EQVlTIiwiX2dldFBhc3N3b3JkRW5yb2xsVG9rZW5MaWZldGltZU1zIiwicGFzc3dvcmRFbnJvbGxUb2tlbkV4cGlyYXRpb24iLCJwYXNzd29yZEVucm9sbFRva2VuRXhwaXJhdGlvbkluRGF5cyIsIkRFRkFVTFRfUEFTU1dPUkRfRU5ST0xMX1RPS0VOX0VYUElSQVRJT05fREFZUyIsIl90b2tlbkV4cGlyYXRpb24iLCJ3aGVuIiwiRGF0ZSIsImdldFRpbWUiLCJfdG9rZW5FeHBpcmVzU29vbiIsIm1pbkxpZmV0aW1lTXMiLCJtaW5MaWZldGltZUNhcE1zIiwiTUlOX1RPS0VOX0xJRkVUSU1FX0NBUF9TRUNTIiwiX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzIiwiY3J5cHRvIiwiVVJMIiwiaGFzT3duIiwiX3NlcnZlciIsIl9pbml0U2VydmVyTWV0aG9kcyIsIl9pbml0QWNjb3VudERhdGFIb29rcyIsIl9hdXRvcHVibGlzaEZpZWxkcyIsImxvZ2dlZEluVXNlciIsIm90aGVyVXNlcnMiLCJfZGVmYXVsdFB1Ymxpc2hGaWVsZHMiLCJwcm9qZWN0aW9uIiwicHJvZmlsZSIsInVzZXJuYW1lIiwiZW1haWxzIiwiX2luaXRTZXJ2ZXJQdWJsaWNhdGlvbnMiLCJfYWNjb3VudERhdGEiLCJfdXNlck9ic2VydmVzRm9yQ29ubmVjdGlvbnMiLCJfbmV4dFVzZXJPYnNlcnZlTnVtYmVyIiwiX2xvZ2luSGFuZGxlcnMiLCJzZXR1cFVzZXJzQ29sbGVjdGlvbiIsInNldHVwRGVmYXVsdExvZ2luSGFuZGxlcnMiLCJzZXRFeHBpcmVUb2tlbnNJbnRlcnZhbCIsIl92YWxpZGF0ZUxvZ2luSG9vayIsIl92YWxpZGF0ZU5ld1VzZXJIb29rcyIsImRlZmF1bHRWYWxpZGF0ZU5ld1VzZXJIb29rIiwiYmluZCIsIl9kZWxldGVTYXZlZFRva2Vuc0ZvckFsbFVzZXJzT25TdGFydHVwIiwiX3NraXBDYXNlSW5zZW5zaXRpdmVDaGVja3NGb3JUZXN0IiwidXJscyIsInJlc2V0UGFzc3dvcmQiLCJ0b2tlbiIsImV4dHJhUGFyYW1zIiwiYnVpbGRFbWFpbFVybCIsInZlcmlmeUVtYWlsIiwiZW5yb2xsQWNjb3VudCIsImFkZERlZmF1bHRSYXRlTGltaXQiLCJwYXRoIiwidXJsIiwiYWJzb2x1dGVVcmwiLCJwYXJhbXMiLCJlbnRyaWVzIiwidmFsdWUiLCJzZWFyY2hQYXJhbXMiLCJhcHBlbmQiLCJ0b1N0cmluZyIsImN1cnJlbnRJbnZvY2F0aW9uIiwiX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uIiwiZ2V0IiwiX0N1cnJlbnRQdWJsaWNhdGlvbkludm9jYXRpb24iLCJ2YWxpZGF0ZUxvZ2luQXR0ZW1wdCIsInZhbGlkYXRlTmV3VXNlciIsInB1c2giLCJiZWZvcmVFeHRlcm5hbExvZ2luIiwiX2JlZm9yZUV4dGVybmFsTG9naW5Ib29rIiwib25DcmVhdGVVc2VyIiwiX29uQ3JlYXRlVXNlckhvb2siLCJvbkV4dGVybmFsTG9naW4iLCJfb25FeHRlcm5hbExvZ2luSG9vayIsInNldEFkZGl0aW9uYWxGaW5kVXNlck9uRXh0ZXJuYWxMb2dpbiIsIl9hZGRpdGlvbmFsRmluZFVzZXJPbkV4dGVybmFsTG9naW4iLCJfdmFsaWRhdGVMb2dpbiIsImF0dGVtcHQiLCJlYWNoIiwiY2xvbmVBdHRlbXB0V2l0aENvbm5lY3Rpb24iLCJlIiwiYWxsb3dlZCIsImVycm9yIiwiX3N1Y2Nlc3NmdWxMb2dpbiIsIl9mYWlsZWRMb2dpbiIsIl9zdWNjZXNzZnVsTG9nb3V0IiwiX2xvZ2luVXNlciIsIm1ldGhvZEludm9jYXRpb24iLCJzdGFtcGVkTG9naW5Ub2tlbiIsIl9nZW5lcmF0ZVN0YW1wZWRMb2dpblRva2VuIiwiX2luc2VydExvZ2luVG9rZW4iLCJfbm9ZaWVsZHNBbGxvd2VkIiwiX3NldExvZ2luVG9rZW4iLCJfaGFzaExvZ2luVG9rZW4iLCJzZXRVc2VySWQiLCJpZCIsInRva2VuRXhwaXJlcyIsIl9hdHRlbXB0TG9naW4iLCJtZXRob2ROYW1lIiwibWV0aG9kQXJncyIsInJlc3VsdCIsInR5cGUiLCJtZXRob2RBcmd1bWVudHMiLCJBcnJheSIsImZyb20iLCJfbG9naW5NZXRob2QiLCJmbiIsInRyeUxvZ2luTWV0aG9kIiwiX3JlcG9ydExvZ2luRmFpbHVyZSIsInJlZ2lzdGVyTG9naW5IYW5kbGVyIiwiaGFuZGxlciIsIl9ydW5Mb2dpbkhhbmRsZXJzIiwiZGVzdHJveVRva2VuIiwibG9naW5Ub2tlbiIsInVwZGF0ZSIsIiRwdWxsIiwiJG9yIiwiaGFzaGVkVG9rZW4iLCJhY2NvdW50cyIsIm1ldGhvZHMiLCJsb2dpbiIsImNoZWNrIiwiYXJndW1lbnRzIiwibG9nb3V0IiwiX2dldExvZ2luVG9rZW4iLCJnZXROZXdUb2tlbiIsImN1cnJlbnRIYXNoZWRUb2tlbiIsImN1cnJlbnRTdGFtcGVkVG9rZW4iLCJzZXJ2aWNlcyIsInJlc3VtZSIsImxvZ2luVG9rZW5zIiwiZmluZCIsInN0YW1wZWRUb2tlbiIsIm5ld1N0YW1wZWRUb2tlbiIsInJlbW92ZU90aGVyVG9rZW5zIiwiY3VycmVudFRva2VuIiwiJG5lIiwiY29uZmlndXJlTG9naW5TZXJ2aWNlIiwiTWF0Y2giLCJPYmplY3RJbmNsdWRpbmciLCJzZXJ2aWNlIiwiU3RyaW5nIiwib2F1dGgiLCJzZXJ2aWNlTmFtZXMiLCJ1c2luZ09BdXRoRW5jcnlwdGlvbiIsInNlY3JldCIsInNlYWwiLCJpbnNlcnQiLCJvbkNvbm5lY3Rpb24iLCJvbkNsb3NlIiwiX3JlbW92ZVRva2VuRnJvbUNvbm5lY3Rpb24iLCJwdWJsaXNoIiwiaXNfYXV0byIsIl9pZCIsImF1dG9wdWJsaXNoIiwidG9GaWVsZFNlbGVjdG9yIiwicmVkdWNlIiwicHJldiIsImZpZWxkIiwic2VsZWN0b3IiLCJhZGRBdXRvcHVibGlzaEZpZWxkcyIsIm9wdHMiLCJhcHBseSIsImZvckxvZ2dlZEluVXNlciIsImZvck90aGVyVXNlcnMiLCJzZXREZWZhdWx0UHVibGlzaEZpZWxkcyIsIl9nZXRBY2NvdW50RGF0YSIsImNvbm5lY3Rpb25JZCIsImRhdGEiLCJfc2V0QWNjb3VudERhdGEiLCJoYXNoIiwiY3JlYXRlSGFzaCIsImRpZ2VzdCIsIl9oYXNoU3RhbXBlZFRva2VuIiwiaGFzaGVkU3RhbXBlZFRva2VuIiwiX2luc2VydEhhc2hlZExvZ2luVG9rZW4iLCJxdWVyeSIsIiRhZGRUb1NldCIsIl9jbGVhckFsbExvZ2luVG9rZW5zIiwiJHNldCIsIl9nZXRVc2VyT2JzZXJ2ZSIsIm9ic2VydmUiLCJzdG9wIiwibmV3VG9rZW4iLCJteU9ic2VydmVOdW1iZXIiLCJkZWZlciIsImZvdW5kTWF0Y2hpbmdVc2VyIiwib2JzZXJ2ZUNoYW5nZXMiLCJhZGRlZCIsInJlbW92ZWQiLCJjbG9zZSIsIm5vbk11dGF0aW5nQ2FsbGJhY2tzIiwiUmFuZG9tIiwiX2V4cGlyZVBhc3N3b3JkUmVzZXRUb2tlbnMiLCJvbGRlc3RWYWxpZERhdGUiLCJ0b2tlbkxpZmV0aW1lTXMiLCJ0b2tlbkZpbHRlciIsIiRleGlzdHMiLCJleHBpcmVQYXNzd29yZFRva2VuIiwiX2V4cGlyZVBhc3N3b3JkRW5yb2xsVG9rZW5zIiwiX2V4cGlyZVRva2VucyIsInVzZXJGaWx0ZXIiLCIkbHQiLCJtdWx0aSIsInN1cGVyUmVzdWx0IiwiZXhwaXJlVG9rZW5JbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJpbnNlcnRVc2VyRG9jIiwiY3JlYXRlZEF0IiwicGluRW5jcnlwdGVkRmllbGRzVG9Vc2VyIiwiZnVsbFVzZXIiLCJkZWZhdWx0Q3JlYXRlVXNlckhvb2siLCJob29rIiwiZXJybXNnIiwiX3Rlc3RFbWFpbERvbWFpbiIsImVtYWlsIiwiZG9tYWluIiwicmVzdHJpY3RDcmVhdGlvbkJ5RW1haWxEb21haW4iLCJSZWdFeHAiLCJfZXNjYXBlUmVnRXhwIiwidGVzdCIsIl9kZWxldGVTYXZlZFRva2Vuc0ZvclVzZXIiLCJ0b2tlbnNUb0RlbGV0ZSIsIiR1bnNldCIsIiRwdWxsQWxsIiwibG9naW5Ub2tlbnNUb0RlbGV0ZSIsInVwZGF0ZU9yQ3JlYXRlVXNlckZyb21FeHRlcm5hbFNlcnZpY2UiLCJzZXJ2aWNlTmFtZSIsInNlcnZpY2VEYXRhIiwic2VydmljZUlkS2V5IiwiaXNOYU4iLCJwYXJzZUludCIsInNldEF0dHJzIiwicmVtb3ZlRGVmYXVsdFJhdGVMaW1pdCIsInJlc3AiLCJERFBSYXRlTGltaXRlciIsInJlbW92ZVJ1bGUiLCJkZWZhdWx0UmF0ZUxpbWl0ZXJSdWxlSWQiLCJhZGRSdWxlIiwiY2xpZW50QWRkcmVzcyIsImNsb25lZEF0dGVtcHQiLCJFSlNPTiIsImNsb25lIiwiZGVmYXVsdFJlc3VtZUxvZ2luSGFuZGxlciIsIm9sZFVuaGFzaGVkU3R5bGVUb2tlbiIsImlzRW5yb2xsIiwicmVzZXRSYW5nZU9yIiwiZXhwaXJlRmlsdGVyIiwiJGFuZCIsInNldEludGVydmFsIiwia2V5SXNMb2FkZWQiLCJpc1NlYWxlZCIsIm9wZW4iLCJlbWFpbElzR29vZCIsImFkZHJlc3MiLCJ2YWx1ZXMiLCJhbGxvdyIsIm1vZGlmaWVyIiwiZmV0Y2giLCJfZW5zdXJlSW5kZXgiLCJ1bmlxdWUiLCJzcGFyc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsU0FBTyxDQUFDQyxNQUFSLENBQWU7QUFBQ0Msa0JBQWMsRUFBQyxNQUFJQTtBQUFwQixHQUFmO0FBQW9ELE1BQUlBLGNBQUo7QUFBbUJGLFNBQU8sQ0FBQ0csSUFBUixDQUFhLHNCQUFiLEVBQW9DO0FBQUNELGtCQUFjLENBQUNFLENBQUQsRUFBRztBQUFDRixvQkFBYyxHQUFDRSxDQUFmO0FBQWlCOztBQUFwQyxHQUFwQyxFQUEwRSxDQUExRTs7QUFFdkU7QUFDQTtBQUNBO0FBQ0E7QUFDQUMsVUFBUSxHQUFHLElBQUlILGNBQUosQ0FBbUJJLE1BQU0sQ0FBQ0MsTUFBMUIsQ0FBWCxDLENBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFDQUQsUUFBTSxDQUFDRSxLQUFQLEdBQWVILFFBQVEsQ0FBQ0csS0FBeEI7Ozs7Ozs7Ozs7OztBQ2xCQSxJQUFJQyxhQUFKOztBQUFrQkMsTUFBTSxDQUFDUCxJQUFQLENBQVksc0NBQVosRUFBbUQ7QUFBQ1EsU0FBTyxDQUFDUCxDQUFELEVBQUc7QUFBQ0ssaUJBQWEsR0FBQ0wsQ0FBZDtBQUFnQjs7QUFBNUIsQ0FBbkQsRUFBaUYsQ0FBakY7QUFBbEJNLE1BQU0sQ0FBQ1QsTUFBUCxDQUFjO0FBQUNXLGdCQUFjLEVBQUMsTUFBSUEsY0FBcEI7QUFBbUNDLDJCQUF5QixFQUFDLE1BQUlBLHlCQUFqRTtBQUEyRkMsMkJBQXlCLEVBQUMsTUFBSUE7QUFBekgsQ0FBZDs7QUFTTyxNQUFNRixj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QixFQUNFO0FBQUVFLFVBQU0sRUFBRTtBQUFWLEdBREYsRUFsQ29DLENBb0NwQzs7O0FBQ0FyVixPQUFLLENBQUNtVixZQUFOLENBQW1CLGtDQUFuQixFQUF1RDtBQUFFRSxVQUFNLEVBQUU7QUFBVixHQUF2RCxFQXJDb0MsQ0FzQ3BDOzs7QUFDQXJWLE9BQUssQ0FBQ21WLFlBQU4sQ0FBbUIsOEJBQW5CLEVBQW1EO0FBQUVFLFVBQU0sRUFBRTtBQUFWLEdBQW5EO0FBQ0QsQ0F4Q0QsQyIsImZpbGUiOiIvcGFja2FnZXMvYWNjb3VudHMtYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFjY291bnRzU2VydmVyIH0gZnJvbSBcIi4vYWNjb3VudHNfc2VydmVyLmpzXCI7XG5cbi8qKlxuICogQG5hbWVzcGFjZSBBY2NvdW50c1xuICogQHN1bW1hcnkgVGhlIG5hbWVzcGFjZSBmb3IgYWxsIHNlcnZlci1zaWRlIGFjY291bnRzLXJlbGF0ZWQgbWV0aG9kcy5cbiAqL1xuQWNjb3VudHMgPSBuZXcgQWNjb3VudHNTZXJ2ZXIoTWV0ZW9yLnNlcnZlcik7XG5cbi8vIFVzZXJzIHRhYmxlLiBEb24ndCB1c2UgdGhlIG5vcm1hbCBhdXRvcHVibGlzaCwgc2luY2Ugd2Ugd2FudCB0byBoaWRlXG4vLyBzb21lIGZpZWxkcy4gQ29kZSB0byBhdXRvcHVibGlzaCB0aGlzIGlzIGluIGFjY291bnRzX3NlcnZlci5qcy5cbi8vIFhYWCBBbGxvdyB1c2VycyB0byBjb25maWd1cmUgdGhpcyBjb2xsZWN0aW9uIG5hbWUuXG5cbi8qKlxuICogQHN1bW1hcnkgQSBbTW9uZ28uQ29sbGVjdGlvbl0oI2NvbGxlY3Rpb25zKSBjb250YWluaW5nIHVzZXIgZG9jdW1lbnRzLlxuICogQGxvY3VzIEFueXdoZXJlXG4gKiBAdHlwZSB7TW9uZ28uQ29sbGVjdGlvbn1cbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiovXG5NZXRlb3IudXNlcnMgPSBBY2NvdW50cy51c2VycztcblxuZXhwb3J0IHtcbiAgLy8gU2luY2UgdGhpcyBmaWxlIGlzIHRoZSBtYWluIG1vZHVsZSBmb3IgdGhlIHNlcnZlciB2ZXJzaW9uIG9mIHRoZVxuICAvLyBhY2NvdW50cy1iYXNlIHBhY2thZ2UsIHByb3BlcnRpZXMgb2Ygbm9uLWVudHJ5LXBvaW50IG1vZHVsZXMgbmVlZCB0b1xuICAvLyBiZSByZS1leHBvcnRlZCBpbiBvcmRlciB0byBiZSBhY2Nlc3NpYmxlIHRvIG1vZHVsZXMgdGhhdCBpbXBvcnQgdGhlXG4gIC8vIGFjY291bnRzLWJhc2UgcGFja2FnZS5cbiAgQWNjb3VudHNTZXJ2ZXJcbn07XG4iLCIvKipcbiAqIEBzdW1tYXJ5IFN1cGVyLWNvbnN0cnVjdG9yIGZvciBBY2NvdW50c0NsaWVudCBhbmQgQWNjb3VudHNTZXJ2ZXIuXG4gKiBAbG9jdXMgQW55d2hlcmVcbiAqIEBjbGFzcyBBY2NvdW50c0NvbW1vblxuICogQGluc3RhbmNlbmFtZSBhY2NvdW50c0NsaWVudE9yU2VydmVyXG4gKiBAcGFyYW0gb3B0aW9ucyB7T2JqZWN0fSBhbiBvYmplY3Qgd2l0aCBmaWVsZHM6XG4gKiAtIGNvbm5lY3Rpb24ge09iamVjdH0gT3B0aW9uYWwgRERQIGNvbm5lY3Rpb24gdG8gcmV1c2UuXG4gKiAtIGRkcFVybCB7U3RyaW5nfSBPcHRpb25hbCBVUkwgZm9yIGNyZWF0aW5nIGEgbmV3IEREUCBjb25uZWN0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgQWNjb3VudHNDb21tb24ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgLy8gQ3VycmVudGx5IHRoaXMgaXMgcmVhZCBkaXJlY3RseSBieSBwYWNrYWdlcyBsaWtlIGFjY291bnRzLXBhc3N3b3JkXG4gICAgLy8gYW5kIGFjY291bnRzLXVpLXVuc3R5bGVkLlxuICAgIHRoaXMuX29wdGlvbnMgPSB7fTtcblxuICAgIC8vIE5vdGUgdGhhdCBzZXR0aW5nIHRoaXMuY29ubmVjdGlvbiA9IG51bGwgY2F1c2VzIHRoaXMudXNlcnMgdG8gYmUgYVxuICAgIC8vIExvY2FsQ29sbGVjdGlvbiwgd2hpY2ggaXMgbm90IHdoYXQgd2Ugd2FudC5cbiAgICB0aGlzLmNvbm5lY3Rpb24gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5faW5pdENvbm5lY3Rpb24ob3B0aW9ucyB8fCB7fSk7XG5cbiAgICAvLyBUaGVyZSBpcyBhbiBhbGxvdyBjYWxsIGluIGFjY291bnRzX3NlcnZlci5qcyB0aGF0IHJlc3RyaWN0cyB3cml0ZXMgdG9cbiAgICAvLyB0aGlzIGNvbGxlY3Rpb24uXG4gICAgdGhpcy51c2VycyA9IG5ldyBNb25nby5Db2xsZWN0aW9uKFwidXNlcnNcIiwge1xuICAgICAgX3ByZXZlbnRBdXRvcHVibGlzaDogdHJ1ZSxcbiAgICAgIGNvbm5lY3Rpb246IHRoaXMuY29ubmVjdGlvblxuICAgIH0pO1xuXG4gICAgLy8gQ2FsbGJhY2sgZXhjZXB0aW9ucyBhcmUgcHJpbnRlZCB3aXRoIE1ldGVvci5fZGVidWcgYW5kIGlnbm9yZWQuXG4gICAgdGhpcy5fb25Mb2dpbkhvb2sgPSBuZXcgSG9vayh7XG4gICAgICBiaW5kRW52aXJvbm1lbnQ6IGZhbHNlLFxuICAgICAgZGVidWdQcmludEV4Y2VwdGlvbnM6IFwib25Mb2dpbiBjYWxsYmFja1wiXG4gICAgfSk7XG5cbiAgICB0aGlzLl9vbkxvZ2luRmFpbHVyZUhvb2sgPSBuZXcgSG9vayh7XG4gICAgICBiaW5kRW52aXJvbm1lbnQ6IGZhbHNlLFxuICAgICAgZGVidWdQcmludEV4Y2VwdGlvbnM6IFwib25Mb2dpbkZhaWx1cmUgY2FsbGJhY2tcIlxuICAgIH0pO1xuXG4gICAgdGhpcy5fb25Mb2dvdXRIb29rID0gbmV3IEhvb2soe1xuICAgICAgYmluZEVudmlyb25tZW50OiBmYWxzZSxcbiAgICAgIGRlYnVnUHJpbnRFeGNlcHRpb25zOiBcIm9uTG9nb3V0IGNhbGxiYWNrXCJcbiAgICB9KTtcblxuICAgIC8vIEV4cG9zZSBmb3IgdGVzdGluZy5cbiAgICB0aGlzLkRFRkFVTFRfTE9HSU5fRVhQSVJBVElPTl9EQVlTID0gREVGQVVMVF9MT0dJTl9FWFBJUkFUSU9OX0RBWVM7XG4gICAgdGhpcy5MT0dJTl9VTkVYUElSSU5HX1RPS0VOX0RBWVMgPSBMT0dJTl9VTkVYUElSSU5HX1RPS0VOX0RBWVM7XG5cbiAgICAvLyBUaHJvd24gd2hlbiB0aGUgdXNlciBjYW5jZWxzIHRoZSBsb2dpbiBwcm9jZXNzIChlZywgY2xvc2VzIGFuIG9hdXRoXG4gICAgLy8gcG9wdXAsIGRlY2xpbmVzIHJldGluYSBzY2FuLCBldGMpXG4gICAgY29uc3QgbGNlTmFtZSA9ICdBY2NvdW50cy5Mb2dpbkNhbmNlbGxlZEVycm9yJztcbiAgICB0aGlzLkxvZ2luQ2FuY2VsbGVkRXJyb3IgPSBNZXRlb3IubWFrZUVycm9yVHlwZShcbiAgICAgIGxjZU5hbWUsXG4gICAgICBmdW5jdGlvbiAoZGVzY3JpcHRpb24pIHtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gZGVzY3JpcHRpb247XG4gICAgICB9XG4gICAgKTtcbiAgICB0aGlzLkxvZ2luQ2FuY2VsbGVkRXJyb3IucHJvdG90eXBlLm5hbWUgPSBsY2VOYW1lO1xuXG4gICAgLy8gVGhpcyBpcyB1c2VkIHRvIHRyYW5zbWl0IHNwZWNpZmljIHN1YmNsYXNzIGVycm9ycyBvdmVyIHRoZSB3aXJlLiBXZVxuICAgIC8vIHNob3VsZCBjb21lIHVwIHdpdGggYSBtb3JlIGdlbmVyaWMgd2F5IHRvIGRvIHRoaXMgKGVnLCB3aXRoIHNvbWUgc29ydCBvZlxuICAgIC8vIHN5bWJvbGljIGVycm9yIGNvZGUgcmF0aGVyIHRoYW4gYSBudW1iZXIpLlxuICAgIHRoaXMuTG9naW5DYW5jZWxsZWRFcnJvci5udW1lcmljRXJyb3IgPSAweDhhY2RjMmY7XG5cbiAgICAvLyBsb2dpblNlcnZpY2VDb25maWd1cmF0aW9uIGFuZCBDb25maWdFcnJvciBhcmUgbWFpbnRhaW5lZCBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcbiAgICBNZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gICAgICBjb25zdCB7IFNlcnZpY2VDb25maWd1cmF0aW9uIH0gPSBQYWNrYWdlWydzZXJ2aWNlLWNvbmZpZ3VyYXRpb24nXTtcbiAgICAgIHRoaXMubG9naW5TZXJ2aWNlQ29uZmlndXJhdGlvbiA9IFNlcnZpY2VDb25maWd1cmF0aW9uLmNvbmZpZ3VyYXRpb25zO1xuICAgICAgdGhpcy5Db25maWdFcnJvciA9IFNlcnZpY2VDb25maWd1cmF0aW9uLkNvbmZpZ0Vycm9yO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEdldCB0aGUgY3VycmVudCB1c2VyIGlkLCBvciBgbnVsbGAgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4uIEEgcmVhY3RpdmUgZGF0YSBzb3VyY2UuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKi9cbiAgdXNlcklkKCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcInVzZXJJZCBtZXRob2Qgbm90IGltcGxlbWVudGVkXCIpO1xuICB9XG5cbiAgLy8gbWVyZ2UgdGhlIGRlZmF1bHRGaWVsZFNlbGVjdG9yIHdpdGggYW4gZXhpc3Rpbmcgb3B0aW9ucyBvYmplY3RcbiAgX2FkZERlZmF1bHRGaWVsZFNlbGVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIC8vIHRoaXMgd2lsbCBiZSB0aGUgbW9zdCBjb21tb24gY2FzZSBmb3IgbW9zdCBwZW9wbGUsIHNvIG1ha2UgaXQgcXVpY2tcbiAgICBpZiAoIXRoaXMuX29wdGlvbnMuZGVmYXVsdEZpZWxkU2VsZWN0b3IpIHJldHVybiBvcHRpb25zO1xuXG4gICAgLy8gaWYgbm8gZmllbGQgc2VsZWN0b3IgdGhlbiBqdXN0IHVzZSBkZWZhdWx0RmllbGRTZWxlY3RvclxuICAgIGlmICghb3B0aW9ucy5maWVsZHMpIHJldHVybiB7XG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgZmllbGRzOiB0aGlzLl9vcHRpb25zLmRlZmF1bHRGaWVsZFNlbGVjdG9yLFxuICAgIH07XG5cbiAgICAvLyBpZiBlbXB0eSBmaWVsZCBzZWxlY3RvciB0aGVuIHRoZSBmdWxsIHVzZXIgb2JqZWN0IGlzIGV4cGxpY2l0bHkgcmVxdWVzdGVkLCBzbyBvYmV5XG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKG9wdGlvbnMuZmllbGRzKTtcbiAgICBpZiAoIWtleXMubGVuZ3RoKSByZXR1cm4gb3B0aW9ucztcblxuICAgIC8vIGlmIHRoZSByZXF1ZXN0ZWQgZmllbGRzIGFyZSArdmUgdGhlbiBpZ25vcmUgZGVmYXVsdEZpZWxkU2VsZWN0b3JcbiAgICAvLyBhc3N1bWUgdGhleSBhcmUgYWxsIGVpdGhlciArdmUgb3IgLXZlIGJlY2F1c2UgTW9uZ28gZG9lc24ndCBsaWtlIG1peGVkXG4gICAgaWYgKCEhb3B0aW9ucy5maWVsZHNba2V5c1swXV0pIHJldHVybiBvcHRpb25zO1xuXG4gICAgLy8gVGhlIHJlcXVlc3RlZCBmaWVsZHMgYXJlIC12ZS5cbiAgICAvLyBJZiB0aGUgZGVmYXVsdEZpZWxkU2VsZWN0b3IgaXMgK3ZlIHRoZW4gdXNlIHJlcXVlc3RlZCBmaWVsZHMsIG90aGVyd2lzZSBtZXJnZSB0aGVtXG4gICAgY29uc3Qga2V5czIgPSBPYmplY3Qua2V5cyh0aGlzLl9vcHRpb25zLmRlZmF1bHRGaWVsZFNlbGVjdG9yKTtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9ucy5kZWZhdWx0RmllbGRTZWxlY3RvcltrZXlzMlswXV0gPyBvcHRpb25zIDoge1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIGZpZWxkczoge1xuICAgICAgICAuLi5vcHRpb25zLmZpZWxkcyxcbiAgICAgICAgLi4udGhpcy5fb3B0aW9ucy5kZWZhdWx0RmllbGRTZWxlY3RvcixcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgR2V0IHRoZSBjdXJyZW50IHVzZXIgcmVjb3JkLCBvciBgbnVsbGAgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4uIEEgcmVhY3RpdmUgZGF0YSBzb3VyY2UuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqIEBwYXJhbSB7TW9uZ29GaWVsZFNwZWNpZmllcn0gb3B0aW9ucy5maWVsZHMgRGljdGlvbmFyeSBvZiBmaWVsZHMgdG8gcmV0dXJuIG9yIGV4Y2x1ZGUuXG4gICAqL1xuICB1c2VyKG9wdGlvbnMpIHtcbiAgICBjb25zdCB1c2VySWQgPSB0aGlzLnVzZXJJZCgpO1xuICAgIHJldHVybiB1c2VySWQgPyB0aGlzLnVzZXJzLmZpbmRPbmUodXNlcklkLCB0aGlzLl9hZGREZWZhdWx0RmllbGRTZWxlY3RvcihvcHRpb25zKSkgOiBudWxsO1xuICB9XG5cbiAgLy8gU2V0IHVwIGNvbmZpZyBmb3IgdGhlIGFjY291bnRzIHN5c3RlbS4gQ2FsbCB0aGlzIG9uIGJvdGggdGhlIGNsaWVudFxuICAvLyBhbmQgdGhlIHNlcnZlci5cbiAgLy9cbiAgLy8gTm90ZSB0aGF0IHRoaXMgbWV0aG9kIGdldHMgb3ZlcnJpZGRlbiBvbiBBY2NvdW50c1NlcnZlci5wcm90b3R5cGUsIGJ1dFxuICAvLyB0aGUgb3ZlcnJpZGluZyBtZXRob2QgY2FsbHMgdGhlIG92ZXJyaWRkZW4gbWV0aG9kLlxuICAvL1xuICAvLyBYWFggd2Ugc2hvdWxkIGFkZCBzb21lIGVuZm9yY2VtZW50IHRoYXQgdGhpcyBpcyBjYWxsZWQgb24gYm90aCB0aGVcbiAgLy8gY2xpZW50IGFuZCB0aGUgc2VydmVyLiBPdGhlcndpc2UsIGEgdXNlciBjYW5cbiAgLy8gJ2ZvcmJpZENsaWVudEFjY291bnRDcmVhdGlvbicgb25seSBvbiB0aGUgY2xpZW50IGFuZCB3aGlsZSBpdCBsb29rc1xuICAvLyBsaWtlIHRoZWlyIGFwcCBpcyBzZWN1cmUsIHRoZSBzZXJ2ZXIgd2lsbCBzdGlsbCBhY2NlcHQgY3JlYXRlVXNlclxuICAvLyBjYWxscy4gaHR0cHM6Ly9naXRodWIuY29tL21ldGVvci9tZXRlb3IvaXNzdWVzLzgyOFxuICAvL1xuICAvLyBAcGFyYW0gb3B0aW9ucyB7T2JqZWN0fSBhbiBvYmplY3Qgd2l0aCBmaWVsZHM6XG4gIC8vIC0gc2VuZFZlcmlmaWNhdGlvbkVtYWlsIHtCb29sZWFufVxuICAvLyAgICAgU2VuZCBlbWFpbCBhZGRyZXNzIHZlcmlmaWNhdGlvbiBlbWFpbHMgdG8gbmV3IHVzZXJzIGNyZWF0ZWQgZnJvbVxuICAvLyAgICAgY2xpZW50IHNpZ251cHMuXG4gIC8vIC0gZm9yYmlkQ2xpZW50QWNjb3VudENyZWF0aW9uIHtCb29sZWFufVxuICAvLyAgICAgRG8gbm90IGFsbG93IGNsaWVudHMgdG8gY3JlYXRlIGFjY291bnRzIGRpcmVjdGx5LlxuICAvLyAtIHJlc3RyaWN0Q3JlYXRpb25CeUVtYWlsRG9tYWluIHtGdW5jdGlvbiBvciBTdHJpbmd9XG4gIC8vICAgICBSZXF1aXJlIGNyZWF0ZWQgdXNlcnMgdG8gaGF2ZSBhbiBlbWFpbCBtYXRjaGluZyB0aGUgZnVuY3Rpb24gb3JcbiAgLy8gICAgIGhhdmluZyB0aGUgc3RyaW5nIGFzIGRvbWFpbi5cbiAgLy8gLSBsb2dpbkV4cGlyYXRpb25JbkRheXMge051bWJlcn1cbiAgLy8gICAgIE51bWJlciBvZiBkYXlzIHNpbmNlIGxvZ2luIHVudGlsIGEgdXNlciBpcyBsb2dnZWQgb3V0IChsb2dpbiB0b2tlblxuICAvLyAgICAgZXhwaXJlcykuXG4gIC8vIC0gcGFzc3dvcmRSZXNldFRva2VuRXhwaXJhdGlvbkluRGF5cyB7TnVtYmVyfVxuICAvLyAgICAgTnVtYmVyIG9mIGRheXMgc2luY2UgcGFzc3dvcmQgcmVzZXQgdG9rZW4gY3JlYXRpb24gdW50aWwgdGhlXG4gIC8vICAgICB0b2tlbiBjYW5udCBiZSB1c2VkIGFueSBsb25nZXIgKHBhc3N3b3JkIHJlc2V0IHRva2VuIGV4cGlyZXMpLlxuICAvLyAtIGFtYmlndW91c0Vycm9yTWVzc2FnZXMge0Jvb2xlYW59XG4gIC8vICAgICBSZXR1cm4gYW1iaWd1b3VzIGVycm9yIG1lc3NhZ2VzIGZyb20gbG9naW4gZmFpbHVyZXMgdG8gcHJldmVudFxuICAvLyAgICAgdXNlciBlbnVtZXJhdGlvbi5cbiAgLy8gLSBiY3J5cHRSb3VuZHMge051bWJlcn1cbiAgLy8gICAgIEFsbG93cyBvdmVycmlkZSBvZiBudW1iZXIgb2YgYmNyeXB0IHJvdW5kcyAoYWthIHdvcmsgZmFjdG9yKSB1c2VkXG4gIC8vICAgICB0byBzdG9yZSBwYXNzd29yZHMuXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFNldCBnbG9iYWwgYWNjb3VudHMgb3B0aW9ucy5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5zZW5kVmVyaWZpY2F0aW9uRW1haWwgTmV3IHVzZXJzIHdpdGggYW4gZW1haWwgYWRkcmVzcyB3aWxsIHJlY2VpdmUgYW4gYWRkcmVzcyB2ZXJpZmljYXRpb24gZW1haWwuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5mb3JiaWRDbGllbnRBY2NvdW50Q3JlYXRpb24gQ2FsbHMgdG8gW2BjcmVhdGVVc2VyYF0oI2FjY291bnRzX2NyZWF0ZXVzZXIpIGZyb20gdGhlIGNsaWVudCB3aWxsIGJlIHJlamVjdGVkLiBJbiBhZGRpdGlvbiwgaWYgeW91IGFyZSB1c2luZyBbYWNjb3VudHMtdWldKCNhY2NvdW50c3VpKSwgdGhlIFwiQ3JlYXRlIGFjY291bnRcIiBsaW5rIHdpbGwgbm90IGJlIGF2YWlsYWJsZS5cbiAgICogQHBhcmFtIHtTdHJpbmcgfCBGdW5jdGlvbn0gb3B0aW9ucy5yZXN0cmljdENyZWF0aW9uQnlFbWFpbERvbWFpbiBJZiBzZXQgdG8gYSBzdHJpbmcsIG9ubHkgYWxsb3dzIG5ldyB1c2VycyBpZiB0aGUgZG9tYWluIHBhcnQgb2YgdGhlaXIgZW1haWwgYWRkcmVzcyBtYXRjaGVzIHRoZSBzdHJpbmcuIElmIHNldCB0byBhIGZ1bmN0aW9uLCBvbmx5IGFsbG93cyBuZXcgdXNlcnMgaWYgdGhlIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZS4gIFRoZSBmdW5jdGlvbiBpcyBwYXNzZWQgdGhlIGZ1bGwgZW1haWwgYWRkcmVzcyBvZiB0aGUgcHJvcG9zZWQgbmV3IHVzZXIuICBXb3JrcyB3aXRoIHBhc3N3b3JkLWJhc2VkIHNpZ24taW4gYW5kIGV4dGVybmFsIHNlcnZpY2VzIHRoYXQgZXhwb3NlIGVtYWlsIGFkZHJlc3NlcyAoR29vZ2xlLCBGYWNlYm9vaywgR2l0SHViKS4gQWxsIGV4aXN0aW5nIHVzZXJzIHN0aWxsIGNhbiBsb2cgaW4gYWZ0ZXIgZW5hYmxpbmcgdGhpcyBvcHRpb24uIEV4YW1wbGU6IGBBY2NvdW50cy5jb25maWcoeyByZXN0cmljdENyZWF0aW9uQnlFbWFpbERvbWFpbjogJ3NjaG9vbC5lZHUnIH0pYC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMubG9naW5FeHBpcmF0aW9uSW5EYXlzIFRoZSBudW1iZXIgb2YgZGF5cyBmcm9tIHdoZW4gYSB1c2VyIGxvZ3MgaW4gdW50aWwgdGhlaXIgdG9rZW4gZXhwaXJlcyBhbmQgdGhleSBhcmUgbG9nZ2VkIG91dC4gRGVmYXVsdHMgdG8gOTAuIFNldCB0byBgbnVsbGAgdG8gZGlzYWJsZSBsb2dpbiBleHBpcmF0aW9uLlxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5sb2dpbkV4cGlyYXRpb24gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgZnJvbSB3aGVuIGEgdXNlciBsb2dzIGluIHVudGlsIHRoZWlyIHRva2VuIGV4cGlyZXMgYW5kIHRoZXkgYXJlIGxvZ2dlZCBvdXQsIGZvciBhIG1vcmUgZ3JhbnVsYXIgY29udHJvbC4gSWYgYGxvZ2luRXhwaXJhdGlvbkluRGF5c2AgaXMgc2V0LCBpdCB0YWtlcyBwcmVjZWRlbnQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLm9hdXRoU2VjcmV0S2V5IFdoZW4gdXNpbmcgdGhlIGBvYXV0aC1lbmNyeXB0aW9uYCBwYWNrYWdlLCB0aGUgMTYgYnl0ZSBrZXkgdXNpbmcgdG8gZW5jcnlwdCBzZW5zaXRpdmUgYWNjb3VudCBjcmVkZW50aWFscyBpbiB0aGUgZGF0YWJhc2UsIGVuY29kZWQgaW4gYmFzZTY0LiAgVGhpcyBvcHRpb24gbWF5IG9ubHkgYmUgc3BlY2lmaWVkIG9uIHRoZSBzZXJ2ZXIuICBTZWUgcGFja2FnZXMvb2F1dGgtZW5jcnlwdGlvbi9SRUFETUUubWQgZm9yIGRldGFpbHMuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLnBhc3N3b3JkUmVzZXRUb2tlbkV4cGlyYXRpb25JbkRheXMgVGhlIG51bWJlciBvZiBkYXlzIGZyb20gd2hlbiBhIGxpbmsgdG8gcmVzZXQgcGFzc3dvcmQgaXMgc2VudCB1bnRpbCB0b2tlbiBleHBpcmVzIGFuZCB1c2VyIGNhbid0IHJlc2V0IHBhc3N3b3JkIHdpdGggdGhlIGxpbmsgYW55bW9yZS4gRGVmYXVsdHMgdG8gMy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMucGFzc3dvcmRSZXNldFRva2VuRXhwaXJhdGlvbiBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmcm9tIHdoZW4gYSBsaW5rIHRvIHJlc2V0IHBhc3N3b3JkIGlzIHNlbnQgdW50aWwgdG9rZW4gZXhwaXJlcyBhbmQgdXNlciBjYW4ndCByZXNldCBwYXNzd29yZCB3aXRoIHRoZSBsaW5rIGFueW1vcmUuIElmIGBwYXNzd29yZFJlc2V0VG9rZW5FeHBpcmF0aW9uSW5EYXlzYCBpcyBzZXQsIGl0IHRha2VzIHByZWNlZGVudC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMucGFzc3dvcmRFbnJvbGxUb2tlbkV4cGlyYXRpb25JbkRheXMgVGhlIG51bWJlciBvZiBkYXlzIGZyb20gd2hlbiBhIGxpbmsgdG8gc2V0IGluaXRpYWwgcGFzc3dvcmQgaXMgc2VudCB1bnRpbCB0b2tlbiBleHBpcmVzIGFuZCB1c2VyIGNhbid0IHNldCBwYXNzd29yZCB3aXRoIHRoZSBsaW5rIGFueW1vcmUuIERlZmF1bHRzIHRvIDMwLlxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5wYXNzd29yZEVucm9sbFRva2VuRXhwaXJhdGlvbiBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBmcm9tIHdoZW4gYSBsaW5rIHRvIHNldCBpbml0aWFsIHBhc3N3b3JkIGlzIHNlbnQgdW50aWwgdG9rZW4gZXhwaXJlcyBhbmQgdXNlciBjYW4ndCBzZXQgcGFzc3dvcmQgd2l0aCB0aGUgbGluayBhbnltb3JlLiBJZiBgcGFzc3dvcmRFbnJvbGxUb2tlbkV4cGlyYXRpb25JbkRheXNgIGlzIHNldCwgaXQgdGFrZXMgcHJlY2VkZW50LlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMuYW1iaWd1b3VzRXJyb3JNZXNzYWdlcyBSZXR1cm4gYW1iaWd1b3VzIGVycm9yIG1lc3NhZ2VzIGZyb20gbG9naW4gZmFpbHVyZXMgdG8gcHJldmVudCB1c2VyIGVudW1lcmF0aW9uLiBEZWZhdWx0cyB0byBmYWxzZS5cbiAgICogQHBhcmFtIHtNb25nb0ZpZWxkU3BlY2lmaWVyfSBvcHRpb25zLmRlZmF1bHRGaWVsZFNlbGVjdG9yIFRvIGV4Y2x1ZGUgYnkgZGVmYXVsdCBsYXJnZSBjdXN0b20gZmllbGRzIGZyb20gYE1ldGVvci51c2VyKClgIGFuZCBgTWV0ZW9yLmZpbmRVc2VyQnkuLi4oKWAgZnVuY3Rpb25zIHdoZW4gY2FsbGVkIHdpdGhvdXQgYSBmaWVsZCBzZWxlY3RvciwgYW5kIGFsbCBgb25Mb2dpbmAsIGBvbkxvZ2luRmFpbHVyZWAgYW5kIGBvbkxvZ291dGAgY2FsbGJhY2tzLiAgRXhhbXBsZTogYEFjY291bnRzLmNvbmZpZyh7IGRlZmF1bHRGaWVsZFNlbGVjdG9yOiB7IG15QmlnQXJyYXk6IDAgfX0pYC4gQmV3YXJlIHdoZW4gdXNpbmcgdGhpcy4gSWYsIGZvciBpbnN0YW5jZSwgeW91IGRvIG5vdCBpbmNsdWRlIGBlbWFpbGAgd2hlbiBleGNsdWRpbmcgdGhlIGZpZWxkcywgeW91IGNhbiBoYXZlIHByb2JsZW1zIHdpdGggZnVuY3Rpb25zIGxpa2UgYGZvcmdvdFBhc3N3b3JkYCB0aGF0IHdpbGwgYnJlYWsgYmVjYXVzZSB0aGV5IHdvbid0IGhhdmUgdGhlIHJlcXVpcmVkIGRhdGEgYXZhaWxhYmxlLiBJdCdzIHJlY29tbWVuZCB0aGF0IHlvdSBhbHdheXMga2VlcCB0aGUgZmllbGRzIGBfaWRgLCBgdXNlcm5hbWVgLCBhbmQgYGVtYWlsYC5cbiAgICovXG4gIGNvbmZpZyhvcHRpb25zKSB7XG4gICAgLy8gV2UgZG9uJ3Qgd2FudCB1c2VycyB0byBhY2NpZGVudGFsbHkgb25seSBjYWxsIEFjY291bnRzLmNvbmZpZyBvbiB0aGVcbiAgICAvLyBjbGllbnQsIHdoZXJlIHNvbWUgb2YgdGhlIG9wdGlvbnMgd2lsbCBoYXZlIHBhcnRpYWwgZWZmZWN0cyAoZWcgcmVtb3ZpbmdcbiAgICAvLyB0aGUgXCJjcmVhdGUgYWNjb3VudFwiIGJ1dHRvbiBmcm9tIGFjY291bnRzLXVpIGlmIGZvcmJpZENsaWVudEFjY291bnRDcmVhdGlvblxuICAgIC8vIGlzIHNldCwgb3IgcmVkaXJlY3RpbmcgR29vZ2xlIGxvZ2luIHRvIGEgc3BlY2lmaWMtZG9tYWluIHBhZ2UpIHdpdGhvdXRcbiAgICAvLyBoYXZpbmcgdGhlaXIgZnVsbCBlZmZlY3RzLlxuICAgIGlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgICAgIF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uYWNjb3VudHNDb25maWdDYWxsZWQgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoIV9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uYWNjb3VudHNDb25maWdDYWxsZWQpIHtcbiAgICAgIC8vIFhYWCB3b3VsZCBiZSBuaWNlIHRvIFwiY3Jhc2hcIiB0aGUgY2xpZW50IGFuZCByZXBsYWNlIHRoZSBVSSB3aXRoIGFuIGVycm9yXG4gICAgICAvLyBtZXNzYWdlLCBidXQgdGhlcmUncyBubyB0cml2aWFsIHdheSB0byBkbyB0aGlzLlxuICAgICAgTWV0ZW9yLl9kZWJ1ZyhcIkFjY291bnRzLmNvbmZpZyB3YXMgY2FsbGVkIG9uIHRoZSBjbGllbnQgYnV0IG5vdCBvbiB0aGUgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcInNlcnZlcjsgc29tZSBjb25maWd1cmF0aW9uIG9wdGlvbnMgbWF5IG5vdCB0YWtlIGVmZmVjdC5cIik7XG4gICAgfVxuXG4gICAgLy8gV2UgbmVlZCB0byB2YWxpZGF0ZSB0aGUgb2F1dGhTZWNyZXRLZXkgb3B0aW9uIGF0IHRoZSB0aW1lXG4gICAgLy8gQWNjb3VudHMuY29uZmlnIGlzIGNhbGxlZC4gV2UgYWxzbyBkZWxpYmVyYXRlbHkgZG9uJ3Qgc3RvcmUgdGhlXG4gICAgLy8gb2F1dGhTZWNyZXRLZXkgaW4gQWNjb3VudHMuX29wdGlvbnMuXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvcHRpb25zLCAnb2F1dGhTZWNyZXRLZXknKSkge1xuICAgICAgaWYgKE1ldGVvci5pc0NsaWVudCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgb2F1dGhTZWNyZXRLZXkgb3B0aW9uIG1heSBvbmx5IGJlIHNwZWNpZmllZCBvbiB0aGUgc2VydmVyXCIpO1xuICAgICAgfVxuICAgICAgaWYgKCEgUGFja2FnZVtcIm9hdXRoLWVuY3J5cHRpb25cIl0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIG9hdXRoLWVuY3J5cHRpb24gcGFja2FnZSBtdXN0IGJlIGxvYWRlZCB0byBzZXQgb2F1dGhTZWNyZXRLZXlcIik7XG4gICAgICB9XG4gICAgICBQYWNrYWdlW1wib2F1dGgtZW5jcnlwdGlvblwiXS5PQXV0aEVuY3J5cHRpb24ubG9hZEtleShvcHRpb25zLm9hdXRoU2VjcmV0S2V5KTtcbiAgICAgIG9wdGlvbnMgPSB7IC4uLm9wdGlvbnMgfTtcbiAgICAgIGRlbGV0ZSBvcHRpb25zLm9hdXRoU2VjcmV0S2V5O1xuICAgIH1cblxuICAgIC8vIHZhbGlkYXRlIG9wdGlvbiBrZXlzXG4gICAgY29uc3QgVkFMSURfS0VZUyA9IFtcInNlbmRWZXJpZmljYXRpb25FbWFpbFwiLCBcImZvcmJpZENsaWVudEFjY291bnRDcmVhdGlvblwiLCBcInBhc3N3b3JkRW5yb2xsVG9rZW5FeHBpcmF0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgXCJwYXNzd29yZEVucm9sbFRva2VuRXhwaXJhdGlvbkluRGF5c1wiLCBcInJlc3RyaWN0Q3JlYXRpb25CeUVtYWlsRG9tYWluXCIsIFwibG9naW5FeHBpcmF0aW9uSW5EYXlzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgXCJsb2dpbkV4cGlyYXRpb25cIiwgXCJwYXNzd29yZFJlc2V0VG9rZW5FeHBpcmF0aW9uSW5EYXlzXCIsIFwicGFzc3dvcmRSZXNldFRva2VuRXhwaXJhdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICAgIFwiYW1iaWd1b3VzRXJyb3JNZXNzYWdlc1wiLCBcImJjcnlwdFJvdW5kc1wiLCBcImRlZmF1bHRGaWVsZFNlbGVjdG9yXCJdO1xuXG4gICAgT2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgaWYgKCFWQUxJRF9LRVlTLmluY2x1ZGVzKGtleSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBY2NvdW50cy5jb25maWc6IEludmFsaWQga2V5OiAke2tleX1gKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHNldCB2YWx1ZXMgaW4gQWNjb3VudHMuX29wdGlvbnNcbiAgICBWQUxJRF9LRVlTLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGlmIChrZXkgaW4gb3B0aW9ucykge1xuICAgICAgICBpZiAoa2V5IGluIHRoaXMuX29wdGlvbnMpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IHNldCBcXGAke2tleX1cXGAgbW9yZSB0aGFuIG9uY2VgKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9vcHRpb25zW2tleV0gPSBvcHRpb25zW2tleV07XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgUmVnaXN0ZXIgYSBjYWxsYmFjayB0byBiZSBjYWxsZWQgYWZ0ZXIgYSBsb2dpbiBhdHRlbXB0IHN1Y2NlZWRzLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIHdoZW4gbG9naW4gaXMgc3VjY2Vzc2Z1bC5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICBUaGUgY2FsbGJhY2sgcmVjZWl2ZXMgYSBzaW5nbGUgb2JqZWN0IHRoYXRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICBob2xkcyBsb2dpbiBkZXRhaWxzLiBUaGlzIG9iamVjdCBjb250YWlucyB0aGUgbG9naW5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgdHlwZSAocGFzc3dvcmQsIHJlc3VtZSwgZXRjLikgb24gYm90aCB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICBjbGllbnQgYW5kIHNlcnZlci4gYG9uTG9naW5gIGNhbGxiYWNrcyByZWdpc3RlcmVkXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgb24gdGhlIHNlcnZlciBhbHNvIHJlY2VpdmUgZXh0cmEgZGF0YSwgc3VjaFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgIGFzIHVzZXIgZGV0YWlscywgY29ubmVjdGlvbiBpbmZvcm1hdGlvbiwgZXRjLlxuICAgKi9cbiAgb25Mb2dpbihmdW5jKSB7XG4gICAgbGV0IHJldCA9IHRoaXMuX29uTG9naW5Ib29rLnJlZ2lzdGVyKGZ1bmMpO1xuICAgIC8vIGNhbGwgdGhlIGp1c3QgcmVnaXN0ZXJlZCBjYWxsYmFjayBpZiBhbHJlYWR5IGxvZ2dlZCBpblxuICAgIHRoaXMuX3N0YXJ0dXBDYWxsYmFjayhyZXQuY2FsbGJhY2spO1xuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgUmVnaXN0ZXIgYSBjYWxsYmFjayB0byBiZSBjYWxsZWQgYWZ0ZXIgYSBsb2dpbiBhdHRlbXB0IGZhaWxzLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIGFmdGVyIHRoZSBsb2dpbiBoYXMgZmFpbGVkLlxuICAgKi9cbiAgb25Mb2dpbkZhaWx1cmUoZnVuYykge1xuICAgIHJldHVybiB0aGlzLl9vbkxvZ2luRmFpbHVyZUhvb2sucmVnaXN0ZXIoZnVuYyk7XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgUmVnaXN0ZXIgYSBjYWxsYmFjayB0byBiZSBjYWxsZWQgYWZ0ZXIgYSBsb2dvdXQgYXR0ZW1wdCBzdWNjZWVkcy5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCB3aGVuIGxvZ291dCBpcyBzdWNjZXNzZnVsLlxuICAgKi9cbiAgb25Mb2dvdXQoZnVuYykge1xuICAgIHJldHVybiB0aGlzLl9vbkxvZ291dEhvb2sucmVnaXN0ZXIoZnVuYyk7XG4gIH1cblxuICBfaW5pdENvbm5lY3Rpb24ob3B0aW9ucykge1xuICAgIGlmICghIE1ldGVvci5pc0NsaWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRoZSBjb25uZWN0aW9uIHVzZWQgYnkgdGhlIEFjY291bnRzIHN5c3RlbS4gVGhpcyBpcyB0aGUgY29ubmVjdGlvblxuICAgIC8vIHRoYXQgd2lsbCBnZXQgbG9nZ2VkIGluIGJ5IE1ldGVvci5sb2dpbigpLCBhbmQgdGhpcyBpcyB0aGVcbiAgICAvLyBjb25uZWN0aW9uIHdob3NlIGxvZ2luIHN0YXRlIHdpbGwgYmUgcmVmbGVjdGVkIGJ5IE1ldGVvci51c2VySWQoKS5cbiAgICAvL1xuICAgIC8vIEl0IHdvdWxkIGJlIG11Y2ggcHJlZmVyYWJsZSBmb3IgdGhpcyB0byBiZSBpbiBhY2NvdW50c19jbGllbnQuanMsXG4gICAgLy8gYnV0IGl0IGhhcyB0byBiZSBoZXJlIGJlY2F1c2UgaXQncyBuZWVkZWQgdG8gY3JlYXRlIHRoZVxuICAgIC8vIE1ldGVvci51c2VycyBjb2xsZWN0aW9uLlxuICAgIGlmIChvcHRpb25zLmNvbm5lY3Rpb24pIHtcbiAgICAgIHRoaXMuY29ubmVjdGlvbiA9IG9wdGlvbnMuY29ubmVjdGlvbjtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZGRwVXJsKSB7XG4gICAgICB0aGlzLmNvbm5lY3Rpb24gPSBERFAuY29ubmVjdChvcHRpb25zLmRkcFVybCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgX19tZXRlb3JfcnVudGltZV9jb25maWdfXyAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgICAgICAgICAgX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5BQ0NPVU5UU19DT05ORUNUSU9OX1VSTCkge1xuICAgICAgLy8gVGVtcG9yYXJ5LCBpbnRlcm5hbCBob29rIHRvIGFsbG93IHRoZSBzZXJ2ZXIgdG8gcG9pbnQgdGhlIGNsaWVudFxuICAgICAgLy8gdG8gYSBkaWZmZXJlbnQgYXV0aGVudGljYXRpb24gc2VydmVyLiBUaGlzIGlzIGZvciBhIHZlcnlcbiAgICAgIC8vIHBhcnRpY3VsYXIgdXNlIGNhc2UgdGhhdCBjb21lcyB1cCB3aGVuIGltcGxlbWVudGluZyBhIG9hdXRoXG4gICAgICAvLyBzZXJ2ZXIuIFVuc3VwcG9ydGVkIGFuZCBtYXkgZ28gYXdheSBhdCBhbnkgcG9pbnQgaW4gdGltZS5cbiAgICAgIC8vXG4gICAgICAvLyBXZSB3aWxsIGV2ZW50dWFsbHkgcHJvdmlkZSBhIGdlbmVyYWwgd2F5IHRvIHVzZSBhY2NvdW50LWJhc2VcbiAgICAgIC8vIGFnYWluc3QgYW55IEREUCBjb25uZWN0aW9uLCBub3QganVzdCBvbmUgc3BlY2lhbCBvbmUuXG4gICAgICB0aGlzLmNvbm5lY3Rpb24gPVxuICAgICAgICBERFAuY29ubmVjdChfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLkFDQ09VTlRTX0NPTk5FQ1RJT05fVVJMKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb25uZWN0aW9uID0gTWV0ZW9yLmNvbm5lY3Rpb247XG4gICAgfVxuICB9XG5cbiAgX2dldFRva2VuTGlmZXRpbWVNcygpIHtcbiAgICAvLyBXaGVuIGxvZ2luRXhwaXJhdGlvbkluRGF5cyBpcyBzZXQgdG8gbnVsbCwgd2UnbGwgdXNlIGEgcmVhbGx5IGhpZ2hcbiAgICAvLyBudW1iZXIgb2YgZGF5cyAoTE9HSU5fVU5FWFBJUkFCTEVfVE9LRU5fREFZUykgdG8gc2ltdWxhdGUgYW5cbiAgICAvLyB1bmV4cGlyaW5nIHRva2VuLlxuICAgIGNvbnN0IGxvZ2luRXhwaXJhdGlvbkluRGF5cyA9XG4gICAgICAodGhpcy5fb3B0aW9ucy5sb2dpbkV4cGlyYXRpb25JbkRheXMgPT09IG51bGwpXG4gICAgICAgID8gTE9HSU5fVU5FWFBJUklOR19UT0tFTl9EQVlTXG4gICAgICAgIDogdGhpcy5fb3B0aW9ucy5sb2dpbkV4cGlyYXRpb25JbkRheXM7XG4gICAgcmV0dXJuIHRoaXMuX29wdGlvbnMubG9naW5FeHBpcmF0aW9uIHx8IChsb2dpbkV4cGlyYXRpb25JbkRheXNcbiAgICAgICAgfHwgREVGQVVMVF9MT0dJTl9FWFBJUkFUSU9OX0RBWVMpICogODY0MDAwMDA7XG4gIH1cblxuICBfZ2V0UGFzc3dvcmRSZXNldFRva2VuTGlmZXRpbWVNcygpIHtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9ucy5wYXNzd29yZFJlc2V0VG9rZW5FeHBpcmF0aW9uIHx8ICh0aGlzLl9vcHRpb25zLnBhc3N3b3JkUmVzZXRUb2tlbkV4cGlyYXRpb25JbkRheXMgfHxcbiAgICAgICAgICAgIERFRkFVTFRfUEFTU1dPUkRfUkVTRVRfVE9LRU5fRVhQSVJBVElPTl9EQVlTKSAqIDg2NDAwMDAwO1xuICB9XG5cbiAgX2dldFBhc3N3b3JkRW5yb2xsVG9rZW5MaWZldGltZU1zKCkge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zLnBhc3N3b3JkRW5yb2xsVG9rZW5FeHBpcmF0aW9uIHx8ICh0aGlzLl9vcHRpb25zLnBhc3N3b3JkRW5yb2xsVG9rZW5FeHBpcmF0aW9uSW5EYXlzIHx8XG4gICAgICAgIERFRkFVTFRfUEFTU1dPUkRfRU5ST0xMX1RPS0VOX0VYUElSQVRJT05fREFZUykgKiA4NjQwMDAwMDtcbiAgfVxuXG4gIF90b2tlbkV4cGlyYXRpb24od2hlbikge1xuICAgIC8vIFdlIHBhc3Mgd2hlbiB0aHJvdWdoIHRoZSBEYXRlIGNvbnN0cnVjdG9yIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eTtcbiAgICAvLyBgd2hlbmAgdXNlZCB0byBiZSBhIG51bWJlci5cbiAgICByZXR1cm4gbmV3IERhdGUoKG5ldyBEYXRlKHdoZW4pKS5nZXRUaW1lKCkgKyB0aGlzLl9nZXRUb2tlbkxpZmV0aW1lTXMoKSk7XG4gIH1cblxuICBfdG9rZW5FeHBpcmVzU29vbih3aGVuKSB7XG4gICAgbGV0IG1pbkxpZmV0aW1lTXMgPSAuMSAqIHRoaXMuX2dldFRva2VuTGlmZXRpbWVNcygpO1xuICAgIGNvbnN0IG1pbkxpZmV0aW1lQ2FwTXMgPSBNSU5fVE9LRU5fTElGRVRJTUVfQ0FQX1NFQ1MgKiAxMDAwO1xuICAgIGlmIChtaW5MaWZldGltZU1zID4gbWluTGlmZXRpbWVDYXBNcykge1xuICAgICAgbWluTGlmZXRpbWVNcyA9IG1pbkxpZmV0aW1lQ2FwTXM7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRGF0ZSgpID4gKG5ldyBEYXRlKHdoZW4pIC0gbWluTGlmZXRpbWVNcyk7XG4gIH1cblxuICAvLyBOby1vcCBvbiB0aGUgc2VydmVyLCBvdmVycmlkZGVuIG9uIHRoZSBjbGllbnQuXG4gIF9zdGFydHVwQ2FsbGJhY2soY2FsbGJhY2spIHt9XG59XG5cbi8vIE5vdGUgdGhhdCBBY2NvdW50cyBpcyBkZWZpbmVkIHNlcGFyYXRlbHkgaW4gYWNjb3VudHNfY2xpZW50LmpzIGFuZFxuLy8gYWNjb3VudHNfc2VydmVyLmpzLlxuXG4vKipcbiAqIEBzdW1tYXJ5IEdldCB0aGUgY3VycmVudCB1c2VyIGlkLCBvciBgbnVsbGAgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4uIEEgcmVhY3RpdmUgZGF0YSBzb3VyY2UuXG4gKiBAbG9jdXMgQW55d2hlcmUgYnV0IHB1Ymxpc2ggZnVuY3Rpb25zXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgbWV0ZW9yXG4gKi9cbk1ldGVvci51c2VySWQgPSAoKSA9PiBBY2NvdW50cy51c2VySWQoKTtcblxuLyoqXG4gKiBAc3VtbWFyeSBHZXQgdGhlIGN1cnJlbnQgdXNlciByZWNvcmQsIG9yIGBudWxsYCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbi4gQSByZWFjdGl2ZSBkYXRhIHNvdXJjZS5cbiAqIEBsb2N1cyBBbnl3aGVyZSBidXQgcHVibGlzaCBmdW5jdGlvbnNcbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEBwYXJhbSB7TW9uZ29GaWVsZFNwZWNpZmllcn0gb3B0aW9ucy5maWVsZHMgRGljdGlvbmFyeSBvZiBmaWVsZHMgdG8gcmV0dXJuIG9yIGV4Y2x1ZGUuXG4gKi9cbk1ldGVvci51c2VyID0gKG9wdGlvbnMpID0+IEFjY291bnRzLnVzZXIob3B0aW9ucyk7XG5cbi8vIGhvdyBsb25nIChpbiBkYXlzKSB1bnRpbCBhIGxvZ2luIHRva2VuIGV4cGlyZXNcbmNvbnN0IERFRkFVTFRfTE9HSU5fRVhQSVJBVElPTl9EQVlTID0gOTA7XG4vLyBob3cgbG9uZyAoaW4gZGF5cykgdW50aWwgcmVzZXQgcGFzc3dvcmQgdG9rZW4gZXhwaXJlc1xuY29uc3QgREVGQVVMVF9QQVNTV09SRF9SRVNFVF9UT0tFTl9FWFBJUkFUSU9OX0RBWVMgPSAzO1xuLy8gaG93IGxvbmcgKGluIGRheXMpIHVudGlsIGVucm9sIHBhc3N3b3JkIHRva2VuIGV4cGlyZXNcbmNvbnN0IERFRkFVTFRfUEFTU1dPUkRfRU5ST0xMX1RPS0VOX0VYUElSQVRJT05fREFZUyA9IDMwO1xuLy8gQ2xpZW50cyBkb24ndCB0cnkgdG8gYXV0by1sb2dpbiB3aXRoIGEgdG9rZW4gdGhhdCBpcyBnb2luZyB0byBleHBpcmUgd2l0aGluXG4vLyAuMSAqIERFRkFVTFRfTE9HSU5fRVhQSVJBVElPTl9EQVlTLCBjYXBwZWQgYXQgTUlOX1RPS0VOX0xJRkVUSU1FX0NBUF9TRUNTLlxuLy8gVHJpZXMgdG8gYXZvaWQgYWJydXB0IGRpc2Nvbm5lY3RzIGZyb20gZXhwaXJpbmcgdG9rZW5zLlxuY29uc3QgTUlOX1RPS0VOX0xJRkVUSU1FX0NBUF9TRUNTID0gMzYwMDsgLy8gb25lIGhvdXJcbi8vIGhvdyBvZnRlbiAoaW4gbWlsbGlzZWNvbmRzKSB3ZSBjaGVjayBmb3IgZXhwaXJlZCB0b2tlbnNcbmV4cG9ydCBjb25zdCBFWFBJUkVfVE9LRU5TX0lOVEVSVkFMX01TID0gNjAwICogMTAwMDsgLy8gMTAgbWludXRlc1xuLy8gaG93IGxvbmcgd2Ugd2FpdCBiZWZvcmUgbG9nZ2luZyBvdXQgY2xpZW50cyB3aGVuIE1ldGVvci5sb2dvdXRPdGhlckNsaWVudHMgaXNcbi8vIGNhbGxlZFxuZXhwb3J0IGNvbnN0IENPTk5FQ1RJT05fQ0xPU0VfREVMQVlfTVMgPSAxMCAqIDEwMDA7XG4vLyBBIGxhcmdlIG51bWJlciBvZiBleHBpcmF0aW9uIGRheXMgKGFwcHJveGltYXRlbHkgMTAwIHllYXJzIHdvcnRoKSB0aGF0IGlzXG4vLyB1c2VkIHdoZW4gY3JlYXRpbmcgdW5leHBpcmluZyB0b2tlbnMuXG5jb25zdCBMT0dJTl9VTkVYUElSSU5HX1RPS0VOX0RBWVMgPSAzNjUgKiAxMDA7XG4iLCJpbXBvcnQgY3J5cHRvIGZyb20gJ2NyeXB0byc7XG5pbXBvcnQge1xuICBBY2NvdW50c0NvbW1vbixcbiAgRVhQSVJFX1RPS0VOU19JTlRFUlZBTF9NUyxcbiAgQ09OTkVDVElPTl9DTE9TRV9ERUxBWV9NU1xufSBmcm9tICcuL2FjY291bnRzX2NvbW1vbi5qcyc7XG5pbXBvcnQgeyBVUkwgfSBmcm9tICdtZXRlb3IvdXJsJztcblxuY29uc3QgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBAc3VtbWFyeSBDb25zdHJ1Y3RvciBmb3IgdGhlIGBBY2NvdW50c2AgbmFtZXNwYWNlIG9uIHRoZSBzZXJ2ZXIuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAY2xhc3MgQWNjb3VudHNTZXJ2ZXJcbiAqIEBleHRlbmRzIEFjY291bnRzQ29tbW9uXG4gKiBAaW5zdGFuY2VuYW1lIGFjY291bnRzU2VydmVyXG4gKiBAcGFyYW0ge09iamVjdH0gc2VydmVyIEEgc2VydmVyIG9iamVjdCBzdWNoIGFzIGBNZXRlb3Iuc2VydmVyYC5cbiAqL1xuZXhwb3J0IGNsYXNzIEFjY291bnRzU2VydmVyIGV4dGVuZHMgQWNjb3VudHNDb21tb24ge1xuICAvLyBOb3RlIHRoYXQgdGhpcyBjb25zdHJ1Y3RvciBpcyBsZXNzIGxpa2VseSB0byBiZSBpbnN0YW50aWF0ZWQgbXVsdGlwbGVcbiAgLy8gdGltZXMgdGhhbiB0aGUgYEFjY291bnRzQ2xpZW50YCBjb25zdHJ1Y3RvciwgYmVjYXVzZSBhIHNpbmdsZSBzZXJ2ZXJcbiAgLy8gY2FuIHByb3ZpZGUgb25seSBvbmUgc2V0IG9mIG1ldGhvZHMuXG4gIGNvbnN0cnVjdG9yKHNlcnZlcikge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9zZXJ2ZXIgPSBzZXJ2ZXIgfHwgTWV0ZW9yLnNlcnZlcjtcbiAgICAvLyBTZXQgdXAgdGhlIHNlcnZlcidzIG1ldGhvZHMsIGFzIGlmIGJ5IGNhbGxpbmcgTWV0ZW9yLm1ldGhvZHMuXG4gICAgdGhpcy5faW5pdFNlcnZlck1ldGhvZHMoKTtcblxuICAgIHRoaXMuX2luaXRBY2NvdW50RGF0YUhvb2tzKCk7XG5cbiAgICAvLyBJZiBhdXRvcHVibGlzaCBpcyBvbiwgcHVibGlzaCB0aGVzZSB1c2VyIGZpZWxkcy4gTG9naW4gc2VydmljZVxuICAgIC8vIHBhY2thZ2VzIChlZyBhY2NvdW50cy1nb29nbGUpIGFkZCB0byB0aGVzZSBieSBjYWxsaW5nXG4gICAgLy8gYWRkQXV0b3B1Ymxpc2hGaWVsZHMuICBOb3RhYmx5LCB0aGlzIGlzbid0IGltcGxlbWVudGVkIHdpdGggbXVsdGlwbGVcbiAgICAvLyBwdWJsaXNoZXMgc2luY2UgRERQIG9ubHkgbWVyZ2VzIG9ubHkgYWNyb3NzIHRvcC1sZXZlbCBmaWVsZHMsIG5vdFxuICAgIC8vIHN1YmZpZWxkcyAoc3VjaCBhcyAnc2VydmljZXMuZmFjZWJvb2suYWNjZXNzVG9rZW4nKVxuICAgIHRoaXMuX2F1dG9wdWJsaXNoRmllbGRzID0ge1xuICAgICAgbG9nZ2VkSW5Vc2VyOiBbJ3Byb2ZpbGUnLCAndXNlcm5hbWUnLCAnZW1haWxzJ10sXG4gICAgICBvdGhlclVzZXJzOiBbJ3Byb2ZpbGUnLCAndXNlcm5hbWUnXVxuICAgIH07XG5cbiAgICAvLyB1c2Ugb2JqZWN0IHRvIGtlZXAgdGhlIHJlZmVyZW5jZSB3aGVuIHVzZWQgaW4gZnVuY3Rpb25zXG4gICAgLy8gd2hlcmUgX2RlZmF1bHRQdWJsaXNoRmllbGRzIGlzIGRlc3RydWN0dXJlZCBpbnRvIGxleGljYWwgc2NvcGVcbiAgICAvLyBmb3IgcHVibGlzaCBjYWxsYmFja3MgdGhhdCBuZWVkIGB0aGlzYFxuICAgIHRoaXMuX2RlZmF1bHRQdWJsaXNoRmllbGRzID0ge1xuICAgICAgcHJvamVjdGlvbjoge1xuICAgICAgICBwcm9maWxlOiAxLFxuICAgICAgICB1c2VybmFtZTogMSxcbiAgICAgICAgZW1haWxzOiAxLFxuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLl9pbml0U2VydmVyUHVibGljYXRpb25zKCk7XG5cbiAgICAvLyBjb25uZWN0aW9uSWQgLT4ge2Nvbm5lY3Rpb24sIGxvZ2luVG9rZW59XG4gICAgdGhpcy5fYWNjb3VudERhdGEgPSB7fTtcblxuICAgIC8vIGNvbm5lY3Rpb24gaWQgLT4gb2JzZXJ2ZSBoYW5kbGUgZm9yIHRoZSBsb2dpbiB0b2tlbiB0aGF0IHRoaXMgY29ubmVjdGlvbiBpc1xuICAgIC8vIGN1cnJlbnRseSBhc3NvY2lhdGVkIHdpdGgsIG9yIGEgbnVtYmVyLiBUaGUgbnVtYmVyIGluZGljYXRlcyB0aGF0IHdlIGFyZSBpblxuICAgIC8vIHRoZSBwcm9jZXNzIG9mIHNldHRpbmcgdXAgdGhlIG9ic2VydmUgKHVzaW5nIGEgbnVtYmVyIGluc3RlYWQgb2YgYSBzaW5nbGVcbiAgICAvLyBzZW50aW5lbCBhbGxvd3MgbXVsdGlwbGUgYXR0ZW1wdHMgdG8gc2V0IHVwIHRoZSBvYnNlcnZlIHRvIGlkZW50aWZ5IHdoaWNoXG4gICAgLy8gb25lIHdhcyB0aGVpcnMpLlxuICAgIHRoaXMuX3VzZXJPYnNlcnZlc0ZvckNvbm5lY3Rpb25zID0ge307XG4gICAgdGhpcy5fbmV4dFVzZXJPYnNlcnZlTnVtYmVyID0gMTsgIC8vIGZvciB0aGUgbnVtYmVyIGRlc2NyaWJlZCBhYm92ZS5cblxuICAgIC8vIGxpc3Qgb2YgYWxsIHJlZ2lzdGVyZWQgaGFuZGxlcnMuXG4gICAgdGhpcy5fbG9naW5IYW5kbGVycyA9IFtdO1xuXG4gICAgc2V0dXBVc2Vyc0NvbGxlY3Rpb24odGhpcy51c2Vycyk7XG4gICAgc2V0dXBEZWZhdWx0TG9naW5IYW5kbGVycyh0aGlzKTtcbiAgICBzZXRFeHBpcmVUb2tlbnNJbnRlcnZhbCh0aGlzKTtcblxuICAgIHRoaXMuX3ZhbGlkYXRlTG9naW5Ib29rID0gbmV3IEhvb2soeyBiaW5kRW52aXJvbm1lbnQ6IGZhbHNlIH0pO1xuICAgIHRoaXMuX3ZhbGlkYXRlTmV3VXNlckhvb2tzID0gW1xuICAgICAgZGVmYXVsdFZhbGlkYXRlTmV3VXNlckhvb2suYmluZCh0aGlzKVxuICAgIF07XG5cbiAgICB0aGlzLl9kZWxldGVTYXZlZFRva2Vuc0ZvckFsbFVzZXJzT25TdGFydHVwKCk7XG5cbiAgICB0aGlzLl9za2lwQ2FzZUluc2Vuc2l0aXZlQ2hlY2tzRm9yVGVzdCA9IHt9O1xuXG4gICAgdGhpcy51cmxzID0ge1xuICAgICAgcmVzZXRQYXNzd29yZDogKHRva2VuLCBleHRyYVBhcmFtcykgPT4gdGhpcy5idWlsZEVtYWlsVXJsKGAjL3Jlc2V0LXBhc3N3b3JkLyR7dG9rZW59YCwgZXh0cmFQYXJhbXMpLFxuICAgICAgdmVyaWZ5RW1haWw6ICh0b2tlbiwgZXh0cmFQYXJhbXMpID0+IHRoaXMuYnVpbGRFbWFpbFVybChgIy92ZXJpZnktZW1haWwvJHt0b2tlbn1gLCBleHRyYVBhcmFtcyksXG4gICAgICBlbnJvbGxBY2NvdW50OiAodG9rZW4sIGV4dHJhUGFyYW1zKSA9PiB0aGlzLmJ1aWxkRW1haWxVcmwoYCMvZW5yb2xsLWFjY291bnQvJHt0b2tlbn1gLCBleHRyYVBhcmFtcyksXG4gICAgfTtcblxuICAgIHRoaXMuYWRkRGVmYXVsdFJhdGVMaW1pdCgpO1xuXG4gICAgdGhpcy5idWlsZEVtYWlsVXJsID0gKHBhdGgsIGV4dHJhUGFyYW1zID0ge30pID0+IHtcbiAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwoTWV0ZW9yLmFic29sdXRlVXJsKHBhdGgpKTtcbiAgICAgIGNvbnN0IHBhcmFtcyA9IE9iamVjdC5lbnRyaWVzKGV4dHJhUGFyYW1zKTtcbiAgICAgIGlmIChwYXJhbXMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBBZGQgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIHRvIHRoZSB1cmxcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgcGFyYW1zKSB7XG4gICAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB1cmwudG9TdHJpbmcoKTtcbiAgICB9O1xuICB9XG5cbiAgLy8vXG4gIC8vLyBDVVJSRU5UIFVTRVJcbiAgLy8vXG5cbiAgLy8gQG92ZXJyaWRlIG9mIFwiYWJzdHJhY3RcIiBub24taW1wbGVtZW50YXRpb24gaW4gYWNjb3VudHNfY29tbW9uLmpzXG4gIHVzZXJJZCgpIHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIG9ubHkgd29ya3MgaWYgY2FsbGVkIGluc2lkZSBhIG1ldGhvZCBvciBhIHB1YmljYXRpb24uXG4gICAgLy8gVXNpbmcgYW55IG9mIHRoZSBpbmZvcm1hdGlvbiBmcm9tIE1ldGVvci51c2VyKCkgaW4gYSBtZXRob2Qgb3JcbiAgICAvLyBwdWJsaXNoIGZ1bmN0aW9uIHdpbGwgYWx3YXlzIHVzZSB0aGUgdmFsdWUgZnJvbSB3aGVuIHRoZSBmdW5jdGlvbiBmaXJzdFxuICAgIC8vIHJ1bnMuIFRoaXMgaXMgbGlrZWx5IG5vdCB3aGF0IHRoZSB1c2VyIGV4cGVjdHMuIFRoZSB3YXkgdG8gbWFrZSB0aGlzIHdvcmtcbiAgICAvLyBpbiBhIG1ldGhvZCBvciBwdWJsaXNoIGZ1bmN0aW9uIGlzIHRvIGRvIE1ldGVvci5maW5kKHRoaXMudXNlcklkKS5vYnNlcnZlXG4gICAgLy8gYW5kIHJlY29tcHV0ZSB3aGVuIHRoZSB1c2VyIHJlY29yZCBjaGFuZ2VzLlxuICAgIGNvbnN0IGN1cnJlbnRJbnZvY2F0aW9uID0gRERQLl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbi5nZXQoKSB8fCBERFAuX0N1cnJlbnRQdWJsaWNhdGlvbkludm9jYXRpb24uZ2V0KCk7XG4gICAgaWYgKCFjdXJyZW50SW52b2NhdGlvbilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGVvci51c2VySWQgY2FuIG9ubHkgYmUgaW52b2tlZCBpbiBtZXRob2QgY2FsbHMgb3IgcHVibGljYXRpb25zLlwiKTtcbiAgICByZXR1cm4gY3VycmVudEludm9jYXRpb24udXNlcklkO1xuICB9XG5cbiAgLy8vXG4gIC8vLyBMT0dJTiBIT09LU1xuICAvLy9cblxuICAvKipcbiAgICogQHN1bW1hcnkgVmFsaWRhdGUgbG9naW4gYXR0ZW1wdHMuXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBDYWxsZWQgd2hlbmV2ZXIgYSBsb2dpbiBpcyBhdHRlbXB0ZWQgKGVpdGhlciBzdWNjZXNzZnVsIG9yIHVuc3VjY2Vzc2Z1bCkuICBBIGxvZ2luIGNhbiBiZSBhYm9ydGVkIGJ5IHJldHVybmluZyBhIGZhbHN5IHZhbHVlIG9yIHRocm93aW5nIGFuIGV4Y2VwdGlvbi5cbiAgICovXG4gIHZhbGlkYXRlTG9naW5BdHRlbXB0KGZ1bmMpIHtcbiAgICAvLyBFeGNlcHRpb25zIGluc2lkZSB0aGUgaG9vayBjYWxsYmFjayBhcmUgcGFzc2VkIHVwIHRvIHVzLlxuICAgIHJldHVybiB0aGlzLl92YWxpZGF0ZUxvZ2luSG9vay5yZWdpc3RlcihmdW5jKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBTZXQgcmVzdHJpY3Rpb25zIG9uIG5ldyB1c2VyIGNyZWF0aW9uLlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgQ2FsbGVkIHdoZW5ldmVyIGEgbmV3IHVzZXIgaXMgY3JlYXRlZC4gVGFrZXMgdGhlIG5ldyB1c2VyIG9iamVjdCwgYW5kIHJldHVybnMgdHJ1ZSB0byBhbGxvdyB0aGUgY3JlYXRpb24gb3IgZmFsc2UgdG8gYWJvcnQuXG4gICAqL1xuICB2YWxpZGF0ZU5ld1VzZXIoZnVuYykge1xuICAgIHRoaXMuX3ZhbGlkYXRlTmV3VXNlckhvb2tzLnB1c2goZnVuYyk7XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgVmFsaWRhdGUgbG9naW4gZnJvbSBleHRlcm5hbCBzZXJ2aWNlXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBDYWxsZWQgd2hlbmV2ZXIgbG9naW4vdXNlciBjcmVhdGlvbiBmcm9tIGV4dGVybmFsIHNlcnZpY2UgaXMgYXR0ZW1wdGVkLiBMb2dpbiBvciB1c2VyIGNyZWF0aW9uIGJhc2VkIG9uIHRoaXMgbG9naW4gY2FuIGJlIGFib3J0ZWQgYnkgcGFzc2luZyBhIGZhbHN5IHZhbHVlIG9yIHRocm93aW5nIGFuIGV4Y2VwdGlvbi5cbiAgICovXG4gIGJlZm9yZUV4dGVybmFsTG9naW4oZnVuYykge1xuICAgIGlmICh0aGlzLl9iZWZvcmVFeHRlcm5hbExvZ2luSG9vaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG9ubHkgY2FsbCBiZWZvcmVFeHRlcm5hbExvZ2luIG9uY2VcIik7XG4gICAgfVxuXG4gICAgdGhpcy5fYmVmb3JlRXh0ZXJuYWxMb2dpbkhvb2sgPSBmdW5jO1xuICB9XG5cbiAgLy8vXG4gIC8vLyBDUkVBVEUgVVNFUiBIT09LU1xuICAvLy9cblxuICAvKipcbiAgICogQHN1bW1hcnkgQ3VzdG9taXplIG5ldyB1c2VyIGNyZWF0aW9uLlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgQ2FsbGVkIHdoZW5ldmVyIGEgbmV3IHVzZXIgaXMgY3JlYXRlZC4gUmV0dXJuIHRoZSBuZXcgdXNlciBvYmplY3QsIG9yIHRocm93IGFuIGBFcnJvcmAgdG8gYWJvcnQgdGhlIGNyZWF0aW9uLlxuICAgKi9cbiAgb25DcmVhdGVVc2VyKGZ1bmMpIHtcbiAgICBpZiAodGhpcy5fb25DcmVhdGVVc2VySG9vaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG9ubHkgY2FsbCBvbkNyZWF0ZVVzZXIgb25jZVwiKTtcbiAgICB9XG5cbiAgICB0aGlzLl9vbkNyZWF0ZVVzZXJIb29rID0gZnVuYztcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBDdXN0b21pemUgb2F1dGggdXNlciBwcm9maWxlIHVwZGF0ZXNcbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIENhbGxlZCB3aGVuZXZlciBhIHVzZXIgaXMgbG9nZ2VkIGluIHZpYSBvYXV0aC4gUmV0dXJuIHRoZSBwcm9maWxlIG9iamVjdCB0byBiZSBtZXJnZWQsIG9yIHRocm93IGFuIGBFcnJvcmAgdG8gYWJvcnQgdGhlIGNyZWF0aW9uLlxuICAgKi9cbiAgb25FeHRlcm5hbExvZ2luKGZ1bmMpIHtcbiAgICBpZiAodGhpcy5fb25FeHRlcm5hbExvZ2luSG9vaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG9ubHkgY2FsbCBvbkV4dGVybmFsTG9naW4gb25jZVwiKTtcbiAgICB9XG5cbiAgICB0aGlzLl9vbkV4dGVybmFsTG9naW5Ib29rID0gZnVuYztcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBDdXN0b21pemUgdXNlciBzZWxlY3Rpb24gb24gZXh0ZXJuYWwgbG9naW5zXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBDYWxsZWQgd2hlbmV2ZXIgYSB1c2VyIGlzIGxvZ2dlZCBpbiB2aWEgb2F1dGggYW5kIGFcbiAgICogdXNlciBpcyBub3QgZm91bmQgd2l0aCB0aGUgc2VydmljZSBpZC4gUmV0dXJuIHRoZSB1c2VyIG9yIHVuZGVmaW5lZC5cbiAgICovXG4gICBzZXRBZGRpdGlvbmFsRmluZFVzZXJPbkV4dGVybmFsTG9naW4oZnVuYykge1xuICAgIGlmICh0aGlzLl9hZGRpdGlvbmFsRmluZFVzZXJPbkV4dGVybmFsTG9naW4pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBvbmx5IGNhbGwgc2V0QWRkaXRpb25hbEZpbmRVc2VyT25FeHRlcm5hbExvZ2luIG9uY2VcIik7XG4gICAgfVxuICAgIHRoaXMuX2FkZGl0aW9uYWxGaW5kVXNlck9uRXh0ZXJuYWxMb2dpbiA9IGZ1bmM7XG4gIH1cblxuICBfdmFsaWRhdGVMb2dpbihjb25uZWN0aW9uLCBhdHRlbXB0KSB7XG4gICAgdGhpcy5fdmFsaWRhdGVMb2dpbkhvb2suZWFjaChjYWxsYmFjayA9PiB7XG4gICAgICBsZXQgcmV0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0ID0gY2FsbGJhY2soY2xvbmVBdHRlbXB0V2l0aENvbm5lY3Rpb24oY29ubmVjdGlvbiwgYXR0ZW1wdCkpO1xuICAgICAgfVxuICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgYXR0ZW1wdC5hbGxvd2VkID0gZmFsc2U7XG4gICAgICAgIC8vIFhYWCB0aGlzIG1lYW5zIHRoZSBsYXN0IHRocm93biBlcnJvciBvdmVycmlkZXMgcHJldmlvdXMgZXJyb3JcbiAgICAgICAgLy8gbWVzc2FnZXMuIE1heWJlIHRoaXMgaXMgc3VycHJpc2luZyB0byB1c2VycyBhbmQgd2Ugc2hvdWxkIG1ha2VcbiAgICAgICAgLy8gb3ZlcnJpZGluZyBlcnJvcnMgbW9yZSBleHBsaWNpdC4gKHNlZVxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWV0ZW9yL21ldGVvci9pc3N1ZXMvMTk2MClcbiAgICAgICAgYXR0ZW1wdC5lcnJvciA9IGU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKCEgcmV0KSB7XG4gICAgICAgIGF0dGVtcHQuYWxsb3dlZCA9IGZhbHNlO1xuICAgICAgICAvLyBkb24ndCBvdmVycmlkZSBhIHNwZWNpZmljIGVycm9yIHByb3ZpZGVkIGJ5IGEgcHJldmlvdXNcbiAgICAgICAgLy8gdmFsaWRhdG9yIG9yIHRoZSBpbml0aWFsIGF0dGVtcHQgKGVnIFwiaW5jb3JyZWN0IHBhc3N3b3JkXCIpLlxuICAgICAgICBpZiAoIWF0dGVtcHQuZXJyb3IpXG4gICAgICAgICAgYXR0ZW1wdC5lcnJvciA9IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIkxvZ2luIGZvcmJpZGRlblwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9O1xuXG4gIF9zdWNjZXNzZnVsTG9naW4oY29ubmVjdGlvbiwgYXR0ZW1wdCkge1xuICAgIHRoaXMuX29uTG9naW5Ib29rLmVhY2goY2FsbGJhY2sgPT4ge1xuICAgICAgY2FsbGJhY2soY2xvbmVBdHRlbXB0V2l0aENvbm5lY3Rpb24oY29ubmVjdGlvbiwgYXR0ZW1wdCkpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH07XG5cbiAgX2ZhaWxlZExvZ2luKGNvbm5lY3Rpb24sIGF0dGVtcHQpIHtcbiAgICB0aGlzLl9vbkxvZ2luRmFpbHVyZUhvb2suZWFjaChjYWxsYmFjayA9PiB7XG4gICAgICBjYWxsYmFjayhjbG9uZUF0dGVtcHRXaXRoQ29ubmVjdGlvbihjb25uZWN0aW9uLCBhdHRlbXB0KSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgfTtcblxuICBfc3VjY2Vzc2Z1bExvZ291dChjb25uZWN0aW9uLCB1c2VySWQpIHtcbiAgICAvLyBkb24ndCBmZXRjaCB0aGUgdXNlciBvYmplY3QgdW5sZXNzIHRoZXJlIGFyZSBzb21lIGNhbGxiYWNrcyByZWdpc3RlcmVkXG4gICAgbGV0IHVzZXI7XG4gICAgdGhpcy5fb25Mb2dvdXRIb29rLmVhY2goY2FsbGJhY2sgPT4ge1xuICAgICAgaWYgKCF1c2VyICYmIHVzZXJJZCkgdXNlciA9IHRoaXMudXNlcnMuZmluZE9uZSh1c2VySWQsIHtmaWVsZHM6IHRoaXMuX29wdGlvbnMuZGVmYXVsdEZpZWxkU2VsZWN0b3J9KTtcbiAgICAgIGNhbGxiYWNrKHsgdXNlciwgY29ubmVjdGlvbiB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vL1xuICAvLy8gTE9HSU4gTUVUSE9EU1xuICAvLy9cblxuICAvLyBMb2dpbiBtZXRob2RzIHJldHVybiB0byB0aGUgY2xpZW50IGFuIG9iamVjdCBjb250YWluaW5nIHRoZXNlXG4gIC8vIGZpZWxkcyB3aGVuIHRoZSB1c2VyIHdhcyBsb2dnZWQgaW4gc3VjY2Vzc2Z1bGx5OlxuICAvL1xuICAvLyAgIGlkOiB1c2VySWRcbiAgLy8gICB0b2tlbjogKlxuICAvLyAgIHRva2VuRXhwaXJlczogKlxuICAvL1xuICAvLyB0b2tlbkV4cGlyZXMgaXMgb3B0aW9uYWwgYW5kIGludGVuZHMgdG8gcHJvdmlkZSBhIGhpbnQgdG8gdGhlXG4gIC8vIGNsaWVudCBhcyB0byB3aGVuIHRoZSB0b2tlbiB3aWxsIGV4cGlyZS4gSWYgbm90IHByb3ZpZGVkLCB0aGVcbiAgLy8gY2xpZW50IHdpbGwgY2FsbCBBY2NvdW50cy5fdG9rZW5FeHBpcmF0aW9uLCBwYXNzaW5nIGl0IHRoZSBkYXRlXG4gIC8vIHRoYXQgaXQgcmVjZWl2ZWQgdGhlIHRva2VuLlxuICAvL1xuICAvLyBUaGUgbG9naW4gbWV0aG9kIHdpbGwgdGhyb3cgYW4gZXJyb3IgYmFjayB0byB0aGUgY2xpZW50IGlmIHRoZSB1c2VyXG4gIC8vIGZhaWxlZCB0byBsb2cgaW4uXG4gIC8vXG4gIC8vXG4gIC8vIExvZ2luIGhhbmRsZXJzIGFuZCBzZXJ2aWNlIHNwZWNpZmljIGxvZ2luIG1ldGhvZHMgc3VjaCBhc1xuICAvLyBgY3JlYXRlVXNlcmAgaW50ZXJuYWxseSByZXR1cm4gYSBgcmVzdWx0YCBvYmplY3QgY29udGFpbmluZyB0aGVzZVxuICAvLyBmaWVsZHM6XG4gIC8vXG4gIC8vICAgdHlwZTpcbiAgLy8gICAgIG9wdGlvbmFsIHN0cmluZzsgdGhlIHNlcnZpY2UgbmFtZSwgb3ZlcnJpZGVzIHRoZSBoYW5kbGVyXG4gIC8vICAgICBkZWZhdWx0IGlmIHByZXNlbnQuXG4gIC8vXG4gIC8vICAgZXJyb3I6XG4gIC8vICAgICBleGNlcHRpb247IGlmIHRoZSB1c2VyIGlzIG5vdCBhbGxvd2VkIHRvIGxvZ2luLCB0aGUgcmVhc29uIHdoeS5cbiAgLy9cbiAgLy8gICB1c2VySWQ6XG4gIC8vICAgICBzdHJpbmc7IHRoZSB1c2VyIGlkIG9mIHRoZSB1c2VyIGF0dGVtcHRpbmcgdG8gbG9naW4gKGlmXG4gIC8vICAgICBrbm93biksIHJlcXVpcmVkIGZvciBhbiBhbGxvd2VkIGxvZ2luLlxuICAvL1xuICAvLyAgIG9wdGlvbnM6XG4gIC8vICAgICBvcHRpb25hbCBvYmplY3QgbWVyZ2VkIGludG8gdGhlIHJlc3VsdCByZXR1cm5lZCBieSB0aGUgbG9naW5cbiAgLy8gICAgIG1ldGhvZDsgdXNlZCBieSBIQU1LIGZyb20gU1JQLlxuICAvL1xuICAvLyAgIHN0YW1wZWRMb2dpblRva2VuOlxuICAvLyAgICAgb3B0aW9uYWwgb2JqZWN0IHdpdGggYHRva2VuYCBhbmQgYHdoZW5gIGluZGljYXRpbmcgdGhlIGxvZ2luXG4gIC8vICAgICB0b2tlbiBpcyBhbHJlYWR5IHByZXNlbnQgaW4gdGhlIGRhdGFiYXNlLCByZXR1cm5lZCBieSB0aGVcbiAgLy8gICAgIFwicmVzdW1lXCIgbG9naW4gaGFuZGxlci5cbiAgLy9cbiAgLy8gRm9yIGNvbnZlbmllbmNlLCBsb2dpbiBtZXRob2RzIGNhbiBhbHNvIHRocm93IGFuIGV4Y2VwdGlvbiwgd2hpY2hcbiAgLy8gaXMgY29udmVydGVkIGludG8gYW4ge2Vycm9yfSByZXN1bHQuICBIb3dldmVyLCBpZiB0aGUgaWQgb2YgdGhlXG4gIC8vIHVzZXIgYXR0ZW1wdGluZyB0aGUgbG9naW4gaXMga25vd24sIGEge3VzZXJJZCwgZXJyb3J9IHJlc3VsdCBzaG91bGRcbiAgLy8gYmUgcmV0dXJuZWQgaW5zdGVhZCBzaW5jZSB0aGUgdXNlciBpZCBpcyBub3QgY2FwdHVyZWQgd2hlbiBhblxuICAvLyBleGNlcHRpb24gaXMgdGhyb3duLlxuICAvL1xuICAvLyBUaGlzIGludGVybmFsIGByZXN1bHRgIG9iamVjdCBpcyBhdXRvbWF0aWNhbGx5IGNvbnZlcnRlZCBpbnRvIHRoZVxuICAvLyBwdWJsaWMge2lkLCB0b2tlbiwgdG9rZW5FeHBpcmVzfSBvYmplY3QgcmV0dXJuZWQgdG8gdGhlIGNsaWVudC5cblxuICAvLyBUcnkgYSBsb2dpbiBtZXRob2QsIGNvbnZlcnRpbmcgdGhyb3duIGV4Y2VwdGlvbnMgaW50byBhbiB7ZXJyb3J9XG4gIC8vIHJlc3VsdC4gIFRoZSBgdHlwZWAgYXJndW1lbnQgaXMgYSBkZWZhdWx0LCBpbnNlcnRlZCBpbnRvIHRoZSByZXN1bHRcbiAgLy8gb2JqZWN0IGlmIG5vdCBleHBsaWNpdGx5IHJldHVybmVkLlxuICAvL1xuICAvLyBMb2cgaW4gYSB1c2VyIG9uIGEgY29ubmVjdGlvbi5cbiAgLy9cbiAgLy8gV2UgdXNlIHRoZSBtZXRob2QgaW52b2NhdGlvbiB0byBzZXQgdGhlIHVzZXIgaWQgb24gdGhlIGNvbm5lY3Rpb24sXG4gIC8vIG5vdCB0aGUgY29ubmVjdGlvbiBvYmplY3QgZGlyZWN0bHkuIHNldFVzZXJJZCBpcyB0aWVkIHRvIG1ldGhvZHMgdG9cbiAgLy8gZW5mb3JjZSBjbGVhciBvcmRlcmluZyBvZiBtZXRob2QgYXBwbGljYXRpb24gKHVzaW5nIHdhaXQgbWV0aG9kcyBvblxuICAvLyB0aGUgY2xpZW50LCBhbmQgYSBubyBzZXRVc2VySWQgYWZ0ZXIgdW5ibG9jayByZXN0cmljdGlvbiBvbiB0aGVcbiAgLy8gc2VydmVyKVxuICAvL1xuICAvLyBUaGUgYHN0YW1wZWRMb2dpblRva2VuYCBwYXJhbWV0ZXIgaXMgb3B0aW9uYWwuICBXaGVuIHByZXNlbnQsIGl0XG4gIC8vIGluZGljYXRlcyB0aGF0IHRoZSBsb2dpbiB0b2tlbiBoYXMgYWxyZWFkeSBiZWVuIGluc2VydGVkIGludG8gdGhlXG4gIC8vIGRhdGFiYXNlIGFuZCBkb2Vzbid0IG5lZWQgdG8gYmUgaW5zZXJ0ZWQgYWdhaW4uICAoSXQncyB1c2VkIGJ5IHRoZVxuICAvLyBcInJlc3VtZVwiIGxvZ2luIGhhbmRsZXIpLlxuICBfbG9naW5Vc2VyKG1ldGhvZEludm9jYXRpb24sIHVzZXJJZCwgc3RhbXBlZExvZ2luVG9rZW4pIHtcbiAgICBpZiAoISBzdGFtcGVkTG9naW5Ub2tlbikge1xuICAgICAgc3RhbXBlZExvZ2luVG9rZW4gPSB0aGlzLl9nZW5lcmF0ZVN0YW1wZWRMb2dpblRva2VuKCk7XG4gICAgICB0aGlzLl9pbnNlcnRMb2dpblRva2VuKHVzZXJJZCwgc3RhbXBlZExvZ2luVG9rZW4pO1xuICAgIH1cblxuICAgIC8vIFRoaXMgb3JkZXIgKGFuZCB0aGUgYXZvaWRhbmNlIG9mIHlpZWxkcykgaXMgaW1wb3J0YW50IHRvIG1ha2VcbiAgICAvLyBzdXJlIHRoYXQgd2hlbiBwdWJsaXNoIGZ1bmN0aW9ucyBhcmUgcmVydW4sIHRoZXkgc2VlIGFcbiAgICAvLyBjb25zaXN0ZW50IHZpZXcgb2YgdGhlIHdvcmxkOiB0aGUgdXNlcklkIGlzIHNldCBhbmQgbWF0Y2hlc1xuICAgIC8vIHRoZSBsb2dpbiB0b2tlbiBvbiB0aGUgY29ubmVjdGlvbiAobm90IHRoYXQgdGhlcmUgaXNcbiAgICAvLyBjdXJyZW50bHkgYSBwdWJsaWMgQVBJIGZvciByZWFkaW5nIHRoZSBsb2dpbiB0b2tlbiBvbiBhXG4gICAgLy8gY29ubmVjdGlvbikuXG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoKCkgPT5cbiAgICAgIHRoaXMuX3NldExvZ2luVG9rZW4oXG4gICAgICAgIHVzZXJJZCxcbiAgICAgICAgbWV0aG9kSW52b2NhdGlvbi5jb25uZWN0aW9uLFxuICAgICAgICB0aGlzLl9oYXNoTG9naW5Ub2tlbihzdGFtcGVkTG9naW5Ub2tlbi50b2tlbilcbiAgICAgIClcbiAgICApO1xuXG4gICAgbWV0aG9kSW52b2NhdGlvbi5zZXRVc2VySWQodXNlcklkKTtcblxuICAgIHJldHVybiB7XG4gICAgICBpZDogdXNlcklkLFxuICAgICAgdG9rZW46IHN0YW1wZWRMb2dpblRva2VuLnRva2VuLFxuICAgICAgdG9rZW5FeHBpcmVzOiB0aGlzLl90b2tlbkV4cGlyYXRpb24oc3RhbXBlZExvZ2luVG9rZW4ud2hlbilcbiAgICB9O1xuICB9O1xuXG4gIC8vIEFmdGVyIGEgbG9naW4gbWV0aG9kIGhhcyBjb21wbGV0ZWQsIGNhbGwgdGhlIGxvZ2luIGhvb2tzLiAgTm90ZVxuICAvLyB0aGF0IGBhdHRlbXB0TG9naW5gIGlzIGNhbGxlZCBmb3IgKmFsbCogbG9naW4gYXR0ZW1wdHMsIGV2ZW4gb25lc1xuICAvLyB3aGljaCBhcmVuJ3Qgc3VjY2Vzc2Z1bCAoc3VjaCBhcyBhbiBpbnZhbGlkIHBhc3N3b3JkLCBldGMpLlxuICAvL1xuICAvLyBJZiB0aGUgbG9naW4gaXMgYWxsb3dlZCBhbmQgaXNuJ3QgYWJvcnRlZCBieSBhIHZhbGlkYXRlIGxvZ2luIGhvb2tcbiAgLy8gY2FsbGJhY2ssIGxvZyBpbiB0aGUgdXNlci5cbiAgLy9cbiAgX2F0dGVtcHRMb2dpbihcbiAgICBtZXRob2RJbnZvY2F0aW9uLFxuICAgIG1ldGhvZE5hbWUsXG4gICAgbWV0aG9kQXJncyxcbiAgICByZXN1bHRcbiAgKSB7XG4gICAgaWYgKCFyZXN1bHQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJyZXN1bHQgaXMgcmVxdWlyZWRcIik7XG5cbiAgICAvLyBYWFggQSBwcm9ncmFtbWluZyBlcnJvciBpbiBhIGxvZ2luIGhhbmRsZXIgY2FuIGxlYWQgdG8gdGhpcyBvY2N1cnJpbmcsIGFuZFxuICAgIC8vIHRoZW4gd2UgZG9uJ3QgY2FsbCBvbkxvZ2luIG9yIG9uTG9naW5GYWlsdXJlIGNhbGxiYWNrcy4gU2hvdWxkXG4gICAgLy8gdHJ5TG9naW5NZXRob2QgY2F0Y2ggdGhpcyBjYXNlIGFuZCB0dXJuIGl0IGludG8gYW4gZXJyb3I/XG4gICAgaWYgKCFyZXN1bHQudXNlcklkICYmICFyZXN1bHQuZXJyb3IpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBIGxvZ2luIG1ldGhvZCBtdXN0IHNwZWNpZnkgYSB1c2VySWQgb3IgYW4gZXJyb3JcIik7XG5cbiAgICBsZXQgdXNlcjtcbiAgICBpZiAocmVzdWx0LnVzZXJJZClcbiAgICAgIHVzZXIgPSB0aGlzLnVzZXJzLmZpbmRPbmUocmVzdWx0LnVzZXJJZCwge2ZpZWxkczogdGhpcy5fb3B0aW9ucy5kZWZhdWx0RmllbGRTZWxlY3Rvcn0pO1xuXG4gICAgY29uc3QgYXR0ZW1wdCA9IHtcbiAgICAgIHR5cGU6IHJlc3VsdC50eXBlIHx8IFwidW5rbm93blwiLFxuICAgICAgYWxsb3dlZDogISEgKHJlc3VsdC51c2VySWQgJiYgIXJlc3VsdC5lcnJvciksXG4gICAgICBtZXRob2ROYW1lOiBtZXRob2ROYW1lLFxuICAgICAgbWV0aG9kQXJndW1lbnRzOiBBcnJheS5mcm9tKG1ldGhvZEFyZ3MpXG4gICAgfTtcbiAgICBpZiAocmVzdWx0LmVycm9yKSB7XG4gICAgICBhdHRlbXB0LmVycm9yID0gcmVzdWx0LmVycm9yO1xuICAgIH1cbiAgICBpZiAodXNlcikge1xuICAgICAgYXR0ZW1wdC51c2VyID0gdXNlcjtcbiAgICB9XG5cbiAgICAvLyBfdmFsaWRhdGVMb2dpbiBtYXkgbXV0YXRlIGBhdHRlbXB0YCBieSBhZGRpbmcgYW4gZXJyb3IgYW5kIGNoYW5naW5nIGFsbG93ZWRcbiAgICAvLyB0byBmYWxzZSwgYnV0IHRoYXQncyB0aGUgb25seSBjaGFuZ2UgaXQgY2FuIG1ha2UgKGFuZCB0aGUgdXNlcidzIGNhbGxiYWNrc1xuICAgIC8vIG9ubHkgZ2V0IGEgY2xvbmUgb2YgYGF0dGVtcHRgKS5cbiAgICB0aGlzLl92YWxpZGF0ZUxvZ2luKG1ldGhvZEludm9jYXRpb24uY29ubmVjdGlvbiwgYXR0ZW1wdCk7XG5cbiAgICBpZiAoYXR0ZW1wdC5hbGxvd2VkKSB7XG4gICAgICBjb25zdCByZXQgPSB7XG4gICAgICAgIC4uLnRoaXMuX2xvZ2luVXNlcihcbiAgICAgICAgICBtZXRob2RJbnZvY2F0aW9uLFxuICAgICAgICAgIHJlc3VsdC51c2VySWQsXG4gICAgICAgICAgcmVzdWx0LnN0YW1wZWRMb2dpblRva2VuXG4gICAgICAgICksXG4gICAgICAgIC4uLnJlc3VsdC5vcHRpb25zXG4gICAgICB9O1xuICAgICAgcmV0LnR5cGUgPSBhdHRlbXB0LnR5cGU7XG4gICAgICB0aGlzLl9zdWNjZXNzZnVsTG9naW4obWV0aG9kSW52b2NhdGlvbi5jb25uZWN0aW9uLCBhdHRlbXB0KTtcbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5fZmFpbGVkTG9naW4obWV0aG9kSW52b2NhdGlvbi5jb25uZWN0aW9uLCBhdHRlbXB0KTtcbiAgICAgIHRocm93IGF0dGVtcHQuZXJyb3I7XG4gICAgfVxuICB9O1xuXG4gIC8vIEFsbCBzZXJ2aWNlIHNwZWNpZmljIGxvZ2luIG1ldGhvZHMgc2hvdWxkIGdvIHRocm91Z2ggdGhpcyBmdW5jdGlvbi5cbiAgLy8gRW5zdXJlIHRoYXQgdGhyb3duIGV4Y2VwdGlvbnMgYXJlIGNhdWdodCBhbmQgdGhhdCBsb2dpbiBob29rXG4gIC8vIGNhbGxiYWNrcyBhcmUgc3RpbGwgY2FsbGVkLlxuICAvL1xuICBfbG9naW5NZXRob2QoXG4gICAgbWV0aG9kSW52b2NhdGlvbixcbiAgICBtZXRob2ROYW1lLFxuICAgIG1ldGhvZEFyZ3MsXG4gICAgdHlwZSxcbiAgICBmblxuICApIHtcbiAgICByZXR1cm4gdGhpcy5fYXR0ZW1wdExvZ2luKFxuICAgICAgbWV0aG9kSW52b2NhdGlvbixcbiAgICAgIG1ldGhvZE5hbWUsXG4gICAgICBtZXRob2RBcmdzLFxuICAgICAgdHJ5TG9naW5NZXRob2QodHlwZSwgZm4pXG4gICAgKTtcbiAgfTtcblxuXG4gIC8vIFJlcG9ydCBhIGxvZ2luIGF0dGVtcHQgZmFpbGVkIG91dHNpZGUgdGhlIGNvbnRleHQgb2YgYSBub3JtYWwgbG9naW5cbiAgLy8gbWV0aG9kLiBUaGlzIGlzIGZvciB1c2UgaW4gdGhlIGNhc2Ugd2hlcmUgdGhlcmUgaXMgYSBtdWx0aS1zdGVwIGxvZ2luXG4gIC8vIHByb2NlZHVyZSAoZWcgU1JQIGJhc2VkIHBhc3N3b3JkIGxvZ2luKS4gSWYgYSBtZXRob2QgZWFybHkgaW4gdGhlXG4gIC8vIGNoYWluIGZhaWxzLCBpdCBzaG91bGQgY2FsbCB0aGlzIGZ1bmN0aW9uIHRvIHJlcG9ydCBhIGZhaWx1cmUuIFRoZXJlXG4gIC8vIGlzIG5vIGNvcnJlc3BvbmRpbmcgbWV0aG9kIGZvciBhIHN1Y2Nlc3NmdWwgbG9naW47IG1ldGhvZHMgdGhhdCBjYW5cbiAgLy8gc3VjY2VlZCBhdCBsb2dnaW5nIGEgdXNlciBpbiBzaG91bGQgYWx3YXlzIGJlIGFjdHVhbCBsb2dpbiBtZXRob2RzXG4gIC8vICh1c2luZyBlaXRoZXIgQWNjb3VudHMuX2xvZ2luTWV0aG9kIG9yIEFjY291bnRzLnJlZ2lzdGVyTG9naW5IYW5kbGVyKS5cbiAgX3JlcG9ydExvZ2luRmFpbHVyZShcbiAgICBtZXRob2RJbnZvY2F0aW9uLFxuICAgIG1ldGhvZE5hbWUsXG4gICAgbWV0aG9kQXJncyxcbiAgICByZXN1bHRcbiAgKSB7XG4gICAgY29uc3QgYXR0ZW1wdCA9IHtcbiAgICAgIHR5cGU6IHJlc3VsdC50eXBlIHx8IFwidW5rbm93blwiLFxuICAgICAgYWxsb3dlZDogZmFsc2UsXG4gICAgICBlcnJvcjogcmVzdWx0LmVycm9yLFxuICAgICAgbWV0aG9kTmFtZTogbWV0aG9kTmFtZSxcbiAgICAgIG1ldGhvZEFyZ3VtZW50czogQXJyYXkuZnJvbShtZXRob2RBcmdzKVxuICAgIH07XG5cbiAgICBpZiAocmVzdWx0LnVzZXJJZCkge1xuICAgICAgYXR0ZW1wdC51c2VyID0gdGhpcy51c2Vycy5maW5kT25lKHJlc3VsdC51c2VySWQsIHtmaWVsZHM6IHRoaXMuX29wdGlvbnMuZGVmYXVsdEZpZWxkU2VsZWN0b3J9KTtcbiAgICB9XG5cbiAgICB0aGlzLl92YWxpZGF0ZUxvZ2luKG1ldGhvZEludm9jYXRpb24uY29ubmVjdGlvbiwgYXR0ZW1wdCk7XG4gICAgdGhpcy5fZmFpbGVkTG9naW4obWV0aG9kSW52b2NhdGlvbi5jb25uZWN0aW9uLCBhdHRlbXB0KTtcblxuICAgIC8vIF92YWxpZGF0ZUxvZ2luIG1heSBtdXRhdGUgYXR0ZW1wdCB0byBzZXQgYSBuZXcgZXJyb3IgbWVzc2FnZS4gUmV0dXJuXG4gICAgLy8gdGhlIG1vZGlmaWVkIHZlcnNpb24uXG4gICAgcmV0dXJuIGF0dGVtcHQ7XG4gIH07XG5cbiAgLy8vXG4gIC8vLyBMT0dJTiBIQU5ETEVSU1xuICAvLy9cblxuICAvLyBUaGUgbWFpbiBlbnRyeSBwb2ludCBmb3IgYXV0aCBwYWNrYWdlcyB0byBob29rIGluIHRvIGxvZ2luLlxuICAvL1xuICAvLyBBIGxvZ2luIGhhbmRsZXIgaXMgYSBsb2dpbiBtZXRob2Qgd2hpY2ggY2FuIHJldHVybiBgdW5kZWZpbmVkYCB0b1xuICAvLyBpbmRpY2F0ZSB0aGF0IHRoZSBsb2dpbiByZXF1ZXN0IGlzIG5vdCBoYW5kbGVkIGJ5IHRoaXMgaGFuZGxlci5cbiAgLy9cbiAgLy8gQHBhcmFtIG5hbWUge1N0cmluZ30gT3B0aW9uYWwuICBUaGUgc2VydmljZSBuYW1lLCB1c2VkIGJ5IGRlZmF1bHRcbiAgLy8gaWYgYSBzcGVjaWZpYyBzZXJ2aWNlIG5hbWUgaXNuJ3QgcmV0dXJuZWQgaW4gdGhlIHJlc3VsdC5cbiAgLy9cbiAgLy8gQHBhcmFtIGhhbmRsZXIge0Z1bmN0aW9ufSBBIGZ1bmN0aW9uIHRoYXQgcmVjZWl2ZXMgYW4gb3B0aW9ucyBvYmplY3RcbiAgLy8gKGFzIHBhc3NlZCBhcyBhbiBhcmd1bWVudCB0byB0aGUgYGxvZ2luYCBtZXRob2QpIGFuZCByZXR1cm5zIG9uZSBvZjpcbiAgLy8gLSBgdW5kZWZpbmVkYCwgbWVhbmluZyBkb24ndCBoYW5kbGU7XG4gIC8vIC0gYSBsb2dpbiBtZXRob2QgcmVzdWx0IG9iamVjdFxuXG4gIHJlZ2lzdGVyTG9naW5IYW5kbGVyKG5hbWUsIGhhbmRsZXIpIHtcbiAgICBpZiAoISBoYW5kbGVyKSB7XG4gICAgICBoYW5kbGVyID0gbmFtZTtcbiAgICAgIG5hbWUgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX2xvZ2luSGFuZGxlcnMucHVzaCh7XG4gICAgICBuYW1lOiBuYW1lLFxuICAgICAgaGFuZGxlcjogaGFuZGxlclxuICAgIH0pO1xuICB9O1xuXG5cbiAgLy8gQ2hlY2tzIGEgdXNlcidzIGNyZWRlbnRpYWxzIGFnYWluc3QgYWxsIHRoZSByZWdpc3RlcmVkIGxvZ2luXG4gIC8vIGhhbmRsZXJzLCBhbmQgcmV0dXJucyBhIGxvZ2luIHRva2VuIGlmIHRoZSBjcmVkZW50aWFscyBhcmUgdmFsaWQuIEl0XG4gIC8vIGlzIGxpa2UgdGhlIGxvZ2luIG1ldGhvZCwgZXhjZXB0IHRoYXQgaXQgZG9lc24ndCBzZXQgdGhlIGxvZ2dlZC1pblxuICAvLyB1c2VyIG9uIHRoZSBjb25uZWN0aW9uLiBUaHJvd3MgYSBNZXRlb3IuRXJyb3IgaWYgbG9nZ2luZyBpbiBmYWlscyxcbiAgLy8gaW5jbHVkaW5nIHRoZSBjYXNlIHdoZXJlIG5vbmUgb2YgdGhlIGxvZ2luIGhhbmRsZXJzIGhhbmRsZWQgdGhlIGxvZ2luXG4gIC8vIHJlcXVlc3QuIE90aGVyd2lzZSwgcmV0dXJucyB7aWQ6IHVzZXJJZCwgdG9rZW46ICosIHRva2VuRXhwaXJlczogKn0uXG4gIC8vXG4gIC8vIEZvciBleGFtcGxlLCBpZiB5b3Ugd2FudCB0byBsb2dpbiB3aXRoIGEgcGxhaW50ZXh0IHBhc3N3b3JkLCBgb3B0aW9uc2AgY291bGQgYmVcbiAgLy8gICB7IHVzZXI6IHsgdXNlcm5hbWU6IDx1c2VybmFtZT4gfSwgcGFzc3dvcmQ6IDxwYXNzd29yZD4gfSwgb3JcbiAgLy8gICB7IHVzZXI6IHsgZW1haWw6IDxlbWFpbD4gfSwgcGFzc3dvcmQ6IDxwYXNzd29yZD4gfS5cblxuICAvLyBUcnkgYWxsIG9mIHRoZSByZWdpc3RlcmVkIGxvZ2luIGhhbmRsZXJzIHVudGlsIG9uZSBvZiB0aGVtIGRvZXNuJ3RcbiAgLy8gcmV0dXJuIGB1bmRlZmluZWRgLCBtZWFuaW5nIGl0IGhhbmRsZWQgdGhpcyBjYWxsIHRvIGBsb2dpbmAuIFJldHVyblxuICAvLyB0aGF0IHJldHVybiB2YWx1ZS5cbiAgX3J1bkxvZ2luSGFuZGxlcnMobWV0aG9kSW52b2NhdGlvbiwgb3B0aW9ucykge1xuICAgIGZvciAobGV0IGhhbmRsZXIgb2YgdGhpcy5fbG9naW5IYW5kbGVycykge1xuICAgICAgY29uc3QgcmVzdWx0ID0gdHJ5TG9naW5NZXRob2QoXG4gICAgICAgIGhhbmRsZXIubmFtZSxcbiAgICAgICAgKCkgPT4gaGFuZGxlci5oYW5kbGVyLmNhbGwobWV0aG9kSW52b2NhdGlvbiwgb3B0aW9ucylcbiAgICAgICk7XG5cbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAwLCBcIkEgbG9naW4gaGFuZGxlciBzaG91bGQgcmV0dXJuIGEgcmVzdWx0IG9yIHVuZGVmaW5lZFwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogbnVsbCxcbiAgICAgIGVycm9yOiBuZXcgTWV0ZW9yLkVycm9yKDQwMCwgXCJVbnJlY29nbml6ZWQgb3B0aW9ucyBmb3IgbG9naW4gcmVxdWVzdFwiKVxuICAgIH07XG4gIH07XG5cbiAgLy8gRGVsZXRlcyB0aGUgZ2l2ZW4gbG9naW5Ub2tlbiBmcm9tIHRoZSBkYXRhYmFzZS5cbiAgLy9cbiAgLy8gRm9yIG5ldy1zdHlsZSBoYXNoZWQgdG9rZW4sIHRoaXMgd2lsbCBjYXVzZSBhbGwgY29ubmVjdGlvbnNcbiAgLy8gYXNzb2NpYXRlZCB3aXRoIHRoZSB0b2tlbiB0byBiZSBjbG9zZWQuXG4gIC8vXG4gIC8vIEFueSBjb25uZWN0aW9ucyBhc3NvY2lhdGVkIHdpdGggb2xkLXN0eWxlIHVuaGFzaGVkIHRva2VucyB3aWxsIGJlXG4gIC8vIGluIHRoZSBwcm9jZXNzIG9mIGJlY29taW5nIGFzc29jaWF0ZWQgd2l0aCBoYXNoZWQgdG9rZW5zIGFuZCB0aGVuXG4gIC8vIHRoZXknbGwgZ2V0IGNsb3NlZC5cbiAgZGVzdHJveVRva2VuKHVzZXJJZCwgbG9naW5Ub2tlbikge1xuICAgIHRoaXMudXNlcnMudXBkYXRlKHVzZXJJZCwge1xuICAgICAgJHB1bGw6IHtcbiAgICAgICAgXCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnNcIjoge1xuICAgICAgICAgICRvcjogW1xuICAgICAgICAgICAgeyBoYXNoZWRUb2tlbjogbG9naW5Ub2tlbiB9LFxuICAgICAgICAgICAgeyB0b2tlbjogbG9naW5Ub2tlbiB9XG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgX2luaXRTZXJ2ZXJNZXRob2RzKCkge1xuICAgIC8vIFRoZSBtZXRob2RzIGNyZWF0ZWQgaW4gdGhpcyBmdW5jdGlvbiBuZWVkIHRvIGJlIGNyZWF0ZWQgaGVyZSBzbyB0aGF0XG4gICAgLy8gdGhpcyB2YXJpYWJsZSBpcyBhdmFpbGFibGUgaW4gdGhlaXIgc2NvcGUuXG4gICAgY29uc3QgYWNjb3VudHMgPSB0aGlzO1xuXG5cbiAgICAvLyBUaGlzIG9iamVjdCB3aWxsIGJlIHBvcHVsYXRlZCB3aXRoIG1ldGhvZHMgYW5kIHRoZW4gcGFzc2VkIHRvXG4gICAgLy8gYWNjb3VudHMuX3NlcnZlci5tZXRob2RzIGZ1cnRoZXIgYmVsb3cuXG4gICAgY29uc3QgbWV0aG9kcyA9IHt9O1xuXG4gICAgLy8gQHJldHVybnMge09iamVjdHxudWxsfVxuICAgIC8vICAgSWYgc3VjY2Vzc2Z1bCwgcmV0dXJucyB7dG9rZW46IHJlY29ubmVjdFRva2VuLCBpZDogdXNlcklkfVxuICAgIC8vICAgSWYgdW5zdWNjZXNzZnVsIChmb3IgZXhhbXBsZSwgaWYgdGhlIHVzZXIgY2xvc2VkIHRoZSBvYXV0aCBsb2dpbiBwb3B1cCksXG4gICAgLy8gICAgIHRocm93cyBhbiBlcnJvciBkZXNjcmliaW5nIHRoZSByZWFzb25cbiAgICBtZXRob2RzLmxvZ2luID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgIC8vIExvZ2luIGhhbmRsZXJzIHNob3VsZCByZWFsbHkgYWxzbyBjaGVjayB3aGF0ZXZlciBmaWVsZCB0aGV5IGxvb2sgYXQgaW5cbiAgICAgIC8vIG9wdGlvbnMsIGJ1dCB3ZSBkb24ndCBlbmZvcmNlIGl0LlxuICAgICAgY2hlY2sob3B0aW9ucywgT2JqZWN0KTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gYWNjb3VudHMuX3J1bkxvZ2luSGFuZGxlcnModGhpcywgb3B0aW9ucyk7XG5cbiAgICAgIHJldHVybiBhY2NvdW50cy5fYXR0ZW1wdExvZ2luKHRoaXMsIFwibG9naW5cIiwgYXJndW1lbnRzLCByZXN1bHQpO1xuICAgIH07XG5cbiAgICBtZXRob2RzLmxvZ291dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IHRva2VuID0gYWNjb3VudHMuX2dldExvZ2luVG9rZW4odGhpcy5jb25uZWN0aW9uLmlkKTtcbiAgICAgIGFjY291bnRzLl9zZXRMb2dpblRva2VuKHRoaXMudXNlcklkLCB0aGlzLmNvbm5lY3Rpb24sIG51bGwpO1xuICAgICAgaWYgKHRva2VuICYmIHRoaXMudXNlcklkKSB7XG4gICAgICAgIGFjY291bnRzLmRlc3Ryb3lUb2tlbih0aGlzLnVzZXJJZCwgdG9rZW4pO1xuICAgICAgfVxuICAgICAgYWNjb3VudHMuX3N1Y2Nlc3NmdWxMb2dvdXQodGhpcy5jb25uZWN0aW9uLCB0aGlzLnVzZXJJZCk7XG4gICAgICB0aGlzLnNldFVzZXJJZChudWxsKTtcbiAgICB9O1xuXG4gICAgLy8gR2VuZXJhdGVzIGEgbmV3IGxvZ2luIHRva2VuIHdpdGggdGhlIHNhbWUgZXhwaXJhdGlvbiBhcyB0aGVcbiAgICAvLyBjb25uZWN0aW9uJ3MgY3VycmVudCB0b2tlbiBhbmQgc2F2ZXMgaXQgdG8gdGhlIGRhdGFiYXNlLiBBc3NvY2lhdGVzXG4gICAgLy8gdGhlIGNvbm5lY3Rpb24gd2l0aCB0aGlzIG5ldyB0b2tlbiBhbmQgcmV0dXJucyBpdC4gVGhyb3dzIGFuIGVycm9yXG4gICAgLy8gaWYgY2FsbGVkIG9uIGEgY29ubmVjdGlvbiB0aGF0IGlzbid0IGxvZ2dlZCBpbi5cbiAgICAvL1xuICAgIC8vIEByZXR1cm5zIE9iamVjdFxuICAgIC8vICAgSWYgc3VjY2Vzc2Z1bCwgcmV0dXJucyB7IHRva2VuOiA8bmV3IHRva2VuPiwgaWQ6IDx1c2VyIGlkPixcbiAgICAvLyAgIHRva2VuRXhwaXJlczogPGV4cGlyYXRpb24gZGF0ZT4gfS5cbiAgICBtZXRob2RzLmdldE5ld1Rva2VuID0gZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgdXNlciA9IGFjY291bnRzLnVzZXJzLmZpbmRPbmUodGhpcy51c2VySWQsIHtcbiAgICAgICAgZmllbGRzOiB7IFwic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zXCI6IDEgfVxuICAgICAgfSk7XG4gICAgICBpZiAoISB0aGlzLnVzZXJJZCB8fCAhIHVzZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcihcIllvdSBhcmUgbm90IGxvZ2dlZCBpbi5cIik7XG4gICAgICB9XG4gICAgICAvLyBCZSBjYXJlZnVsIG5vdCB0byBnZW5lcmF0ZSBhIG5ldyB0b2tlbiB0aGF0IGhhcyBhIGxhdGVyXG4gICAgICAvLyBleHBpcmF0aW9uIHRoYW4gdGhlIGN1cnJlbiB0b2tlbi4gT3RoZXJ3aXNlLCBhIGJhZCBndXkgd2l0aCBhXG4gICAgICAvLyBzdG9sZW4gdG9rZW4gY291bGQgdXNlIHRoaXMgbWV0aG9kIHRvIHN0b3AgaGlzIHN0b2xlbiB0b2tlbiBmcm9tXG4gICAgICAvLyBldmVyIGV4cGlyaW5nLlxuICAgICAgY29uc3QgY3VycmVudEhhc2hlZFRva2VuID0gYWNjb3VudHMuX2dldExvZ2luVG9rZW4odGhpcy5jb25uZWN0aW9uLmlkKTtcbiAgICAgIGNvbnN0IGN1cnJlbnRTdGFtcGVkVG9rZW4gPSB1c2VyLnNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vucy5maW5kKFxuICAgICAgICBzdGFtcGVkVG9rZW4gPT4gc3RhbXBlZFRva2VuLmhhc2hlZFRva2VuID09PSBjdXJyZW50SGFzaGVkVG9rZW5cbiAgICAgICk7XG4gICAgICBpZiAoISBjdXJyZW50U3RhbXBlZFRva2VuKSB7IC8vIHNhZmV0eSBiZWx0OiB0aGlzIHNob3VsZCBuZXZlciBoYXBwZW5cbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcihcIkludmFsaWQgbG9naW4gdG9rZW5cIik7XG4gICAgICB9XG4gICAgICBjb25zdCBuZXdTdGFtcGVkVG9rZW4gPSBhY2NvdW50cy5fZ2VuZXJhdGVTdGFtcGVkTG9naW5Ub2tlbigpO1xuICAgICAgbmV3U3RhbXBlZFRva2VuLndoZW4gPSBjdXJyZW50U3RhbXBlZFRva2VuLndoZW47XG4gICAgICBhY2NvdW50cy5faW5zZXJ0TG9naW5Ub2tlbih0aGlzLnVzZXJJZCwgbmV3U3RhbXBlZFRva2VuKTtcbiAgICAgIHJldHVybiBhY2NvdW50cy5fbG9naW5Vc2VyKHRoaXMsIHRoaXMudXNlcklkLCBuZXdTdGFtcGVkVG9rZW4pO1xuICAgIH07XG5cbiAgICAvLyBSZW1vdmVzIGFsbCB0b2tlbnMgZXhjZXB0IHRoZSB0b2tlbiBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnRcbiAgICAvLyBjb25uZWN0aW9uLiBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIGNvbm5lY3Rpb24gaXMgbm90IGxvZ2dlZFxuICAgIC8vIGluLiBSZXR1cm5zIG5vdGhpbmcgb24gc3VjY2Vzcy5cbiAgICBtZXRob2RzLnJlbW92ZU90aGVyVG9rZW5zID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCEgdGhpcy51c2VySWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcihcIllvdSBhcmUgbm90IGxvZ2dlZCBpbi5cIik7XG4gICAgICB9XG4gICAgICBjb25zdCBjdXJyZW50VG9rZW4gPSBhY2NvdW50cy5fZ2V0TG9naW5Ub2tlbih0aGlzLmNvbm5lY3Rpb24uaWQpO1xuICAgICAgYWNjb3VudHMudXNlcnMudXBkYXRlKHRoaXMudXNlcklkLCB7XG4gICAgICAgICRwdWxsOiB7XG4gICAgICAgICAgXCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnNcIjogeyBoYXNoZWRUb2tlbjogeyAkbmU6IGN1cnJlbnRUb2tlbiB9IH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIEFsbG93IGEgb25lLXRpbWUgY29uZmlndXJhdGlvbiBmb3IgYSBsb2dpbiBzZXJ2aWNlLiBNb2RpZmljYXRpb25zXG4gICAgLy8gdG8gdGhpcyBjb2xsZWN0aW9uIGFyZSBhbHNvIGFsbG93ZWQgaW4gaW5zZWN1cmUgbW9kZS5cbiAgICBtZXRob2RzLmNvbmZpZ3VyZUxvZ2luU2VydmljZSA9IChvcHRpb25zKSA9PiB7XG4gICAgICBjaGVjayhvcHRpb25zLCBNYXRjaC5PYmplY3RJbmNsdWRpbmcoe3NlcnZpY2U6IFN0cmluZ30pKTtcbiAgICAgIC8vIERvbid0IGxldCByYW5kb20gdXNlcnMgY29uZmlndXJlIGEgc2VydmljZSB3ZSBoYXZlbid0IGFkZGVkIHlldCAoc29cbiAgICAgIC8vIHRoYXQgd2hlbiB3ZSBkbyBsYXRlciBhZGQgaXQsIGl0J3Mgc2V0IHVwIHdpdGggdGhlaXIgY29uZmlndXJhdGlvblxuICAgICAgLy8gaW5zdGVhZCBvZiBvdXJzKS5cbiAgICAgIC8vIFhYWCBpZiBzZXJ2aWNlIGNvbmZpZ3VyYXRpb24gaXMgb2F1dGgtc3BlY2lmaWMgdGhlbiB0aGlzIGNvZGUgc2hvdWxkXG4gICAgICAvLyAgICAgYmUgaW4gYWNjb3VudHMtb2F1dGg7IGlmIGl0J3Mgbm90IHRoZW4gdGhlIHJlZ2lzdHJ5IHNob3VsZCBiZVxuICAgICAgLy8gICAgIGluIHRoaXMgcGFja2FnZVxuICAgICAgaWYgKCEoYWNjb3VudHMub2F1dGhcbiAgICAgICAgJiYgYWNjb3VudHMub2F1dGguc2VydmljZU5hbWVzKCkuaW5jbHVkZXMob3B0aW9ucy5zZXJ2aWNlKSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiU2VydmljZSB1bmtub3duXCIpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7IFNlcnZpY2VDb25maWd1cmF0aW9uIH0gPSBQYWNrYWdlWydzZXJ2aWNlLWNvbmZpZ3VyYXRpb24nXTtcbiAgICAgIGlmIChTZXJ2aWNlQ29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9ucy5maW5kT25lKHtzZXJ2aWNlOiBvcHRpb25zLnNlcnZpY2V9KSlcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIGBTZXJ2aWNlICR7b3B0aW9ucy5zZXJ2aWNlfSBhbHJlYWR5IGNvbmZpZ3VyZWRgKTtcblxuICAgICAgaWYgKGhhc093bi5jYWxsKG9wdGlvbnMsICdzZWNyZXQnKSAmJiB1c2luZ09BdXRoRW5jcnlwdGlvbigpKVxuICAgICAgICBvcHRpb25zLnNlY3JldCA9IE9BdXRoRW5jcnlwdGlvbi5zZWFsKG9wdGlvbnMuc2VjcmV0KTtcblxuICAgICAgU2VydmljZUNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnMuaW5zZXJ0KG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICBhY2NvdW50cy5fc2VydmVyLm1ldGhvZHMobWV0aG9kcyk7XG4gIH07XG5cbiAgX2luaXRBY2NvdW50RGF0YUhvb2tzKCkge1xuICAgIHRoaXMuX3NlcnZlci5vbkNvbm5lY3Rpb24oY29ubmVjdGlvbiA9PiB7XG4gICAgICB0aGlzLl9hY2NvdW50RGF0YVtjb25uZWN0aW9uLmlkXSA9IHtcbiAgICAgICAgY29ubmVjdGlvbjogY29ubmVjdGlvblxuICAgICAgfTtcblxuICAgICAgY29ubmVjdGlvbi5vbkNsb3NlKCgpID0+IHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlVG9rZW5Gcm9tQ29ubmVjdGlvbihjb25uZWN0aW9uLmlkKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2FjY291bnREYXRhW2Nvbm5lY3Rpb24uaWRdO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgX2luaXRTZXJ2ZXJQdWJsaWNhdGlvbnMoKSB7XG4gICAgLy8gQnJpbmcgaW50byBsZXhpY2FsIHNjb3BlIGZvciBwdWJsaXNoIGNhbGxiYWNrcyB0aGF0IG5lZWQgYHRoaXNgXG4gICAgY29uc3QgeyB1c2VycywgX2F1dG9wdWJsaXNoRmllbGRzLCBfZGVmYXVsdFB1Ymxpc2hGaWVsZHMgfSA9IHRoaXM7XG5cbiAgICAvLyBQdWJsaXNoIGFsbCBsb2dpbiBzZXJ2aWNlIGNvbmZpZ3VyYXRpb24gZmllbGRzIG90aGVyIHRoYW4gc2VjcmV0LlxuICAgIHRoaXMuX3NlcnZlci5wdWJsaXNoKFwibWV0ZW9yLmxvZ2luU2VydmljZUNvbmZpZ3VyYXRpb25cIiwgKCkgPT4ge1xuICAgICAgY29uc3QgeyBTZXJ2aWNlQ29uZmlndXJhdGlvbiB9ID0gUGFja2FnZVsnc2VydmljZS1jb25maWd1cmF0aW9uJ107XG4gICAgICByZXR1cm4gU2VydmljZUNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnMuZmluZCh7fSwge2ZpZWxkczoge3NlY3JldDogMH19KTtcbiAgICB9LCB7aXNfYXV0bzogdHJ1ZX0pOyAvLyBub3QgdGVjaG5pY2FsbHkgYXV0b3B1Ymxpc2gsIGJ1dCBzdG9wcyB0aGUgd2FybmluZy5cblxuICAgIC8vIFVzZSBNZXRlb3Iuc3RhcnR1cCB0byBnaXZlIG90aGVyIHBhY2thZ2VzIGEgY2hhbmNlIHRvIGNhbGxcbiAgICAvLyBzZXREZWZhdWx0UHVibGlzaEZpZWxkcy5cbiAgICBNZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gICAgICAvLyBQdWJsaXNoIHRoZSBjdXJyZW50IHVzZXIncyByZWNvcmQgdG8gdGhlIGNsaWVudC5cbiAgICAgIHRoaXMuX3NlcnZlci5wdWJsaXNoKG51bGwsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMudXNlcklkKSB7XG4gICAgICAgICAgcmV0dXJuIHVzZXJzLmZpbmQoe1xuICAgICAgICAgICAgX2lkOiB0aGlzLnVzZXJJZFxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIGZpZWxkczogX2RlZmF1bHRQdWJsaXNoRmllbGRzLnByb2plY3Rpb24sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0sIC8qc3VwcHJlc3MgYXV0b3B1Ymxpc2ggd2FybmluZyove2lzX2F1dG86IHRydWV9KTtcbiAgICB9KTtcblxuICAgIC8vIFVzZSBNZXRlb3Iuc3RhcnR1cCB0byBnaXZlIG90aGVyIHBhY2thZ2VzIGEgY2hhbmNlIHRvIGNhbGxcbiAgICAvLyBhZGRBdXRvcHVibGlzaEZpZWxkcy5cbiAgICBQYWNrYWdlLmF1dG9wdWJsaXNoICYmIE1ldGVvci5zdGFydHVwKCgpID0+IHtcbiAgICAgIC8vIFsncHJvZmlsZScsICd1c2VybmFtZSddIC0+IHtwcm9maWxlOiAxLCB1c2VybmFtZTogMX1cbiAgICAgIGNvbnN0IHRvRmllbGRTZWxlY3RvciA9IGZpZWxkcyA9PiBmaWVsZHMucmVkdWNlKChwcmV2LCBmaWVsZCkgPT4gKFxuICAgICAgICAgIHsgLi4ucHJldiwgW2ZpZWxkXTogMSB9KSxcbiAgICAgICAge31cbiAgICAgICk7XG4gICAgICB0aGlzLl9zZXJ2ZXIucHVibGlzaChudWxsLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLnVzZXJJZCkge1xuICAgICAgICAgIHJldHVybiB1c2Vycy5maW5kKHsgX2lkOiB0aGlzLnVzZXJJZCB9LCB7XG4gICAgICAgICAgICBmaWVsZHM6IHRvRmllbGRTZWxlY3RvcihfYXV0b3B1Ymxpc2hGaWVsZHMubG9nZ2VkSW5Vc2VyKSxcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9LCAvKnN1cHByZXNzIGF1dG9wdWJsaXNoIHdhcm5pbmcqL3tpc19hdXRvOiB0cnVlfSk7XG5cbiAgICAgIC8vIFhYWCB0aGlzIHB1Ymxpc2ggaXMgbmVpdGhlciBkZWR1cC1hYmxlIG5vciBpcyBpdCBvcHRpbWl6ZWQgYnkgb3VyIHNwZWNpYWxcbiAgICAgIC8vIHRyZWF0bWVudCBvZiBxdWVyaWVzIG9uIGEgc3BlY2lmaWMgX2lkLiBUaGVyZWZvcmUgdGhpcyB3aWxsIGhhdmUgTyhuXjIpXG4gICAgICAvLyBydW4tdGltZSBwZXJmb3JtYW5jZSBldmVyeSB0aW1lIGEgdXNlciBkb2N1bWVudCBpcyBjaGFuZ2VkIChlZyBzb21lb25lXG4gICAgICAvLyBsb2dnaW5nIGluKS4gSWYgdGhpcyBpcyBhIHByb2JsZW0sIHdlIGNhbiBpbnN0ZWFkIHdyaXRlIGEgbWFudWFsIHB1Ymxpc2hcbiAgICAgIC8vIGZ1bmN0aW9uIHdoaWNoIGZpbHRlcnMgb3V0IGZpZWxkcyBiYXNlZCBvbiAndGhpcy51c2VySWQnLlxuICAgICAgdGhpcy5fc2VydmVyLnB1Ymxpc2gobnVsbCwgZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBzZWxlY3RvciA9IHRoaXMudXNlcklkID8geyBfaWQ6IHsgJG5lOiB0aGlzLnVzZXJJZCB9IH0gOiB7fTtcbiAgICAgICAgcmV0dXJuIHVzZXJzLmZpbmQoc2VsZWN0b3IsIHtcbiAgICAgICAgICBmaWVsZHM6IHRvRmllbGRTZWxlY3RvcihfYXV0b3B1Ymxpc2hGaWVsZHMub3RoZXJVc2VycyksXG4gICAgICAgIH0pXG4gICAgICB9LCAvKnN1cHByZXNzIGF1dG9wdWJsaXNoIHdhcm5pbmcqL3tpc19hdXRvOiB0cnVlfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQWRkIHRvIHRoZSBsaXN0IG9mIGZpZWxkcyBvciBzdWJmaWVsZHMgdG8gYmUgYXV0b21hdGljYWxseVxuICAvLyBwdWJsaXNoZWQgaWYgYXV0b3B1Ymxpc2ggaXMgb24uIE11c3QgYmUgY2FsbGVkIGZyb20gdG9wLWxldmVsXG4gIC8vIGNvZGUgKGllLCBiZWZvcmUgTWV0ZW9yLnN0YXJ0dXAgaG9va3MgcnVuKS5cbiAgLy9cbiAgLy8gQHBhcmFtIG9wdHMge09iamVjdH0gd2l0aDpcbiAgLy8gICAtIGZvckxvZ2dlZEluVXNlciB7QXJyYXl9IEFycmF5IG9mIGZpZWxkcyBwdWJsaXNoZWQgdG8gdGhlIGxvZ2dlZC1pbiB1c2VyXG4gIC8vICAgLSBmb3JPdGhlclVzZXJzIHtBcnJheX0gQXJyYXkgb2YgZmllbGRzIHB1Ymxpc2hlZCB0byB1c2VycyB0aGF0IGFyZW4ndCBsb2dnZWQgaW5cbiAgYWRkQXV0b3B1Ymxpc2hGaWVsZHMob3B0cykge1xuICAgIHRoaXMuX2F1dG9wdWJsaXNoRmllbGRzLmxvZ2dlZEluVXNlci5wdXNoLmFwcGx5KFxuICAgICAgdGhpcy5fYXV0b3B1Ymxpc2hGaWVsZHMubG9nZ2VkSW5Vc2VyLCBvcHRzLmZvckxvZ2dlZEluVXNlcik7XG4gICAgdGhpcy5fYXV0b3B1Ymxpc2hGaWVsZHMub3RoZXJVc2Vycy5wdXNoLmFwcGx5KFxuICAgICAgdGhpcy5fYXV0b3B1Ymxpc2hGaWVsZHMub3RoZXJVc2Vycywgb3B0cy5mb3JPdGhlclVzZXJzKTtcbiAgfTtcblxuICAvLyBSZXBsYWNlcyB0aGUgZmllbGRzIHRvIGJlIGF1dG9tYXRpY2FsbHlcbiAgLy8gcHVibGlzaGVkIHdoZW4gdGhlIHVzZXIgbG9ncyBpblxuICAvL1xuICAvLyBAcGFyYW0ge01vbmdvRmllbGRTcGVjaWZpZXJ9IGZpZWxkcyBEaWN0aW9uYXJ5IG9mIGZpZWxkcyB0byByZXR1cm4gb3IgZXhjbHVkZS5cbiAgc2V0RGVmYXVsdFB1Ymxpc2hGaWVsZHMoZmllbGRzKSB7XG4gICAgdGhpcy5fZGVmYXVsdFB1Ymxpc2hGaWVsZHMucHJvamVjdGlvbiA9IGZpZWxkcztcbiAgfTtcblxuICAvLy9cbiAgLy8vIEFDQ09VTlQgREFUQVxuICAvLy9cblxuICAvLyBIQUNLOiBUaGlzIGlzIHVzZWQgYnkgJ21ldGVvci1hY2NvdW50cycgdG8gZ2V0IHRoZSBsb2dpblRva2VuIGZvciBhXG4gIC8vIGNvbm5lY3Rpb24uIE1heWJlIHRoZXJlIHNob3VsZCBiZSBhIHB1YmxpYyB3YXkgdG8gZG8gdGhhdC5cbiAgX2dldEFjY291bnREYXRhKGNvbm5lY3Rpb25JZCwgZmllbGQpIHtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5fYWNjb3VudERhdGFbY29ubmVjdGlvbklkXTtcbiAgICByZXR1cm4gZGF0YSAmJiBkYXRhW2ZpZWxkXTtcbiAgfTtcblxuICBfc2V0QWNjb3VudERhdGEoY29ubmVjdGlvbklkLCBmaWVsZCwgdmFsdWUpIHtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5fYWNjb3VudERhdGFbY29ubmVjdGlvbklkXTtcblxuICAgIC8vIHNhZmV0eSBiZWx0LiBzaG91bGRuJ3QgaGFwcGVuLiBhY2NvdW50RGF0YSBpcyBzZXQgaW4gb25Db25uZWN0aW9uLFxuICAgIC8vIHdlIGRvbid0IGhhdmUgYSBjb25uZWN0aW9uSWQgdW50aWwgaXQgaXMgc2V0LlxuICAgIGlmICghZGF0YSlcbiAgICAgIHJldHVybjtcblxuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgZGVsZXRlIGRhdGFbZmllbGRdO1xuICAgIGVsc2VcbiAgICAgIGRhdGFbZmllbGRdID0gdmFsdWU7XG4gIH07XG5cbiAgLy8vXG4gIC8vLyBSRUNPTk5FQ1QgVE9LRU5TXG4gIC8vL1xuICAvLy8gc3VwcG9ydCByZWNvbm5lY3RpbmcgdXNpbmcgYSBtZXRlb3IgbG9naW4gdG9rZW5cblxuICBfaGFzaExvZ2luVG9rZW4obG9naW5Ub2tlbikge1xuICAgIGNvbnN0IGhhc2ggPSBjcnlwdG8uY3JlYXRlSGFzaCgnc2hhMjU2Jyk7XG4gICAgaGFzaC51cGRhdGUobG9naW5Ub2tlbik7XG4gICAgcmV0dXJuIGhhc2guZGlnZXN0KCdiYXNlNjQnKTtcbiAgfTtcblxuICAvLyB7dG9rZW4sIHdoZW59ID0+IHtoYXNoZWRUb2tlbiwgd2hlbn1cbiAgX2hhc2hTdGFtcGVkVG9rZW4oc3RhbXBlZFRva2VuKSB7XG4gICAgY29uc3QgeyB0b2tlbiwgLi4uaGFzaGVkU3RhbXBlZFRva2VuIH0gPSBzdGFtcGVkVG9rZW47XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmhhc2hlZFN0YW1wZWRUb2tlbixcbiAgICAgIGhhc2hlZFRva2VuOiB0aGlzLl9oYXNoTG9naW5Ub2tlbih0b2tlbilcbiAgICB9O1xuICB9O1xuXG4gIC8vIFVzaW5nICRhZGRUb1NldCBhdm9pZHMgZ2V0dGluZyBhbiBpbmRleCBlcnJvciBpZiBhbm90aGVyIGNsaWVudFxuICAvLyBsb2dnaW5nIGluIHNpbXVsdGFuZW91c2x5IGhhcyBhbHJlYWR5IGluc2VydGVkIHRoZSBuZXcgaGFzaGVkXG4gIC8vIHRva2VuLlxuICBfaW5zZXJ0SGFzaGVkTG9naW5Ub2tlbih1c2VySWQsIGhhc2hlZFRva2VuLCBxdWVyeSkge1xuICAgIHF1ZXJ5ID0gcXVlcnkgPyB7IC4uLnF1ZXJ5IH0gOiB7fTtcbiAgICBxdWVyeS5faWQgPSB1c2VySWQ7XG4gICAgdGhpcy51c2Vycy51cGRhdGUocXVlcnksIHtcbiAgICAgICRhZGRUb1NldDoge1xuICAgICAgICBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vuc1wiOiBoYXNoZWRUb2tlblxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIC8vIEV4cG9ydGVkIGZvciB0ZXN0cy5cbiAgX2luc2VydExvZ2luVG9rZW4odXNlcklkLCBzdGFtcGVkVG9rZW4sIHF1ZXJ5KSB7XG4gICAgdGhpcy5faW5zZXJ0SGFzaGVkTG9naW5Ub2tlbihcbiAgICAgIHVzZXJJZCxcbiAgICAgIHRoaXMuX2hhc2hTdGFtcGVkVG9rZW4oc3RhbXBlZFRva2VuKSxcbiAgICAgIHF1ZXJ5XG4gICAgKTtcbiAgfTtcblxuICBfY2xlYXJBbGxMb2dpblRva2Vucyh1c2VySWQpIHtcbiAgICB0aGlzLnVzZXJzLnVwZGF0ZSh1c2VySWQsIHtcbiAgICAgICRzZXQ6IHtcbiAgICAgICAgJ3NlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vucyc6IFtdXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gdGVzdCBob29rXG4gIF9nZXRVc2VyT2JzZXJ2ZShjb25uZWN0aW9uSWQpIHtcbiAgICByZXR1cm4gdGhpcy5fdXNlck9ic2VydmVzRm9yQ29ubmVjdGlvbnNbY29ubmVjdGlvbklkXTtcbiAgfTtcblxuICAvLyBDbGVhbiB1cCB0aGlzIGNvbm5lY3Rpb24ncyBhc3NvY2lhdGlvbiB3aXRoIHRoZSB0b2tlbjogdGhhdCBpcywgc3RvcFxuICAvLyB0aGUgb2JzZXJ2ZSB0aGF0IHdlIHN0YXJ0ZWQgd2hlbiB3ZSBhc3NvY2lhdGVkIHRoZSBjb25uZWN0aW9uIHdpdGhcbiAgLy8gdGhpcyB0b2tlbi5cbiAgX3JlbW92ZVRva2VuRnJvbUNvbm5lY3Rpb24oY29ubmVjdGlvbklkKSB7XG4gICAgaWYgKGhhc093bi5jYWxsKHRoaXMuX3VzZXJPYnNlcnZlc0ZvckNvbm5lY3Rpb25zLCBjb25uZWN0aW9uSWQpKSB7XG4gICAgICBjb25zdCBvYnNlcnZlID0gdGhpcy5fdXNlck9ic2VydmVzRm9yQ29ubmVjdGlvbnNbY29ubmVjdGlvbklkXTtcbiAgICAgIGlmICh0eXBlb2Ygb2JzZXJ2ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgLy8gV2UncmUgaW4gdGhlIHByb2Nlc3Mgb2Ygc2V0dGluZyB1cCBhbiBvYnNlcnZlIGZvciB0aGlzIGNvbm5lY3Rpb24uIFdlXG4gICAgICAgIC8vIGNhbid0IGNsZWFuIHVwIHRoYXQgb2JzZXJ2ZSB5ZXQsIGJ1dCBpZiB3ZSBkZWxldGUgdGhlIHBsYWNlaG9sZGVyIGZvclxuICAgICAgICAvLyB0aGlzIGNvbm5lY3Rpb24sIHRoZW4gdGhlIG9ic2VydmUgd2lsbCBnZXQgY2xlYW5lZCB1cCBhcyBzb29uIGFzIGl0IGhhc1xuICAgICAgICAvLyBiZWVuIHNldCB1cC5cbiAgICAgICAgZGVsZXRlIHRoaXMuX3VzZXJPYnNlcnZlc0ZvckNvbm5lY3Rpb25zW2Nvbm5lY3Rpb25JZF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWxldGUgdGhpcy5fdXNlck9ic2VydmVzRm9yQ29ubmVjdGlvbnNbY29ubmVjdGlvbklkXTtcbiAgICAgICAgb2JzZXJ2ZS5zdG9wKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIF9nZXRMb2dpblRva2VuKGNvbm5lY3Rpb25JZCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRBY2NvdW50RGF0YShjb25uZWN0aW9uSWQsICdsb2dpblRva2VuJyk7XG4gIH07XG5cbiAgLy8gbmV3VG9rZW4gaXMgYSBoYXNoZWQgdG9rZW4uXG4gIF9zZXRMb2dpblRva2VuKHVzZXJJZCwgY29ubmVjdGlvbiwgbmV3VG9rZW4pIHtcbiAgICB0aGlzLl9yZW1vdmVUb2tlbkZyb21Db25uZWN0aW9uKGNvbm5lY3Rpb24uaWQpO1xuICAgIHRoaXMuX3NldEFjY291bnREYXRhKGNvbm5lY3Rpb24uaWQsICdsb2dpblRva2VuJywgbmV3VG9rZW4pO1xuXG4gICAgaWYgKG5ld1Rva2VuKSB7XG4gICAgICAvLyBTZXQgdXAgYW4gb2JzZXJ2ZSBmb3IgdGhpcyB0b2tlbi4gSWYgdGhlIHRva2VuIGdvZXMgYXdheSwgd2UgbmVlZFxuICAgICAgLy8gdG8gY2xvc2UgdGhlIGNvbm5lY3Rpb24uICBXZSBkZWZlciB0aGUgb2JzZXJ2ZSBiZWNhdXNlIHRoZXJlJ3NcbiAgICAgIC8vIG5vIG5lZWQgZm9yIGl0IHRvIGJlIG9uIHRoZSBjcml0aWNhbCBwYXRoIGZvciBsb2dpbjsgd2UganVzdCBuZWVkXG4gICAgICAvLyB0byBlbnN1cmUgdGhhdCB0aGUgY29ubmVjdGlvbiB3aWxsIGdldCBjbG9zZWQgYXQgc29tZSBwb2ludCBpZlxuICAgICAgLy8gdGhlIHRva2VuIGdldHMgZGVsZXRlZC5cbiAgICAgIC8vXG4gICAgICAvLyBJbml0aWFsbHksIHdlIHNldCB0aGUgb2JzZXJ2ZSBmb3IgdGhpcyBjb25uZWN0aW9uIHRvIGEgbnVtYmVyOyB0aGlzXG4gICAgICAvLyBzaWduaWZpZXMgdG8gb3RoZXIgY29kZSAod2hpY2ggbWlnaHQgcnVuIHdoaWxlIHdlIHlpZWxkKSB0aGF0IHdlIGFyZSBpblxuICAgICAgLy8gdGhlIHByb2Nlc3Mgb2Ygc2V0dGluZyB1cCBhbiBvYnNlcnZlIGZvciB0aGlzIGNvbm5lY3Rpb24uIE9uY2UgdGhlXG4gICAgICAvLyBvYnNlcnZlIGlzIHJlYWR5IHRvIGdvLCB3ZSByZXBsYWNlIHRoZSBudW1iZXIgd2l0aCB0aGUgcmVhbCBvYnNlcnZlXG4gICAgICAvLyBoYW5kbGUgKHVubGVzcyB0aGUgcGxhY2Vob2xkZXIgaGFzIGJlZW4gZGVsZXRlZCBvciByZXBsYWNlZCBieSBhXG4gICAgICAvLyBkaWZmZXJlbnQgcGxhY2Vob2xkIG51bWJlciwgc2lnbmlmeWluZyB0aGF0IHRoZSBjb25uZWN0aW9uIHdhcyBjbG9zZWRcbiAgICAgIC8vIGFscmVhZHkgLS0gaW4gdGhpcyBjYXNlIHdlIGp1c3QgY2xlYW4gdXAgdGhlIG9ic2VydmUgdGhhdCB3ZSBzdGFydGVkKS5cbiAgICAgIGNvbnN0IG15T2JzZXJ2ZU51bWJlciA9ICsrdGhpcy5fbmV4dFVzZXJPYnNlcnZlTnVtYmVyO1xuICAgICAgdGhpcy5fdXNlck9ic2VydmVzRm9yQ29ubmVjdGlvbnNbY29ubmVjdGlvbi5pZF0gPSBteU9ic2VydmVOdW1iZXI7XG4gICAgICBNZXRlb3IuZGVmZXIoKCkgPT4ge1xuICAgICAgICAvLyBJZiBzb21ldGhpbmcgZWxzZSBoYXBwZW5lZCBvbiB0aGlzIGNvbm5lY3Rpb24gaW4gdGhlIG1lYW50aW1lIChpdCBnb3RcbiAgICAgICAgLy8gY2xvc2VkLCBvciBhbm90aGVyIGNhbGwgdG8gX3NldExvZ2luVG9rZW4gaGFwcGVuZWQpLCBqdXN0IGRvXG4gICAgICAgIC8vIG5vdGhpbmcuIFdlIGRvbid0IG5lZWQgdG8gc3RhcnQgYW4gb2JzZXJ2ZSBmb3IgYW4gb2xkIGNvbm5lY3Rpb24gb3Igb2xkXG4gICAgICAgIC8vIHRva2VuLlxuICAgICAgICBpZiAodGhpcy5fdXNlck9ic2VydmVzRm9yQ29ubmVjdGlvbnNbY29ubmVjdGlvbi5pZF0gIT09IG15T2JzZXJ2ZU51bWJlcikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBmb3VuZE1hdGNoaW5nVXNlcjtcbiAgICAgICAgLy8gQmVjYXVzZSB3ZSB1cGdyYWRlIHVuaGFzaGVkIGxvZ2luIHRva2VucyB0byBoYXNoZWQgdG9rZW5zIGF0XG4gICAgICAgIC8vIGxvZ2luIHRpbWUsIHNlc3Npb25zIHdpbGwgb25seSBiZSBsb2dnZWQgaW4gd2l0aCBhIGhhc2hlZFxuICAgICAgICAvLyB0b2tlbi4gVGh1cyB3ZSBvbmx5IG5lZWQgdG8gb2JzZXJ2ZSBoYXNoZWQgdG9rZW5zIGhlcmUuXG4gICAgICAgIGNvbnN0IG9ic2VydmUgPSB0aGlzLnVzZXJzLmZpbmQoe1xuICAgICAgICAgIF9pZDogdXNlcklkLFxuICAgICAgICAgICdzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMuaGFzaGVkVG9rZW4nOiBuZXdUb2tlblxuICAgICAgICB9LCB7IGZpZWxkczogeyBfaWQ6IDEgfSB9KS5vYnNlcnZlQ2hhbmdlcyh7XG4gICAgICAgICAgYWRkZWQ6ICgpID0+IHtcbiAgICAgICAgICAgIGZvdW5kTWF0Y2hpbmdVc2VyID0gdHJ1ZTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlbW92ZWQ6IGNvbm5lY3Rpb24uY2xvc2UsXG4gICAgICAgICAgLy8gVGhlIG9uQ2xvc2UgY2FsbGJhY2sgZm9yIHRoZSBjb25uZWN0aW9uIHRha2VzIGNhcmUgb2ZcbiAgICAgICAgICAvLyBjbGVhbmluZyB1cCB0aGUgb2JzZXJ2ZSBoYW5kbGUgYW5kIGFueSBvdGhlciBzdGF0ZSB3ZSBoYXZlXG4gICAgICAgICAgLy8gbHlpbmcgYXJvdW5kLlxuICAgICAgICB9LCB7IG5vbk11dGF0aW5nQ2FsbGJhY2tzOiB0cnVlIH0pO1xuXG4gICAgICAgIC8vIElmIHRoZSB1c2VyIHJhbiBhbm90aGVyIGxvZ2luIG9yIGxvZ291dCBjb21tYW5kIHdlIHdlcmUgd2FpdGluZyBmb3IgdGhlXG4gICAgICAgIC8vIGRlZmVyIG9yIGFkZGVkIHRvIGZpcmUgKGllLCBhbm90aGVyIGNhbGwgdG8gX3NldExvZ2luVG9rZW4gb2NjdXJyZWQpLFxuICAgICAgICAvLyB0aGVuIHdlIGxldCB0aGUgbGF0ZXIgb25lIHdpbiAoc3RhcnQgYW4gb2JzZXJ2ZSwgZXRjKSBhbmQganVzdCBzdG9wIG91clxuICAgICAgICAvLyBvYnNlcnZlIG5vdy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gU2ltaWxhcmx5LCBpZiB0aGUgY29ubmVjdGlvbiB3YXMgYWxyZWFkeSBjbG9zZWQsIHRoZW4gdGhlIG9uQ2xvc2VcbiAgICAgICAgLy8gY2FsbGJhY2sgd291bGQgaGF2ZSBjYWxsZWQgX3JlbW92ZVRva2VuRnJvbUNvbm5lY3Rpb24gYW5kIHRoZXJlIHdvbid0XG4gICAgICAgIC8vIGJlIGFuIGVudHJ5IGluIF91c2VyT2JzZXJ2ZXNGb3JDb25uZWN0aW9ucy4gV2UgY2FuIHN0b3AgdGhlIG9ic2VydmUuXG4gICAgICAgIGlmICh0aGlzLl91c2VyT2JzZXJ2ZXNGb3JDb25uZWN0aW9uc1tjb25uZWN0aW9uLmlkXSAhPT0gbXlPYnNlcnZlTnVtYmVyKSB7XG4gICAgICAgICAgb2JzZXJ2ZS5zdG9wKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fdXNlck9ic2VydmVzRm9yQ29ubmVjdGlvbnNbY29ubmVjdGlvbi5pZF0gPSBvYnNlcnZlO1xuXG4gICAgICAgIGlmICghIGZvdW5kTWF0Y2hpbmdVc2VyKSB7XG4gICAgICAgICAgLy8gV2UndmUgc2V0IHVwIGFuIG9ic2VydmUgb24gdGhlIHVzZXIgYXNzb2NpYXRlZCB3aXRoIGBuZXdUb2tlbmAsXG4gICAgICAgICAgLy8gc28gaWYgdGhlIG5ldyB0b2tlbiBpcyByZW1vdmVkIGZyb20gdGhlIGRhdGFiYXNlLCB3ZSdsbCBjbG9zZVxuICAgICAgICAgIC8vIHRoZSBjb25uZWN0aW9uLiBCdXQgdGhlIHRva2VuIG1pZ2h0IGhhdmUgYWxyZWFkeSBiZWVuIGRlbGV0ZWRcbiAgICAgICAgICAvLyBiZWZvcmUgd2Ugc2V0IHVwIHRoZSBvYnNlcnZlLCB3aGljaCB3b3VsZG4ndCBoYXZlIGNsb3NlZCB0aGVcbiAgICAgICAgICAvLyBjb25uZWN0aW9uIGJlY2F1c2UgdGhlIG9ic2VydmUgd2Fzbid0IHJ1bm5pbmcgeWV0LlxuICAgICAgICAgIGNvbm5lY3Rpb24uY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIC8vIChBbHNvIHVzZWQgYnkgTWV0ZW9yIEFjY291bnRzIHNlcnZlciBhbmQgdGVzdHMpLlxuICAvL1xuICBfZ2VuZXJhdGVTdGFtcGVkTG9naW5Ub2tlbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdG9rZW46IFJhbmRvbS5zZWNyZXQoKSxcbiAgICAgIHdoZW46IG5ldyBEYXRlXG4gICAgfTtcbiAgfTtcblxuICAvLy9cbiAgLy8vIFRPS0VOIEVYUElSQVRJT05cbiAgLy8vXG5cbiAgLy8gRGVsZXRlcyBleHBpcmVkIHBhc3N3b3JkIHJlc2V0IHRva2VucyBmcm9tIHRoZSBkYXRhYmFzZS5cbiAgLy9cbiAgLy8gRXhwb3J0ZWQgZm9yIHRlc3RzLiBBbHNvLCB0aGUgYXJndW1lbnRzIGFyZSBvbmx5IHVzZWQgYnlcbiAgLy8gdGVzdHMuIG9sZGVzdFZhbGlkRGF0ZSBpcyBzaW11bGF0ZSBleHBpcmluZyB0b2tlbnMgd2l0aG91dCB3YWl0aW5nXG4gIC8vIGZvciB0aGVtIHRvIGFjdHVhbGx5IGV4cGlyZS4gdXNlcklkIGlzIHVzZWQgYnkgdGVzdHMgdG8gb25seSBleHBpcmVcbiAgLy8gdG9rZW5zIGZvciB0aGUgdGVzdCB1c2VyLlxuICBfZXhwaXJlUGFzc3dvcmRSZXNldFRva2VucyhvbGRlc3RWYWxpZERhdGUsIHVzZXJJZCkge1xuICAgIGNvbnN0IHRva2VuTGlmZXRpbWVNcyA9IHRoaXMuX2dldFBhc3N3b3JkUmVzZXRUb2tlbkxpZmV0aW1lTXMoKTtcblxuICAgIC8vIHdoZW4gY2FsbGluZyBmcm9tIGEgdGVzdCB3aXRoIGV4dHJhIGFyZ3VtZW50cywgeW91IG11c3Qgc3BlY2lmeSBib3RoIVxuICAgIGlmICgob2xkZXN0VmFsaWREYXRlICYmICF1c2VySWQpIHx8ICghb2xkZXN0VmFsaWREYXRlICYmIHVzZXJJZCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkJhZCB0ZXN0LiBNdXN0IHNwZWNpZnkgYm90aCBvbGRlc3RWYWxpZERhdGUgYW5kIHVzZXJJZC5cIik7XG4gICAgfVxuXG4gICAgb2xkZXN0VmFsaWREYXRlID0gb2xkZXN0VmFsaWREYXRlIHx8XG4gICAgICAobmV3IERhdGUobmV3IERhdGUoKSAtIHRva2VuTGlmZXRpbWVNcykpO1xuXG4gICAgY29uc3QgdG9rZW5GaWx0ZXIgPSB7XG4gICAgICAkb3I6IFtcbiAgICAgICAgeyBcInNlcnZpY2VzLnBhc3N3b3JkLnJlc2V0LnJlYXNvblwiOiBcInJlc2V0XCJ9LFxuICAgICAgICB7IFwic2VydmljZXMucGFzc3dvcmQucmVzZXQucmVhc29uXCI6IHskZXhpc3RzOiBmYWxzZX19XG4gICAgICBdXG4gICAgfTtcblxuICAgIGV4cGlyZVBhc3N3b3JkVG9rZW4odGhpcywgb2xkZXN0VmFsaWREYXRlLCB0b2tlbkZpbHRlciwgdXNlcklkKTtcbiAgfVxuXG4gIC8vIERlbGV0ZXMgZXhwaXJlZCBwYXNzd29yZCBlbnJvbGwgdG9rZW5zIGZyb20gdGhlIGRhdGFiYXNlLlxuICAvL1xuICAvLyBFeHBvcnRlZCBmb3IgdGVzdHMuIEFsc28sIHRoZSBhcmd1bWVudHMgYXJlIG9ubHkgdXNlZCBieVxuICAvLyB0ZXN0cy4gb2xkZXN0VmFsaWREYXRlIGlzIHNpbXVsYXRlIGV4cGlyaW5nIHRva2VucyB3aXRob3V0IHdhaXRpbmdcbiAgLy8gZm9yIHRoZW0gdG8gYWN0dWFsbHkgZXhwaXJlLiB1c2VySWQgaXMgdXNlZCBieSB0ZXN0cyB0byBvbmx5IGV4cGlyZVxuICAvLyB0b2tlbnMgZm9yIHRoZSB0ZXN0IHVzZXIuXG4gIF9leHBpcmVQYXNzd29yZEVucm9sbFRva2VucyhvbGRlc3RWYWxpZERhdGUsIHVzZXJJZCkge1xuICAgIGNvbnN0IHRva2VuTGlmZXRpbWVNcyA9IHRoaXMuX2dldFBhc3N3b3JkRW5yb2xsVG9rZW5MaWZldGltZU1zKCk7XG5cbiAgICAvLyB3aGVuIGNhbGxpbmcgZnJvbSBhIHRlc3Qgd2l0aCBleHRyYSBhcmd1bWVudHMsIHlvdSBtdXN0IHNwZWNpZnkgYm90aCFcbiAgICBpZiAoKG9sZGVzdFZhbGlkRGF0ZSAmJiAhdXNlcklkKSB8fCAoIW9sZGVzdFZhbGlkRGF0ZSAmJiB1c2VySWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCYWQgdGVzdC4gTXVzdCBzcGVjaWZ5IGJvdGggb2xkZXN0VmFsaWREYXRlIGFuZCB1c2VySWQuXCIpO1xuICAgIH1cblxuICAgIG9sZGVzdFZhbGlkRGF0ZSA9IG9sZGVzdFZhbGlkRGF0ZSB8fFxuICAgICAgKG5ldyBEYXRlKG5ldyBEYXRlKCkgLSB0b2tlbkxpZmV0aW1lTXMpKTtcblxuICAgIGNvbnN0IHRva2VuRmlsdGVyID0ge1xuICAgICAgXCJzZXJ2aWNlcy5wYXNzd29yZC5lbnJvbGwucmVhc29uXCI6IFwiZW5yb2xsXCJcbiAgICB9O1xuXG4gICAgZXhwaXJlUGFzc3dvcmRUb2tlbih0aGlzLCBvbGRlc3RWYWxpZERhdGUsIHRva2VuRmlsdGVyLCB1c2VySWQpO1xuICB9XG5cbiAgLy8gRGVsZXRlcyBleHBpcmVkIHRva2VucyBmcm9tIHRoZSBkYXRhYmFzZSBhbmQgY2xvc2VzIGFsbCBvcGVuIGNvbm5lY3Rpb25zXG4gIC8vIGFzc29jaWF0ZWQgd2l0aCB0aGVzZSB0b2tlbnMuXG4gIC8vXG4gIC8vIEV4cG9ydGVkIGZvciB0ZXN0cy4gQWxzbywgdGhlIGFyZ3VtZW50cyBhcmUgb25seSB1c2VkIGJ5XG4gIC8vIHRlc3RzLiBvbGRlc3RWYWxpZERhdGUgaXMgc2ltdWxhdGUgZXhwaXJpbmcgdG9rZW5zIHdpdGhvdXQgd2FpdGluZ1xuICAvLyBmb3IgdGhlbSB0byBhY3R1YWxseSBleHBpcmUuIHVzZXJJZCBpcyB1c2VkIGJ5IHRlc3RzIHRvIG9ubHkgZXhwaXJlXG4gIC8vIHRva2VucyBmb3IgdGhlIHRlc3QgdXNlci5cbiAgX2V4cGlyZVRva2VucyhvbGRlc3RWYWxpZERhdGUsIHVzZXJJZCkge1xuICAgIGNvbnN0IHRva2VuTGlmZXRpbWVNcyA9IHRoaXMuX2dldFRva2VuTGlmZXRpbWVNcygpO1xuXG4gICAgLy8gd2hlbiBjYWxsaW5nIGZyb20gYSB0ZXN0IHdpdGggZXh0cmEgYXJndW1lbnRzLCB5b3UgbXVzdCBzcGVjaWZ5IGJvdGghXG4gICAgaWYgKChvbGRlc3RWYWxpZERhdGUgJiYgIXVzZXJJZCkgfHwgKCFvbGRlc3RWYWxpZERhdGUgJiYgdXNlcklkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQmFkIHRlc3QuIE11c3Qgc3BlY2lmeSBib3RoIG9sZGVzdFZhbGlkRGF0ZSBhbmQgdXNlcklkLlwiKTtcbiAgICB9XG5cbiAgICBvbGRlc3RWYWxpZERhdGUgPSBvbGRlc3RWYWxpZERhdGUgfHxcbiAgICAgIChuZXcgRGF0ZShuZXcgRGF0ZSgpIC0gdG9rZW5MaWZldGltZU1zKSk7XG4gICAgY29uc3QgdXNlckZpbHRlciA9IHVzZXJJZCA/IHtfaWQ6IHVzZXJJZH0gOiB7fTtcblxuXG4gICAgLy8gQmFja3dhcmRzIGNvbXBhdGlibGUgd2l0aCBvbGRlciB2ZXJzaW9ucyBvZiBtZXRlb3IgdGhhdCBzdG9yZWQgbG9naW4gdG9rZW5cbiAgICAvLyB0aW1lc3RhbXBzIGFzIG51bWJlcnMuXG4gICAgdGhpcy51c2Vycy51cGRhdGUoeyAuLi51c2VyRmlsdGVyLFxuICAgICAgJG9yOiBbXG4gICAgICAgIHsgXCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMud2hlblwiOiB7ICRsdDogb2xkZXN0VmFsaWREYXRlIH0gfSxcbiAgICAgICAgeyBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vucy53aGVuXCI6IHsgJGx0OiArb2xkZXN0VmFsaWREYXRlIH0gfVxuICAgICAgXVxuICAgIH0sIHtcbiAgICAgICRwdWxsOiB7XG4gICAgICAgIFwic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zXCI6IHtcbiAgICAgICAgICAkb3I6IFtcbiAgICAgICAgICAgIHsgd2hlbjogeyAkbHQ6IG9sZGVzdFZhbGlkRGF0ZSB9IH0sXG4gICAgICAgICAgICB7IHdoZW46IHsgJGx0OiArb2xkZXN0VmFsaWREYXRlIH0gfVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHsgbXVsdGk6IHRydWUgfSk7XG4gICAgLy8gVGhlIG9ic2VydmUgb24gTWV0ZW9yLnVzZXJzIHdpbGwgdGFrZSBjYXJlIG9mIGNsb3NpbmcgY29ubmVjdGlvbnMgZm9yXG4gICAgLy8gZXhwaXJlZCB0b2tlbnMuXG4gIH07XG5cbiAgLy8gQG92ZXJyaWRlIGZyb20gYWNjb3VudHNfY29tbW9uLmpzXG4gIGNvbmZpZyhvcHRpb25zKSB7XG4gICAgLy8gQ2FsbCB0aGUgb3ZlcnJpZGRlbiBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgbWV0aG9kLlxuICAgIGNvbnN0IHN1cGVyUmVzdWx0ID0gQWNjb3VudHNDb21tb24ucHJvdG90eXBlLmNvbmZpZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgLy8gSWYgdGhlIHVzZXIgc2V0IGxvZ2luRXhwaXJhdGlvbkluRGF5cyB0byBudWxsLCB0aGVuIHdlIG5lZWQgdG8gY2xlYXIgdGhlXG4gICAgLy8gdGltZXIgdGhhdCBwZXJpb2RpY2FsbHkgZXhwaXJlcyB0b2tlbnMuXG4gICAgaWYgKGhhc093bi5jYWxsKHRoaXMuX29wdGlvbnMsICdsb2dpbkV4cGlyYXRpb25JbkRheXMnKSAmJlxuICAgICAgdGhpcy5fb3B0aW9ucy5sb2dpbkV4cGlyYXRpb25JbkRheXMgPT09IG51bGwgJiZcbiAgICAgIHRoaXMuZXhwaXJlVG9rZW5JbnRlcnZhbCkge1xuICAgICAgTWV0ZW9yLmNsZWFySW50ZXJ2YWwodGhpcy5leHBpcmVUb2tlbkludGVydmFsKTtcbiAgICAgIHRoaXMuZXhwaXJlVG9rZW5JbnRlcnZhbCA9IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN1cGVyUmVzdWx0O1xuICB9O1xuXG4gIC8vIENhbGxlZCBieSBhY2NvdW50cy1wYXNzd29yZFxuICBpbnNlcnRVc2VyRG9jKG9wdGlvbnMsIHVzZXIpIHtcbiAgICAvLyAtIGNsb25lIHVzZXIgZG9jdW1lbnQsIHRvIHByb3RlY3QgZnJvbSBtb2RpZmljYXRpb25cbiAgICAvLyAtIGFkZCBjcmVhdGVkQXQgdGltZXN0YW1wXG4gICAgLy8gLSBwcmVwYXJlIGFuIF9pZCwgc28gdGhhdCB5b3UgY2FuIG1vZGlmeSBvdGhlciBjb2xsZWN0aW9ucyAoZWdcbiAgICAvLyBjcmVhdGUgYSBmaXJzdCB0YXNrIGZvciBldmVyeSBuZXcgdXNlcilcbiAgICAvL1xuICAgIC8vIFhYWCBJZiB0aGUgb25DcmVhdGVVc2VyIG9yIHZhbGlkYXRlTmV3VXNlciBob29rcyBmYWlsLCB3ZSBtaWdodFxuICAgIC8vIGVuZCB1cCBoYXZpbmcgbW9kaWZpZWQgc29tZSBvdGhlciBjb2xsZWN0aW9uXG4gICAgLy8gaW5hcHByb3ByaWF0ZWx5LiBUaGUgc29sdXRpb24gaXMgcHJvYmFibHkgdG8gaGF2ZSBvbkNyZWF0ZVVzZXJcbiAgICAvLyBhY2NlcHQgdHdvIGNhbGxiYWNrcyAtIG9uZSB0aGF0IGdldHMgY2FsbGVkIGJlZm9yZSBpbnNlcnRpbmdcbiAgICAvLyB0aGUgdXNlciBkb2N1bWVudCAoaW4gd2hpY2ggeW91IGNhbiBtb2RpZnkgaXRzIGNvbnRlbnRzKSwgYW5kXG4gICAgLy8gb25lIHRoYXQgZ2V0cyBjYWxsZWQgYWZ0ZXIgKGluIHdoaWNoIHlvdSBzaG91bGQgY2hhbmdlIG90aGVyXG4gICAgLy8gY29sbGVjdGlvbnMpXG4gICAgdXNlciA9IHtcbiAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKSxcbiAgICAgIF9pZDogUmFuZG9tLmlkKCksXG4gICAgICAuLi51c2VyLFxuICAgIH07XG5cbiAgICBpZiAodXNlci5zZXJ2aWNlcykge1xuICAgICAgT2JqZWN0LmtleXModXNlci5zZXJ2aWNlcykuZm9yRWFjaChzZXJ2aWNlID0+XG4gICAgICAgIHBpbkVuY3J5cHRlZEZpZWxkc1RvVXNlcih1c2VyLnNlcnZpY2VzW3NlcnZpY2VdLCB1c2VyLl9pZClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IGZ1bGxVc2VyO1xuICAgIGlmICh0aGlzLl9vbkNyZWF0ZVVzZXJIb29rKSB7XG4gICAgICBmdWxsVXNlciA9IHRoaXMuX29uQ3JlYXRlVXNlckhvb2sob3B0aW9ucywgdXNlcik7XG5cbiAgICAgIC8vIFRoaXMgaXMgKm5vdCogcGFydCBvZiB0aGUgQVBJLiBXZSBuZWVkIHRoaXMgYmVjYXVzZSB3ZSBjYW4ndCBpc29sYXRlXG4gICAgICAvLyB0aGUgZ2xvYmFsIHNlcnZlciBlbnZpcm9ubWVudCBiZXR3ZWVuIHRlc3RzLCBtZWFuaW5nIHdlIGNhbid0IHRlc3RcbiAgICAgIC8vIGJvdGggaGF2aW5nIGEgY3JlYXRlIHVzZXIgaG9vayBzZXQgYW5kIG5vdCBoYXZpbmcgb25lIHNldC5cbiAgICAgIGlmIChmdWxsVXNlciA9PT0gJ1RFU1QgREVGQVVMVCBIT09LJylcbiAgICAgICAgZnVsbFVzZXIgPSBkZWZhdWx0Q3JlYXRlVXNlckhvb2sob3B0aW9ucywgdXNlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZ1bGxVc2VyID0gZGVmYXVsdENyZWF0ZVVzZXJIb29rKG9wdGlvbnMsIHVzZXIpO1xuICAgIH1cblxuICAgIHRoaXMuX3ZhbGlkYXRlTmV3VXNlckhvb2tzLmZvckVhY2goaG9vayA9PiB7XG4gICAgICBpZiAoISBob29rKGZ1bGxVc2VyKSlcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVXNlciB2YWxpZGF0aW9uIGZhaWxlZFwiKTtcbiAgICB9KTtcblxuICAgIGxldCB1c2VySWQ7XG4gICAgdHJ5IHtcbiAgICAgIHVzZXJJZCA9IHRoaXMudXNlcnMuaW5zZXJ0KGZ1bGxVc2VyKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBYWFggc3RyaW5nIHBhcnNpbmcgc3Vja3MsIG1heWJlXG4gICAgICAvLyBodHRwczovL2ppcmEubW9uZ29kYi5vcmcvYnJvd3NlL1NFUlZFUi0zMDY5IHdpbGwgZ2V0IGZpeGVkIG9uZSBkYXlcbiAgICAgIC8vIGh0dHBzOi8vamlyYS5tb25nb2RiLm9yZy9icm93c2UvU0VSVkVSLTQ2MzdcbiAgICAgIGlmICghZS5lcnJtc2cpIHRocm93IGU7XG4gICAgICBpZiAoZS5lcnJtc2cuaW5jbHVkZXMoJ2VtYWlscy5hZGRyZXNzJykpXG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIkVtYWlsIGFscmVhZHkgZXhpc3RzLlwiKTtcbiAgICAgIGlmIChlLmVycm1zZy5pbmNsdWRlcygndXNlcm5hbWUnKSlcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVXNlcm5hbWUgYWxyZWFkeSBleGlzdHMuXCIpO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgcmV0dXJuIHVzZXJJZDtcbiAgfTtcblxuICAvLyBIZWxwZXIgZnVuY3Rpb246IHJldHVybnMgZmFsc2UgaWYgZW1haWwgZG9lcyBub3QgbWF0Y2ggY29tcGFueSBkb21haW4gZnJvbVxuICAvLyB0aGUgY29uZmlndXJhdGlvbi5cbiAgX3Rlc3RFbWFpbERvbWFpbihlbWFpbCkge1xuICAgIGNvbnN0IGRvbWFpbiA9IHRoaXMuX29wdGlvbnMucmVzdHJpY3RDcmVhdGlvbkJ5RW1haWxEb21haW47XG5cbiAgICByZXR1cm4gIWRvbWFpbiB8fFxuICAgICAgKHR5cGVvZiBkb21haW4gPT09ICdmdW5jdGlvbicgJiYgZG9tYWluKGVtYWlsKSkgfHxcbiAgICAgICh0eXBlb2YgZG9tYWluID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAobmV3IFJlZ0V4cChgQCR7TWV0ZW9yLl9lc2NhcGVSZWdFeHAoZG9tYWluKX0kYCwgJ2knKSkudGVzdChlbWFpbCkpO1xuICB9O1xuXG4gIC8vL1xuICAvLy8gQ0xFQU4gVVAgRk9SIGBsb2dvdXRPdGhlckNsaWVudHNgXG4gIC8vL1xuXG4gIF9kZWxldGVTYXZlZFRva2Vuc0ZvclVzZXIodXNlcklkLCB0b2tlbnNUb0RlbGV0ZSkge1xuICAgIGlmICh0b2tlbnNUb0RlbGV0ZSkge1xuICAgICAgdGhpcy51c2Vycy51cGRhdGUodXNlcklkLCB7XG4gICAgICAgICR1bnNldDoge1xuICAgICAgICAgIFwic2VydmljZXMucmVzdW1lLmhhdmVMb2dpblRva2Vuc1RvRGVsZXRlXCI6IDEsXG4gICAgICAgICAgXCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnNUb0RlbGV0ZVwiOiAxXG4gICAgICAgIH0sXG4gICAgICAgICRwdWxsQWxsOiB7XG4gICAgICAgICAgXCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnNcIjogdG9rZW5zVG9EZWxldGVcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIF9kZWxldGVTYXZlZFRva2Vuc0ZvckFsbFVzZXJzT25TdGFydHVwKCkge1xuICAgIC8vIElmIHdlIGZpbmQgdXNlcnMgd2hvIGhhdmUgc2F2ZWQgdG9rZW5zIHRvIGRlbGV0ZSBvbiBzdGFydHVwLCBkZWxldGVcbiAgICAvLyB0aGVtIG5vdy4gSXQncyBwb3NzaWJsZSB0aGF0IHRoZSBzZXJ2ZXIgY291bGQgaGF2ZSBjcmFzaGVkIGFuZCBjb21lXG4gICAgLy8gYmFjayB1cCBiZWZvcmUgbmV3IHRva2VucyBhcmUgZm91bmQgaW4gbG9jYWxTdG9yYWdlLCBidXQgdGhpc1xuICAgIC8vIHNob3VsZG4ndCBoYXBwZW4gdmVyeSBvZnRlbi4gV2Ugc2hvdWxkbid0IHB1dCBhIGRlbGF5IGhlcmUgYmVjYXVzZVxuICAgIC8vIHRoYXQgd291bGQgZ2l2ZSBhIGxvdCBvZiBwb3dlciB0byBhbiBhdHRhY2tlciB3aXRoIGEgc3RvbGVuIGxvZ2luXG4gICAgLy8gdG9rZW4gYW5kIHRoZSBhYmlsaXR5IHRvIGNyYXNoIHRoZSBzZXJ2ZXIuXG4gICAgTWV0ZW9yLnN0YXJ0dXAoKCkgPT4ge1xuICAgICAgdGhpcy51c2Vycy5maW5kKHtcbiAgICAgICAgXCJzZXJ2aWNlcy5yZXN1bWUuaGF2ZUxvZ2luVG9rZW5zVG9EZWxldGVcIjogdHJ1ZVxuICAgICAgfSwge2ZpZWxkczoge1xuICAgICAgICBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vuc1RvRGVsZXRlXCI6IDFcbiAgICAgIH19KS5mb3JFYWNoKHVzZXIgPT4ge1xuICAgICAgICB0aGlzLl9kZWxldGVTYXZlZFRva2Vuc0ZvclVzZXIoXG4gICAgICAgICAgdXNlci5faWQsXG4gICAgICAgICAgdXNlci5zZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnNUb0RlbGV0ZVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8vXG4gIC8vLyBNQU5BR0lORyBVU0VSIE9CSkVDVFNcbiAgLy8vXG5cbiAgLy8gVXBkYXRlcyBvciBjcmVhdGVzIGEgdXNlciBhZnRlciB3ZSBhdXRoZW50aWNhdGUgd2l0aCBhIDNyZCBwYXJ0eS5cbiAgLy9cbiAgLy8gQHBhcmFtIHNlcnZpY2VOYW1lIHtTdHJpbmd9IFNlcnZpY2UgbmFtZSAoZWcsIHR3aXR0ZXIpLlxuICAvLyBAcGFyYW0gc2VydmljZURhdGEge09iamVjdH0gRGF0YSB0byBzdG9yZSBpbiB0aGUgdXNlcidzIHJlY29yZFxuICAvLyAgICAgICAgdW5kZXIgc2VydmljZXNbc2VydmljZU5hbWVdLiBNdXN0IGluY2x1ZGUgYW4gXCJpZFwiIGZpZWxkXG4gIC8vICAgICAgICB3aGljaCBpcyBhIHVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGUgdXNlciBpbiB0aGUgc2VydmljZS5cbiAgLy8gQHBhcmFtIG9wdGlvbnMge09iamVjdCwgb3B0aW9uYWx9IE90aGVyIG9wdGlvbnMgdG8gcGFzcyB0byBpbnNlcnRVc2VyRG9jXG4gIC8vICAgICAgICAoZWcsIHByb2ZpbGUpXG4gIC8vIEByZXR1cm5zIHtPYmplY3R9IE9iamVjdCB3aXRoIHRva2VuIGFuZCBpZCBrZXlzLCBsaWtlIHRoZSByZXN1bHRcbiAgLy8gICAgICAgIG9mIHRoZSBcImxvZ2luXCIgbWV0aG9kLlxuICAvL1xuICB1cGRhdGVPckNyZWF0ZVVzZXJGcm9tRXh0ZXJuYWxTZXJ2aWNlKFxuICAgIHNlcnZpY2VOYW1lLFxuICAgIHNlcnZpY2VEYXRhLFxuICAgIG9wdGlvbnNcbiAgKSB7XG4gICAgb3B0aW9ucyA9IHsgLi4ub3B0aW9ucyB9O1xuXG4gICAgaWYgKHNlcnZpY2VOYW1lID09PSBcInBhc3N3b3JkXCIgfHwgc2VydmljZU5hbWUgPT09IFwicmVzdW1lXCIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgXCJDYW4ndCB1c2UgdXBkYXRlT3JDcmVhdGVVc2VyRnJvbUV4dGVybmFsU2VydmljZSB3aXRoIGludGVybmFsIHNlcnZpY2UgXCJcbiAgICAgICAgKyBzZXJ2aWNlTmFtZSk7XG4gICAgfVxuICAgIGlmICghaGFzT3duLmNhbGwoc2VydmljZURhdGEsICdpZCcpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBTZXJ2aWNlIGRhdGEgZm9yIHNlcnZpY2UgJHtzZXJ2aWNlTmFtZX0gbXVzdCBpbmNsdWRlIGlkYCk7XG4gICAgfVxuXG4gICAgLy8gTG9vayBmb3IgYSB1c2VyIHdpdGggdGhlIGFwcHJvcHJpYXRlIHNlcnZpY2UgdXNlciBpZC5cbiAgICBjb25zdCBzZWxlY3RvciA9IHt9O1xuICAgIGNvbnN0IHNlcnZpY2VJZEtleSA9IGBzZXJ2aWNlcy4ke3NlcnZpY2VOYW1lfS5pZGA7XG5cbiAgICAvLyBYWFggVGVtcG9yYXJ5IHNwZWNpYWwgY2FzZSBmb3IgVHdpdHRlci4gKElzc3VlICM2MjkpXG4gICAgLy8gICBUaGUgc2VydmljZURhdGEuaWQgd2lsbCBiZSBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhbiBpbnRlZ2VyLlxuICAgIC8vICAgV2Ugd2FudCBpdCB0byBtYXRjaCBlaXRoZXIgYSBzdG9yZWQgc3RyaW5nIG9yIGludCByZXByZXNlbnRhdGlvbi5cbiAgICAvLyAgIFRoaXMgaXMgdG8gY2F0ZXIgdG8gZWFybGllciB2ZXJzaW9ucyBvZiBNZXRlb3Igc3RvcmluZyB0d2l0dGVyXG4gICAgLy8gICB1c2VyIElEcyBpbiBudW1iZXIgZm9ybSwgYW5kIHJlY2VudCB2ZXJzaW9ucyBzdG9yaW5nIHRoZW0gYXMgc3RyaW5ncy5cbiAgICAvLyAgIFRoaXMgY2FuIGJlIHJlbW92ZWQgb25jZSBtaWdyYXRpb24gdGVjaG5vbG9neSBpcyBpbiBwbGFjZSwgYW5kIHR3aXR0ZXJcbiAgICAvLyAgIHVzZXJzIHN0b3JlZCB3aXRoIGludGVnZXIgSURzIGhhdmUgYmVlbiBtaWdyYXRlZCB0byBzdHJpbmcgSURzLlxuICAgIGlmIChzZXJ2aWNlTmFtZSA9PT0gXCJ0d2l0dGVyXCIgJiYgIWlzTmFOKHNlcnZpY2VEYXRhLmlkKSkge1xuICAgICAgc2VsZWN0b3JbXCIkb3JcIl0gPSBbe30se31dO1xuICAgICAgc2VsZWN0b3JbXCIkb3JcIl1bMF1bc2VydmljZUlkS2V5XSA9IHNlcnZpY2VEYXRhLmlkO1xuICAgICAgc2VsZWN0b3JbXCIkb3JcIl1bMV1bc2VydmljZUlkS2V5XSA9IHBhcnNlSW50KHNlcnZpY2VEYXRhLmlkLCAxMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGVjdG9yW3NlcnZpY2VJZEtleV0gPSBzZXJ2aWNlRGF0YS5pZDtcbiAgICB9XG5cbiAgICBsZXQgdXNlciA9IHRoaXMudXNlcnMuZmluZE9uZShzZWxlY3Rvciwge2ZpZWxkczogdGhpcy5fb3B0aW9ucy5kZWZhdWx0RmllbGRTZWxlY3Rvcn0pO1xuXG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHRoZSBkZXZlbG9wZXIgaGFzIGEgY3VzdG9tIHdheSB0byBmaW5kIHRoZSB1c2VyIG91dHNpZGVcbiAgICAvLyBvZiB0aGUgZ2VuZXJhbCBzZWxlY3RvcnMgYWJvdmUuXG4gICAgaWYgKCF1c2VyICYmIHRoaXMuX2FkZGl0aW9uYWxGaW5kVXNlck9uRXh0ZXJuYWxMb2dpbikge1xuICAgICAgdXNlciA9IHRoaXMuX2FkZGl0aW9uYWxGaW5kVXNlck9uRXh0ZXJuYWxMb2dpbih7c2VydmljZU5hbWUsIHNlcnZpY2VEYXRhLCBvcHRpb25zfSlcbiAgICB9XG5cbiAgICAvLyBCZWZvcmUgY29udGludWluZywgcnVuIHVzZXIgaG9vayB0byBzZWUgaWYgd2Ugc2hvdWxkIGNvbnRpbnVlXG4gICAgaWYgKHRoaXMuX2JlZm9yZUV4dGVybmFsTG9naW5Ib29rICYmICF0aGlzLl9iZWZvcmVFeHRlcm5hbExvZ2luSG9vayhzZXJ2aWNlTmFtZSwgc2VydmljZURhdGEsIHVzZXIpKSB7XG4gICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwMywgXCJMb2dpbiBmb3JiaWRkZW5cIik7XG4gICAgfVxuXG4gICAgLy8gV2hlbiBjcmVhdGluZyBhIG5ldyB1c2VyIHdlIHBhc3MgdGhyb3VnaCBhbGwgb3B0aW9ucy4gV2hlbiB1cGRhdGluZyBhblxuICAgIC8vIGV4aXN0aW5nIHVzZXIsIGJ5IGRlZmF1bHQgd2Ugb25seSBwcm9jZXNzL3Bhc3MgdGhyb3VnaCB0aGUgc2VydmljZURhdGFcbiAgICAvLyAoZWcsIHNvIHRoYXQgd2Uga2VlcCBhbiB1bmV4cGlyZWQgYWNjZXNzIHRva2VuIGFuZCBkb24ndCBjYWNoZSBvbGQgZW1haWxcbiAgICAvLyBhZGRyZXNzZXMgaW4gc2VydmljZURhdGEuZW1haWwpLiBUaGUgb25FeHRlcm5hbExvZ2luIGhvb2sgY2FuIGJlIHVzZWQgd2hlblxuICAgIC8vIGNyZWF0aW5nIG9yIHVwZGF0aW5nIGEgdXNlciwgdG8gbW9kaWZ5IG9yIHBhc3MgdGhyb3VnaCBtb3JlIG9wdGlvbnMgYXNcbiAgICAvLyBuZWVkZWQuXG4gICAgbGV0IG9wdHMgPSB1c2VyID8ge30gOiBvcHRpb25zO1xuICAgIGlmICh0aGlzLl9vbkV4dGVybmFsTG9naW5Ib29rKSB7XG4gICAgICBvcHRzID0gdGhpcy5fb25FeHRlcm5hbExvZ2luSG9vayhvcHRpb25zLCB1c2VyKTtcbiAgICB9XG5cbiAgICBpZiAodXNlcikge1xuICAgICAgcGluRW5jcnlwdGVkRmllbGRzVG9Vc2VyKHNlcnZpY2VEYXRhLCB1c2VyLl9pZCk7XG5cbiAgICAgIGxldCBzZXRBdHRycyA9IHt9O1xuICAgICAgT2JqZWN0LmtleXMoc2VydmljZURhdGEpLmZvckVhY2goa2V5ID0+XG4gICAgICAgIHNldEF0dHJzW2BzZXJ2aWNlcy4ke3NlcnZpY2VOYW1lfS4ke2tleX1gXSA9IHNlcnZpY2VEYXRhW2tleV1cbiAgICAgICk7XG5cbiAgICAgIC8vIFhYWCBNYXliZSB3ZSBzaG91bGQgcmUtdXNlIHRoZSBzZWxlY3RvciBhYm92ZSBhbmQgbm90aWNlIGlmIHRoZSB1cGRhdGVcbiAgICAgIC8vICAgICB0b3VjaGVzIG5vdGhpbmc/XG4gICAgICBzZXRBdHRycyA9IHsgLi4uc2V0QXR0cnMsIC4uLm9wdHMgfTtcbiAgICAgIHRoaXMudXNlcnMudXBkYXRlKHVzZXIuX2lkLCB7XG4gICAgICAgICRzZXQ6IHNldEF0dHJzXG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogc2VydmljZU5hbWUsXG4gICAgICAgIHVzZXJJZDogdXNlci5faWRcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENyZWF0ZSBhIG5ldyB1c2VyIHdpdGggdGhlIHNlcnZpY2UgZGF0YS5cbiAgICAgIHVzZXIgPSB7c2VydmljZXM6IHt9fTtcbiAgICAgIHVzZXIuc2VydmljZXNbc2VydmljZU5hbWVdID0gc2VydmljZURhdGE7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBzZXJ2aWNlTmFtZSxcbiAgICAgICAgdXNlcklkOiB0aGlzLmluc2VydFVzZXJEb2Mob3B0cywgdXNlcilcbiAgICAgIH07XG4gICAgfVxuICB9O1xuXG4gIC8vIFJlbW92ZXMgZGVmYXVsdCByYXRlIGxpbWl0aW5nIHJ1bGVcbiAgcmVtb3ZlRGVmYXVsdFJhdGVMaW1pdCgpIHtcbiAgICBjb25zdCByZXNwID0gRERQUmF0ZUxpbWl0ZXIucmVtb3ZlUnVsZSh0aGlzLmRlZmF1bHRSYXRlTGltaXRlclJ1bGVJZCk7XG4gICAgdGhpcy5kZWZhdWx0UmF0ZUxpbWl0ZXJSdWxlSWQgPSBudWxsO1xuICAgIHJldHVybiByZXNwO1xuICB9O1xuXG4gIC8vIEFkZCBhIGRlZmF1bHQgcnVsZSBvZiBsaW1pdGluZyBsb2dpbnMsIGNyZWF0aW5nIG5ldyB1c2VycyBhbmQgcGFzc3dvcmQgcmVzZXRcbiAgLy8gdG8gNSB0aW1lcyBldmVyeSAxMCBzZWNvbmRzIHBlciBjb25uZWN0aW9uLlxuICBhZGREZWZhdWx0UmF0ZUxpbWl0KCkge1xuICAgIGlmICghdGhpcy5kZWZhdWx0UmF0ZUxpbWl0ZXJSdWxlSWQpIHtcbiAgICAgIHRoaXMuZGVmYXVsdFJhdGVMaW1pdGVyUnVsZUlkID0gRERQUmF0ZUxpbWl0ZXIuYWRkUnVsZSh7XG4gICAgICAgIHVzZXJJZDogbnVsbCxcbiAgICAgICAgY2xpZW50QWRkcmVzczogbnVsbCxcbiAgICAgICAgdHlwZTogJ21ldGhvZCcsXG4gICAgICAgIG5hbWU6IG5hbWUgPT4gWydsb2dpbicsICdjcmVhdGVVc2VyJywgJ3Jlc2V0UGFzc3dvcmQnLCAnZm9yZ290UGFzc3dvcmQnXVxuICAgICAgICAgIC5pbmNsdWRlcyhuYW1lKSxcbiAgICAgICAgY29ubmVjdGlvbklkOiAoY29ubmVjdGlvbklkKSA9PiB0cnVlLFxuICAgICAgfSwgNSwgMTAwMDApO1xuICAgIH1cbiAgfTtcblxufVxuXG4vLyBHaXZlIGVhY2ggbG9naW4gaG9vayBjYWxsYmFjayBhIGZyZXNoIGNsb25lZCBjb3B5IG9mIHRoZSBhdHRlbXB0XG4vLyBvYmplY3QsIGJ1dCBkb24ndCBjbG9uZSB0aGUgY29ubmVjdGlvbi5cbi8vXG5jb25zdCBjbG9uZUF0dGVtcHRXaXRoQ29ubmVjdGlvbiA9IChjb25uZWN0aW9uLCBhdHRlbXB0KSA9PiB7XG4gIGNvbnN0IGNsb25lZEF0dGVtcHQgPSBFSlNPTi5jbG9uZShhdHRlbXB0KTtcbiAgY2xvbmVkQXR0ZW1wdC5jb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgcmV0dXJuIGNsb25lZEF0dGVtcHQ7XG59O1xuXG5jb25zdCB0cnlMb2dpbk1ldGhvZCA9ICh0eXBlLCBmbikgPT4ge1xuICBsZXQgcmVzdWx0O1xuICB0cnkge1xuICAgIHJlc3VsdCA9IGZuKCk7XG4gIH1cbiAgY2F0Y2ggKGUpIHtcbiAgICByZXN1bHQgPSB7ZXJyb3I6IGV9O1xuICB9XG5cbiAgaWYgKHJlc3VsdCAmJiAhcmVzdWx0LnR5cGUgJiYgdHlwZSlcbiAgICByZXN1bHQudHlwZSA9IHR5cGU7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmNvbnN0IHNldHVwRGVmYXVsdExvZ2luSGFuZGxlcnMgPSBhY2NvdW50cyA9PiB7XG4gIGFjY291bnRzLnJlZ2lzdGVyTG9naW5IYW5kbGVyKFwicmVzdW1lXCIsIGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRSZXN1bWVMb2dpbkhhbmRsZXIuY2FsbCh0aGlzLCBhY2NvdW50cywgb3B0aW9ucyk7XG4gIH0pO1xufTtcblxuLy8gTG9naW4gaGFuZGxlciBmb3IgcmVzdW1lIHRva2Vucy5cbmNvbnN0IGRlZmF1bHRSZXN1bWVMb2dpbkhhbmRsZXIgPSAoYWNjb3VudHMsIG9wdGlvbnMpID0+IHtcbiAgaWYgKCFvcHRpb25zLnJlc3VtZSlcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuXG4gIGNoZWNrKG9wdGlvbnMucmVzdW1lLCBTdHJpbmcpO1xuXG4gIGNvbnN0IGhhc2hlZFRva2VuID0gYWNjb3VudHMuX2hhc2hMb2dpblRva2VuKG9wdGlvbnMucmVzdW1lKTtcblxuICAvLyBGaXJzdCBsb29rIGZvciBqdXN0IHRoZSBuZXctc3R5bGUgaGFzaGVkIGxvZ2luIHRva2VuLCB0byBhdm9pZFxuICAvLyBzZW5kaW5nIHRoZSB1bmhhc2hlZCB0b2tlbiB0byB0aGUgZGF0YWJhc2UgaW4gYSBxdWVyeSBpZiB3ZSBkb24ndFxuICAvLyBuZWVkIHRvLlxuICBsZXQgdXNlciA9IGFjY291bnRzLnVzZXJzLmZpbmRPbmUoXG4gICAge1wic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zLmhhc2hlZFRva2VuXCI6IGhhc2hlZFRva2VufSxcbiAgICB7ZmllbGRzOiB7XCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMuJFwiOiAxfX0pO1xuXG4gIGlmICghIHVzZXIpIHtcbiAgICAvLyBJZiB3ZSBkaWRuJ3QgZmluZCB0aGUgaGFzaGVkIGxvZ2luIHRva2VuLCB0cnkgYWxzbyBsb29raW5nIGZvclxuICAgIC8vIHRoZSBvbGQtc3R5bGUgdW5oYXNoZWQgdG9rZW4uICBCdXQgd2UgbmVlZCB0byBsb29rIGZvciBlaXRoZXJcbiAgICAvLyB0aGUgb2xkLXN0eWxlIHRva2VuIE9SIHRoZSBuZXctc3R5bGUgdG9rZW4sIGJlY2F1c2UgYW5vdGhlclxuICAgIC8vIGNsaWVudCBjb25uZWN0aW9uIGxvZ2dpbmcgaW4gc2ltdWx0YW5lb3VzbHkgbWlnaHQgaGF2ZSBhbHJlYWR5XG4gICAgLy8gY29udmVydGVkIHRoZSB0b2tlbi5cbiAgICB1c2VyID0gYWNjb3VudHMudXNlcnMuZmluZE9uZSh7XG4gICAgICAkb3I6IFtcbiAgICAgICAge1wic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zLmhhc2hlZFRva2VuXCI6IGhhc2hlZFRva2VufSxcbiAgICAgICAge1wic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zLnRva2VuXCI6IG9wdGlvbnMucmVzdW1lfVxuICAgICAgXVxuICAgIH0sXG4gICAgLy8gTm90ZTogQ2Fubm90IHVzZSAuLi5sb2dpblRva2Vucy4kIHBvc2l0aW9uYWwgb3BlcmF0b3Igd2l0aCAkb3IgcXVlcnkuXG4gICAge2ZpZWxkczoge1wic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zXCI6IDF9fSk7XG4gIH1cblxuICBpZiAoISB1c2VyKVxuICAgIHJldHVybiB7XG4gICAgICBlcnJvcjogbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiWW91J3ZlIGJlZW4gbG9nZ2VkIG91dCBieSB0aGUgc2VydmVyLiBQbGVhc2UgbG9nIGluIGFnYWluLlwiKVxuICAgIH07XG5cbiAgLy8gRmluZCB0aGUgdG9rZW4sIHdoaWNoIHdpbGwgZWl0aGVyIGJlIGFuIG9iamVjdCB3aXRoIGZpZWxkc1xuICAvLyB7aGFzaGVkVG9rZW4sIHdoZW59IGZvciBhIGhhc2hlZCB0b2tlbiBvciB7dG9rZW4sIHdoZW59IGZvciBhblxuICAvLyB1bmhhc2hlZCB0b2tlbi5cbiAgbGV0IG9sZFVuaGFzaGVkU3R5bGVUb2tlbjtcbiAgbGV0IHRva2VuID0gdXNlci5zZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMuZmluZCh0b2tlbiA9PlxuICAgIHRva2VuLmhhc2hlZFRva2VuID09PSBoYXNoZWRUb2tlblxuICApO1xuICBpZiAodG9rZW4pIHtcbiAgICBvbGRVbmhhc2hlZFN0eWxlVG9rZW4gPSBmYWxzZTtcbiAgfSBlbHNlIHtcbiAgICB0b2tlbiA9IHVzZXIuc2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zLmZpbmQodG9rZW4gPT5cbiAgICAgIHRva2VuLnRva2VuID09PSBvcHRpb25zLnJlc3VtZVxuICAgICk7XG4gICAgb2xkVW5oYXNoZWRTdHlsZVRva2VuID0gdHJ1ZTtcbiAgfVxuXG4gIGNvbnN0IHRva2VuRXhwaXJlcyA9IGFjY291bnRzLl90b2tlbkV4cGlyYXRpb24odG9rZW4ud2hlbik7XG4gIGlmIChuZXcgRGF0ZSgpID49IHRva2VuRXhwaXJlcylcbiAgICByZXR1cm4ge1xuICAgICAgdXNlcklkOiB1c2VyLl9pZCxcbiAgICAgIGVycm9yOiBuZXcgTWV0ZW9yLkVycm9yKDQwMywgXCJZb3VyIHNlc3Npb24gaGFzIGV4cGlyZWQuIFBsZWFzZSBsb2cgaW4gYWdhaW4uXCIpXG4gICAgfTtcblxuICAvLyBVcGRhdGUgdG8gYSBoYXNoZWQgdG9rZW4gd2hlbiBhbiB1bmhhc2hlZCB0b2tlbiBpcyBlbmNvdW50ZXJlZC5cbiAgaWYgKG9sZFVuaGFzaGVkU3R5bGVUb2tlbikge1xuICAgIC8vIE9ubHkgYWRkIHRoZSBuZXcgaGFzaGVkIHRva2VuIGlmIHRoZSBvbGQgdW5oYXNoZWQgdG9rZW4gc3RpbGxcbiAgICAvLyBleGlzdHMgKHRoaXMgYXZvaWRzIHJlc3VycmVjdGluZyB0aGUgdG9rZW4gaWYgaXQgd2FzIGRlbGV0ZWRcbiAgICAvLyBhZnRlciB3ZSByZWFkIGl0KS4gIFVzaW5nICRhZGRUb1NldCBhdm9pZHMgZ2V0dGluZyBhbiBpbmRleFxuICAgIC8vIGVycm9yIGlmIGFub3RoZXIgY2xpZW50IGxvZ2dpbmcgaW4gc2ltdWx0YW5lb3VzbHkgaGFzIGFscmVhZHlcbiAgICAvLyBpbnNlcnRlZCB0aGUgbmV3IGhhc2hlZCB0b2tlbi5cbiAgICBhY2NvdW50cy51c2Vycy51cGRhdGUoXG4gICAgICB7XG4gICAgICAgIF9pZDogdXNlci5faWQsXG4gICAgICAgIFwic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zLnRva2VuXCI6IG9wdGlvbnMucmVzdW1lXG4gICAgICB9LFxuICAgICAgeyRhZGRUb1NldDoge1xuICAgICAgICAgIFwic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zXCI6IHtcbiAgICAgICAgICAgIFwiaGFzaGVkVG9rZW5cIjogaGFzaGVkVG9rZW4sXG4gICAgICAgICAgICBcIndoZW5cIjogdG9rZW4ud2hlblxuICAgICAgICAgIH1cbiAgICAgICAgfX1cbiAgICApO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBvbGQgdG9rZW4gKmFmdGVyKiBhZGRpbmcgdGhlIG5ldywgc2luY2Ugb3RoZXJ3aXNlXG4gICAgLy8gYW5vdGhlciBjbGllbnQgdHJ5aW5nIHRvIGxvZ2luIGJldHdlZW4gb3VyIHJlbW92aW5nIHRoZSBvbGQgYW5kXG4gICAgLy8gYWRkaW5nIHRoZSBuZXcgd291bGRuJ3QgZmluZCBhIHRva2VuIHRvIGxvZ2luIHdpdGguXG4gICAgYWNjb3VudHMudXNlcnMudXBkYXRlKHVzZXIuX2lkLCB7XG4gICAgICAkcHVsbDoge1xuICAgICAgICBcInNlcnZpY2VzLnJlc3VtZS5sb2dpblRva2Vuc1wiOiB7IFwidG9rZW5cIjogb3B0aW9ucy5yZXN1bWUgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB1c2VySWQ6IHVzZXIuX2lkLFxuICAgIHN0YW1wZWRMb2dpblRva2VuOiB7XG4gICAgICB0b2tlbjogb3B0aW9ucy5yZXN1bWUsXG4gICAgICB3aGVuOiB0b2tlbi53aGVuXG4gICAgfVxuICB9O1xufTtcblxuY29uc3QgZXhwaXJlUGFzc3dvcmRUb2tlbiA9IChcbiAgYWNjb3VudHMsXG4gIG9sZGVzdFZhbGlkRGF0ZSxcbiAgdG9rZW5GaWx0ZXIsXG4gIHVzZXJJZFxuKSA9PiB7XG4gIC8vIGJvb2xlYW4gdmFsdWUgdXNlZCB0byBkZXRlcm1pbmUgaWYgdGhpcyBtZXRob2Qgd2FzIGNhbGxlZCBmcm9tIGVucm9sbCBhY2NvdW50IHdvcmtmbG93XG4gIGxldCBpc0Vucm9sbCA9IGZhbHNlO1xuICBjb25zdCB1c2VyRmlsdGVyID0gdXNlcklkID8ge19pZDogdXNlcklkfSA6IHt9O1xuICAvLyBjaGVjayBpZiB0aGlzIG1ldGhvZCB3YXMgY2FsbGVkIGZyb20gZW5yb2xsIGFjY291bnQgd29ya2Zsb3dcbiAgaWYodG9rZW5GaWx0ZXJbJ3NlcnZpY2VzLnBhc3N3b3JkLmVucm9sbC5yZWFzb24nXSkge1xuICAgIGlzRW5yb2xsID0gdHJ1ZTtcbiAgfVxuICBsZXQgcmVzZXRSYW5nZU9yID0ge1xuICAgICRvcjogW1xuICAgICAgeyBcInNlcnZpY2VzLnBhc3N3b3JkLnJlc2V0LndoZW5cIjogeyAkbHQ6IG9sZGVzdFZhbGlkRGF0ZSB9IH0sXG4gICAgICB7IFwic2VydmljZXMucGFzc3dvcmQucmVzZXQud2hlblwiOiB7ICRsdDogK29sZGVzdFZhbGlkRGF0ZSB9IH1cbiAgICBdXG4gIH07XG4gIGlmKGlzRW5yb2xsKSB7XG4gICAgcmVzZXRSYW5nZU9yID0ge1xuICAgICAgJG9yOiBbXG4gICAgICAgIHsgXCJzZXJ2aWNlcy5wYXNzd29yZC5lbnJvbGwud2hlblwiOiB7ICRsdDogb2xkZXN0VmFsaWREYXRlIH0gfSxcbiAgICAgICAgeyBcInNlcnZpY2VzLnBhc3N3b3JkLmVucm9sbC53aGVuXCI6IHsgJGx0OiArb2xkZXN0VmFsaWREYXRlIH0gfVxuICAgICAgXVxuICAgIH07XG4gIH1cbiAgY29uc3QgZXhwaXJlRmlsdGVyID0geyAkYW5kOiBbdG9rZW5GaWx0ZXIsIHJlc2V0UmFuZ2VPcl0gfTtcbiAgaWYoaXNFbnJvbGwpIHtcbiAgICBhY2NvdW50cy51c2Vycy51cGRhdGUoey4uLnVzZXJGaWx0ZXIsIC4uLmV4cGlyZUZpbHRlcn0sIHtcbiAgICAgICR1bnNldDoge1xuICAgICAgICBcInNlcnZpY2VzLnBhc3N3b3JkLmVucm9sbFwiOiBcIlwiXG4gICAgICB9XG4gICAgfSwgeyBtdWx0aTogdHJ1ZSB9KTtcbiAgfSBlbHNlIHtcbiAgICBhY2NvdW50cy51c2Vycy51cGRhdGUoey4uLnVzZXJGaWx0ZXIsIC4uLmV4cGlyZUZpbHRlcn0sIHtcbiAgICAgICR1bnNldDoge1xuICAgICAgICBcInNlcnZpY2VzLnBhc3N3b3JkLnJlc2V0XCI6IFwiXCJcbiAgICAgIH1cbiAgICB9LCB7IG11bHRpOiB0cnVlIH0pO1xuICB9XG5cbn07XG5cbmNvbnN0IHNldEV4cGlyZVRva2Vuc0ludGVydmFsID0gYWNjb3VudHMgPT4ge1xuICBhY2NvdW50cy5leHBpcmVUb2tlbkludGVydmFsID0gTWV0ZW9yLnNldEludGVydmFsKCgpID0+IHtcbiAgICBhY2NvdW50cy5fZXhwaXJlVG9rZW5zKCk7XG4gICAgYWNjb3VudHMuX2V4cGlyZVBhc3N3b3JkUmVzZXRUb2tlbnMoKTtcbiAgICBhY2NvdW50cy5fZXhwaXJlUGFzc3dvcmRFbnJvbGxUb2tlbnMoKTtcbiAgfSwgRVhQSVJFX1RPS0VOU19JTlRFUlZBTF9NUyk7XG59O1xuXG4vLy9cbi8vLyBPQXV0aCBFbmNyeXB0aW9uIFN1cHBvcnRcbi8vL1xuXG5jb25zdCBPQXV0aEVuY3J5cHRpb24gPVxuICBQYWNrYWdlW1wib2F1dGgtZW5jcnlwdGlvblwiXSAmJlxuICBQYWNrYWdlW1wib2F1dGgtZW5jcnlwdGlvblwiXS5PQXV0aEVuY3J5cHRpb247XG5cbmNvbnN0IHVzaW5nT0F1dGhFbmNyeXB0aW9uID0gKCkgPT4ge1xuICByZXR1cm4gT0F1dGhFbmNyeXB0aW9uICYmIE9BdXRoRW5jcnlwdGlvbi5rZXlJc0xvYWRlZCgpO1xufTtcblxuLy8gT0F1dGggc2VydmljZSBkYXRhIGlzIHRlbXBvcmFyaWx5IHN0b3JlZCBpbiB0aGUgcGVuZGluZyBjcmVkZW50aWFsc1xuLy8gY29sbGVjdGlvbiBkdXJpbmcgdGhlIG9hdXRoIGF1dGhlbnRpY2F0aW9uIHByb2Nlc3MuICBTZW5zaXRpdmUgZGF0YVxuLy8gc3VjaCBhcyBhY2Nlc3MgdG9rZW5zIGFyZSBlbmNyeXB0ZWQgd2l0aG91dCB0aGUgdXNlciBpZCBiZWNhdXNlXG4vLyB3ZSBkb24ndCBrbm93IHRoZSB1c2VyIGlkIHlldC4gIFdlIHJlLWVuY3J5cHQgdGhlc2UgZmllbGRzIHdpdGggdGhlXG4vLyB1c2VyIGlkIGluY2x1ZGVkIHdoZW4gc3RvcmluZyB0aGUgc2VydmljZSBkYXRhIHBlcm1hbmVudGx5IGluXG4vLyB0aGUgdXNlcnMgY29sbGVjdGlvbi5cbi8vXG5jb25zdCBwaW5FbmNyeXB0ZWRGaWVsZHNUb1VzZXIgPSAoc2VydmljZURhdGEsIHVzZXJJZCkgPT4ge1xuICBPYmplY3Qua2V5cyhzZXJ2aWNlRGF0YSkuZm9yRWFjaChrZXkgPT4ge1xuICAgIGxldCB2YWx1ZSA9IHNlcnZpY2VEYXRhW2tleV07XG4gICAgaWYgKE9BdXRoRW5jcnlwdGlvbiAmJiBPQXV0aEVuY3J5cHRpb24uaXNTZWFsZWQodmFsdWUpKVxuICAgICAgdmFsdWUgPSBPQXV0aEVuY3J5cHRpb24uc2VhbChPQXV0aEVuY3J5cHRpb24ub3Blbih2YWx1ZSksIHVzZXJJZCk7XG4gICAgc2VydmljZURhdGFba2V5XSA9IHZhbHVlO1xuICB9KTtcbn07XG5cblxuLy8gRW5jcnlwdCB1bmVuY3J5cHRlZCBsb2dpbiBzZXJ2aWNlIHNlY3JldHMgd2hlbiBvYXV0aC1lbmNyeXB0aW9uIGlzXG4vLyBhZGRlZC5cbi8vXG4vLyBYWFggRm9yIHRoZSBvYXV0aFNlY3JldEtleSB0byBiZSBhdmFpbGFibGUgaGVyZSBhdCBzdGFydHVwLCB0aGVcbi8vIGRldmVsb3BlciBtdXN0IGNhbGwgQWNjb3VudHMuY29uZmlnKHtvYXV0aFNlY3JldEtleTogLi4ufSkgYXQgbG9hZFxuLy8gdGltZSwgaW5zdGVhZCBvZiBpbiBhIE1ldGVvci5zdGFydHVwIGJsb2NrLCBiZWNhdXNlIHRoZSBzdGFydHVwXG4vLyBibG9jayBpbiB0aGUgYXBwIGNvZGUgd2lsbCBydW4gYWZ0ZXIgdGhpcyBhY2NvdW50cy1iYXNlIHN0YXJ0dXBcbi8vIGJsb2NrLiAgUGVyaGFwcyB3ZSBuZWVkIGEgcG9zdC1zdGFydHVwIGNhbGxiYWNrP1xuXG5NZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gIGlmICghIHVzaW5nT0F1dGhFbmNyeXB0aW9uKCkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB7IFNlcnZpY2VDb25maWd1cmF0aW9uIH0gPSBQYWNrYWdlWydzZXJ2aWNlLWNvbmZpZ3VyYXRpb24nXTtcblxuICBTZXJ2aWNlQ29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9ucy5maW5kKHtcbiAgICAkYW5kOiBbe1xuICAgICAgc2VjcmV0OiB7ICRleGlzdHM6IHRydWUgfVxuICAgIH0sIHtcbiAgICAgIFwic2VjcmV0LmFsZ29yaXRobVwiOiB7ICRleGlzdHM6IGZhbHNlIH1cbiAgICB9XVxuICB9KS5mb3JFYWNoKGNvbmZpZyA9PiB7XG4gICAgU2VydmljZUNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnMudXBkYXRlKGNvbmZpZy5faWQsIHtcbiAgICAgICRzZXQ6IHtcbiAgICAgICAgc2VjcmV0OiBPQXV0aEVuY3J5cHRpb24uc2VhbChjb25maWcuc2VjcmV0KVxuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn0pO1xuXG4vLyBYWFggc2VlIGNvbW1lbnQgb24gQWNjb3VudHMuY3JlYXRlVXNlciBpbiBwYXNzd29yZHNfc2VydmVyIGFib3V0IGFkZGluZyBhXG4vLyBzZWNvbmQgXCJzZXJ2ZXIgb3B0aW9uc1wiIGFyZ3VtZW50LlxuY29uc3QgZGVmYXVsdENyZWF0ZVVzZXJIb29rID0gKG9wdGlvbnMsIHVzZXIpID0+IHtcbiAgaWYgKG9wdGlvbnMucHJvZmlsZSlcbiAgICB1c2VyLnByb2ZpbGUgPSBvcHRpb25zLnByb2ZpbGU7XG4gIHJldHVybiB1c2VyO1xufTtcblxuLy8gVmFsaWRhdGUgbmV3IHVzZXIncyBlbWFpbCBvciBHb29nbGUvRmFjZWJvb2svR2l0SHViIGFjY291bnQncyBlbWFpbFxuZnVuY3Rpb24gZGVmYXVsdFZhbGlkYXRlTmV3VXNlckhvb2sodXNlcikge1xuICBjb25zdCBkb21haW4gPSB0aGlzLl9vcHRpb25zLnJlc3RyaWN0Q3JlYXRpb25CeUVtYWlsRG9tYWluO1xuICBpZiAoIWRvbWFpbikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgbGV0IGVtYWlsSXNHb29kID0gZmFsc2U7XG4gIGlmICh1c2VyLmVtYWlscyAmJiB1c2VyLmVtYWlscy5sZW5ndGggPiAwKSB7XG4gICAgZW1haWxJc0dvb2QgPSB1c2VyLmVtYWlscy5yZWR1Y2UoXG4gICAgICAocHJldiwgZW1haWwpID0+IHByZXYgfHwgdGhpcy5fdGVzdEVtYWlsRG9tYWluKGVtYWlsLmFkZHJlc3MpLCBmYWxzZVxuICAgICk7XG4gIH0gZWxzZSBpZiAodXNlci5zZXJ2aWNlcyAmJiBPYmplY3QudmFsdWVzKHVzZXIuc2VydmljZXMpLmxlbmd0aCA+IDApIHtcbiAgICAvLyBGaW5kIGFueSBlbWFpbCBvZiBhbnkgc2VydmljZSBhbmQgY2hlY2sgaXRcbiAgICBlbWFpbElzR29vZCA9IE9iamVjdC52YWx1ZXModXNlci5zZXJ2aWNlcykucmVkdWNlKFxuICAgICAgKHByZXYsIHNlcnZpY2UpID0+IHNlcnZpY2UuZW1haWwgJiYgdGhpcy5fdGVzdEVtYWlsRG9tYWluKHNlcnZpY2UuZW1haWwpLFxuICAgICAgZmFsc2UsXG4gICAgKTtcbiAgfVxuXG4gIGlmIChlbWFpbElzR29vZCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBkb21haW4gPT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIGBAJHtkb21haW59IGVtYWlsIHJlcXVpcmVkYCk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiRW1haWwgZG9lc24ndCBtYXRjaCB0aGUgY3JpdGVyaWEuXCIpO1xuICB9XG59XG5cbmNvbnN0IHNldHVwVXNlcnNDb2xsZWN0aW9uID0gdXNlcnMgPT4ge1xuICAvLy9cbiAgLy8vIFJFU1RSSUNUSU5HIFdSSVRFUyBUTyBVU0VSIE9CSkVDVFNcbiAgLy8vXG4gIHVzZXJzLmFsbG93KHtcbiAgICAvLyBjbGllbnRzIGNhbiBtb2RpZnkgdGhlIHByb2ZpbGUgZmllbGQgb2YgdGhlaXIgb3duIGRvY3VtZW50LCBhbmRcbiAgICAvLyBub3RoaW5nIGVsc2UuXG4gICAgdXBkYXRlOiAodXNlcklkLCB1c2VyLCBmaWVsZHMsIG1vZGlmaWVyKSA9PiB7XG4gICAgICAvLyBtYWtlIHN1cmUgaXQgaXMgb3VyIHJlY29yZFxuICAgICAgaWYgKHVzZXIuX2lkICE9PSB1c2VySWQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyB1c2VyIGNhbiBvbmx5IG1vZGlmeSB0aGUgJ3Byb2ZpbGUnIGZpZWxkLiBzZXRzIHRvIG11bHRpcGxlXG4gICAgICAvLyBzdWIta2V5cyAoZWcgcHJvZmlsZS5mb28gYW5kIHByb2ZpbGUuYmFyKSBhcmUgbWVyZ2VkIGludG8gZW50cnlcbiAgICAgIC8vIGluIHRoZSBmaWVsZHMgbGlzdC5cbiAgICAgIGlmIChmaWVsZHMubGVuZ3RoICE9PSAxIHx8IGZpZWxkc1swXSAhPT0gJ3Byb2ZpbGUnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBmZXRjaDogWydfaWQnXSAvLyB3ZSBvbmx5IGxvb2sgYXQgX2lkLlxuICB9KTtcblxuICAvLy8gREVGQVVMVCBJTkRFWEVTIE9OIFVTRVJTXG4gIHVzZXJzLl9lbnN1cmVJbmRleCgndXNlcm5hbWUnLCB7IHVuaXF1ZTogdHJ1ZSwgc3BhcnNlOiB0cnVlIH0pO1xuICB1c2Vycy5fZW5zdXJlSW5kZXgoJ2VtYWlscy5hZGRyZXNzJywgeyB1bmlxdWU6IHRydWUsIHNwYXJzZTogdHJ1ZSB9KTtcbiAgdXNlcnMuX2Vuc3VyZUluZGV4KCdzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMuaGFzaGVkVG9rZW4nLFxuICAgIHsgdW5pcXVlOiB0cnVlLCBzcGFyc2U6IHRydWUgfSk7XG4gIHVzZXJzLl9lbnN1cmVJbmRleCgnc2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zLnRva2VuJyxcbiAgICB7IHVuaXF1ZTogdHJ1ZSwgc3BhcnNlOiB0cnVlIH0pO1xuICAvLyBGb3IgdGFraW5nIGNhcmUgb2YgbG9nb3V0T3RoZXJDbGllbnRzIGNhbGxzIHRoYXQgY3Jhc2hlZCBiZWZvcmUgdGhlXG4gIC8vIHRva2VucyB3ZXJlIGRlbGV0ZWQuXG4gIHVzZXJzLl9lbnN1cmVJbmRleCgnc2VydmljZXMucmVzdW1lLmhhdmVMb2dpblRva2Vuc1RvRGVsZXRlJyxcbiAgICB7IHNwYXJzZTogdHJ1ZSB9KTtcbiAgLy8gRm9yIGV4cGlyaW5nIGxvZ2luIHRva2Vuc1xuICB1c2Vycy5fZW5zdXJlSW5kZXgoXCJzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMud2hlblwiLCB7IHNwYXJzZTogdHJ1ZSB9KTtcbiAgLy8gRm9yIGV4cGlyaW5nIHBhc3N3b3JkIHRva2Vuc1xuICB1c2Vycy5fZW5zdXJlSW5kZXgoJ3NlcnZpY2VzLnBhc3N3b3JkLnJlc2V0LndoZW4nLCB7IHNwYXJzZTogdHJ1ZSB9KTtcbn07XG4iXX0=
