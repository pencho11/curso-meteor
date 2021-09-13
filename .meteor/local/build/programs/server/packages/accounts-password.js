(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Accounts = Package['accounts-base'].Accounts;
var SHA256 = Package.sha.SHA256;
var EJSON = Package.ejson.EJSON;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var Email = Package.email.Email;
var EmailInternals = Package.email.EmailInternals;
var Random = Package.random.Random;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"accounts-password":{"email_templates.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/accounts-password/email_templates.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
const greet = welcomeMsg => (user, url) => {
  const greeting = user.profile && user.profile.name ? "Hello ".concat(user.profile.name, ",") : "Hello,";
  return "".concat(greeting, "\n\n").concat(welcomeMsg, ", simply click the link below.\n\n").concat(url, "\n\nThanks.\n");
};
/**
 * @summary Options to customize emails sent from the Accounts system.
 * @locus Server
 * @importFromPackage accounts-base
 */


Accounts.emailTemplates = {
  from: "Accounts Example <no-reply@example.com>",
  siteName: Meteor.absoluteUrl().replace(/^https?:\/\//, '').replace(/\/$/, ''),
  resetPassword: {
    subject: () => "How to reset your password on ".concat(Accounts.emailTemplates.siteName),
    text: greet("To reset your password")
  },
  verifyEmail: {
    subject: () => "How to verify email address on ".concat(Accounts.emailTemplates.siteName),
    text: greet("To verify your account email")
  },
  enrollAccount: {
    subject: () => "An account has been created for you on ".concat(Accounts.emailTemplates.siteName),
    text: greet("To start using the service")
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"password_server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/accounts-password/password_server.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
let _objectSpread;

module.link("@babel/runtime/helpers/objectSpread2", {
  default(v) {
    _objectSpread = v;
  }

}, 0);
let bcrypt;
module.link("bcrypt", {
  default(v) {
    bcrypt = v;
  }

}, 0);
const bcryptHash = Meteor.wrapAsync(bcrypt.hash);
const bcryptCompare = Meteor.wrapAsync(bcrypt.compare); // Utility for grabbing user

const getUserById = (id, options) => Meteor.users.findOne(id, Accounts._addDefaultFieldSelector(options)); // User records have a 'services.password.bcrypt' field on them to hold
// their hashed passwords.
//
// When the client sends a password to the server, it can either be a
// string (the plaintext password) or an object with keys 'digest' and
// 'algorithm' (must be "sha-256" for now). The Meteor client always sends
// password objects { digest: *, algorithm: "sha-256" }, but DDP clients
// that don't have access to SHA can just send plaintext passwords as
// strings.
//
// When the server receives a plaintext password as a string, it always
// hashes it with SHA256 before passing it into bcrypt. When the server
// receives a password as an object, it asserts that the algorithm is
// "sha-256" and then passes the digest to bcrypt.


Accounts._bcryptRounds = () => Accounts._options.bcryptRounds || 10; // Given a 'password' from the client, extract the string that we should
// bcrypt. 'password' can be one of:
//  - String (the plaintext password)
//  - Object with 'digest' and 'algorithm' keys. 'algorithm' must be "sha-256".
//


const getPasswordString = password => {
  if (typeof password === "string") {
    password = SHA256(password);
  } else {
    // 'password' is an object
    if (password.algorithm !== "sha-256") {
      throw new Error("Invalid password hash algorithm. " + "Only 'sha-256' is allowed.");
    }

    password = password.digest;
  }

  return password;
}; // Use bcrypt to hash the password for storage in the database.
// `password` can be a string (in which case it will be run through
// SHA256 before bcrypt) or an object with properties `digest` and
// `algorithm` (in which case we bcrypt `password.digest`).
//


const hashPassword = password => {
  password = getPasswordString(password);
  return bcryptHash(password, Accounts._bcryptRounds());
}; // Extract the number of rounds used in the specified bcrypt hash.


const getRoundsFromBcryptHash = hash => {
  let rounds;

  if (hash) {
    const hashSegments = hash.split('$');

    if (hashSegments.length > 2) {
      rounds = parseInt(hashSegments[2], 10);
    }
  }

  return rounds;
}; // Check whether the provided password matches the bcrypt'ed password in
// the database user record. `password` can be a string (in which case
// it will be run through SHA256 before bcrypt) or an object with
// properties `digest` and `algorithm` (in which case we bcrypt
// `password.digest`).
//
// The user parameter needs at least user._id and user.services


Accounts._checkPasswordUserFields = {
  _id: 1,
  services: 1
}; //

Accounts._checkPassword = (user, password) => {
  const result = {
    userId: user._id
  };
  const formattedPassword = getPasswordString(password);
  const hash = user.services.password.bcrypt;
  const hashRounds = getRoundsFromBcryptHash(hash);

  if (!bcryptCompare(formattedPassword, hash)) {
    result.error = handleError("Incorrect password", false);
  } else if (hash && Accounts._bcryptRounds() != hashRounds) {
    // The password checks out, but the user's bcrypt hash needs to be updated.
    Meteor.defer(() => {
      Meteor.users.update({
        _id: user._id
      }, {
        $set: {
          'services.password.bcrypt': bcryptHash(formattedPassword, Accounts._bcryptRounds())
        }
      });
    });
  }

  return result;
};

const checkPassword = Accounts._checkPassword; ///
/// ERROR HANDLER
///

const handleError = function (msg) {
  let throwError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  const error = new Meteor.Error(403, Accounts._options.ambiguousErrorMessages ? "Something went wrong. Please check your credentials." : msg);

  if (throwError) {
    throw error;
  }

  return error;
}; ///
/// LOGIN
///


Accounts._findUserByQuery = (query, options) => {
  let user = null;

  if (query.id) {
    // default field selector is added within getUserById()
    user = getUserById(query.id, options);
  } else {
    options = Accounts._addDefaultFieldSelector(options);
    let fieldName;
    let fieldValue;

    if (query.username) {
      fieldName = 'username';
      fieldValue = query.username;
    } else if (query.email) {
      fieldName = 'emails.address';
      fieldValue = query.email;
    } else {
      throw new Error("shouldn't happen (validation missed something)");
    }

    let selector = {};
    selector[fieldName] = fieldValue;
    user = Meteor.users.findOne(selector, options); // If user is not found, try a case insensitive lookup

    if (!user) {
      selector = selectorForFastCaseInsensitiveLookup(fieldName, fieldValue);
      const candidateUsers = Meteor.users.find(selector, options).fetch(); // No match if multiple candidates are found

      if (candidateUsers.length === 1) {
        user = candidateUsers[0];
      }
    }
  }

  return user;
};
/**
 * @summary Finds the user with the specified username.
 * First tries to match username case sensitively; if that fails, it
 * tries case insensitively; but if more than one user matches the case
 * insensitive search, it returns null.
 * @locus Server
 * @param {String} username The username to look for
 * @param {Object} [options]
 * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
 * @returns {Object} A user if found, else null
 * @importFromPackage accounts-base
 */


Accounts.findUserByUsername = (username, options) => Accounts._findUserByQuery({
  username
}, options);
/**
 * @summary Finds the user with the specified email.
 * First tries to match email case sensitively; if that fails, it
 * tries case insensitively; but if more than one user matches the case
 * insensitive search, it returns null.
 * @locus Server
 * @param {String} email The email address to look for
 * @param {Object} [options]
 * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
 * @returns {Object} A user if found, else null
 * @importFromPackage accounts-base
 */


Accounts.findUserByEmail = (email, options) => Accounts._findUserByQuery({
  email
}, options); // Generates a MongoDB selector that can be used to perform a fast case
// insensitive lookup for the given fieldName and string. Since MongoDB does
// not support case insensitive indexes, and case insensitive regex queries
// are slow, we construct a set of prefix selectors for all permutations of
// the first 4 characters ourselves. We first attempt to matching against
// these, and because 'prefix expression' regex queries do use indexes (see
// http://docs.mongodb.org/v2.6/reference/operator/query/regex/#index-use),
// this has been found to greatly improve performance (from 1200ms to 5ms in a
// test with 1.000.000 users).


const selectorForFastCaseInsensitiveLookup = (fieldName, string) => {
  // Performance seems to improve up to 4 prefix characters
  const prefix = string.substring(0, Math.min(string.length, 4));
  const orClause = generateCasePermutationsForString(prefix).map(prefixPermutation => {
    const selector = {};
    selector[fieldName] = new RegExp("^".concat(Meteor._escapeRegExp(prefixPermutation)));
    return selector;
  });
  const caseInsensitiveClause = {};
  caseInsensitiveClause[fieldName] = new RegExp("^".concat(Meteor._escapeRegExp(string), "$"), 'i');
  return {
    $and: [{
      $or: orClause
    }, caseInsensitiveClause]
  };
}; // Generates permutations of all case variations of a given string.


const generateCasePermutationsForString = string => {
  let permutations = [''];

  for (let i = 0; i < string.length; i++) {
    const ch = string.charAt(i);
    permutations = [].concat(...permutations.map(prefix => {
      const lowerCaseChar = ch.toLowerCase();
      const upperCaseChar = ch.toUpperCase(); // Don't add unnecessary permutations when ch is not a letter

      if (lowerCaseChar === upperCaseChar) {
        return [prefix + ch];
      } else {
        return [prefix + lowerCaseChar, prefix + upperCaseChar];
      }
    }));
  }

  return permutations;
};

const checkForCaseInsensitiveDuplicates = (fieldName, displayName, fieldValue, ownUserId) => {
  // Some tests need the ability to add users with the same case insensitive
  // value, hence the _skipCaseInsensitiveChecksForTest check
  const skipCheck = Object.prototype.hasOwnProperty.call(Accounts._skipCaseInsensitiveChecksForTest, fieldValue);

  if (fieldValue && !skipCheck) {
    const matchedUsers = Meteor.users.find(selectorForFastCaseInsensitiveLookup(fieldName, fieldValue), {
      fields: {
        _id: 1
      },
      // we only need a maximum of 2 users for the logic below to work
      limit: 2
    }).fetch();

    if (matchedUsers.length > 0 && ( // If we don't have a userId yet, any match we find is a duplicate
    !ownUserId || // Otherwise, check to see if there are multiple matches or a match
    // that is not us
    matchedUsers.length > 1 || matchedUsers[0]._id !== ownUserId)) {
      handleError("".concat(displayName, " already exists."));
    }
  }
}; // XXX maybe this belongs in the check package


const NonEmptyString = Match.Where(x => {
  check(x, String);
  return x.length > 0;
});
const userQueryValidator = Match.Where(user => {
  check(user, {
    id: Match.Optional(NonEmptyString),
    username: Match.Optional(NonEmptyString),
    email: Match.Optional(NonEmptyString)
  });
  if (Object.keys(user).length !== 1) throw new Match.Error("User property must have exactly one field");
  return true;
});
const passwordValidator = Match.OneOf(Match.Where(str => {
  var _Meteor$settings, _Meteor$settings$pack, _Meteor$settings$pack2;

  return Match.test(str, String) && str.length <= ((_Meteor$settings = Meteor.settings) === null || _Meteor$settings === void 0 ? void 0 : (_Meteor$settings$pack = _Meteor$settings.packages) === null || _Meteor$settings$pack === void 0 ? void 0 : (_Meteor$settings$pack2 = _Meteor$settings$pack.accounts) === null || _Meteor$settings$pack2 === void 0 ? void 0 : _Meteor$settings$pack2.passwordMaxLength) || 256;
}), {
  digest: Match.Where(str => Match.test(str, String) && str.length === 64),
  algorithm: Match.OneOf('sha-256')
}); // Handler to login with a password.
//
// The Meteor client sets options.password to an object with keys
// 'digest' (set to SHA256(password)) and 'algorithm' ("sha-256").
//
// For other DDP clients which don't have access to SHA, the handler
// also accepts the plaintext password in options.password as a string.
//
// (It might be nice if servers could turn the plaintext password
// option off. Or maybe it should be opt-in, not opt-out?
// Accounts.config option?)
//
// Note that neither password option is secure without SSL.
//

Accounts.registerLoginHandler("password", options => {
  if (!options.password) return undefined; // don't handle

  check(options, {
    user: userQueryValidator,
    password: passwordValidator
  });

  const user = Accounts._findUserByQuery(options.user, {
    fields: _objectSpread({
      services: 1
    }, Accounts._checkPasswordUserFields)
  });

  if (!user) {
    handleError("User not found");
  }

  if (!user.services || !user.services.password || !user.services.password.bcrypt) {
    handleError("User has no password set");
  }

  return checkPassword(user, options.password);
}); ///
/// CHANGING
///

/**
 * @summary Change a user's username. Use this instead of updating the
 * database directly. The operation will fail if there is an existing user
 * with a username only differing in case.
 * @locus Server
 * @param {String} userId The ID of the user to update.
 * @param {String} newUsername A new username for the user.
 * @importFromPackage accounts-base
 */

Accounts.setUsername = (userId, newUsername) => {
  check(userId, NonEmptyString);
  check(newUsername, NonEmptyString);
  const user = getUserById(userId, {
    fields: {
      username: 1
    }
  });

  if (!user) {
    handleError("User not found");
  }

  const oldUsername = user.username; // Perform a case insensitive check for duplicates before update

  checkForCaseInsensitiveDuplicates('username', 'Username', newUsername, user._id);
  Meteor.users.update({
    _id: user._id
  }, {
    $set: {
      username: newUsername
    }
  }); // Perform another check after update, in case a matching user has been
  // inserted in the meantime

  try {
    checkForCaseInsensitiveDuplicates('username', 'Username', newUsername, user._id);
  } catch (ex) {
    // Undo update if the check fails
    Meteor.users.update({
      _id: user._id
    }, {
      $set: {
        username: oldUsername
      }
    });
    throw ex;
  }
}; // Let the user change their own password if they know the old
// password. `oldPassword` and `newPassword` should be objects with keys
// `digest` and `algorithm` (representing the SHA256 of the password).


Meteor.methods({
  changePassword: function (oldPassword, newPassword) {
    check(oldPassword, passwordValidator);
    check(newPassword, passwordValidator);

    if (!this.userId) {
      throw new Meteor.Error(401, "Must be logged in");
    }

    const user = getUserById(this.userId, {
      fields: _objectSpread({
        services: 1
      }, Accounts._checkPasswordUserFields)
    });

    if (!user) {
      handleError("User not found");
    }

    if (!user.services || !user.services.password || !user.services.password.bcrypt) {
      handleError("User has no password set");
    }

    const result = checkPassword(user, oldPassword);

    if (result.error) {
      throw result.error;
    }

    const hashed = hashPassword(newPassword); // It would be better if this removed ALL existing tokens and replaced
    // the token for the current connection with a new one, but that would
    // be tricky, so we'll settle for just replacing all tokens other than
    // the one for the current connection.

    const currentToken = Accounts._getLoginToken(this.connection.id);

    Meteor.users.update({
      _id: this.userId
    }, {
      $set: {
        'services.password.bcrypt': hashed
      },
      $pull: {
        'services.resume.loginTokens': {
          hashedToken: {
            $ne: currentToken
          }
        }
      },
      $unset: {
        'services.password.reset': 1
      }
    });
    return {
      passwordChanged: true
    };
  }
}); // Force change the users password.

/**
 * @summary Forcibly change the password for a user.
 * @locus Server
 * @param {String} userId The id of the user to update.
 * @param {String} newPassword A new password for the user.
 * @param {Object} [options]
 * @param {Object} options.logout Logout all current connections with this userId (default: true)
 * @importFromPackage accounts-base
 */

Accounts.setPassword = (userId, newPlaintextPassword, options) => {
  check(userId, String);
  check(newPlaintextPassword, Match.Where(str => {
    var _Meteor$settings2, _Meteor$settings2$pac, _Meteor$settings2$pac2;

    return Match.test(str, String) && str.length <= ((_Meteor$settings2 = Meteor.settings) === null || _Meteor$settings2 === void 0 ? void 0 : (_Meteor$settings2$pac = _Meteor$settings2.packages) === null || _Meteor$settings2$pac === void 0 ? void 0 : (_Meteor$settings2$pac2 = _Meteor$settings2$pac.accounts) === null || _Meteor$settings2$pac2 === void 0 ? void 0 : _Meteor$settings2$pac2.passwordMaxLength) || 256;
  }));
  check(options, Match.Maybe({
    logout: Boolean
  }));
  options = _objectSpread({
    logout: true
  }, options);
  const user = getUserById(userId, {
    fields: {
      _id: 1
    }
  });

  if (!user) {
    throw new Meteor.Error(403, "User not found");
  }

  const update = {
    $unset: {
      'services.password.reset': 1
    },
    $set: {
      'services.password.bcrypt': hashPassword(newPlaintextPassword)
    }
  };

  if (options.logout) {
    update.$unset['services.resume.loginTokens'] = 1;
  }

  Meteor.users.update({
    _id: user._id
  }, update);
}; ///
/// RESETTING VIA EMAIL
///
// Utility for plucking addresses from emails


const pluckAddresses = function () {
  let emails = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return emails.map(email => email.address);
}; // Method called by a user to request a password reset email. This is
// the start of the reset process.


Meteor.methods({
  forgotPassword: options => {
    check(options, {
      email: String
    });
    const user = Accounts.findUserByEmail(options.email, {
      fields: {
        emails: 1
      }
    });

    if (!user) {
      handleError("User not found");
    }

    const emails = pluckAddresses(user.emails);
    const caseSensitiveEmail = emails.find(email => email.toLowerCase() === options.email.toLowerCase());
    Accounts.sendResetPasswordEmail(user._id, caseSensitiveEmail);
  }
});
/**
 * @summary Generates a reset token and saves it into the database.
 * @locus Server
 * @param {String} userId The id of the user to generate the reset token for.
 * @param {String} email Which address of the user to generate the reset token for. This address must be in the user's `emails` list. If `null`, defaults to the first email in the list.
 * @param {String} reason `resetPassword` or `enrollAccount`.
 * @param {Object} [extraTokenData] Optional additional data to be added into the token record.
 * @returns {Object} Object with {email, user, token} values.
 * @importFromPackage accounts-base
 */

Accounts.generateResetToken = (userId, email, reason, extraTokenData) => {
  // Make sure the user exists, and email is one of their addresses.
  // Don't limit the fields in the user object since the user is returned
  // by the function and some other fields might be used elsewhere.
  const user = getUserById(userId);

  if (!user) {
    handleError("Can't find user");
  } // pick the first email if we weren't passed an email.


  if (!email && user.emails && user.emails[0]) {
    email = user.emails[0].address;
  } // make sure we have a valid email


  if (!email || !pluckAddresses(user.emails).includes(email)) {
    handleError("No such email for user.");
  }

  const token = Random.secret();
  const tokenRecord = {
    token,
    email,
    when: new Date()
  };

  if (reason === 'resetPassword') {
    tokenRecord.reason = 'reset';
  } else if (reason === 'enrollAccount') {
    tokenRecord.reason = 'enroll';
  } else if (reason) {
    // fallback so that this function can be used for unknown reasons as well
    tokenRecord.reason = reason;
  }

  if (extraTokenData) {
    Object.assign(tokenRecord, extraTokenData);
  } // if this method is called from the enroll account work-flow then
  // store the token record in 'services.password.enroll' db field
  // else store the token record in in 'services.password.reset' db field


  if (reason === 'enrollAccount') {
    Meteor.users.update({
      _id: user._id
    }, {
      $set: {
        'services.password.enroll': tokenRecord
      }
    });
  } else {
    Meteor.users.update({
      _id: user._id
    }, {
      $set: {
        'services.password.reset': tokenRecord
      }
    });
  } // before passing to template, update user object with new token


  Meteor._ensure(user, 'services', 'password').reset = tokenRecord;
  Meteor._ensure(user, 'services', 'password').enroll = tokenRecord;
  return {
    email,
    user,
    token
  };
};
/**
 * @summary Generates an e-mail verification token and saves it into the database.
 * @locus Server
 * @param {String} userId The id of the user to generate the  e-mail verification token for.
 * @param {String} email Which address of the user to generate the e-mail verification token for. This address must be in the user's `emails` list. If `null`, defaults to the first unverified email in the list.
 * @param {Object} [extraTokenData] Optional additional data to be added into the token record.
 * @returns {Object} Object with {email, user, token} values.
 * @importFromPackage accounts-base
 */


Accounts.generateVerificationToken = (userId, email, extraTokenData) => {
  // Make sure the user exists, and email is one of their addresses.
  // Don't limit the fields in the user object since the user is returned
  // by the function and some other fields might be used elsewhere.
  const user = getUserById(userId);

  if (!user) {
    handleError("Can't find user");
  } // pick the first unverified email if we weren't passed an email.


  if (!email) {
    const emailRecord = (user.emails || []).find(e => !e.verified);
    email = (emailRecord || {}).address;

    if (!email) {
      handleError("That user has no unverified email addresses.");
    }
  } // make sure we have a valid email


  if (!email || !pluckAddresses(user.emails).includes(email)) {
    handleError("No such email for user.");
  }

  const token = Random.secret();
  const tokenRecord = {
    token,
    // TODO: This should probably be renamed to "email" to match reset token record.
    address: email,
    when: new Date()
  };

  if (extraTokenData) {
    Object.assign(tokenRecord, extraTokenData);
  }

  Meteor.users.update({
    _id: user._id
  }, {
    $push: {
      'services.email.verificationTokens': tokenRecord
    }
  }); // before passing to template, update user object with new token

  Meteor._ensure(user, 'services', 'email');

  if (!user.services.email.verificationTokens) {
    user.services.email.verificationTokens = [];
  }

  user.services.email.verificationTokens.push(tokenRecord);
  return {
    email,
    user,
    token
  };
};
/**
 * @summary Creates options for email sending for reset password and enroll account emails.
 * You can use this function when customizing a reset password or enroll account email sending.
 * @locus Server
 * @param {Object} email Which address of the user's to send the email to.
 * @param {Object} user The user object to generate options for.
 * @param {String} url URL to which user is directed to confirm the email.
 * @param {String} reason `resetPassword` or `enrollAccount`.
 * @returns {Object} Options which can be passed to `Email.send`.
 * @importFromPackage accounts-base
 */


Accounts.generateOptionsForEmail = (email, user, url, reason) => {
  const options = {
    to: email,
    from: Accounts.emailTemplates[reason].from ? Accounts.emailTemplates[reason].from(user) : Accounts.emailTemplates.from,
    subject: Accounts.emailTemplates[reason].subject(user)
  };

  if (typeof Accounts.emailTemplates[reason].text === 'function') {
    options.text = Accounts.emailTemplates[reason].text(user, url);
  }

  if (typeof Accounts.emailTemplates[reason].html === 'function') {
    options.html = Accounts.emailTemplates[reason].html(user, url);
  }

  if (typeof Accounts.emailTemplates.headers === 'object') {
    options.headers = Accounts.emailTemplates.headers;
  }

  return options;
}; // send the user an email with a link that when opened allows the user
// to set a new password, without the old password.

/**
 * @summary Send an email with a link the user can use to reset their password.
 * @locus Server
 * @param {String} userId The id of the user to send email to.
 * @param {String} [email] Optional. Which address of the user's to send the email to. This address must be in the user's `emails` list. Defaults to the first email in the list.
 * @param {Object} [extraTokenData] Optional additional data to be added into the token record.
 * @param {Object} [extraParams] Optional additional params to be added to the reset url.
 * @returns {Object} Object with {email, user, token, url, options} values.
 * @importFromPackage accounts-base
 */


Accounts.sendResetPasswordEmail = (userId, email, extraTokenData, extraParams) => {
  const {
    email: realEmail,
    user,
    token
  } = Accounts.generateResetToken(userId, email, 'resetPassword', extraTokenData);
  const url = Accounts.urls.resetPassword(token, extraParams);
  const options = Accounts.generateOptionsForEmail(realEmail, user, url, 'resetPassword');
  Email.send(options);

  if (Meteor.isDevelopment) {
    console.log("\nReset password URL: ".concat(url));
  }

  return {
    email: realEmail,
    user,
    token,
    url,
    options
  };
}; // send the user an email informing them that their account was created, with
// a link that when opened both marks their email as verified and forces them
// to choose their password. The email must be one of the addresses in the
// user's emails field, or undefined to pick the first email automatically.
//
// This is not called automatically. It must be called manually if you
// want to use enrollment emails.

/**
 * @summary Send an email with a link the user can use to set their initial password.
 * @locus Server
 * @param {String} userId The id of the user to send email to.
 * @param {String} [email] Optional. Which address of the user's to send the email to. This address must be in the user's `emails` list. Defaults to the first email in the list.
 * @param {Object} [extraTokenData] Optional additional data to be added into the token record.
 * @param {Object} [extraParams] Optional additional params to be added to the enrollment url.
 * @returns {Object} Object with {email, user, token, url, options} values.
 * @importFromPackage accounts-base
 */


Accounts.sendEnrollmentEmail = (userId, email, extraTokenData, extraParams) => {
  const {
    email: realEmail,
    user,
    token
  } = Accounts.generateResetToken(userId, email, 'enrollAccount', extraTokenData);
  const url = Accounts.urls.enrollAccount(token, extraParams);
  const options = Accounts.generateOptionsForEmail(realEmail, user, url, 'enrollAccount');
  Email.send(options);

  if (Meteor.isDevelopment) {
    console.log("\nEnrollment email URL: ".concat(url));
  }

  return {
    email: realEmail,
    user,
    token,
    url,
    options
  };
}; // Take token from sendResetPasswordEmail or sendEnrollmentEmail, change
// the users password, and log them in.


Meteor.methods({
  resetPassword: function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    const token = args[0];
    const newPassword = args[1];
    return Accounts._loginMethod(this, "resetPassword", args, "password", () => {
      check(token, String);
      check(newPassword, passwordValidator);
      let user = Meteor.users.findOne({
        "services.password.reset.token": token
      }, {
        fields: {
          services: 1,
          emails: 1
        }
      });
      let isEnroll = false; // if token is in services.password.reset db field implies
      // this method is was not called from enroll account workflow
      // else this method is called from enroll account workflow

      if (!user) {
        user = Meteor.users.findOne({
          "services.password.enroll.token": token
        }, {
          fields: {
            services: 1,
            emails: 1
          }
        });
        isEnroll = true;
      }

      if (!user) {
        throw new Meteor.Error(403, "Token expired");
      }

      let tokenRecord = {};

      if (isEnroll) {
        tokenRecord = user.services.password.enroll;
      } else {
        tokenRecord = user.services.password.reset;
      }

      const {
        when,
        reason,
        email
      } = tokenRecord;

      let tokenLifetimeMs = Accounts._getPasswordResetTokenLifetimeMs();

      if (reason === "enroll") {
        tokenLifetimeMs = Accounts._getPasswordEnrollTokenLifetimeMs();
      }

      const currentTimeMs = Date.now();
      if (currentTimeMs - when > tokenLifetimeMs) throw new Meteor.Error(403, "Token expired");
      if (!pluckAddresses(user.emails).includes(email)) return {
        userId: user._id,
        error: new Meteor.Error(403, "Token has invalid email address")
      };
      const hashed = hashPassword(newPassword); // NOTE: We're about to invalidate tokens on the user, who we might be
      // logged in as. Make sure to avoid logging ourselves out if this
      // happens. But also make sure not to leave the connection in a state
      // of having a bad token set if things fail.

      const oldToken = Accounts._getLoginToken(this.connection.id);

      Accounts._setLoginToken(user._id, this.connection, null);

      const resetToOldToken = () => Accounts._setLoginToken(user._id, this.connection, oldToken);

      try {
        // Update the user record by:
        // - Changing the password to the new one
        // - Forgetting about the reset token or enroll token that was just used
        // - Verifying their email, since they got the password reset via email.
        let affectedRecords = {}; // if reason is enroll then check services.password.enroll.token field for affected records

        if (reason === 'enroll') {
          affectedRecords = Meteor.users.update({
            _id: user._id,
            'emails.address': email,
            'services.password.enroll.token': token
          }, {
            $set: {
              'services.password.bcrypt': hashed,
              'emails.$.verified': true
            },
            $unset: {
              'services.password.enroll': 1
            }
          });
        } else {
          affectedRecords = Meteor.users.update({
            _id: user._id,
            'emails.address': email,
            'services.password.reset.token': token
          }, {
            $set: {
              'services.password.bcrypt': hashed,
              'emails.$.verified': true
            },
            $unset: {
              'services.password.reset': 1
            }
          });
        }

        if (affectedRecords !== 1) return {
          userId: user._id,
          error: new Meteor.Error(403, "Invalid email")
        };
      } catch (err) {
        resetToOldToken();
        throw err;
      } // Replace all valid login tokens with new ones (changing
      // password should invalidate existing sessions).


      Accounts._clearAllLoginTokens(user._id);

      return {
        userId: user._id
      };
    });
  }
}); ///
/// EMAIL VERIFICATION
///
// send the user an email with a link that when opened marks that
// address as verified

/**
 * @summary Send an email with a link the user can use verify their email address.
 * @locus Server
 * @param {String} userId The id of the user to send email to.
 * @param {String} [email] Optional. Which address of the user's to send the email to. This address must be in the user's `emails` list. Defaults to the first unverified email in the list.
 * @param {Object} [extraTokenData] Optional additional data to be added into the token record.
 * @param {Object} [extraParams] Optional additional params to be added to the verification url.
 *
 * @returns {Object} Object with {email, user, token, url, options} values.
 * @importFromPackage accounts-base
 */

Accounts.sendVerificationEmail = (userId, email, extraTokenData, extraParams) => {
  // XXX Also generate a link using which someone can delete this
  // account if they own said address but weren't those who created
  // this account.
  const {
    email: realEmail,
    user,
    token
  } = Accounts.generateVerificationToken(userId, email, extraTokenData);
  const url = Accounts.urls.verifyEmail(token, extraParams);
  const options = Accounts.generateOptionsForEmail(realEmail, user, url, 'verifyEmail');
  Email.send(options);

  if (Meteor.isDevelopment) {
    console.log("\nVerification email URL: ".concat(url));
  }

  return {
    email: realEmail,
    user,
    token,
    url,
    options
  };
}; // Take token from sendVerificationEmail, mark the email as verified,
// and log them in.


Meteor.methods({
  verifyEmail: function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    const token = args[0];
    return Accounts._loginMethod(this, "verifyEmail", args, "password", () => {
      check(token, String);
      const user = Meteor.users.findOne({
        'services.email.verificationTokens.token': token
      }, {
        fields: {
          services: 1,
          emails: 1
        }
      });
      if (!user) throw new Meteor.Error(403, "Verify email link expired");
      const tokenRecord = user.services.email.verificationTokens.find(t => t.token == token);
      if (!tokenRecord) return {
        userId: user._id,
        error: new Meteor.Error(403, "Verify email link expired")
      };
      const emailsRecord = user.emails.find(e => e.address == tokenRecord.address);
      if (!emailsRecord) return {
        userId: user._id,
        error: new Meteor.Error(403, "Verify email link is for unknown address")
      }; // By including the address in the query, we can use 'emails.$' in the
      // modifier to get a reference to the specific object in the emails
      // array. See
      // http://www.mongodb.org/display/DOCS/Updating/#Updating-The%24positionaloperator)
      // http://www.mongodb.org/display/DOCS/Updating#Updating-%24pull

      Meteor.users.update({
        _id: user._id,
        'emails.address': tokenRecord.address
      }, {
        $set: {
          'emails.$.verified': true
        },
        $pull: {
          'services.email.verificationTokens': {
            address: tokenRecord.address
          }
        }
      });
      return {
        userId: user._id
      };
    });
  }
});
/**
 * @summary Add an email address for a user. Use this instead of directly
 * updating the database. The operation will fail if there is a different user
 * with an email only differing in case. If the specified user has an existing
 * email only differing in case however, we replace it.
 * @locus Server
 * @param {String} userId The ID of the user to update.
 * @param {String} newEmail A new email address for the user.
 * @param {Boolean} [verified] Optional - whether the new email address should
 * be marked as verified. Defaults to false.
 * @importFromPackage accounts-base
 */

Accounts.addEmail = (userId, newEmail, verified) => {
  check(userId, NonEmptyString);
  check(newEmail, NonEmptyString);
  check(verified, Match.Optional(Boolean));

  if (verified === void 0) {
    verified = false;
  }

  const user = getUserById(userId, {
    fields: {
      emails: 1
    }
  });
  if (!user) throw new Meteor.Error(403, "User not found"); // Allow users to change their own email to a version with a different case
  // We don't have to call checkForCaseInsensitiveDuplicates to do a case
  // insensitive check across all emails in the database here because: (1) if
  // there is no case-insensitive duplicate between this user and other users,
  // then we are OK and (2) if this would create a conflict with other users
  // then there would already be a case-insensitive duplicate and we can't fix
  // that in this code anyway.

  const caseInsensitiveRegExp = new RegExp("^".concat(Meteor._escapeRegExp(newEmail), "$"), 'i');
  const didUpdateOwnEmail = (user.emails || []).reduce((prev, email) => {
    if (caseInsensitiveRegExp.test(email.address)) {
      Meteor.users.update({
        _id: user._id,
        'emails.address': email.address
      }, {
        $set: {
          'emails.$.address': newEmail,
          'emails.$.verified': verified
        }
      });
      return true;
    } else {
      return prev;
    }
  }, false); // In the other updates below, we have to do another call to
  // checkForCaseInsensitiveDuplicates to make sure that no conflicting values
  // were added to the database in the meantime. We don't have to do this for
  // the case where the user is updating their email address to one that is the
  // same as before, but only different because of capitalization. Read the
  // big comment above to understand why.

  if (didUpdateOwnEmail) {
    return;
  } // Perform a case insensitive check for duplicates before update


  checkForCaseInsensitiveDuplicates('emails.address', 'Email', newEmail, user._id);
  Meteor.users.update({
    _id: user._id
  }, {
    $addToSet: {
      emails: {
        address: newEmail,
        verified: verified
      }
    }
  }); // Perform another check after update, in case a matching user has been
  // inserted in the meantime

  try {
    checkForCaseInsensitiveDuplicates('emails.address', 'Email', newEmail, user._id);
  } catch (ex) {
    // Undo update if the check fails
    Meteor.users.update({
      _id: user._id
    }, {
      $pull: {
        emails: {
          address: newEmail
        }
      }
    });
    throw ex;
  }
};
/**
 * @summary Remove an email address for a user. Use this instead of updating
 * the database directly.
 * @locus Server
 * @param {String} userId The ID of the user to update.
 * @param {String} email The email address to remove.
 * @importFromPackage accounts-base
 */


Accounts.removeEmail = (userId, email) => {
  check(userId, NonEmptyString);
  check(email, NonEmptyString);
  const user = getUserById(userId, {
    fields: {
      _id: 1
    }
  });
  if (!user) throw new Meteor.Error(403, "User not found");
  Meteor.users.update({
    _id: user._id
  }, {
    $pull: {
      emails: {
        address: email
      }
    }
  });
}; ///
/// CREATING USERS
///
// Shared createUser function called from the createUser method, both
// if originates in client or server code. Calls user provided hooks,
// does the actual user insertion.
//
// returns the user id


const createUser = options => {
  // Unknown keys allowed, because a onCreateUserHook can take arbitrary
  // options.
  check(options, Match.ObjectIncluding({
    username: Match.Optional(String),
    email: Match.Optional(String),
    password: Match.Optional(passwordValidator)
  }));
  const {
    username,
    email,
    password
  } = options;
  if (!username && !email) throw new Meteor.Error(400, "Need to set a username or email");
  const user = {
    services: {}
  };

  if (password) {
    const hashed = hashPassword(password);
    user.services.password = {
      bcrypt: hashed
    };
  }

  if (username) user.username = username;
  if (email) user.emails = [{
    address: email,
    verified: false
  }]; // Perform a case insensitive check before insert

  checkForCaseInsensitiveDuplicates('username', 'Username', username);
  checkForCaseInsensitiveDuplicates('emails.address', 'Email', email);
  const userId = Accounts.insertUserDoc(options, user); // Perform another check after insert, in case a matching user has been
  // inserted in the meantime

  try {
    checkForCaseInsensitiveDuplicates('username', 'Username', username, userId);
    checkForCaseInsensitiveDuplicates('emails.address', 'Email', email, userId);
  } catch (ex) {
    // Remove inserted user if the check fails
    Meteor.users.remove(userId);
    throw ex;
  }

  return userId;
}; // method for create user. Requests come from the client.


Meteor.methods({
  createUser: function () {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    const options = args[0];
    return Accounts._loginMethod(this, "createUser", args, "password", () => {
      // createUser() above does more checking.
      check(options, Object);
      if (Accounts._options.forbidClientAccountCreation) return {
        error: new Meteor.Error(403, "Signups forbidden")
      };
      const userId = Accounts.createUserVerifyingEmail(options); // client gets logged in as the new user afterwards.

      return {
        userId: userId
      };
    });
  }
});
/**
 * @summary Creates an user and sends an email if `options.email` is informed.
 * Then if the `sendVerificationEmail` option from the `Accounts` package is
 * enabled, you'll send a verification email if `options.password` is informed,
 * otherwise you'll send an enrollment email.
 * @locus Server
 * @param {Object} options The options object to be passed down when creating
 * the user
 * @param {String} options.username A unique name for this user.
 * @param {String} options.email The user's email address.
 * @param {String} options.password The user's password. This is __not__ sent in plain text over the wire.
 * @param {Object} options.profile The user's profile, typically including the `name` field.
 * @importFromPackage accounts-base
 * */

Accounts.createUserVerifyingEmail = options => {
  options = _objectSpread({}, options); // Create user. result contains id and token.

  const userId = createUser(options); // safety belt. createUser is supposed to throw on error. send 500 error
  // instead of sending a verification email with empty userid.

  if (!userId) throw new Error("createUser failed to insert new user"); // If `Accounts._options.sendVerificationEmail` is set, register
  // a token to verify the user's primary email, and send it to
  // that address.

  if (options.email && Accounts._options.sendVerificationEmail) {
    if (options.password) {
      Accounts.sendVerificationEmail(userId, options.email);
    } else {
      Accounts.sendEnrollmentEmail(userId, options.email);
    }
  }

  return userId;
}; // Create user directly on the server.
//
// Unlike the client version, this does not log you in as this user
// after creation.
//
// returns userId or throws an error if it can't create
//
// XXX add another argument ("server options") that gets sent to onCreateUser,
// which is always empty when called from the createUser method? eg, "admin:
// true", which we want to prevent the client from setting, but which a custom
// method calling Accounts.createUser could set?
//


Accounts.createUser = (options, callback) => {
  options = _objectSpread({}, options); // XXX allow an optional callback?

  if (callback) {
    throw new Error("Accounts.createUser with callback not supported on the server yet.");
  }

  return createUser(options);
}; ///
/// PASSWORD-SPECIFIC INDEXES ON USERS
///


Meteor.users._ensureIndex('services.email.verificationTokens.token', {
  unique: true,
  sparse: true
});

Meteor.users._ensureIndex('services.password.reset.token', {
  unique: true,
  sparse: true
});

Meteor.users._ensureIndex('services.password.enroll.token', {
  unique: true,
  sparse: true
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"bcrypt":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/accounts-password/node_modules/bcrypt/package.json                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "bcrypt",
  "version": "5.0.1",
  "main": "./bcrypt"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"bcrypt.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/accounts-password/node_modules/bcrypt/bcrypt.js                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/accounts-password/email_templates.js");
require("/node_modules/meteor/accounts-password/password_server.js");

/* Exports */
Package._define("accounts-password");

})();

//# sourceURL=meteor://💻app/packages/accounts-password.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtcGFzc3dvcmQvZW1haWxfdGVtcGxhdGVzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hY2NvdW50cy1wYXNzd29yZC9wYXNzd29yZF9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiZ3JlZXQiLCJ3ZWxjb21lTXNnIiwidXNlciIsInVybCIsImdyZWV0aW5nIiwicHJvZmlsZSIsIm5hbWUiLCJBY2NvdW50cyIsImVtYWlsVGVtcGxhdGVzIiwiZnJvbSIsInNpdGVOYW1lIiwiTWV0ZW9yIiwiYWJzb2x1dGVVcmwiLCJyZXBsYWNlIiwicmVzZXRQYXNzd29yZCIsInN1YmplY3QiLCJ0ZXh0IiwidmVyaWZ5RW1haWwiLCJlbnJvbGxBY2NvdW50IiwiX29iamVjdFNwcmVhZCIsIm1vZHVsZSIsImxpbmsiLCJkZWZhdWx0IiwidiIsImJjcnlwdCIsImJjcnlwdEhhc2giLCJ3cmFwQXN5bmMiLCJoYXNoIiwiYmNyeXB0Q29tcGFyZSIsImNvbXBhcmUiLCJnZXRVc2VyQnlJZCIsImlkIiwib3B0aW9ucyIsInVzZXJzIiwiZmluZE9uZSIsIl9hZGREZWZhdWx0RmllbGRTZWxlY3RvciIsIl9iY3J5cHRSb3VuZHMiLCJfb3B0aW9ucyIsImJjcnlwdFJvdW5kcyIsImdldFBhc3N3b3JkU3RyaW5nIiwicGFzc3dvcmQiLCJTSEEyNTYiLCJhbGdvcml0aG0iLCJFcnJvciIsImRpZ2VzdCIsImhhc2hQYXNzd29yZCIsImdldFJvdW5kc0Zyb21CY3J5cHRIYXNoIiwicm91bmRzIiwiaGFzaFNlZ21lbnRzIiwic3BsaXQiLCJsZW5ndGgiLCJwYXJzZUludCIsIl9jaGVja1Bhc3N3b3JkVXNlckZpZWxkcyIsIl9pZCIsInNlcnZpY2VzIiwiX2NoZWNrUGFzc3dvcmQiLCJyZXN1bHQiLCJ1c2VySWQiLCJmb3JtYXR0ZWRQYXNzd29yZCIsImhhc2hSb3VuZHMiLCJlcnJvciIsImhhbmRsZUVycm9yIiwiZGVmZXIiLCJ1cGRhdGUiLCIkc2V0IiwiY2hlY2tQYXNzd29yZCIsIm1zZyIsInRocm93RXJyb3IiLCJhbWJpZ3VvdXNFcnJvck1lc3NhZ2VzIiwiX2ZpbmRVc2VyQnlRdWVyeSIsInF1ZXJ5IiwiZmllbGROYW1lIiwiZmllbGRWYWx1ZSIsInVzZXJuYW1lIiwiZW1haWwiLCJzZWxlY3RvciIsInNlbGVjdG9yRm9yRmFzdENhc2VJbnNlbnNpdGl2ZUxvb2t1cCIsImNhbmRpZGF0ZVVzZXJzIiwiZmluZCIsImZldGNoIiwiZmluZFVzZXJCeVVzZXJuYW1lIiwiZmluZFVzZXJCeUVtYWlsIiwic3RyaW5nIiwicHJlZml4Iiwic3Vic3RyaW5nIiwiTWF0aCIsIm1pbiIsIm9yQ2xhdXNlIiwiZ2VuZXJhdGVDYXNlUGVybXV0YXRpb25zRm9yU3RyaW5nIiwibWFwIiwicHJlZml4UGVybXV0YXRpb24iLCJSZWdFeHAiLCJfZXNjYXBlUmVnRXhwIiwiY2FzZUluc2Vuc2l0aXZlQ2xhdXNlIiwiJGFuZCIsIiRvciIsInBlcm11dGF0aW9ucyIsImkiLCJjaCIsImNoYXJBdCIsImNvbmNhdCIsImxvd2VyQ2FzZUNoYXIiLCJ0b0xvd2VyQ2FzZSIsInVwcGVyQ2FzZUNoYXIiLCJ0b1VwcGVyQ2FzZSIsImNoZWNrRm9yQ2FzZUluc2Vuc2l0aXZlRHVwbGljYXRlcyIsImRpc3BsYXlOYW1lIiwib3duVXNlcklkIiwic2tpcENoZWNrIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiX3NraXBDYXNlSW5zZW5zaXRpdmVDaGVja3NGb3JUZXN0IiwibWF0Y2hlZFVzZXJzIiwiZmllbGRzIiwibGltaXQiLCJOb25FbXB0eVN0cmluZyIsIk1hdGNoIiwiV2hlcmUiLCJ4IiwiY2hlY2siLCJTdHJpbmciLCJ1c2VyUXVlcnlWYWxpZGF0b3IiLCJPcHRpb25hbCIsImtleXMiLCJwYXNzd29yZFZhbGlkYXRvciIsIk9uZU9mIiwic3RyIiwidGVzdCIsInNldHRpbmdzIiwicGFja2FnZXMiLCJhY2NvdW50cyIsInBhc3N3b3JkTWF4TGVuZ3RoIiwicmVnaXN0ZXJMb2dpbkhhbmRsZXIiLCJ1bmRlZmluZWQiLCJzZXRVc2VybmFtZSIsIm5ld1VzZXJuYW1lIiwib2xkVXNlcm5hbWUiLCJleCIsIm1ldGhvZHMiLCJjaGFuZ2VQYXNzd29yZCIsIm9sZFBhc3N3b3JkIiwibmV3UGFzc3dvcmQiLCJoYXNoZWQiLCJjdXJyZW50VG9rZW4iLCJfZ2V0TG9naW5Ub2tlbiIsImNvbm5lY3Rpb24iLCIkcHVsbCIsImhhc2hlZFRva2VuIiwiJG5lIiwiJHVuc2V0IiwicGFzc3dvcmRDaGFuZ2VkIiwic2V0UGFzc3dvcmQiLCJuZXdQbGFpbnRleHRQYXNzd29yZCIsIk1heWJlIiwibG9nb3V0IiwiQm9vbGVhbiIsInBsdWNrQWRkcmVzc2VzIiwiZW1haWxzIiwiYWRkcmVzcyIsImZvcmdvdFBhc3N3b3JkIiwiY2FzZVNlbnNpdGl2ZUVtYWlsIiwic2VuZFJlc2V0UGFzc3dvcmRFbWFpbCIsImdlbmVyYXRlUmVzZXRUb2tlbiIsInJlYXNvbiIsImV4dHJhVG9rZW5EYXRhIiwiaW5jbHVkZXMiLCJ0b2tlbiIsIlJhbmRvbSIsInNlY3JldCIsInRva2VuUmVjb3JkIiwid2hlbiIsIkRhdGUiLCJhc3NpZ24iLCJfZW5zdXJlIiwicmVzZXQiLCJlbnJvbGwiLCJnZW5lcmF0ZVZlcmlmaWNhdGlvblRva2VuIiwiZW1haWxSZWNvcmQiLCJlIiwidmVyaWZpZWQiLCIkcHVzaCIsInZlcmlmaWNhdGlvblRva2VucyIsInB1c2giLCJnZW5lcmF0ZU9wdGlvbnNGb3JFbWFpbCIsInRvIiwiaHRtbCIsImhlYWRlcnMiLCJleHRyYVBhcmFtcyIsInJlYWxFbWFpbCIsInVybHMiLCJFbWFpbCIsInNlbmQiLCJpc0RldmVsb3BtZW50IiwiY29uc29sZSIsImxvZyIsInNlbmRFbnJvbGxtZW50RW1haWwiLCJhcmdzIiwiX2xvZ2luTWV0aG9kIiwiaXNFbnJvbGwiLCJ0b2tlbkxpZmV0aW1lTXMiLCJfZ2V0UGFzc3dvcmRSZXNldFRva2VuTGlmZXRpbWVNcyIsIl9nZXRQYXNzd29yZEVucm9sbFRva2VuTGlmZXRpbWVNcyIsImN1cnJlbnRUaW1lTXMiLCJub3ciLCJvbGRUb2tlbiIsIl9zZXRMb2dpblRva2VuIiwicmVzZXRUb09sZFRva2VuIiwiYWZmZWN0ZWRSZWNvcmRzIiwiZXJyIiwiX2NsZWFyQWxsTG9naW5Ub2tlbnMiLCJzZW5kVmVyaWZpY2F0aW9uRW1haWwiLCJ0IiwiZW1haWxzUmVjb3JkIiwiYWRkRW1haWwiLCJuZXdFbWFpbCIsImNhc2VJbnNlbnNpdGl2ZVJlZ0V4cCIsImRpZFVwZGF0ZU93bkVtYWlsIiwicmVkdWNlIiwicHJldiIsIiRhZGRUb1NldCIsInJlbW92ZUVtYWlsIiwiY3JlYXRlVXNlciIsIk9iamVjdEluY2x1ZGluZyIsImluc2VydFVzZXJEb2MiLCJyZW1vdmUiLCJmb3JiaWRDbGllbnRBY2NvdW50Q3JlYXRpb24iLCJjcmVhdGVVc2VyVmVyaWZ5aW5nRW1haWwiLCJjYWxsYmFjayIsIl9lbnN1cmVJbmRleCIsInVuaXF1ZSIsInNwYXJzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE1BQU1BLEtBQUssR0FBR0MsVUFBVSxJQUFJLENBQUNDLElBQUQsRUFBT0MsR0FBUCxLQUFlO0FBQ3JDLFFBQU1DLFFBQVEsR0FBSUYsSUFBSSxDQUFDRyxPQUFMLElBQWdCSCxJQUFJLENBQUNHLE9BQUwsQ0FBYUMsSUFBOUIsbUJBQ0RKLElBQUksQ0FBQ0csT0FBTCxDQUFhQyxJQURaLFNBQ3VCLFFBRHhDO0FBRUEsbUJBQVVGLFFBQVYsaUJBRUpILFVBRkksK0NBSUpFLEdBSkk7QUFRTCxDQVhEO0FBYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0FJLFFBQVEsQ0FBQ0MsY0FBVCxHQUEwQjtBQUN4QkMsTUFBSSxFQUFFLHlDQURrQjtBQUV4QkMsVUFBUSxFQUFFQyxNQUFNLENBQUNDLFdBQVAsR0FBcUJDLE9BQXJCLENBQTZCLGNBQTdCLEVBQTZDLEVBQTdDLEVBQWlEQSxPQUFq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LFFBQUosRUFBYztBQUNaLFVBQU0sSUFBSTFMLEtBQUosQ0FBVSxvRUFBVixDQUFOO0FBQ0Q7O0FBRUQsU0FBT29MLFVBQVUsQ0FBQy9MLE9BQUQsQ0FBakI7QUFDRCxDQVRELEMsQ0FXQTtBQUNBO0FBQ0E7OztBQUNBckIsTUFBTSxDQUFDc0IsS0FBUCxDQUFhcU0sWUFBYixDQUEwQix5Q0FBMUIsRUFDMEI7QUFBRUMsUUFBTSxFQUFFLElBQVY7QUFBZ0JDLFFBQU0sRUFBRTtBQUF4QixDQUQxQjs7QUFFQTdOLE1BQU0sQ0FBQ3NCLEtBQVAsQ0FBYXFNLFlBQWIsQ0FBMEIsK0JBQTFCLEVBQzBCO0FBQUVDLFFBQU0sRUFBRSxJQUFWO0FBQWdCQyxRQUFNLEVBQUU7QUFBeEIsQ0FEMUI7O0FBRUE3TixNQUFNLENBQUNzQixLQUFQLENBQWFxTSxZQUFiLENBQTBCLGdDQUExQixFQUMwQjtBQUFFQyxRQUFNLEVBQUUsSUFBVjtBQUFnQkMsUUFBTSxFQUFFO0FBQXhCLENBRDFCLEUiLCJmaWxlIjoiL3BhY2thZ2VzL2FjY291bnRzLXBhc3N3b3JkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZ3JlZXQgPSB3ZWxjb21lTXNnID0+ICh1c2VyLCB1cmwpID0+IHtcbiAgICAgIGNvbnN0IGdyZWV0aW5nID0gKHVzZXIucHJvZmlsZSAmJiB1c2VyLnByb2ZpbGUubmFtZSkgP1xuICAgICAgICAgICAgKGBIZWxsbyAke3VzZXIucHJvZmlsZS5uYW1lfSxgKSA6IFwiSGVsbG8sXCI7XG4gICAgICByZXR1cm4gYCR7Z3JlZXRpbmd9XG5cbiR7d2VsY29tZU1zZ30sIHNpbXBseSBjbGljayB0aGUgbGluayBiZWxvdy5cblxuJHt1cmx9XG5cblRoYW5rcy5cbmA7XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IE9wdGlvbnMgdG8gY3VzdG9taXplIGVtYWlscyBzZW50IGZyb20gdGhlIEFjY291bnRzIHN5c3RlbS5cbiAqIEBsb2N1cyBTZXJ2ZXJcbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBhY2NvdW50cy1iYXNlXG4gKi9cbkFjY291bnRzLmVtYWlsVGVtcGxhdGVzID0ge1xuICBmcm9tOiBcIkFjY291bnRzIEV4YW1wbGUgPG5vLXJlcGx5QGV4YW1wbGUuY29tPlwiLFxuICBzaXRlTmFtZTogTWV0ZW9yLmFic29sdXRlVXJsKCkucmVwbGFjZSgvXmh0dHBzPzpcXC9cXC8vLCAnJykucmVwbGFjZSgvXFwvJC8sICcnKSxcblxuICByZXNldFBhc3N3b3JkOiB7XG4gICAgc3ViamVjdDogKCkgPT4gYEhvdyB0byByZXNldCB5b3VyIHBhc3N3b3JkIG9uICR7QWNjb3VudHMuZW1haWxUZW1wbGF0ZXMuc2l0ZU5hbWV9YCxcbiAgICB0ZXh0OiBncmVldChcIlRvIHJlc2V0IHlvdXIgcGFzc3dvcmRcIiksXG4gIH0sXG4gIHZlcmlmeUVtYWlsOiB7XG4gICAgc3ViamVjdDogKCkgPT4gYEhvdyB0byB2ZXJpZnkgZW1haWwgYWRkcmVzcyBvbiAke0FjY291bnRzLmVtYWlsVGVtcGxhdGVzLnNpdGVOYW1lfWAsXG4gICAgdGV4dDogZ3JlZXQoXCJUbyB2ZXJpZnkgeW91ciBhY2NvdW50IGVtYWlsXCIpLFxuICB9LFxuICBlbnJvbGxBY2NvdW50OiB7XG4gICAgc3ViamVjdDogKCkgPT4gYEFuIGFjY291bnQgaGFzIGJlZW4gY3JlYXRlZCBmb3IgeW91IG9uICR7QWNjb3VudHMuZW1haWxUZW1wbGF0ZXMuc2l0ZU5hbWV9YCxcbiAgICB0ZXh0OiBncmVldChcIlRvIHN0YXJ0IHVzaW5nIHRoZSBzZXJ2aWNlXCIpLFxuICB9LFxufTtcbiIsImltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0J1xuXG5jb25zdCBiY3J5cHRIYXNoID0gTWV0ZW9yLndyYXBBc3luYyhiY3J5cHQuaGFzaCk7XG5jb25zdCBiY3J5cHRDb21wYXJlID0gTWV0ZW9yLndyYXBBc3luYyhiY3J5cHQuY29tcGFyZSk7XG5cbi8vIFV0aWxpdHkgZm9yIGdyYWJiaW5nIHVzZXJcbmNvbnN0IGdldFVzZXJCeUlkID0gKGlkLCBvcHRpb25zKSA9PiBNZXRlb3IudXNlcnMuZmluZE9uZShpZCwgQWNjb3VudHMuX2FkZERlZmF1bHRGaWVsZFNlbGVjdG9yKG9wdGlvbnMpKTtcblxuLy8gVXNlciByZWNvcmRzIGhhdmUgYSAnc2VydmljZXMucGFzc3dvcmQuYmNyeXB0JyBmaWVsZCBvbiB0aGVtIHRvIGhvbGRcbi8vIHRoZWlyIGhhc2hlZCBwYXNzd29yZHMuXG4vL1xuLy8gV2hlbiB0aGUgY2xpZW50IHNlbmRzIGEgcGFzc3dvcmQgdG8gdGhlIHNlcnZlciwgaXQgY2FuIGVpdGhlciBiZSBhXG4vLyBzdHJpbmcgKHRoZSBwbGFpbnRleHQgcGFzc3dvcmQpIG9yIGFuIG9iamVjdCB3aXRoIGtleXMgJ2RpZ2VzdCcgYW5kXG4vLyAnYWxnb3JpdGhtJyAobXVzdCBiZSBcInNoYS0yNTZcIiBmb3Igbm93KS4gVGhlIE1ldGVvciBjbGllbnQgYWx3YXlzIHNlbmRzXG4vLyBwYXNzd29yZCBvYmplY3RzIHsgZGlnZXN0OiAqLCBhbGdvcml0aG06IFwic2hhLTI1NlwiIH0sIGJ1dCBERFAgY2xpZW50c1xuLy8gdGhhdCBkb24ndCBoYXZlIGFjY2VzcyB0byBTSEEgY2FuIGp1c3Qgc2VuZCBwbGFpbnRleHQgcGFzc3dvcmRzIGFzXG4vLyBzdHJpbmdzLlxuLy9cbi8vIFdoZW4gdGhlIHNlcnZlciByZWNlaXZlcyBhIHBsYWludGV4dCBwYXNzd29yZCBhcyBhIHN0cmluZywgaXQgYWx3YXlzXG4vLyBoYXNoZXMgaXQgd2l0aCBTSEEyNTYgYmVmb3JlIHBhc3NpbmcgaXQgaW50byBiY3J5cHQuIFdoZW4gdGhlIHNlcnZlclxuLy8gcmVjZWl2ZXMgYSBwYXNzd29yZCBhcyBhbiBvYmplY3QsIGl0IGFzc2VydHMgdGhhdCB0aGUgYWxnb3JpdGhtIGlzXG4vLyBcInNoYS0yNTZcIiBhbmQgdGhlbiBwYXNzZXMgdGhlIGRpZ2VzdCB0byBiY3J5cHQuXG5cblxuQWNjb3VudHMuX2JjcnlwdFJvdW5kcyA9ICgpID0+IEFjY291bnRzLl9vcHRpb25zLmJjcnlwdFJvdW5kcyB8fCAxMDtcblxuLy8gR2l2ZW4gYSAncGFzc3dvcmQnIGZyb20gdGhlIGNsaWVudCwgZXh0cmFjdCB0aGUgc3RyaW5nIHRoYXQgd2Ugc2hvdWxkXG4vLyBiY3J5cHQuICdwYXNzd29yZCcgY2FuIGJlIG9uZSBvZjpcbi8vICAtIFN0cmluZyAodGhlIHBsYWludGV4dCBwYXNzd29yZClcbi8vICAtIE9iamVjdCB3aXRoICdkaWdlc3QnIGFuZCAnYWxnb3JpdGhtJyBrZXlzLiAnYWxnb3JpdGhtJyBtdXN0IGJlIFwic2hhLTI1NlwiLlxuLy9cbmNvbnN0IGdldFBhc3N3b3JkU3RyaW5nID0gcGFzc3dvcmQgPT4ge1xuICBpZiAodHlwZW9mIHBhc3N3b3JkID09PSBcInN0cmluZ1wiKSB7XG4gICAgcGFzc3dvcmQgPSBTSEEyNTYocGFzc3dvcmQpO1xuICB9IGVsc2UgeyAvLyAncGFzc3dvcmQnIGlzIGFuIG9iamVjdFxuICAgIGlmIChwYXNzd29yZC5hbGdvcml0aG0gIT09IFwic2hhLTI1NlwiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHBhc3N3b3JkIGhhc2ggYWxnb3JpdGhtLiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgXCJPbmx5ICdzaGEtMjU2JyBpcyBhbGxvd2VkLlwiKTtcbiAgICB9XG4gICAgcGFzc3dvcmQgPSBwYXNzd29yZC5kaWdlc3Q7XG4gIH1cbiAgcmV0dXJuIHBhc3N3b3JkO1xufTtcblxuLy8gVXNlIGJjcnlwdCB0byBoYXNoIHRoZSBwYXNzd29yZCBmb3Igc3RvcmFnZSBpbiB0aGUgZGF0YWJhc2UuXG4vLyBgcGFzc3dvcmRgIGNhbiBiZSBhIHN0cmluZyAoaW4gd2hpY2ggY2FzZSBpdCB3aWxsIGJlIHJ1biB0aHJvdWdoXG4vLyBTSEEyNTYgYmVmb3JlIGJjcnlwdCkgb3IgYW4gb2JqZWN0IHdpdGggcHJvcGVydGllcyBgZGlnZXN0YCBhbmRcbi8vIGBhbGdvcml0aG1gIChpbiB3aGljaCBjYXNlIHdlIGJjcnlwdCBgcGFzc3dvcmQuZGlnZXN0YCkuXG4vL1xuY29uc3QgaGFzaFBhc3N3b3JkID0gcGFzc3dvcmQgPT4ge1xuICBwYXNzd29yZCA9IGdldFBhc3N3b3JkU3RyaW5nKHBhc3N3b3JkKTtcbiAgcmV0dXJuIGJjcnlwdEhhc2gocGFzc3dvcmQsIEFjY291bnRzLl9iY3J5cHRSb3VuZHMoKSk7XG59O1xuXG4vLyBFeHRyYWN0IHRoZSBudW1iZXIgb2Ygcm91bmRzIHVzZWQgaW4gdGhlIHNwZWNpZmllZCBiY3J5cHQgaGFzaC5cbmNvbnN0IGdldFJvdW5kc0Zyb21CY3J5cHRIYXNoID0gaGFzaCA9PiB7XG4gIGxldCByb3VuZHM7XG4gIGlmIChoYXNoKSB7XG4gICAgY29uc3QgaGFzaFNlZ21lbnRzID0gaGFzaC5zcGxpdCgnJCcpO1xuICAgIGlmIChoYXNoU2VnbWVudHMubGVuZ3RoID4gMikge1xuICAgICAgcm91bmRzID0gcGFyc2VJbnQoaGFzaFNlZ21lbnRzWzJdLCAxMCk7XG4gICAgfVxuICB9XG4gIHJldHVybiByb3VuZHM7XG59O1xuXG4vLyBDaGVjayB3aGV0aGVyIHRoZSBwcm92aWRlZCBwYXNzd29yZCBtYXRjaGVzIHRoZSBiY3J5cHQnZWQgcGFzc3dvcmQgaW5cbi8vIHRoZSBkYXRhYmFzZSB1c2VyIHJlY29yZC4gYHBhc3N3b3JkYCBjYW4gYmUgYSBzdHJpbmcgKGluIHdoaWNoIGNhc2Vcbi8vIGl0IHdpbGwgYmUgcnVuIHRocm91Z2ggU0hBMjU2IGJlZm9yZSBiY3J5cHQpIG9yIGFuIG9iamVjdCB3aXRoXG4vLyBwcm9wZXJ0aWVzIGBkaWdlc3RgIGFuZCBgYWxnb3JpdGhtYCAoaW4gd2hpY2ggY2FzZSB3ZSBiY3J5cHRcbi8vIGBwYXNzd29yZC5kaWdlc3RgKS5cbi8vXG4vLyBUaGUgdXNlciBwYXJhbWV0ZXIgbmVlZHMgYXQgbGVhc3QgdXNlci5faWQgYW5kIHVzZXIuc2VydmljZXNcbkFjY291bnRzLl9jaGVja1Bhc3N3b3JkVXNlckZpZWxkcyA9IHtfaWQ6IDEsIHNlcnZpY2VzOiAxfTtcbi8vXG5BY2NvdW50cy5fY2hlY2tQYXNzd29yZCA9ICh1c2VyLCBwYXNzd29yZCkgPT4ge1xuICBjb25zdCByZXN1bHQgPSB7XG4gICAgdXNlcklkOiB1c2VyLl9pZFxuICB9O1xuXG4gIGNvbnN0IGZvcm1hdHRlZFBhc3N3b3JkID0gZ2V0UGFzc3dvcmRTdHJpbmcocGFzc3dvcmQpO1xuICBjb25zdCBoYXNoID0gdXNlci5zZXJ2aWNlcy5wYXNzd29yZC5iY3J5cHQ7XG4gIGNvbnN0IGhhc2hSb3VuZHMgPSBnZXRSb3VuZHNGcm9tQmNyeXB0SGFzaChoYXNoKTtcblxuICBpZiAoISBiY3J5cHRDb21wYXJlKGZvcm1hdHRlZFBhc3N3b3JkLCBoYXNoKSkge1xuICAgIHJlc3VsdC5lcnJvciA9IGhhbmRsZUVycm9yKFwiSW5jb3JyZWN0IHBhc3N3b3JkXCIsIGZhbHNlKTtcbiAgfSBlbHNlIGlmIChoYXNoICYmIEFjY291bnRzLl9iY3J5cHRSb3VuZHMoKSAhPSBoYXNoUm91bmRzKSB7XG4gICAgLy8gVGhlIHBhc3N3b3JkIGNoZWNrcyBvdXQsIGJ1dCB0aGUgdXNlcidzIGJjcnlwdCBoYXNoIG5lZWRzIHRvIGJlIHVwZGF0ZWQuXG4gICAgTWV0ZW9yLmRlZmVyKCgpID0+IHtcbiAgICAgIE1ldGVvci51c2Vycy51cGRhdGUoeyBfaWQ6IHVzZXIuX2lkIH0sIHtcbiAgICAgICAgJHNldDoge1xuICAgICAgICAgICdzZXJ2aWNlcy5wYXNzd29yZC5iY3J5cHQnOlxuICAgICAgICAgICAgYmNyeXB0SGFzaChmb3JtYXR0ZWRQYXNzd29yZCwgQWNjb3VudHMuX2JjcnlwdFJvdW5kcygpKVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuY29uc3QgY2hlY2tQYXNzd29yZCA9IEFjY291bnRzLl9jaGVja1Bhc3N3b3JkO1xuXG4vLy9cbi8vLyBFUlJPUiBIQU5ETEVSXG4vLy9cbmNvbnN0IGhhbmRsZUVycm9yID0gKG1zZywgdGhyb3dFcnJvciA9IHRydWUpID0+IHtcbiAgY29uc3QgZXJyb3IgPSBuZXcgTWV0ZW9yLkVycm9yKFxuICAgIDQwMyxcbiAgICBBY2NvdW50cy5fb3B0aW9ucy5hbWJpZ3VvdXNFcnJvck1lc3NhZ2VzXG4gICAgICA/IFwiU29tZXRoaW5nIHdlbnQgd3JvbmcuIFBsZWFzZSBjaGVjayB5b3VyIGNyZWRlbnRpYWxzLlwiXG4gICAgICA6IG1zZ1xuICApO1xuICBpZiAodGhyb3dFcnJvcikge1xuICAgIHRocm93IGVycm9yO1xuICB9XG4gIHJldHVybiBlcnJvcjtcbn07XG5cbi8vL1xuLy8vIExPR0lOXG4vLy9cblxuQWNjb3VudHMuX2ZpbmRVc2VyQnlRdWVyeSA9IChxdWVyeSwgb3B0aW9ucykgPT4ge1xuICBsZXQgdXNlciA9IG51bGw7XG5cbiAgaWYgKHF1ZXJ5LmlkKSB7XG4gICAgLy8gZGVmYXVsdCBmaWVsZCBzZWxlY3RvciBpcyBhZGRlZCB3aXRoaW4gZ2V0VXNlckJ5SWQoKVxuICAgIHVzZXIgPSBnZXRVc2VyQnlJZChxdWVyeS5pZCwgb3B0aW9ucyk7XG4gIH0gZWxzZSB7XG4gICAgb3B0aW9ucyA9IEFjY291bnRzLl9hZGREZWZhdWx0RmllbGRTZWxlY3RvcihvcHRpb25zKTtcbiAgICBsZXQgZmllbGROYW1lO1xuICAgIGxldCBmaWVsZFZhbHVlO1xuICAgIGlmIChxdWVyeS51c2VybmFtZSkge1xuICAgICAgZmllbGROYW1lID0gJ3VzZXJuYW1lJztcbiAgICAgIGZpZWxkVmFsdWUgPSBxdWVyeS51c2VybmFtZTtcbiAgICB9IGVsc2UgaWYgKHF1ZXJ5LmVtYWlsKSB7XG4gICAgICBmaWVsZE5hbWUgPSAnZW1haWxzLmFkZHJlc3MnO1xuICAgICAgZmllbGRWYWx1ZSA9IHF1ZXJ5LmVtYWlsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzaG91bGRuJ3QgaGFwcGVuICh2YWxpZGF0aW9uIG1pc3NlZCBzb21ldGhpbmcpXCIpO1xuICAgIH1cbiAgICBsZXQgc2VsZWN0b3IgPSB7fTtcbiAgICBzZWxlY3RvcltmaWVsZE5hbWVdID0gZmllbGRWYWx1ZTtcbiAgICB1c2VyID0gTWV0ZW9yLnVzZXJzLmZpbmRPbmUoc2VsZWN0b3IsIG9wdGlvbnMpO1xuICAgIC8vIElmIHVzZXIgaXMgbm90IGZvdW5kLCB0cnkgYSBjYXNlIGluc2Vuc2l0aXZlIGxvb2t1cFxuICAgIGlmICghdXNlcikge1xuICAgICAgc2VsZWN0b3IgPSBzZWxlY3RvckZvckZhc3RDYXNlSW5zZW5zaXRpdmVMb29rdXAoZmllbGROYW1lLCBmaWVsZFZhbHVlKTtcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZVVzZXJzID0gTWV0ZW9yLnVzZXJzLmZpbmQoc2VsZWN0b3IsIG9wdGlvbnMpLmZldGNoKCk7XG4gICAgICAvLyBObyBtYXRjaCBpZiBtdWx0aXBsZSBjYW5kaWRhdGVzIGFyZSBmb3VuZFxuICAgICAgaWYgKGNhbmRpZGF0ZVVzZXJzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICB1c2VyID0gY2FuZGlkYXRlVXNlcnNbMF07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVzZXI7XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IEZpbmRzIHRoZSB1c2VyIHdpdGggdGhlIHNwZWNpZmllZCB1c2VybmFtZS5cbiAqIEZpcnN0IHRyaWVzIHRvIG1hdGNoIHVzZXJuYW1lIGNhc2Ugc2Vuc2l0aXZlbHk7IGlmIHRoYXQgZmFpbHMsIGl0XG4gKiB0cmllcyBjYXNlIGluc2Vuc2l0aXZlbHk7IGJ1dCBpZiBtb3JlIHRoYW4gb25lIHVzZXIgbWF0Y2hlcyB0aGUgY2FzZVxuICogaW5zZW5zaXRpdmUgc2VhcmNoLCBpdCByZXR1cm5zIG51bGwuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlcm5hbWUgVGhlIHVzZXJuYW1lIHRvIGxvb2sgZm9yXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcGFyYW0ge01vbmdvRmllbGRTcGVjaWZpZXJ9IG9wdGlvbnMuZmllbGRzIERpY3Rpb25hcnkgb2YgZmllbGRzIHRvIHJldHVybiBvciBleGNsdWRlLlxuICogQHJldHVybnMge09iamVjdH0gQSB1c2VyIGlmIGZvdW5kLCBlbHNlIG51bGxcbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBhY2NvdW50cy1iYXNlXG4gKi9cbkFjY291bnRzLmZpbmRVc2VyQnlVc2VybmFtZSA9XG4gICh1c2VybmFtZSwgb3B0aW9ucykgPT4gQWNjb3VudHMuX2ZpbmRVc2VyQnlRdWVyeSh7IHVzZXJuYW1lIH0sIG9wdGlvbnMpO1xuXG4vKipcbiAqIEBzdW1tYXJ5IEZpbmRzIHRoZSB1c2VyIHdpdGggdGhlIHNwZWNpZmllZCBlbWFpbC5cbiAqIEZpcnN0IHRyaWVzIHRvIG1hdGNoIGVtYWlsIGNhc2Ugc2Vuc2l0aXZlbHk7IGlmIHRoYXQgZmFpbHMsIGl0XG4gKiB0cmllcyBjYXNlIGluc2Vuc2l0aXZlbHk7IGJ1dCBpZiBtb3JlIHRoYW4gb25lIHVzZXIgbWF0Y2hlcyB0aGUgY2FzZVxuICogaW5zZW5zaXRpdmUgc2VhcmNoLCBpdCByZXR1cm5zIG51bGwuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gZW1haWwgVGhlIGVtYWlsIGFkZHJlc3MgdG8gbG9vayBmb3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEBwYXJhbSB7TW9uZ29GaWVsZFNwZWNpZmllcn0gb3B0aW9ucy5maWVsZHMgRGljdGlvbmFyeSBvZiBmaWVsZHMgdG8gcmV0dXJuIG9yIGV4Y2x1ZGUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBBIHVzZXIgaWYgZm91bmQsIGVsc2UgbnVsbFxuICogQGltcG9ydEZyb21QYWNrYWdlIGFjY291bnRzLWJhc2VcbiAqL1xuQWNjb3VudHMuZmluZFVzZXJCeUVtYWlsID1cbiAgKGVtYWlsLCBvcHRpb25zKSA9PiBBY2NvdW50cy5fZmluZFVzZXJCeVF1ZXJ5KHsgZW1haWwgfSwgb3B0aW9ucyk7XG5cbi8vIEdlbmVyYXRlcyBhIE1vbmdvREIgc2VsZWN0b3IgdGhhdCBjYW4gYmUgdXNlZCB0byBwZXJmb3JtIGEgZmFzdCBjYXNlXG4vLyBpbnNlbnNpdGl2ZSBsb29rdXAgZm9yIHRoZSBnaXZlbiBmaWVsZE5hbWUgYW5kIHN0cmluZy4gU2luY2UgTW9uZ29EQiBkb2VzXG4vLyBub3Qgc3VwcG9ydCBjYXNlIGluc2Vuc2l0aXZlIGluZGV4ZXMsIGFuZCBjYXNlIGluc2Vuc2l0aXZlIHJlZ2V4IHF1ZXJpZXNcbi8vIGFyZSBzbG93LCB3ZSBjb25zdHJ1Y3QgYSBzZXQgb2YgcHJlZml4IHNlbGVjdG9ycyBmb3IgYWxsIHBlcm11dGF0aW9ucyBvZlxuLy8gdGhlIGZpcnN0IDQgY2hhcmFjdGVycyBvdXJzZWx2ZXMuIFdlIGZpcnN0IGF0dGVtcHQgdG8gbWF0Y2hpbmcgYWdhaW5zdFxuLy8gdGhlc2UsIGFuZCBiZWNhdXNlICdwcmVmaXggZXhwcmVzc2lvbicgcmVnZXggcXVlcmllcyBkbyB1c2UgaW5kZXhlcyAoc2VlXG4vLyBodHRwOi8vZG9jcy5tb25nb2RiLm9yZy92Mi42L3JlZmVyZW5jZS9vcGVyYXRvci9xdWVyeS9yZWdleC8jaW5kZXgtdXNlKSxcbi8vIHRoaXMgaGFzIGJlZW4gZm91bmQgdG8gZ3JlYXRseSBpbXByb3ZlIHBlcmZvcm1hbmNlIChmcm9tIDEyMDBtcyB0byA1bXMgaW4gYVxuLy8gdGVzdCB3aXRoIDEuMDAwLjAwMCB1c2VycykuXG5jb25zdCBzZWxlY3RvckZvckZhc3RDYXNlSW5zZW5zaXRpdmVMb29rdXAgPSAoZmllbGROYW1lLCBzdHJpbmcpID0+IHtcbiAgLy8gUGVyZm9ybWFuY2Ugc2VlbXMgdG8gaW1wcm92ZSB1cCB0byA0IHByZWZpeCBjaGFyYWN0ZXJzXG4gIGNvbnN0IHByZWZpeCA9IHN0cmluZy5zdWJzdHJpbmcoMCwgTWF0aC5taW4oc3RyaW5nLmxlbmd0aCwgNCkpO1xuICBjb25zdCBvckNsYXVzZSA9IGdlbmVyYXRlQ2FzZVBlcm11dGF0aW9uc0ZvclN0cmluZyhwcmVmaXgpLm1hcChcbiAgICBwcmVmaXhQZXJtdXRhdGlvbiA9PiB7XG4gICAgICBjb25zdCBzZWxlY3RvciA9IHt9O1xuICAgICAgc2VsZWN0b3JbZmllbGROYW1lXSA9XG4gICAgICAgIG5ldyBSZWdFeHAoYF4ke01ldGVvci5fZXNjYXBlUmVnRXhwKHByZWZpeFBlcm11dGF0aW9uKX1gKTtcbiAgICAgIHJldHVybiBzZWxlY3RvcjtcbiAgICB9KTtcbiAgY29uc3QgY2FzZUluc2Vuc2l0aXZlQ2xhdXNlID0ge307XG4gIGNhc2VJbnNlbnNpdGl2ZUNsYXVzZVtmaWVsZE5hbWVdID1cbiAgICBuZXcgUmVnRXhwKGBeJHtNZXRlb3IuX2VzY2FwZVJlZ0V4cChzdHJpbmcpfSRgLCAnaScpXG4gIHJldHVybiB7JGFuZDogW3skb3I6IG9yQ2xhdXNlfSwgY2FzZUluc2Vuc2l0aXZlQ2xhdXNlXX07XG59XG5cbi8vIEdlbmVyYXRlcyBwZXJtdXRhdGlvbnMgb2YgYWxsIGNhc2UgdmFyaWF0aW9ucyBvZiBhIGdpdmVuIHN0cmluZy5cbmNvbnN0IGdlbmVyYXRlQ2FzZVBlcm11dGF0aW9uc0ZvclN0cmluZyA9IHN0cmluZyA9PiB7XG4gIGxldCBwZXJtdXRhdGlvbnMgPSBbJyddO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNoID0gc3RyaW5nLmNoYXJBdChpKTtcbiAgICBwZXJtdXRhdGlvbnMgPSBbXS5jb25jYXQoLi4uKHBlcm11dGF0aW9ucy5tYXAocHJlZml4ID0+IHtcbiAgICAgIGNvbnN0IGxvd2VyQ2FzZUNoYXIgPSBjaC50b0xvd2VyQ2FzZSgpO1xuICAgICAgY29uc3QgdXBwZXJDYXNlQ2hhciA9IGNoLnRvVXBwZXJDYXNlKCk7XG4gICAgICAvLyBEb24ndCBhZGQgdW5uZWNlc3NhcnkgcGVybXV0YXRpb25zIHdoZW4gY2ggaXMgbm90IGEgbGV0dGVyXG4gICAgICBpZiAobG93ZXJDYXNlQ2hhciA9PT0gdXBwZXJDYXNlQ2hhcikge1xuICAgICAgICByZXR1cm4gW3ByZWZpeCArIGNoXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbcHJlZml4ICsgbG93ZXJDYXNlQ2hhciwgcHJlZml4ICsgdXBwZXJDYXNlQ2hhcl07XG4gICAgICB9XG4gICAgfSkpKTtcbiAgfVxuICByZXR1cm4gcGVybXV0YXRpb25zO1xufVxuXG5jb25zdCBjaGVja0ZvckNhc2VJbnNlbnNpdGl2ZUR1cGxpY2F0ZXMgPSAoZmllbGROYW1lLCBkaXNwbGF5TmFtZSwgZmllbGRWYWx1ZSwgb3duVXNlcklkKSA9PiB7XG4gIC8vIFNvbWUgdGVzdHMgbmVlZCB0aGUgYWJpbGl0eSB0byBhZGQgdXNlcnMgd2l0aCB0aGUgc2FtZSBjYXNlIGluc2Vuc2l0aXZlXG4gIC8vIHZhbHVlLCBoZW5jZSB0aGUgX3NraXBDYXNlSW5zZW5zaXRpdmVDaGVja3NGb3JUZXN0IGNoZWNrXG4gIGNvbnN0IHNraXBDaGVjayA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChBY2NvdW50cy5fc2tpcENhc2VJbnNlbnNpdGl2ZUNoZWNrc0ZvclRlc3QsIGZpZWxkVmFsdWUpO1xuXG4gIGlmIChmaWVsZFZhbHVlICYmICFza2lwQ2hlY2spIHtcbiAgICBjb25zdCBtYXRjaGVkVXNlcnMgPSBNZXRlb3IudXNlcnMuZmluZChcbiAgICAgIHNlbGVjdG9yRm9yRmFzdENhc2VJbnNlbnNpdGl2ZUxvb2t1cChmaWVsZE5hbWUsIGZpZWxkVmFsdWUpLFxuICAgICAge1xuICAgICAgICBmaWVsZHM6IHtfaWQ6IDF9LFxuICAgICAgICAvLyB3ZSBvbmx5IG5lZWQgYSBtYXhpbXVtIG9mIDIgdXNlcnMgZm9yIHRoZSBsb2dpYyBiZWxvdyB0byB3b3JrXG4gICAgICAgIGxpbWl0OiAyLFxuICAgICAgfVxuICAgICkuZmV0Y2goKTtcblxuICAgIGlmIChtYXRjaGVkVXNlcnMubGVuZ3RoID4gMCAmJlxuICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgdXNlcklkIHlldCwgYW55IG1hdGNoIHdlIGZpbmQgaXMgYSBkdXBsaWNhdGVcbiAgICAgICAgKCFvd25Vc2VySWQgfHxcbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBjaGVjayB0byBzZWUgaWYgdGhlcmUgYXJlIG11bHRpcGxlIG1hdGNoZXMgb3IgYSBtYXRjaFxuICAgICAgICAvLyB0aGF0IGlzIG5vdCB1c1xuICAgICAgICAobWF0Y2hlZFVzZXJzLmxlbmd0aCA+IDEgfHwgbWF0Y2hlZFVzZXJzWzBdLl9pZCAhPT0gb3duVXNlcklkKSkpIHtcbiAgICAgIGhhbmRsZUVycm9yKGAke2Rpc3BsYXlOYW1lfSBhbHJlYWR5IGV4aXN0cy5gKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIFhYWCBtYXliZSB0aGlzIGJlbG9uZ3MgaW4gdGhlIGNoZWNrIHBhY2thZ2VcbmNvbnN0IE5vbkVtcHR5U3RyaW5nID0gTWF0Y2guV2hlcmUoeCA9PiB7XG4gIGNoZWNrKHgsIFN0cmluZyk7XG4gIHJldHVybiB4Lmxlbmd0aCA+IDA7XG59KTtcblxuY29uc3QgdXNlclF1ZXJ5VmFsaWRhdG9yID0gTWF0Y2guV2hlcmUodXNlciA9PiB7XG4gIGNoZWNrKHVzZXIsIHtcbiAgICBpZDogTWF0Y2guT3B0aW9uYWwoTm9uRW1wdHlTdHJpbmcpLFxuICAgIHVzZXJuYW1lOiBNYXRjaC5PcHRpb25hbChOb25FbXB0eVN0cmluZyksXG4gICAgZW1haWw6IE1hdGNoLk9wdGlvbmFsKE5vbkVtcHR5U3RyaW5nKVxuICB9KTtcbiAgaWYgKE9iamVjdC5rZXlzKHVzZXIpLmxlbmd0aCAhPT0gMSlcbiAgICB0aHJvdyBuZXcgTWF0Y2guRXJyb3IoXCJVc2VyIHByb3BlcnR5IG11c3QgaGF2ZSBleGFjdGx5IG9uZSBmaWVsZFwiKTtcbiAgcmV0dXJuIHRydWU7XG59KTtcblxuY29uc3QgcGFzc3dvcmRWYWxpZGF0b3IgPSBNYXRjaC5PbmVPZihcbiAgTWF0Y2guV2hlcmUoc3RyID0+IE1hdGNoLnRlc3Qoc3RyLCBTdHJpbmcpICYmIHN0ci5sZW5ndGggPD0gTWV0ZW9yLnNldHRpbmdzPy5wYWNrYWdlcz8uYWNjb3VudHM/LnBhc3N3b3JkTWF4TGVuZ3RoIHx8IDI1NiksIHtcbiAgICBkaWdlc3Q6IE1hdGNoLldoZXJlKHN0ciA9PiBNYXRjaC50ZXN0KHN0ciwgU3RyaW5nKSAmJiBzdHIubGVuZ3RoID09PSA2NCksXG4gICAgYWxnb3JpdGhtOiBNYXRjaC5PbmVPZignc2hhLTI1NicpXG4gIH1cbik7XG5cbi8vIEhhbmRsZXIgdG8gbG9naW4gd2l0aCBhIHBhc3N3b3JkLlxuLy9cbi8vIFRoZSBNZXRlb3IgY2xpZW50IHNldHMgb3B0aW9ucy5wYXNzd29yZCB0byBhbiBvYmplY3Qgd2l0aCBrZXlzXG4vLyAnZGlnZXN0JyAoc2V0IHRvIFNIQTI1NihwYXNzd29yZCkpIGFuZCAnYWxnb3JpdGhtJyAoXCJzaGEtMjU2XCIpLlxuLy9cbi8vIEZvciBvdGhlciBERFAgY2xpZW50cyB3aGljaCBkb24ndCBoYXZlIGFjY2VzcyB0byBTSEEsIHRoZSBoYW5kbGVyXG4vLyBhbHNvIGFjY2VwdHMgdGhlIHBsYWludGV4dCBwYXNzd29yZCBpbiBvcHRpb25zLnBhc3N3b3JkIGFzIGEgc3RyaW5nLlxuLy9cbi8vIChJdCBtaWdodCBiZSBuaWNlIGlmIHNlcnZlcnMgY291bGQgdHVybiB0aGUgcGxhaW50ZXh0IHBhc3N3b3JkXG4vLyBvcHRpb24gb2ZmLiBPciBtYXliZSBpdCBzaG91bGQgYmUgb3B0LWluLCBub3Qgb3B0LW91dD9cbi8vIEFjY291bnRzLmNvbmZpZyBvcHRpb24/KVxuLy9cbi8vIE5vdGUgdGhhdCBuZWl0aGVyIHBhc3N3b3JkIG9wdGlvbiBpcyBzZWN1cmUgd2l0aG91dCBTU0wuXG4vL1xuQWNjb3VudHMucmVnaXN0ZXJMb2dpbkhhbmRsZXIoXCJwYXNzd29yZFwiLCBvcHRpb25zID0+IHtcbiAgaWYgKCFvcHRpb25zLnBhc3N3b3JkKVxuICAgIHJldHVybiB1bmRlZmluZWQ7IC8vIGRvbid0IGhhbmRsZVxuXG4gIGNoZWNrKG9wdGlvbnMsIHtcbiAgICB1c2VyOiB1c2VyUXVlcnlWYWxpZGF0b3IsXG4gICAgcGFzc3dvcmQ6IHBhc3N3b3JkVmFsaWRhdG9yXG4gIH0pO1xuXG5cbiAgY29uc3QgdXNlciA9IEFjY291bnRzLl9maW5kVXNlckJ5UXVlcnkob3B0aW9ucy51c2VyLCB7ZmllbGRzOiB7XG4gICAgc2VydmljZXM6IDEsXG4gICAgLi4uQWNjb3VudHMuX2NoZWNrUGFzc3dvcmRVc2VyRmllbGRzLFxuICB9fSk7XG4gIGlmICghdXNlcikge1xuICAgIGhhbmRsZUVycm9yKFwiVXNlciBub3QgZm91bmRcIik7XG4gIH1cblxuICBpZiAoIXVzZXIuc2VydmljZXMgfHwgIXVzZXIuc2VydmljZXMucGFzc3dvcmQgfHxcbiAgICAgICF1c2VyLnNlcnZpY2VzLnBhc3N3b3JkLmJjcnlwdCkge1xuICAgIGhhbmRsZUVycm9yKFwiVXNlciBoYXMgbm8gcGFzc3dvcmQgc2V0XCIpO1xuICB9XG5cbiAgcmV0dXJuIGNoZWNrUGFzc3dvcmQoXG4gICAgdXNlcixcbiAgICBvcHRpb25zLnBhc3N3b3JkXG4gICk7XG59KTtcblxuLy8vXG4vLy8gQ0hBTkdJTkdcbi8vL1xuXG4vKipcbiAqIEBzdW1tYXJ5IENoYW5nZSBhIHVzZXIncyB1c2VybmFtZS4gVXNlIHRoaXMgaW5zdGVhZCBvZiB1cGRhdGluZyB0aGVcbiAqIGRhdGFiYXNlIGRpcmVjdGx5LiBUaGUgb3BlcmF0aW9uIHdpbGwgZmFpbCBpZiB0aGVyZSBpcyBhbiBleGlzdGluZyB1c2VyXG4gKiB3aXRoIGEgdXNlcm5hbWUgb25seSBkaWZmZXJpbmcgaW4gY2FzZS5cbiAqIEBsb2N1cyBTZXJ2ZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VySWQgVGhlIElEIG9mIHRoZSB1c2VyIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBuZXdVc2VybmFtZSBBIG5ldyB1c2VybmFtZSBmb3IgdGhlIHVzZXIuXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgYWNjb3VudHMtYmFzZVxuICovXG5BY2NvdW50cy5zZXRVc2VybmFtZSA9ICh1c2VySWQsIG5ld1VzZXJuYW1lKSA9PiB7XG4gIGNoZWNrKHVzZXJJZCwgTm9uRW1wdHlTdHJpbmcpO1xuICBjaGVjayhuZXdVc2VybmFtZSwgTm9uRW1wdHlTdHJpbmcpO1xuXG4gIGNvbnN0IHVzZXIgPSBnZXRVc2VyQnlJZCh1c2VySWQsIHtmaWVsZHM6IHtcbiAgICB1c2VybmFtZTogMSxcbiAgfX0pO1xuICBpZiAoIXVzZXIpIHtcbiAgICBoYW5kbGVFcnJvcihcIlVzZXIgbm90IGZvdW5kXCIpO1xuICB9XG5cbiAgY29uc3Qgb2xkVXNlcm5hbWUgPSB1c2VyLnVzZXJuYW1lO1xuXG4gIC8vIFBlcmZvcm0gYSBjYXNlIGluc2Vuc2l0aXZlIGNoZWNrIGZvciBkdXBsaWNhdGVzIGJlZm9yZSB1cGRhdGVcbiAgY2hlY2tGb3JDYXNlSW5zZW5zaXRpdmVEdXBsaWNhdGVzKCd1c2VybmFtZScsICdVc2VybmFtZScsIG5ld1VzZXJuYW1lLCB1c2VyLl9pZCk7XG5cbiAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7X2lkOiB1c2VyLl9pZH0sIHskc2V0OiB7dXNlcm5hbWU6IG5ld1VzZXJuYW1lfX0pO1xuXG4gIC8vIFBlcmZvcm0gYW5vdGhlciBjaGVjayBhZnRlciB1cGRhdGUsIGluIGNhc2UgYSBtYXRjaGluZyB1c2VyIGhhcyBiZWVuXG4gIC8vIGluc2VydGVkIGluIHRoZSBtZWFudGltZVxuICB0cnkge1xuICAgIGNoZWNrRm9yQ2FzZUluc2Vuc2l0aXZlRHVwbGljYXRlcygndXNlcm5hbWUnLCAnVXNlcm5hbWUnLCBuZXdVc2VybmFtZSwgdXNlci5faWQpO1xuICB9IGNhdGNoIChleCkge1xuICAgIC8vIFVuZG8gdXBkYXRlIGlmIHRoZSBjaGVjayBmYWlsc1xuICAgIE1ldGVvci51c2Vycy51cGRhdGUoe19pZDogdXNlci5faWR9LCB7JHNldDoge3VzZXJuYW1lOiBvbGRVc2VybmFtZX19KTtcbiAgICB0aHJvdyBleDtcbiAgfVxufTtcblxuLy8gTGV0IHRoZSB1c2VyIGNoYW5nZSB0aGVpciBvd24gcGFzc3dvcmQgaWYgdGhleSBrbm93IHRoZSBvbGRcbi8vIHBhc3N3b3JkLiBgb2xkUGFzc3dvcmRgIGFuZCBgbmV3UGFzc3dvcmRgIHNob3VsZCBiZSBvYmplY3RzIHdpdGgga2V5c1xuLy8gYGRpZ2VzdGAgYW5kIGBhbGdvcml0aG1gIChyZXByZXNlbnRpbmcgdGhlIFNIQTI1NiBvZiB0aGUgcGFzc3dvcmQpLlxuTWV0ZW9yLm1ldGhvZHMoe2NoYW5nZVBhc3N3b3JkOiBmdW5jdGlvbiAob2xkUGFzc3dvcmQsIG5ld1Bhc3N3b3JkKSB7XG4gIGNoZWNrKG9sZFBhc3N3b3JkLCBwYXNzd29yZFZhbGlkYXRvcik7XG4gIGNoZWNrKG5ld1Bhc3N3b3JkLCBwYXNzd29yZFZhbGlkYXRvcik7XG5cbiAgaWYgKCF0aGlzLnVzZXJJZCkge1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAxLCBcIk11c3QgYmUgbG9nZ2VkIGluXCIpO1xuICB9XG5cbiAgY29uc3QgdXNlciA9IGdldFVzZXJCeUlkKHRoaXMudXNlcklkLCB7ZmllbGRzOiB7XG4gICAgc2VydmljZXM6IDEsXG4gICAgLi4uQWNjb3VudHMuX2NoZWNrUGFzc3dvcmRVc2VyRmllbGRzLFxuICB9fSk7XG4gIGlmICghdXNlcikge1xuICAgIGhhbmRsZUVycm9yKFwiVXNlciBub3QgZm91bmRcIik7XG4gIH1cblxuICBpZiAoIXVzZXIuc2VydmljZXMgfHwgIXVzZXIuc2VydmljZXMucGFzc3dvcmQgfHwgIXVzZXIuc2VydmljZXMucGFzc3dvcmQuYmNyeXB0KSB7XG4gICAgaGFuZGxlRXJyb3IoXCJVc2VyIGhhcyBubyBwYXNzd29yZCBzZXRcIik7XG4gIH1cblxuICBjb25zdCByZXN1bHQgPSBjaGVja1Bhc3N3b3JkKHVzZXIsIG9sZFBhc3N3b3JkKTtcbiAgaWYgKHJlc3VsdC5lcnJvcikge1xuICAgIHRocm93IHJlc3VsdC5lcnJvcjtcbiAgfVxuXG4gIGNvbnN0IGhhc2hlZCA9IGhhc2hQYXNzd29yZChuZXdQYXNzd29yZCk7XG5cbiAgLy8gSXQgd291bGQgYmUgYmV0dGVyIGlmIHRoaXMgcmVtb3ZlZCBBTEwgZXhpc3RpbmcgdG9rZW5zIGFuZCByZXBsYWNlZFxuICAvLyB0aGUgdG9rZW4gZm9yIHRoZSBjdXJyZW50IGNvbm5lY3Rpb24gd2l0aCBhIG5ldyBvbmUsIGJ1dCB0aGF0IHdvdWxkXG4gIC8vIGJlIHRyaWNreSwgc28gd2UnbGwgc2V0dGxlIGZvciBqdXN0IHJlcGxhY2luZyBhbGwgdG9rZW5zIG90aGVyIHRoYW5cbiAgLy8gdGhlIG9uZSBmb3IgdGhlIGN1cnJlbnQgY29ubmVjdGlvbi5cbiAgY29uc3QgY3VycmVudFRva2VuID0gQWNjb3VudHMuX2dldExvZ2luVG9rZW4odGhpcy5jb25uZWN0aW9uLmlkKTtcbiAgTWV0ZW9yLnVzZXJzLnVwZGF0ZShcbiAgICB7IF9pZDogdGhpcy51c2VySWQgfSxcbiAgICB7XG4gICAgICAkc2V0OiB7ICdzZXJ2aWNlcy5wYXNzd29yZC5iY3J5cHQnOiBoYXNoZWQgfSxcbiAgICAgICRwdWxsOiB7XG4gICAgICAgICdzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMnOiB7IGhhc2hlZFRva2VuOiB7ICRuZTogY3VycmVudFRva2VuIH0gfVxuICAgICAgfSxcbiAgICAgICR1bnNldDogeyAnc2VydmljZXMucGFzc3dvcmQucmVzZXQnOiAxIH1cbiAgICB9XG4gICk7XG5cbiAgcmV0dXJuIHtwYXNzd29yZENoYW5nZWQ6IHRydWV9O1xufX0pO1xuXG5cbi8vIEZvcmNlIGNoYW5nZSB0aGUgdXNlcnMgcGFzc3dvcmQuXG5cbi8qKlxuICogQHN1bW1hcnkgRm9yY2libHkgY2hhbmdlIHRoZSBwYXNzd29yZCBmb3IgYSB1c2VyLlxuICogQGxvY3VzIFNlcnZlclxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJJZCBUaGUgaWQgb2YgdGhlIHVzZXIgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtTdHJpbmd9IG5ld1Bhc3N3b3JkIEEgbmV3IHBhc3N3b3JkIGZvciB0aGUgdXNlci5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zLmxvZ291dCBMb2dvdXQgYWxsIGN1cnJlbnQgY29ubmVjdGlvbnMgd2l0aCB0aGlzIHVzZXJJZCAoZGVmYXVsdDogdHJ1ZSlcbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBhY2NvdW50cy1iYXNlXG4gKi9cbkFjY291bnRzLnNldFBhc3N3b3JkID0gKHVzZXJJZCwgbmV3UGxhaW50ZXh0UGFzc3dvcmQsIG9wdGlvbnMpID0+IHtcbiAgY2hlY2sodXNlcklkLCBTdHJpbmcpXG4gIGNoZWNrKG5ld1BsYWludGV4dFBhc3N3b3JkLCBNYXRjaC5XaGVyZShzdHIgPT4gTWF0Y2gudGVzdChzdHIsIFN0cmluZykgJiYgc3RyLmxlbmd0aCA8PSBNZXRlb3Iuc2V0dGluZ3M/LnBhY2thZ2VzPy5hY2NvdW50cz8ucGFzc3dvcmRNYXhMZW5ndGggfHwgMjU2KSlcbiAgY2hlY2sob3B0aW9ucywgTWF0Y2guTWF5YmUoeyBsb2dvdXQ6IEJvb2xlYW4gfSkpXG4gIG9wdGlvbnMgPSB7IGxvZ291dDogdHJ1ZSAsIC4uLm9wdGlvbnMgfTtcblxuICBjb25zdCB1c2VyID0gZ2V0VXNlckJ5SWQodXNlcklkLCB7ZmllbGRzOiB7X2lkOiAxfX0pO1xuICBpZiAoIXVzZXIpIHtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwMywgXCJVc2VyIG5vdCBmb3VuZFwiKTtcbiAgfVxuXG4gIGNvbnN0IHVwZGF0ZSA9IHtcbiAgICAkdW5zZXQ6IHtcbiAgICAgICdzZXJ2aWNlcy5wYXNzd29yZC5yZXNldCc6IDFcbiAgICB9LFxuICAgICRzZXQ6IHsnc2VydmljZXMucGFzc3dvcmQuYmNyeXB0JzogaGFzaFBhc3N3b3JkKG5ld1BsYWludGV4dFBhc3N3b3JkKX1cbiAgfTtcblxuICBpZiAob3B0aW9ucy5sb2dvdXQpIHtcbiAgICB1cGRhdGUuJHVuc2V0WydzZXJ2aWNlcy5yZXN1bWUubG9naW5Ub2tlbnMnXSA9IDE7XG4gIH1cblxuICBNZXRlb3IudXNlcnMudXBkYXRlKHtfaWQ6IHVzZXIuX2lkfSwgdXBkYXRlKTtcbn07XG5cblxuLy8vXG4vLy8gUkVTRVRUSU5HIFZJQSBFTUFJTFxuLy8vXG5cbi8vIFV0aWxpdHkgZm9yIHBsdWNraW5nIGFkZHJlc3NlcyBmcm9tIGVtYWlsc1xuY29uc3QgcGx1Y2tBZGRyZXNzZXMgPSAoZW1haWxzID0gW10pID0+IGVtYWlscy5tYXAoZW1haWwgPT4gZW1haWwuYWRkcmVzcyk7XG5cbi8vIE1ldGhvZCBjYWxsZWQgYnkgYSB1c2VyIHRvIHJlcXVlc3QgYSBwYXNzd29yZCByZXNldCBlbWFpbC4gVGhpcyBpc1xuLy8gdGhlIHN0YXJ0IG9mIHRoZSByZXNldCBwcm9jZXNzLlxuTWV0ZW9yLm1ldGhvZHMoe2ZvcmdvdFBhc3N3b3JkOiBvcHRpb25zID0+IHtcbiAgY2hlY2sob3B0aW9ucywge2VtYWlsOiBTdHJpbmd9KVxuXG4gIGNvbnN0IHVzZXIgPSBBY2NvdW50cy5maW5kVXNlckJ5RW1haWwob3B0aW9ucy5lbWFpbCwgeyBmaWVsZHM6IHsgZW1haWxzOiAxIH0gfSk7XG5cbiAgaWYgKCF1c2VyKSB7XG4gICAgaGFuZGxlRXJyb3IoXCJVc2VyIG5vdCBmb3VuZFwiKTtcbiAgfVxuXG4gIGNvbnN0IGVtYWlscyA9IHBsdWNrQWRkcmVzc2VzKHVzZXIuZW1haWxzKTtcbiAgY29uc3QgY2FzZVNlbnNpdGl2ZUVtYWlsID0gZW1haWxzLmZpbmQoXG4gICAgZW1haWwgPT4gZW1haWwudG9Mb3dlckNhc2UoKSA9PT0gb3B0aW9ucy5lbWFpbC50b0xvd2VyQ2FzZSgpXG4gICk7XG5cbiAgQWNjb3VudHMuc2VuZFJlc2V0UGFzc3dvcmRFbWFpbCh1c2VyLl9pZCwgY2FzZVNlbnNpdGl2ZUVtYWlsKTtcbn19KTtcblxuLyoqXG4gKiBAc3VtbWFyeSBHZW5lcmF0ZXMgYSByZXNldCB0b2tlbiBhbmQgc2F2ZXMgaXQgaW50byB0aGUgZGF0YWJhc2UuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlcklkIFRoZSBpZCBvZiB0aGUgdXNlciB0byBnZW5lcmF0ZSB0aGUgcmVzZXQgdG9rZW4gZm9yLlxuICogQHBhcmFtIHtTdHJpbmd9IGVtYWlsIFdoaWNoIGFkZHJlc3Mgb2YgdGhlIHVzZXIgdG8gZ2VuZXJhdGUgdGhlIHJlc2V0IHRva2VuIGZvci4gVGhpcyBhZGRyZXNzIG11c3QgYmUgaW4gdGhlIHVzZXIncyBgZW1haWxzYCBsaXN0LiBJZiBgbnVsbGAsIGRlZmF1bHRzIHRvIHRoZSBmaXJzdCBlbWFpbCBpbiB0aGUgbGlzdC5cbiAqIEBwYXJhbSB7U3RyaW5nfSByZWFzb24gYHJlc2V0UGFzc3dvcmRgIG9yIGBlbnJvbGxBY2NvdW50YC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbZXh0cmFUb2tlbkRhdGFdIE9wdGlvbmFsIGFkZGl0aW9uYWwgZGF0YSB0byBiZSBhZGRlZCBpbnRvIHRoZSB0b2tlbiByZWNvcmQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBPYmplY3Qgd2l0aCB7ZW1haWwsIHVzZXIsIHRva2VufSB2YWx1ZXMuXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgYWNjb3VudHMtYmFzZVxuICovXG5BY2NvdW50cy5nZW5lcmF0ZVJlc2V0VG9rZW4gPSAodXNlcklkLCBlbWFpbCwgcmVhc29uLCBleHRyYVRva2VuRGF0YSkgPT4ge1xuICAvLyBNYWtlIHN1cmUgdGhlIHVzZXIgZXhpc3RzLCBhbmQgZW1haWwgaXMgb25lIG9mIHRoZWlyIGFkZHJlc3Nlcy5cbiAgLy8gRG9uJ3QgbGltaXQgdGhlIGZpZWxkcyBpbiB0aGUgdXNlciBvYmplY3Qgc2luY2UgdGhlIHVzZXIgaXMgcmV0dXJuZWRcbiAgLy8gYnkgdGhlIGZ1bmN0aW9uIGFuZCBzb21lIG90aGVyIGZpZWxkcyBtaWdodCBiZSB1c2VkIGVsc2V3aGVyZS5cbiAgY29uc3QgdXNlciA9IGdldFVzZXJCeUlkKHVzZXJJZCk7XG4gIGlmICghdXNlcikge1xuICAgIGhhbmRsZUVycm9yKFwiQ2FuJ3QgZmluZCB1c2VyXCIpO1xuICB9XG5cbiAgLy8gcGljayB0aGUgZmlyc3QgZW1haWwgaWYgd2Ugd2VyZW4ndCBwYXNzZWQgYW4gZW1haWwuXG4gIGlmICghZW1haWwgJiYgdXNlci5lbWFpbHMgJiYgdXNlci5lbWFpbHNbMF0pIHtcbiAgICBlbWFpbCA9IHVzZXIuZW1haWxzWzBdLmFkZHJlc3M7XG4gIH1cblxuICAvLyBtYWtlIHN1cmUgd2UgaGF2ZSBhIHZhbGlkIGVtYWlsXG4gIGlmICghZW1haWwgfHxcbiAgICAhKHBsdWNrQWRkcmVzc2VzKHVzZXIuZW1haWxzKS5pbmNsdWRlcyhlbWFpbCkpKSB7XG4gICAgaGFuZGxlRXJyb3IoXCJObyBzdWNoIGVtYWlsIGZvciB1c2VyLlwiKTtcbiAgfVxuXG4gIGNvbnN0IHRva2VuID0gUmFuZG9tLnNlY3JldCgpO1xuICBjb25zdCB0b2tlblJlY29yZCA9IHtcbiAgICB0b2tlbixcbiAgICBlbWFpbCxcbiAgICB3aGVuOiBuZXcgRGF0ZSgpXG4gIH07XG5cbiAgaWYgKHJlYXNvbiA9PT0gJ3Jlc2V0UGFzc3dvcmQnKSB7XG4gICAgdG9rZW5SZWNvcmQucmVhc29uID0gJ3Jlc2V0JztcbiAgfSBlbHNlIGlmIChyZWFzb24gPT09ICdlbnJvbGxBY2NvdW50Jykge1xuICAgIHRva2VuUmVjb3JkLnJlYXNvbiA9ICdlbnJvbGwnO1xuICB9IGVsc2UgaWYgKHJlYXNvbikge1xuICAgIC8vIGZhbGxiYWNrIHNvIHRoYXQgdGhpcyBmdW5jdGlvbiBjYW4gYmUgdXNlZCBmb3IgdW5rbm93biByZWFzb25zIGFzIHdlbGxcbiAgICB0b2tlblJlY29yZC5yZWFzb24gPSByZWFzb247XG4gIH1cblxuICBpZiAoZXh0cmFUb2tlbkRhdGEpIHtcbiAgICBPYmplY3QuYXNzaWduKHRva2VuUmVjb3JkLCBleHRyYVRva2VuRGF0YSk7XG4gIH0gXG4gIC8vIGlmIHRoaXMgbWV0aG9kIGlzIGNhbGxlZCBmcm9tIHRoZSBlbnJvbGwgYWNjb3VudCB3b3JrLWZsb3cgdGhlblxuICAvLyBzdG9yZSB0aGUgdG9rZW4gcmVjb3JkIGluICdzZXJ2aWNlcy5wYXNzd29yZC5lbnJvbGwnIGRiIGZpZWxkXG4gIC8vIGVsc2Ugc3RvcmUgdGhlIHRva2VuIHJlY29yZCBpbiBpbiAnc2VydmljZXMucGFzc3dvcmQucmVzZXQnIGRiIGZpZWxkXG4gIGlmKHJlYXNvbiA9PT0gJ2Vucm9sbEFjY291bnQnKSB7XG4gICAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7X2lkOiB1c2VyLl9pZH0sIHtcbiAgICAgICRzZXQgOiB7XG4gICAgICAgICdzZXJ2aWNlcy5wYXNzd29yZC5lbnJvbGwnOiB0b2tlblJlY29yZFxuICAgICAgfVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIE1ldGVvci51c2Vycy51cGRhdGUoe19pZDogdXNlci5faWR9LCB7XG4gICAgICAkc2V0IDoge1xuICAgICAgICAnc2VydmljZXMucGFzc3dvcmQucmVzZXQnOiB0b2tlblJlY29yZFxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gYmVmb3JlIHBhc3NpbmcgdG8gdGVtcGxhdGUsIHVwZGF0ZSB1c2VyIG9iamVjdCB3aXRoIG5ldyB0b2tlblxuICBNZXRlb3IuX2Vuc3VyZSh1c2VyLCAnc2VydmljZXMnLCAncGFzc3dvcmQnKS5yZXNldCA9IHRva2VuUmVjb3JkO1xuICBNZXRlb3IuX2Vuc3VyZSh1c2VyLCAnc2VydmljZXMnLCAncGFzc3dvcmQnKS5lbnJvbGwgPSB0b2tlblJlY29yZDtcbiAgcmV0dXJuIHtlbWFpbCwgdXNlciwgdG9rZW59O1xufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBHZW5lcmF0ZXMgYW4gZS1tYWlsIHZlcmlmaWNhdGlvbiB0b2tlbiBhbmQgc2F2ZXMgaXQgaW50byB0aGUgZGF0YWJhc2UuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlcklkIFRoZSBpZCBvZiB0aGUgdXNlciB0byBnZW5lcmF0ZSB0aGUgIGUtbWFpbCB2ZXJpZmljYXRpb24gdG9rZW4gZm9yLlxuICogQHBhcmFtIHtTdHJpbmd9IGVtYWlsIFdoaWNoIGFkZHJlc3Mgb2YgdGhlIHVzZXIgdG8gZ2VuZXJhdGUgdGhlIGUtbWFpbCB2ZXJpZmljYXRpb24gdG9rZW4gZm9yLiBUaGlzIGFkZHJlc3MgbXVzdCBiZSBpbiB0aGUgdXNlcidzIGBlbWFpbHNgIGxpc3QuIElmIGBudWxsYCwgZGVmYXVsdHMgdG8gdGhlIGZpcnN0IHVudmVyaWZpZWQgZW1haWwgaW4gdGhlIGxpc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW2V4dHJhVG9rZW5EYXRhXSBPcHRpb25hbCBhZGRpdGlvbmFsIGRhdGEgdG8gYmUgYWRkZWQgaW50byB0aGUgdG9rZW4gcmVjb3JkLlxuICogQHJldHVybnMge09iamVjdH0gT2JqZWN0IHdpdGgge2VtYWlsLCB1c2VyLCB0b2tlbn0gdmFsdWVzLlxuICogQGltcG9ydEZyb21QYWNrYWdlIGFjY291bnRzLWJhc2VcbiAqL1xuQWNjb3VudHMuZ2VuZXJhdGVWZXJpZmljYXRpb25Ub2tlbiA9ICh1c2VySWQsIGVtYWlsLCBleHRyYVRva2VuRGF0YSkgPT4ge1xuICAvLyBNYWtlIHN1cmUgdGhlIHVzZXIgZXhpc3RzLCBhbmQgZW1haWwgaXMgb25lIG9mIHRoZWlyIGFkZHJlc3Nlcy5cbiAgLy8gRG9uJ3QgbGltaXQgdGhlIGZpZWxkcyBpbiB0aGUgdXNlciBvYmplY3Qgc2luY2UgdGhlIHVzZXIgaXMgcmV0dXJuZWRcbiAgLy8gYnkgdGhlIGZ1bmN0aW9uIGFuZCBzb21lIG90aGVyIGZpZWxkcyBtaWdodCBiZSB1c2VkIGVsc2V3aGVyZS5cbiAgY29uc3QgdXNlciA9IGdldFVzZXJCeUlkKHVzZXJJZCk7XG4gIGlmICghdXNlcikge1xuICAgIGhhbmRsZUVycm9yKFwiQ2FuJ3QgZmluZCB1c2VyXCIpO1xuICB9XG5cbiAgLy8gcGljayB0aGUgZmlyc3QgdW52ZXJpZmllZCBlbWFpbCBpZiB3ZSB3ZXJlbid0IHBhc3NlZCBhbiBlbWFpbC5cbiAgaWYgKCFlbWFpbCkge1xuICAgIGNvbnN0IGVtYWlsUmVjb3JkID0gKHVzZXIuZW1haWxzIHx8IFtdKS5maW5kKGUgPT4gIWUudmVyaWZpZWQpO1xuICAgIGVtYWlsID0gKGVtYWlsUmVjb3JkIHx8IHt9KS5hZGRyZXNzO1xuXG4gICAgaWYgKCFlbWFpbCkge1xuICAgICAgaGFuZGxlRXJyb3IoXCJUaGF0IHVzZXIgaGFzIG5vIHVudmVyaWZpZWQgZW1haWwgYWRkcmVzc2VzLlwiKTtcbiAgICB9XG4gIH1cblxuICAvLyBtYWtlIHN1cmUgd2UgaGF2ZSBhIHZhbGlkIGVtYWlsXG4gIGlmICghZW1haWwgfHxcbiAgICAhKHBsdWNrQWRkcmVzc2VzKHVzZXIuZW1haWxzKS5pbmNsdWRlcyhlbWFpbCkpKSB7XG4gICAgaGFuZGxlRXJyb3IoXCJObyBzdWNoIGVtYWlsIGZvciB1c2VyLlwiKTtcbiAgfVxuXG4gIGNvbnN0IHRva2VuID0gUmFuZG9tLnNlY3JldCgpO1xuICBjb25zdCB0b2tlblJlY29yZCA9IHtcbiAgICB0b2tlbixcbiAgICAvLyBUT0RPOiBUaGlzIHNob3VsZCBwcm9iYWJseSBiZSByZW5hbWVkIHRvIFwiZW1haWxcIiB0byBtYXRjaCByZXNldCB0b2tlbiByZWNvcmQuXG4gICAgYWRkcmVzczogZW1haWwsXG4gICAgd2hlbjogbmV3IERhdGUoKVxuICB9O1xuXG4gIGlmIChleHRyYVRva2VuRGF0YSkge1xuICAgIE9iamVjdC5hc3NpZ24odG9rZW5SZWNvcmQsIGV4dHJhVG9rZW5EYXRhKTtcbiAgfVxuXG4gIE1ldGVvci51c2Vycy51cGRhdGUoe19pZDogdXNlci5faWR9LCB7JHB1c2g6IHtcbiAgICAnc2VydmljZXMuZW1haWwudmVyaWZpY2F0aW9uVG9rZW5zJzogdG9rZW5SZWNvcmRcbiAgfX0pO1xuXG4gIC8vIGJlZm9yZSBwYXNzaW5nIHRvIHRlbXBsYXRlLCB1cGRhdGUgdXNlciBvYmplY3Qgd2l0aCBuZXcgdG9rZW5cbiAgTWV0ZW9yLl9lbnN1cmUodXNlciwgJ3NlcnZpY2VzJywgJ2VtYWlsJyk7XG4gIGlmICghdXNlci5zZXJ2aWNlcy5lbWFpbC52ZXJpZmljYXRpb25Ub2tlbnMpIHtcbiAgICB1c2VyLnNlcnZpY2VzLmVtYWlsLnZlcmlmaWNhdGlvblRva2VucyA9IFtdO1xuICB9XG4gIHVzZXIuc2VydmljZXMuZW1haWwudmVyaWZpY2F0aW9uVG9rZW5zLnB1c2godG9rZW5SZWNvcmQpO1xuXG4gIHJldHVybiB7ZW1haWwsIHVzZXIsIHRva2VufTtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgQ3JlYXRlcyBvcHRpb25zIGZvciBlbWFpbCBzZW5kaW5nIGZvciByZXNldCBwYXNzd29yZCBhbmQgZW5yb2xsIGFjY291bnQgZW1haWxzLlxuICogWW91IGNhbiB1c2UgdGhpcyBmdW5jdGlvbiB3aGVuIGN1c3RvbWl6aW5nIGEgcmVzZXQgcGFzc3dvcmQgb3IgZW5yb2xsIGFjY291bnQgZW1haWwgc2VuZGluZy5cbiAqIEBsb2N1cyBTZXJ2ZXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbWFpbCBXaGljaCBhZGRyZXNzIG9mIHRoZSB1c2VyJ3MgdG8gc2VuZCB0aGUgZW1haWwgdG8uXG4gKiBAcGFyYW0ge09iamVjdH0gdXNlciBUaGUgdXNlciBvYmplY3QgdG8gZ2VuZXJhdGUgb3B0aW9ucyBmb3IuXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsIFVSTCB0byB3aGljaCB1c2VyIGlzIGRpcmVjdGVkIHRvIGNvbmZpcm0gdGhlIGVtYWlsLlxuICogQHBhcmFtIHtTdHJpbmd9IHJlYXNvbiBgcmVzZXRQYXNzd29yZGAgb3IgYGVucm9sbEFjY291bnRgLlxuICogQHJldHVybnMge09iamVjdH0gT3B0aW9ucyB3aGljaCBjYW4gYmUgcGFzc2VkIHRvIGBFbWFpbC5zZW5kYC5cbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBhY2NvdW50cy1iYXNlXG4gKi9cbkFjY291bnRzLmdlbmVyYXRlT3B0aW9uc0ZvckVtYWlsID0gKGVtYWlsLCB1c2VyLCB1cmwsIHJlYXNvbikgPT4ge1xuICBjb25zdCBvcHRpb25zID0ge1xuICAgIHRvOiBlbWFpbCxcbiAgICBmcm9tOiBBY2NvdW50cy5lbWFpbFRlbXBsYXRlc1tyZWFzb25dLmZyb21cbiAgICAgID8gQWNjb3VudHMuZW1haWxUZW1wbGF0ZXNbcmVhc29uXS5mcm9tKHVzZXIpXG4gICAgICA6IEFjY291bnRzLmVtYWlsVGVtcGxhdGVzLmZyb20sXG4gICAgc3ViamVjdDogQWNjb3VudHMuZW1haWxUZW1wbGF0ZXNbcmVhc29uXS5zdWJqZWN0KHVzZXIpXG4gIH07XG5cbiAgaWYgKHR5cGVvZiBBY2NvdW50cy5lbWFpbFRlbXBsYXRlc1tyZWFzb25dLnRleHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBvcHRpb25zLnRleHQgPSBBY2NvdW50cy5lbWFpbFRlbXBsYXRlc1tyZWFzb25dLnRleHQodXNlciwgdXJsKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgQWNjb3VudHMuZW1haWxUZW1wbGF0ZXNbcmVhc29uXS5odG1sID09PSAnZnVuY3Rpb24nKSB7XG4gICAgb3B0aW9ucy5odG1sID0gQWNjb3VudHMuZW1haWxUZW1wbGF0ZXNbcmVhc29uXS5odG1sKHVzZXIsIHVybCk7XG4gIH1cblxuICBpZiAodHlwZW9mIEFjY291bnRzLmVtYWlsVGVtcGxhdGVzLmhlYWRlcnMgPT09ICdvYmplY3QnKSB7XG4gICAgb3B0aW9ucy5oZWFkZXJzID0gQWNjb3VudHMuZW1haWxUZW1wbGF0ZXMuaGVhZGVycztcbiAgfVxuXG4gIHJldHVybiBvcHRpb25zO1xufTtcblxuLy8gc2VuZCB0aGUgdXNlciBhbiBlbWFpbCB3aXRoIGEgbGluayB0aGF0IHdoZW4gb3BlbmVkIGFsbG93cyB0aGUgdXNlclxuLy8gdG8gc2V0IGEgbmV3IHBhc3N3b3JkLCB3aXRob3V0IHRoZSBvbGQgcGFzc3dvcmQuXG5cbi8qKlxuICogQHN1bW1hcnkgU2VuZCBhbiBlbWFpbCB3aXRoIGEgbGluayB0aGUgdXNlciBjYW4gdXNlIHRvIHJlc2V0IHRoZWlyIHBhc3N3b3JkLlxuICogQGxvY3VzIFNlcnZlclxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJJZCBUaGUgaWQgb2YgdGhlIHVzZXIgdG8gc2VuZCBlbWFpbCB0by5cbiAqIEBwYXJhbSB7U3RyaW5nfSBbZW1haWxdIE9wdGlvbmFsLiBXaGljaCBhZGRyZXNzIG9mIHRoZSB1c2VyJ3MgdG8gc2VuZCB0aGUgZW1haWwgdG8uIFRoaXMgYWRkcmVzcyBtdXN0IGJlIGluIHRoZSB1c2VyJ3MgYGVtYWlsc2AgbGlzdC4gRGVmYXVsdHMgdG8gdGhlIGZpcnN0IGVtYWlsIGluIHRoZSBsaXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtleHRyYVRva2VuRGF0YV0gT3B0aW9uYWwgYWRkaXRpb25hbCBkYXRhIHRvIGJlIGFkZGVkIGludG8gdGhlIHRva2VuIHJlY29yZC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbZXh0cmFQYXJhbXNdIE9wdGlvbmFsIGFkZGl0aW9uYWwgcGFyYW1zIHRvIGJlIGFkZGVkIHRvIHRoZSByZXNldCB1cmwuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBPYmplY3Qgd2l0aCB7ZW1haWwsIHVzZXIsIHRva2VuLCB1cmwsIG9wdGlvbnN9IHZhbHVlcy5cbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBhY2NvdW50cy1iYXNlXG4gKi9cbkFjY291bnRzLnNlbmRSZXNldFBhc3N3b3JkRW1haWwgPSAodXNlcklkLCBlbWFpbCwgZXh0cmFUb2tlbkRhdGEsIGV4dHJhUGFyYW1zKSA9PiB7XG4gIGNvbnN0IHtlbWFpbDogcmVhbEVtYWlsLCB1c2VyLCB0b2tlbn0gPVxuICAgIEFjY291bnRzLmdlbmVyYXRlUmVzZXRUb2tlbih1c2VySWQsIGVtYWlsLCAncmVzZXRQYXNzd29yZCcsIGV4dHJhVG9rZW5EYXRhKTtcbiAgY29uc3QgdXJsID0gQWNjb3VudHMudXJscy5yZXNldFBhc3N3b3JkKHRva2VuLCBleHRyYVBhcmFtcyk7XG4gIGNvbnN0IG9wdGlvbnMgPSBBY2NvdW50cy5nZW5lcmF0ZU9wdGlvbnNGb3JFbWFpbChyZWFsRW1haWwsIHVzZXIsIHVybCwgJ3Jlc2V0UGFzc3dvcmQnKTtcbiAgRW1haWwuc2VuZChvcHRpb25zKTtcbiAgaWYgKE1ldGVvci5pc0RldmVsb3BtZW50KSB7XG4gICAgY29uc29sZS5sb2coYFxcblJlc2V0IHBhc3N3b3JkIFVSTDogJHt1cmx9YCk7XG4gIH1cbiAgcmV0dXJuIHtlbWFpbDogcmVhbEVtYWlsLCB1c2VyLCB0b2tlbiwgdXJsLCBvcHRpb25zfTtcbn07XG5cbi8vIHNlbmQgdGhlIHVzZXIgYW4gZW1haWwgaW5mb3JtaW5nIHRoZW0gdGhhdCB0aGVpciBhY2NvdW50IHdhcyBjcmVhdGVkLCB3aXRoXG4vLyBhIGxpbmsgdGhhdCB3aGVuIG9wZW5lZCBib3RoIG1hcmtzIHRoZWlyIGVtYWlsIGFzIHZlcmlmaWVkIGFuZCBmb3JjZXMgdGhlbVxuLy8gdG8gY2hvb3NlIHRoZWlyIHBhc3N3b3JkLiBUaGUgZW1haWwgbXVzdCBiZSBvbmUgb2YgdGhlIGFkZHJlc3NlcyBpbiB0aGVcbi8vIHVzZXIncyBlbWFpbHMgZmllbGQsIG9yIHVuZGVmaW5lZCB0byBwaWNrIHRoZSBmaXJzdCBlbWFpbCBhdXRvbWF0aWNhbGx5LlxuLy9cbi8vIFRoaXMgaXMgbm90IGNhbGxlZCBhdXRvbWF0aWNhbGx5LiBJdCBtdXN0IGJlIGNhbGxlZCBtYW51YWxseSBpZiB5b3Vcbi8vIHdhbnQgdG8gdXNlIGVucm9sbG1lbnQgZW1haWxzLlxuXG4vKipcbiAqIEBzdW1tYXJ5IFNlbmQgYW4gZW1haWwgd2l0aCBhIGxpbmsgdGhlIHVzZXIgY2FuIHVzZSB0byBzZXQgdGhlaXIgaW5pdGlhbCBwYXNzd29yZC5cbiAqIEBsb2N1cyBTZXJ2ZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VySWQgVGhlIGlkIG9mIHRoZSB1c2VyIHRvIHNlbmQgZW1haWwgdG8uXG4gKiBAcGFyYW0ge1N0cmluZ30gW2VtYWlsXSBPcHRpb25hbC4gV2hpY2ggYWRkcmVzcyBvZiB0aGUgdXNlcidzIHRvIHNlbmQgdGhlIGVtYWlsIHRvLiBUaGlzIGFkZHJlc3MgbXVzdCBiZSBpbiB0aGUgdXNlcidzIGBlbWFpbHNgIGxpc3QuIERlZmF1bHRzIHRvIHRoZSBmaXJzdCBlbWFpbCBpbiB0aGUgbGlzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbZXh0cmFUb2tlbkRhdGFdIE9wdGlvbmFsIGFkZGl0aW9uYWwgZGF0YSB0byBiZSBhZGRlZCBpbnRvIHRoZSB0b2tlbiByZWNvcmQuXG4gKiBAcGFyYW0ge09iamVjdH0gW2V4dHJhUGFyYW1zXSBPcHRpb25hbCBhZGRpdGlvbmFsIHBhcmFtcyB0byBiZSBhZGRlZCB0byB0aGUgZW5yb2xsbWVudCB1cmwuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBPYmplY3Qgd2l0aCB7ZW1haWwsIHVzZXIsIHRva2VuLCB1cmwsIG9wdGlvbnN9IHZhbHVlcy5cbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBhY2NvdW50cy1iYXNlXG4gKi9cbkFjY291bnRzLnNlbmRFbnJvbGxtZW50RW1haWwgPSAodXNlcklkLCBlbWFpbCwgZXh0cmFUb2tlbkRhdGEsIGV4dHJhUGFyYW1zKSA9PiB7XG4gIGNvbnN0IHtlbWFpbDogcmVhbEVtYWlsLCB1c2VyLCB0b2tlbn0gPVxuICAgIEFjY291bnRzLmdlbmVyYXRlUmVzZXRUb2tlbih1c2VySWQsIGVtYWlsLCAnZW5yb2xsQWNjb3VudCcsIGV4dHJhVG9rZW5EYXRhKTtcbiAgY29uc3QgdXJsID0gQWNjb3VudHMudXJscy5lbnJvbGxBY2NvdW50KHRva2VuLCBleHRyYVBhcmFtcyk7XG4gIGNvbnN0IG9wdGlvbnMgPSBBY2NvdW50cy5nZW5lcmF0ZU9wdGlvbnNGb3JFbWFpbChyZWFsRW1haWwsIHVzZXIsIHVybCwgJ2Vucm9sbEFjY291bnQnKTtcbiAgRW1haWwuc2VuZChvcHRpb25zKTtcbiAgaWYgKE1ldGVvci5pc0RldmVsb3BtZW50KSB7XG4gICAgY29uc29sZS5sb2coYFxcbkVucm9sbG1lbnQgZW1haWwgVVJMOiAke3VybH1gKTtcbiAgfVxuICByZXR1cm4ge2VtYWlsOiByZWFsRW1haWwsIHVzZXIsIHRva2VuLCB1cmwsIG9wdGlvbnN9O1xufTtcblxuXG4vLyBUYWtlIHRva2VuIGZyb20gc2VuZFJlc2V0UGFzc3dvcmRFbWFpbCBvciBzZW5kRW5yb2xsbWVudEVtYWlsLCBjaGFuZ2Vcbi8vIHRoZSB1c2VycyBwYXNzd29yZCwgYW5kIGxvZyB0aGVtIGluLlxuTWV0ZW9yLm1ldGhvZHMoe3Jlc2V0UGFzc3dvcmQ6IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gIGNvbnN0IHRva2VuID0gYXJnc1swXTtcbiAgY29uc3QgbmV3UGFzc3dvcmQgPSBhcmdzWzFdO1xuICByZXR1cm4gQWNjb3VudHMuX2xvZ2luTWV0aG9kKFxuICAgIHRoaXMsXG4gICAgXCJyZXNldFBhc3N3b3JkXCIsXG4gICAgYXJncyxcbiAgICBcInBhc3N3b3JkXCIsXG4gICAgKCkgPT4ge1xuICAgICAgY2hlY2sodG9rZW4sIFN0cmluZyk7XG4gICAgICBjaGVjayhuZXdQYXNzd29yZCwgcGFzc3dvcmRWYWxpZGF0b3IpO1xuXG4gICAgICBsZXQgdXNlciA9IE1ldGVvci51c2Vycy5maW5kT25lKFxuICAgICAgICB7XCJzZXJ2aWNlcy5wYXNzd29yZC5yZXNldC50b2tlblwiOiB0b2tlbn0sXG4gICAgICAgIHtmaWVsZHM6IHtcbiAgICAgICAgICBzZXJ2aWNlczogMSxcbiAgICAgICAgICBlbWFpbHM6IDEsXG4gICAgICAgIH19XG4gICAgICApO1xuICAgICBcbiAgICAgIGxldCBpc0Vucm9sbCA9IGZhbHNlO1xuICAgICAgLy8gaWYgdG9rZW4gaXMgaW4gc2VydmljZXMucGFzc3dvcmQucmVzZXQgZGIgZmllbGQgaW1wbGllc1xuICAgICAgLy8gdGhpcyBtZXRob2QgaXMgd2FzIG5vdCBjYWxsZWQgZnJvbSBlbnJvbGwgYWNjb3VudCB3b3JrZmxvd1xuICAgICAgLy8gZWxzZSB0aGlzIG1ldGhvZCBpcyBjYWxsZWQgZnJvbSBlbnJvbGwgYWNjb3VudCB3b3JrZmxvd1xuICAgICAgaWYoIXVzZXIpIHtcbiAgICAgICAgdXNlciA9IE1ldGVvci51c2Vycy5maW5kT25lKFxuICAgICAgICAgIHtcInNlcnZpY2VzLnBhc3N3b3JkLmVucm9sbC50b2tlblwiOiB0b2tlbn0sXG4gICAgICAgICAge2ZpZWxkczoge1xuICAgICAgICAgICAgc2VydmljZXM6IDEsXG4gICAgICAgICAgICBlbWFpbHM6IDEsXG4gICAgICAgICAgfX1cbiAgICAgICAgKTtcbiAgICAgICAgaXNFbnJvbGwgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIlRva2VuIGV4cGlyZWRcIik7XG4gICAgICB9XG4gICAgICBsZXQgdG9rZW5SZWNvcmQgPSB7fTtcbiAgICAgIGlmKGlzRW5yb2xsKSB7XG4gICAgICAgIHRva2VuUmVjb3JkID0gdXNlci5zZXJ2aWNlcy5wYXNzd29yZC5lbnJvbGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b2tlblJlY29yZCA9IHVzZXIuc2VydmljZXMucGFzc3dvcmQucmVzZXQ7XG4gICAgICB9XG4gICAgICBjb25zdCB7IHdoZW4sIHJlYXNvbiwgZW1haWwgfSA9IHRva2VuUmVjb3JkO1xuICAgICAgbGV0IHRva2VuTGlmZXRpbWVNcyA9IEFjY291bnRzLl9nZXRQYXNzd29yZFJlc2V0VG9rZW5MaWZldGltZU1zKCk7XG4gICAgICBpZiAocmVhc29uID09PSBcImVucm9sbFwiKSB7XG4gICAgICAgIHRva2VuTGlmZXRpbWVNcyA9IEFjY291bnRzLl9nZXRQYXNzd29yZEVucm9sbFRva2VuTGlmZXRpbWVNcygpO1xuICAgICAgfVxuICAgICAgY29uc3QgY3VycmVudFRpbWVNcyA9IERhdGUubm93KCk7XG4gICAgICBpZiAoKGN1cnJlbnRUaW1lTXMgLSB3aGVuKSA+IHRva2VuTGlmZXRpbWVNcylcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVG9rZW4gZXhwaXJlZFwiKTtcbiAgICAgIGlmICghKHBsdWNrQWRkcmVzc2VzKHVzZXIuZW1haWxzKS5pbmNsdWRlcyhlbWFpbCkpKVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHVzZXJJZDogdXNlci5faWQsXG4gICAgICAgICAgZXJyb3I6IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIlRva2VuIGhhcyBpbnZhbGlkIGVtYWlsIGFkZHJlc3NcIilcbiAgICAgICAgfTtcblxuICAgICAgY29uc3QgaGFzaGVkID0gaGFzaFBhc3N3b3JkKG5ld1Bhc3N3b3JkKTsgICAgIFxuXG4gICAgICAvLyBOT1RFOiBXZSdyZSBhYm91dCB0byBpbnZhbGlkYXRlIHRva2VucyBvbiB0aGUgdXNlciwgd2hvIHdlIG1pZ2h0IGJlXG4gICAgICAvLyBsb2dnZWQgaW4gYXMuIE1ha2Ugc3VyZSB0byBhdm9pZCBsb2dnaW5nIG91cnNlbHZlcyBvdXQgaWYgdGhpc1xuICAgICAgLy8gaGFwcGVucy4gQnV0IGFsc28gbWFrZSBzdXJlIG5vdCB0byBsZWF2ZSB0aGUgY29ubmVjdGlvbiBpbiBhIHN0YXRlXG4gICAgICAvLyBvZiBoYXZpbmcgYSBiYWQgdG9rZW4gc2V0IGlmIHRoaW5ncyBmYWlsLlxuICAgICAgY29uc3Qgb2xkVG9rZW4gPSBBY2NvdW50cy5fZ2V0TG9naW5Ub2tlbih0aGlzLmNvbm5lY3Rpb24uaWQpO1xuICAgICAgQWNjb3VudHMuX3NldExvZ2luVG9rZW4odXNlci5faWQsIHRoaXMuY29ubmVjdGlvbiwgbnVsbCk7XG4gICAgICBjb25zdCByZXNldFRvT2xkVG9rZW4gPSAoKSA9PlxuICAgICAgICBBY2NvdW50cy5fc2V0TG9naW5Ub2tlbih1c2VyLl9pZCwgdGhpcy5jb25uZWN0aW9uLCBvbGRUb2tlbik7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgdXNlciByZWNvcmQgYnk6XG4gICAgICAgIC8vIC0gQ2hhbmdpbmcgdGhlIHBhc3N3b3JkIHRvIHRoZSBuZXcgb25lXG4gICAgICAgIC8vIC0gRm9yZ2V0dGluZyBhYm91dCB0aGUgcmVzZXQgdG9rZW4gb3IgZW5yb2xsIHRva2VuIHRoYXQgd2FzIGp1c3QgdXNlZFxuICAgICAgICAvLyAtIFZlcmlmeWluZyB0aGVpciBlbWFpbCwgc2luY2UgdGhleSBnb3QgdGhlIHBhc3N3b3JkIHJlc2V0IHZpYSBlbWFpbC5cbiAgICAgICAgbGV0IGFmZmVjdGVkUmVjb3JkcyA9IHt9O1xuICAgICAgICAvLyBpZiByZWFzb24gaXMgZW5yb2xsIHRoZW4gY2hlY2sgc2VydmljZXMucGFzc3dvcmQuZW5yb2xsLnRva2VuIGZpZWxkIGZvciBhZmZlY3RlZCByZWNvcmRzXG4gICAgICAgIGlmKHJlYXNvbiA9PT0gJ2Vucm9sbCcpIHtcbiAgICAgICAgICBhZmZlY3RlZFJlY29yZHMgPSBNZXRlb3IudXNlcnMudXBkYXRlKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBfaWQ6IHVzZXIuX2lkLFxuICAgICAgICAgICAgICAnZW1haWxzLmFkZHJlc3MnOiBlbWFpbCxcbiAgICAgICAgICAgICAgJ3NlcnZpY2VzLnBhc3N3b3JkLmVucm9sbC50b2tlbic6IHRva2VuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyRzZXQ6IHsnc2VydmljZXMucGFzc3dvcmQuYmNyeXB0JzogaGFzaGVkLFxuICAgICAgICAgICAgICAgICAgICAnZW1haWxzLiQudmVyaWZpZWQnOiB0cnVlfSxcbiAgICAgICAgICAgICAgJHVuc2V0OiB7J3NlcnZpY2VzLnBhc3N3b3JkLmVucm9sbCc6IDEgfX0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFmZmVjdGVkUmVjb3JkcyA9IE1ldGVvci51c2Vycy51cGRhdGUoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIF9pZDogdXNlci5faWQsXG4gICAgICAgICAgICAgICdlbWFpbHMuYWRkcmVzcyc6IGVtYWlsLFxuICAgICAgICAgICAgICAnc2VydmljZXMucGFzc3dvcmQucmVzZXQudG9rZW4nOiB0b2tlblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHskc2V0OiB7J3NlcnZpY2VzLnBhc3N3b3JkLmJjcnlwdCc6IGhhc2hlZCxcbiAgICAgICAgICAgICAgICAgICAgJ2VtYWlscy4kLnZlcmlmaWVkJzogdHJ1ZX0sXG4gICAgICAgICAgICAgICR1bnNldDogeydzZXJ2aWNlcy5wYXNzd29yZC5yZXNldCc6IDEgfX0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhZmZlY3RlZFJlY29yZHMgIT09IDEpXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHVzZXJJZDogdXNlci5faWQsXG4gICAgICAgICAgICBlcnJvcjogbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiSW52YWxpZCBlbWFpbFwiKVxuICAgICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmVzZXRUb09sZFRva2VuKCk7XG4gICAgICAgIHRocm93IGVycjtcbiAgICAgIH1cblxuICAgICAgLy8gUmVwbGFjZSBhbGwgdmFsaWQgbG9naW4gdG9rZW5zIHdpdGggbmV3IG9uZXMgKGNoYW5naW5nXG4gICAgICAvLyBwYXNzd29yZCBzaG91bGQgaW52YWxpZGF0ZSBleGlzdGluZyBzZXNzaW9ucykuXG4gICAgICBBY2NvdW50cy5fY2xlYXJBbGxMb2dpblRva2Vucyh1c2VyLl9pZCk7XG5cbiAgICAgIHJldHVybiB7dXNlcklkOiB1c2VyLl9pZH07XG4gICAgfVxuICApO1xufX0pO1xuXG4vLy9cbi8vLyBFTUFJTCBWRVJJRklDQVRJT05cbi8vL1xuXG5cbi8vIHNlbmQgdGhlIHVzZXIgYW4gZW1haWwgd2l0aCBhIGxpbmsgdGhhdCB3aGVuIG9wZW5lZCBtYXJrcyB0aGF0XG4vLyBhZGRyZXNzIGFzIHZlcmlmaWVkXG5cbi8qKlxuICogQHN1bW1hcnkgU2VuZCBhbiBlbWFpbCB3aXRoIGEgbGluayB0aGUgdXNlciBjYW4gdXNlIHZlcmlmeSB0aGVpciBlbWFpbCBhZGRyZXNzLlxuICogQGxvY3VzIFNlcnZlclxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJJZCBUaGUgaWQgb2YgdGhlIHVzZXIgdG8gc2VuZCBlbWFpbCB0by5cbiAqIEBwYXJhbSB7U3RyaW5nfSBbZW1haWxdIE9wdGlvbmFsLiBXaGljaCBhZGRyZXNzIG9mIHRoZSB1c2VyJ3MgdG8gc2VuZCB0aGUgZW1haWwgdG8uIFRoaXMgYWRkcmVzcyBtdXN0IGJlIGluIHRoZSB1c2VyJ3MgYGVtYWlsc2AgbGlzdC4gRGVmYXVsdHMgdG8gdGhlIGZpcnN0IHVudmVyaWZpZWQgZW1haWwgaW4gdGhlIGxpc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW2V4dHJhVG9rZW5EYXRhXSBPcHRpb25hbCBhZGRpdGlvbmFsIGRhdGEgdG8gYmUgYWRkZWQgaW50byB0aGUgdG9rZW4gcmVjb3JkLlxuICogQHBhcmFtIHtPYmplY3R9IFtleHRyYVBhcmFtc10gT3B0aW9uYWwgYWRkaXRpb25hbCBwYXJhbXMgdG8gYmUgYWRkZWQgdG8gdGhlIHZlcmlmaWNhdGlvbiB1cmwuXG4gKlxuICogQHJldHVybnMge09iamVjdH0gT2JqZWN0IHdpdGgge2VtYWlsLCB1c2VyLCB0b2tlbiwgdXJsLCBvcHRpb25zfSB2YWx1ZXMuXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgYWNjb3VudHMtYmFzZVxuICovXG5BY2NvdW50cy5zZW5kVmVyaWZpY2F0aW9uRW1haWwgPSAodXNlcklkLCBlbWFpbCwgZXh0cmFUb2tlbkRhdGEsIGV4dHJhUGFyYW1zKSA9PiB7XG4gIC8vIFhYWCBBbHNvIGdlbmVyYXRlIGEgbGluayB1c2luZyB3aGljaCBzb21lb25lIGNhbiBkZWxldGUgdGhpc1xuICAvLyBhY2NvdW50IGlmIHRoZXkgb3duIHNhaWQgYWRkcmVzcyBidXQgd2VyZW4ndCB0aG9zZSB3aG8gY3JlYXRlZFxuICAvLyB0aGlzIGFjY291bnQuXG5cbiAgY29uc3Qge2VtYWlsOiByZWFsRW1haWwsIHVzZXIsIHRva2VufSA9XG4gICAgQWNjb3VudHMuZ2VuZXJhdGVWZXJpZmljYXRpb25Ub2tlbih1c2VySWQsIGVtYWlsLCBleHRyYVRva2VuRGF0YSk7XG4gIGNvbnN0IHVybCA9IEFjY291bnRzLnVybHMudmVyaWZ5RW1haWwodG9rZW4sIGV4dHJhUGFyYW1zKTtcbiAgY29uc3Qgb3B0aW9ucyA9IEFjY291bnRzLmdlbmVyYXRlT3B0aW9uc0ZvckVtYWlsKHJlYWxFbWFpbCwgdXNlciwgdXJsLCAndmVyaWZ5RW1haWwnKTtcbiAgRW1haWwuc2VuZChvcHRpb25zKTtcbiAgaWYgKE1ldGVvci5pc0RldmVsb3BtZW50KSB7XG4gICAgY29uc29sZS5sb2coYFxcblZlcmlmaWNhdGlvbiBlbWFpbCBVUkw6ICR7dXJsfWApO1xuICB9XG4gIHJldHVybiB7ZW1haWw6IHJlYWxFbWFpbCwgdXNlciwgdG9rZW4sIHVybCwgb3B0aW9uc307XG59O1xuXG4vLyBUYWtlIHRva2VuIGZyb20gc2VuZFZlcmlmaWNhdGlvbkVtYWlsLCBtYXJrIHRoZSBlbWFpbCBhcyB2ZXJpZmllZCxcbi8vIGFuZCBsb2cgdGhlbSBpbi5cbk1ldGVvci5tZXRob2RzKHt2ZXJpZnlFbWFpbDogZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgY29uc3QgdG9rZW4gPSBhcmdzWzBdO1xuICByZXR1cm4gQWNjb3VudHMuX2xvZ2luTWV0aG9kKFxuICAgIHRoaXMsXG4gICAgXCJ2ZXJpZnlFbWFpbFwiLFxuICAgIGFyZ3MsXG4gICAgXCJwYXNzd29yZFwiLFxuICAgICgpID0+IHtcbiAgICAgIGNoZWNrKHRva2VuLCBTdHJpbmcpO1xuXG4gICAgICBjb25zdCB1c2VyID0gTWV0ZW9yLnVzZXJzLmZpbmRPbmUoXG4gICAgICAgIHsnc2VydmljZXMuZW1haWwudmVyaWZpY2F0aW9uVG9rZW5zLnRva2VuJzogdG9rZW59LFxuICAgICAgICB7ZmllbGRzOiB7XG4gICAgICAgICAgc2VydmljZXM6IDEsXG4gICAgICAgICAgZW1haWxzOiAxLFxuICAgICAgICB9fVxuICAgICAgKTtcbiAgICAgIGlmICghdXNlcilcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVmVyaWZ5IGVtYWlsIGxpbmsgZXhwaXJlZFwiKTtcblxuICAgICAgICBjb25zdCB0b2tlblJlY29yZCA9IHVzZXIuc2VydmljZXMuZW1haWwudmVyaWZpY2F0aW9uVG9rZW5zLmZpbmQoXG4gICAgICAgICAgdCA9PiB0LnRva2VuID09IHRva2VuXG4gICAgICAgICk7XG4gICAgICBpZiAoIXRva2VuUmVjb3JkKVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHVzZXJJZDogdXNlci5faWQsXG4gICAgICAgICAgZXJyb3I6IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIlZlcmlmeSBlbWFpbCBsaW5rIGV4cGlyZWRcIilcbiAgICAgICAgfTtcblxuICAgICAgY29uc3QgZW1haWxzUmVjb3JkID0gdXNlci5lbWFpbHMuZmluZChcbiAgICAgICAgZSA9PiBlLmFkZHJlc3MgPT0gdG9rZW5SZWNvcmQuYWRkcmVzc1xuICAgICAgKTtcbiAgICAgIGlmICghZW1haWxzUmVjb3JkKVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHVzZXJJZDogdXNlci5faWQsXG4gICAgICAgICAgZXJyb3I6IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIlZlcmlmeSBlbWFpbCBsaW5rIGlzIGZvciB1bmtub3duIGFkZHJlc3NcIilcbiAgICAgICAgfTtcblxuICAgICAgLy8gQnkgaW5jbHVkaW5nIHRoZSBhZGRyZXNzIGluIHRoZSBxdWVyeSwgd2UgY2FuIHVzZSAnZW1haWxzLiQnIGluIHRoZVxuICAgICAgLy8gbW9kaWZpZXIgdG8gZ2V0IGEgcmVmZXJlbmNlIHRvIHRoZSBzcGVjaWZpYyBvYmplY3QgaW4gdGhlIGVtYWlsc1xuICAgICAgLy8gYXJyYXkuIFNlZVxuICAgICAgLy8gaHR0cDovL3d3dy5tb25nb2RiLm9yZy9kaXNwbGF5L0RPQ1MvVXBkYXRpbmcvI1VwZGF0aW5nLVRoZSUyNHBvc2l0aW9uYWxvcGVyYXRvcilcbiAgICAgIC8vIGh0dHA6Ly93d3cubW9uZ29kYi5vcmcvZGlzcGxheS9ET0NTL1VwZGF0aW5nI1VwZGF0aW5nLSUyNHB1bGxcbiAgICAgIE1ldGVvci51c2Vycy51cGRhdGUoXG4gICAgICAgIHtfaWQ6IHVzZXIuX2lkLFxuICAgICAgICAgJ2VtYWlscy5hZGRyZXNzJzogdG9rZW5SZWNvcmQuYWRkcmVzc30sXG4gICAgICAgIHskc2V0OiB7J2VtYWlscy4kLnZlcmlmaWVkJzogdHJ1ZX0sXG4gICAgICAgICAkcHVsbDogeydzZXJ2aWNlcy5lbWFpbC52ZXJpZmljYXRpb25Ub2tlbnMnOiB7YWRkcmVzczogdG9rZW5SZWNvcmQuYWRkcmVzc319fSk7XG5cbiAgICAgIHJldHVybiB7dXNlcklkOiB1c2VyLl9pZH07XG4gICAgfVxuICApO1xufX0pO1xuXG4vKipcbiAqIEBzdW1tYXJ5IEFkZCBhbiBlbWFpbCBhZGRyZXNzIGZvciBhIHVzZXIuIFVzZSB0aGlzIGluc3RlYWQgb2YgZGlyZWN0bHlcbiAqIHVwZGF0aW5nIHRoZSBkYXRhYmFzZS4gVGhlIG9wZXJhdGlvbiB3aWxsIGZhaWwgaWYgdGhlcmUgaXMgYSBkaWZmZXJlbnQgdXNlclxuICogd2l0aCBhbiBlbWFpbCBvbmx5IGRpZmZlcmluZyBpbiBjYXNlLiBJZiB0aGUgc3BlY2lmaWVkIHVzZXIgaGFzIGFuIGV4aXN0aW5nXG4gKiBlbWFpbCBvbmx5IGRpZmZlcmluZyBpbiBjYXNlIGhvd2V2ZXIsIHdlIHJlcGxhY2UgaXQuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlcklkIFRoZSBJRCBvZiB0aGUgdXNlciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmV3RW1haWwgQSBuZXcgZW1haWwgYWRkcmVzcyBmb3IgdGhlIHVzZXIuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFt2ZXJpZmllZF0gT3B0aW9uYWwgLSB3aGV0aGVyIHRoZSBuZXcgZW1haWwgYWRkcmVzcyBzaG91bGRcbiAqIGJlIG1hcmtlZCBhcyB2ZXJpZmllZC4gRGVmYXVsdHMgdG8gZmFsc2UuXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgYWNjb3VudHMtYmFzZVxuICovXG5BY2NvdW50cy5hZGRFbWFpbCA9ICh1c2VySWQsIG5ld0VtYWlsLCB2ZXJpZmllZCkgPT4ge1xuICBjaGVjayh1c2VySWQsIE5vbkVtcHR5U3RyaW5nKTtcbiAgY2hlY2sobmV3RW1haWwsIE5vbkVtcHR5U3RyaW5nKTtcbiAgY2hlY2sodmVyaWZpZWQsIE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pKTtcblxuICBpZiAodmVyaWZpZWQgPT09IHZvaWQgMCkge1xuICAgIHZlcmlmaWVkID0gZmFsc2U7XG4gIH1cblxuICBjb25zdCB1c2VyID0gZ2V0VXNlckJ5SWQodXNlcklkLCB7ZmllbGRzOiB7ZW1haWxzOiAxfX0pO1xuICBpZiAoIXVzZXIpXG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVXNlciBub3QgZm91bmRcIik7XG5cbiAgLy8gQWxsb3cgdXNlcnMgdG8gY2hhbmdlIHRoZWlyIG93biBlbWFpbCB0byBhIHZlcnNpb24gd2l0aCBhIGRpZmZlcmVudCBjYXNlXG5cbiAgLy8gV2UgZG9uJ3QgaGF2ZSB0byBjYWxsIGNoZWNrRm9yQ2FzZUluc2Vuc2l0aXZlRHVwbGljYXRlcyB0byBkbyBhIGNhc2VcbiAgLy8gaW5zZW5zaXRpdmUgY2hlY2sgYWNyb3NzIGFsbCBlbWFpbHMgaW4gdGhlIGRhdGFiYXNlIGhlcmUgYmVjYXVzZTogKDEpIGlmXG4gIC8vIHRoZXJlIGlzIG5vIGNhc2UtaW5zZW5zaXRpdmUgZHVwbGljYXRlIGJldHdlZW4gdGhpcyB1c2VyIGFuZCBvdGhlciB1c2VycyxcbiAgLy8gdGhlbiB3ZSBhcmUgT0sgYW5kICgyKSBpZiB0aGlzIHdvdWxkIGNyZWF0ZSBhIGNvbmZsaWN0IHdpdGggb3RoZXIgdXNlcnNcbiAgLy8gdGhlbiB0aGVyZSB3b3VsZCBhbHJlYWR5IGJlIGEgY2FzZS1pbnNlbnNpdGl2ZSBkdXBsaWNhdGUgYW5kIHdlIGNhbid0IGZpeFxuICAvLyB0aGF0IGluIHRoaXMgY29kZSBhbnl3YXkuXG4gIGNvbnN0IGNhc2VJbnNlbnNpdGl2ZVJlZ0V4cCA9XG4gICAgbmV3IFJlZ0V4cChgXiR7TWV0ZW9yLl9lc2NhcGVSZWdFeHAobmV3RW1haWwpfSRgLCAnaScpO1xuXG4gIGNvbnN0IGRpZFVwZGF0ZU93bkVtYWlsID0gKHVzZXIuZW1haWxzIHx8IFtdKS5yZWR1Y2UoXG4gICAgKHByZXYsIGVtYWlsKSA9PiB7XG4gICAgICBpZiAoY2FzZUluc2Vuc2l0aXZlUmVnRXhwLnRlc3QoZW1haWwuYWRkcmVzcykpIHtcbiAgICAgICAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7XG4gICAgICAgICAgX2lkOiB1c2VyLl9pZCxcbiAgICAgICAgICAnZW1haWxzLmFkZHJlc3MnOiBlbWFpbC5hZGRyZXNzXG4gICAgICAgIH0sIHskc2V0OiB7XG4gICAgICAgICAgJ2VtYWlscy4kLmFkZHJlc3MnOiBuZXdFbWFpbCxcbiAgICAgICAgICAnZW1haWxzLiQudmVyaWZpZWQnOiB2ZXJpZmllZFxuICAgICAgICB9fSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHByZXY7XG4gICAgICB9XG4gICAgfSxcbiAgICBmYWxzZVxuICApO1xuXG4gIC8vIEluIHRoZSBvdGhlciB1cGRhdGVzIGJlbG93LCB3ZSBoYXZlIHRvIGRvIGFub3RoZXIgY2FsbCB0b1xuICAvLyBjaGVja0ZvckNhc2VJbnNlbnNpdGl2ZUR1cGxpY2F0ZXMgdG8gbWFrZSBzdXJlIHRoYXQgbm8gY29uZmxpY3RpbmcgdmFsdWVzXG4gIC8vIHdlcmUgYWRkZWQgdG8gdGhlIGRhdGFiYXNlIGluIHRoZSBtZWFudGltZS4gV2UgZG9uJ3QgaGF2ZSB0byBkbyB0aGlzIGZvclxuICAvLyB0aGUgY2FzZSB3aGVyZSB0aGUgdXNlciBpcyB1cGRhdGluZyB0aGVpciBlbWFpbCBhZGRyZXNzIHRvIG9uZSB0aGF0IGlzIHRoZVxuICAvLyBzYW1lIGFzIGJlZm9yZSwgYnV0IG9ubHkgZGlmZmVyZW50IGJlY2F1c2Ugb2YgY2FwaXRhbGl6YXRpb24uIFJlYWQgdGhlXG4gIC8vIGJpZyBjb21tZW50IGFib3ZlIHRvIHVuZGVyc3RhbmQgd2h5LlxuXG4gIGlmIChkaWRVcGRhdGVPd25FbWFpbCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFBlcmZvcm0gYSBjYXNlIGluc2Vuc2l0aXZlIGNoZWNrIGZvciBkdXBsaWNhdGVzIGJlZm9yZSB1cGRhdGVcbiAgY2hlY2tGb3JDYXNlSW5zZW5zaXRpdmVEdXBsaWNhdGVzKCdlbWFpbHMuYWRkcmVzcycsICdFbWFpbCcsIG5ld0VtYWlsLCB1c2VyLl9pZCk7XG5cbiAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7XG4gICAgX2lkOiB1c2VyLl9pZFxuICB9LCB7XG4gICAgJGFkZFRvU2V0OiB7XG4gICAgICBlbWFpbHM6IHtcbiAgICAgICAgYWRkcmVzczogbmV3RW1haWwsXG4gICAgICAgIHZlcmlmaWVkOiB2ZXJpZmllZFxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgLy8gUGVyZm9ybSBhbm90aGVyIGNoZWNrIGFmdGVyIHVwZGF0ZSwgaW4gY2FzZSBhIG1hdGNoaW5nIHVzZXIgaGFzIGJlZW5cbiAgLy8gaW5zZXJ0ZWQgaW4gdGhlIG1lYW50aW1lXG4gIHRyeSB7XG4gICAgY2hlY2tGb3JDYXNlSW5zZW5zaXRpdmVEdXBsaWNhdGVzKCdlbWFpbHMuYWRkcmVzcycsICdFbWFpbCcsIG5ld0VtYWlsLCB1c2VyLl9pZCk7XG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgLy8gVW5kbyB1cGRhdGUgaWYgdGhlIGNoZWNrIGZhaWxzXG4gICAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7X2lkOiB1c2VyLl9pZH0sXG4gICAgICB7JHB1bGw6IHtlbWFpbHM6IHthZGRyZXNzOiBuZXdFbWFpbH19fSk7XG4gICAgdGhyb3cgZXg7XG4gIH1cbn1cblxuLyoqXG4gKiBAc3VtbWFyeSBSZW1vdmUgYW4gZW1haWwgYWRkcmVzcyBmb3IgYSB1c2VyLiBVc2UgdGhpcyBpbnN0ZWFkIG9mIHVwZGF0aW5nXG4gKiB0aGUgZGF0YWJhc2UgZGlyZWN0bHkuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlcklkIFRoZSBJRCBvZiB0aGUgdXNlciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge1N0cmluZ30gZW1haWwgVGhlIGVtYWlsIGFkZHJlc3MgdG8gcmVtb3ZlLlxuICogQGltcG9ydEZyb21QYWNrYWdlIGFjY291bnRzLWJhc2VcbiAqL1xuQWNjb3VudHMucmVtb3ZlRW1haWwgPSAodXNlcklkLCBlbWFpbCkgPT4ge1xuICBjaGVjayh1c2VySWQsIE5vbkVtcHR5U3RyaW5nKTtcbiAgY2hlY2soZW1haWwsIE5vbkVtcHR5U3RyaW5nKTtcblxuICBjb25zdCB1c2VyID0gZ2V0VXNlckJ5SWQodXNlcklkLCB7ZmllbGRzOiB7X2lkOiAxfX0pO1xuICBpZiAoIXVzZXIpXG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVXNlciBub3QgZm91bmRcIik7XG5cbiAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7X2lkOiB1c2VyLl9pZH0sXG4gICAgeyRwdWxsOiB7ZW1haWxzOiB7YWRkcmVzczogZW1haWx9fX0pO1xufVxuXG4vLy9cbi8vLyBDUkVBVElORyBVU0VSU1xuLy8vXG5cbi8vIFNoYXJlZCBjcmVhdGVVc2VyIGZ1bmN0aW9uIGNhbGxlZCBmcm9tIHRoZSBjcmVhdGVVc2VyIG1ldGhvZCwgYm90aFxuLy8gaWYgb3JpZ2luYXRlcyBpbiBjbGllbnQgb3Igc2VydmVyIGNvZGUuIENhbGxzIHVzZXIgcHJvdmlkZWQgaG9va3MsXG4vLyBkb2VzIHRoZSBhY3R1YWwgdXNlciBpbnNlcnRpb24uXG4vL1xuLy8gcmV0dXJucyB0aGUgdXNlciBpZFxuY29uc3QgY3JlYXRlVXNlciA9IG9wdGlvbnMgPT4ge1xuICAvLyBVbmtub3duIGtleXMgYWxsb3dlZCwgYmVjYXVzZSBhIG9uQ3JlYXRlVXNlckhvb2sgY2FuIHRha2UgYXJiaXRyYXJ5XG4gIC8vIG9wdGlvbnMuXG4gIGNoZWNrKG9wdGlvbnMsIE1hdGNoLk9iamVjdEluY2x1ZGluZyh7XG4gICAgdXNlcm5hbWU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgZW1haWw6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgcGFzc3dvcmQ6IE1hdGNoLk9wdGlvbmFsKHBhc3N3b3JkVmFsaWRhdG9yKVxuICB9KSk7XG5cbiAgY29uc3QgeyB1c2VybmFtZSwgZW1haWwsIHBhc3N3b3JkIH0gPSBvcHRpb25zO1xuICBpZiAoIXVzZXJuYW1lICYmICFlbWFpbClcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwMCwgXCJOZWVkIHRvIHNldCBhIHVzZXJuYW1lIG9yIGVtYWlsXCIpO1xuXG4gIGNvbnN0IHVzZXIgPSB7c2VydmljZXM6IHt9fTtcbiAgaWYgKHBhc3N3b3JkKSB7XG4gICAgY29uc3QgaGFzaGVkID0gaGFzaFBhc3N3b3JkKHBhc3N3b3JkKTtcbiAgICB1c2VyLnNlcnZpY2VzLnBhc3N3b3JkID0geyBiY3J5cHQ6IGhhc2hlZCB9O1xuICB9XG5cbiAgaWYgKHVzZXJuYW1lKVxuICAgIHVzZXIudXNlcm5hbWUgPSB1c2VybmFtZTtcbiAgaWYgKGVtYWlsKVxuICAgIHVzZXIuZW1haWxzID0gW3thZGRyZXNzOiBlbWFpbCwgdmVyaWZpZWQ6IGZhbHNlfV07XG5cbiAgLy8gUGVyZm9ybSBhIGNhc2UgaW5zZW5zaXRpdmUgY2hlY2sgYmVmb3JlIGluc2VydFxuICBjaGVja0ZvckNhc2VJbnNlbnNpdGl2ZUR1cGxpY2F0ZXMoJ3VzZXJuYW1lJywgJ1VzZXJuYW1lJywgdXNlcm5hbWUpO1xuICBjaGVja0ZvckNhc2VJbnNlbnNpdGl2ZUR1cGxpY2F0ZXMoJ2VtYWlscy5hZGRyZXNzJywgJ0VtYWlsJywgZW1haWwpO1xuXG4gIGNvbnN0IHVzZXJJZCA9IEFjY291bnRzLmluc2VydFVzZXJEb2Mob3B0aW9ucywgdXNlcik7XG4gIC8vIFBlcmZvcm0gYW5vdGhlciBjaGVjayBhZnRlciBpbnNlcnQsIGluIGNhc2UgYSBtYXRjaGluZyB1c2VyIGhhcyBiZWVuXG4gIC8vIGluc2VydGVkIGluIHRoZSBtZWFudGltZVxuICB0cnkge1xuICAgIGNoZWNrRm9yQ2FzZUluc2Vuc2l0aXZlRHVwbGljYXRlcygndXNlcm5hbWUnLCAnVXNlcm5hbWUnLCB1c2VybmFtZSwgdXNlcklkKTtcbiAgICBjaGVja0ZvckNhc2VJbnNlbnNpdGl2ZUR1cGxpY2F0ZXMoJ2VtYWlscy5hZGRyZXNzJywgJ0VtYWlsJywgZW1haWwsIHVzZXJJZCk7XG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgLy8gUmVtb3ZlIGluc2VydGVkIHVzZXIgaWYgdGhlIGNoZWNrIGZhaWxzXG4gICAgTWV0ZW9yLnVzZXJzLnJlbW92ZSh1c2VySWQpO1xuICAgIHRocm93IGV4O1xuICB9XG4gIHJldHVybiB1c2VySWQ7XG59O1xuXG4vLyBtZXRob2QgZm9yIGNyZWF0ZSB1c2VyLiBSZXF1ZXN0cyBjb21lIGZyb20gdGhlIGNsaWVudC5cbk1ldGVvci5tZXRob2RzKHtjcmVhdGVVc2VyOiBmdW5jdGlvbiAoLi4uYXJncykge1xuICBjb25zdCBvcHRpb25zID0gYXJnc1swXTtcbiAgcmV0dXJuIEFjY291bnRzLl9sb2dpbk1ldGhvZChcbiAgICB0aGlzLFxuICAgIFwiY3JlYXRlVXNlclwiLFxuICAgIGFyZ3MsXG4gICAgXCJwYXNzd29yZFwiLFxuICAgICgpID0+IHtcbiAgICAgIC8vIGNyZWF0ZVVzZXIoKSBhYm92ZSBkb2VzIG1vcmUgY2hlY2tpbmcuXG4gICAgICBjaGVjayhvcHRpb25zLCBPYmplY3QpO1xuICAgICAgaWYgKEFjY291bnRzLl9vcHRpb25zLmZvcmJpZENsaWVudEFjY291bnRDcmVhdGlvbilcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBlcnJvcjogbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiU2lnbnVwcyBmb3JiaWRkZW5cIilcbiAgICAgICAgfTtcblxuICAgICAgY29uc3QgdXNlcklkID0gQWNjb3VudHMuY3JlYXRlVXNlclZlcmlmeWluZ0VtYWlsKG9wdGlvbnMpO1xuXG4gICAgICAvLyBjbGllbnQgZ2V0cyBsb2dnZWQgaW4gYXMgdGhlIG5ldyB1c2VyIGFmdGVyd2FyZHMuXG4gICAgICByZXR1cm4ge3VzZXJJZDogdXNlcklkfTtcbiAgICB9XG4gICk7XG59fSk7XG5cbi8qKlxuICogQHN1bW1hcnkgQ3JlYXRlcyBhbiB1c2VyIGFuZCBzZW5kcyBhbiBlbWFpbCBpZiBgb3B0aW9ucy5lbWFpbGAgaXMgaW5mb3JtZWQuXG4gKiBUaGVuIGlmIHRoZSBgc2VuZFZlcmlmaWNhdGlvbkVtYWlsYCBvcHRpb24gZnJvbSB0aGUgYEFjY291bnRzYCBwYWNrYWdlIGlzXG4gKiBlbmFibGVkLCB5b3UnbGwgc2VuZCBhIHZlcmlmaWNhdGlvbiBlbWFpbCBpZiBgb3B0aW9ucy5wYXNzd29yZGAgaXMgaW5mb3JtZWQsXG4gKiBvdGhlcndpc2UgeW91J2xsIHNlbmQgYW4gZW5yb2xsbWVudCBlbWFpbC5cbiAqIEBsb2N1cyBTZXJ2ZXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIFRoZSBvcHRpb25zIG9iamVjdCB0byBiZSBwYXNzZWQgZG93biB3aGVuIGNyZWF0aW5nXG4gKiB0aGUgdXNlclxuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMudXNlcm5hbWUgQSB1bmlxdWUgbmFtZSBmb3IgdGhpcyB1c2VyLlxuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMuZW1haWwgVGhlIHVzZXIncyBlbWFpbCBhZGRyZXNzLlxuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMucGFzc3dvcmQgVGhlIHVzZXIncyBwYXNzd29yZC4gVGhpcyBpcyBfX25vdF9fIHNlbnQgaW4gcGxhaW4gdGV4dCBvdmVyIHRoZSB3aXJlLlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMucHJvZmlsZSBUaGUgdXNlcidzIHByb2ZpbGUsIHR5cGljYWxseSBpbmNsdWRpbmcgdGhlIGBuYW1lYCBmaWVsZC5cbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBhY2NvdW50cy1iYXNlXG4gKiAqL1xuQWNjb3VudHMuY3JlYXRlVXNlclZlcmlmeWluZ0VtYWlsID0gKG9wdGlvbnMpID0+IHtcbiAgb3B0aW9ucyA9IHsgLi4ub3B0aW9ucyB9O1xuICAvLyBDcmVhdGUgdXNlci4gcmVzdWx0IGNvbnRhaW5zIGlkIGFuZCB0b2tlbi5cbiAgY29uc3QgdXNlcklkID0gY3JlYXRlVXNlcihvcHRpb25zKTtcbiAgLy8gc2FmZXR5IGJlbHQuIGNyZWF0ZVVzZXIgaXMgc3VwcG9zZWQgdG8gdGhyb3cgb24gZXJyb3IuIHNlbmQgNTAwIGVycm9yXG4gIC8vIGluc3RlYWQgb2Ygc2VuZGluZyBhIHZlcmlmaWNhdGlvbiBlbWFpbCB3aXRoIGVtcHR5IHVzZXJpZC5cbiAgaWYgKCEgdXNlcklkKVxuICAgIHRocm93IG5ldyBFcnJvcihcImNyZWF0ZVVzZXIgZmFpbGVkIHRvIGluc2VydCBuZXcgdXNlclwiKTtcblxuICAvLyBJZiBgQWNjb3VudHMuX29wdGlvbnMuc2VuZFZlcmlmaWNhdGlvbkVtYWlsYCBpcyBzZXQsIHJlZ2lzdGVyXG4gIC8vIGEgdG9rZW4gdG8gdmVyaWZ5IHRoZSB1c2VyJ3MgcHJpbWFyeSBlbWFpbCwgYW5kIHNlbmQgaXQgdG9cbiAgLy8gdGhhdCBhZGRyZXNzLlxuICBpZiAob3B0aW9ucy5lbWFpbCAmJiBBY2NvdW50cy5fb3B0aW9ucy5zZW5kVmVyaWZpY2F0aW9uRW1haWwpIHtcbiAgICBpZiAob3B0aW9ucy5wYXNzd29yZCkge1xuICAgICAgQWNjb3VudHMuc2VuZFZlcmlmaWNhdGlvbkVtYWlsKHVzZXJJZCwgb3B0aW9ucy5lbWFpbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIEFjY291bnRzLnNlbmRFbnJvbGxtZW50RW1haWwodXNlcklkLCBvcHRpb25zLmVtYWlsKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdXNlcklkO1xufTtcblxuLy8gQ3JlYXRlIHVzZXIgZGlyZWN0bHkgb24gdGhlIHNlcnZlci5cbi8vXG4vLyBVbmxpa2UgdGhlIGNsaWVudCB2ZXJzaW9uLCB0aGlzIGRvZXMgbm90IGxvZyB5b3UgaW4gYXMgdGhpcyB1c2VyXG4vLyBhZnRlciBjcmVhdGlvbi5cbi8vXG4vLyByZXR1cm5zIHVzZXJJZCBvciB0aHJvd3MgYW4gZXJyb3IgaWYgaXQgY2FuJ3QgY3JlYXRlXG4vL1xuLy8gWFhYIGFkZCBhbm90aGVyIGFyZ3VtZW50IChcInNlcnZlciBvcHRpb25zXCIpIHRoYXQgZ2V0cyBzZW50IHRvIG9uQ3JlYXRlVXNlcixcbi8vIHdoaWNoIGlzIGFsd2F5cyBlbXB0eSB3aGVuIGNhbGxlZCBmcm9tIHRoZSBjcmVhdGVVc2VyIG1ldGhvZD8gZWcsIFwiYWRtaW46XG4vLyB0cnVlXCIsIHdoaWNoIHdlIHdhbnQgdG8gcHJldmVudCB0aGUgY2xpZW50IGZyb20gc2V0dGluZywgYnV0IHdoaWNoIGEgY3VzdG9tXG4vLyBtZXRob2QgY2FsbGluZyBBY2NvdW50cy5jcmVhdGVVc2VyIGNvdWxkIHNldD9cbi8vXG5BY2NvdW50cy5jcmVhdGVVc2VyID0gKG9wdGlvbnMsIGNhbGxiYWNrKSA9PiB7XG4gIG9wdGlvbnMgPSB7IC4uLm9wdGlvbnMgfTtcblxuICAvLyBYWFggYWxsb3cgYW4gb3B0aW9uYWwgY2FsbGJhY2s/XG4gIGlmIChjYWxsYmFjaykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkFjY291bnRzLmNyZWF0ZVVzZXIgd2l0aCBjYWxsYmFjayBub3Qgc3VwcG9ydGVkIG9uIHRoZSBzZXJ2ZXIgeWV0LlwiKTtcbiAgfVxuXG4gIHJldHVybiBjcmVhdGVVc2VyKG9wdGlvbnMpO1xufTtcblxuLy8vXG4vLy8gUEFTU1dPUkQtU1BFQ0lGSUMgSU5ERVhFUyBPTiBVU0VSU1xuLy8vXG5NZXRlb3IudXNlcnMuX2Vuc3VyZUluZGV4KCdzZXJ2aWNlcy5lbWFpbC52ZXJpZmljYXRpb25Ub2tlbnMudG9rZW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB7IHVuaXF1ZTogdHJ1ZSwgc3BhcnNlOiB0cnVlIH0pO1xuTWV0ZW9yLnVzZXJzLl9lbnN1cmVJbmRleCgnc2VydmljZXMucGFzc3dvcmQucmVzZXQudG9rZW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB7IHVuaXF1ZTogdHJ1ZSwgc3BhcnNlOiB0cnVlIH0pO1xuTWV0ZW9yLnVzZXJzLl9lbnN1cmVJbmRleCgnc2VydmljZXMucGFzc3dvcmQuZW5yb2xsLnRva2VuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgeyB1bmlxdWU6IHRydWUsIHNwYXJzZTogdHJ1ZSB9KTtcbiJdfQ==
