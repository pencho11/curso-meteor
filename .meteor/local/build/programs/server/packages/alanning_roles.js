(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var Accounts = Package['accounts-base'].Accounts;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var check = Package.check.check;
var Match = Package.check.Match;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Roles;

var require = meteorInstall({"node_modules":{"meteor":{"alanning:roles":{"roles":{"roles_common.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/alanning_roles/roles/roles_common.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!function (module1) {
  /* global Meteor, Roles, Mongo */

  /**
   * Provides functions related to user authorization. Compatible with built-in Meteor accounts packages.
   *
   * Roles are accessible throgh `Meteor.roles` collection and documents consist of:
   *  - `_id`: role name
   *  - `children`: list of subdocuments:
   *    - `_id`
   *
   * Children list elements are subdocuments so that they can be easier extended in the future or by plugins.
   *
   * Roles can have multiple parents and can be children (subroles) of multiple roles.
   *
   * Example: `{_id: 'admin', children: [{_id: 'editor'}]}`
   *
   * The assignment of a role to a user is stored in a collection, accessible through `Meteor.roleAssignment`.
   * It's documents consist of
   *  - `_id`: Internal MongoDB id
   *  - `role`: A role object which got assigned. Usually only contains the `_id` property
   *  - `user`: A user object, usually only contains the `_id` property
   *  - `scope`: scope name
   *  - `inheritedRoles`: A list of all the roles objects inherited by the assigned role.
   *
   * @module Roles
   */
  if (!Meteor.roles) {
    Meteor.roles = new Mongo.Collection('roles');
  }

  if (!Meteor.roleAssignment) {
    Meteor.roleAssignment = new Mongo.Collection('role-assignment');
  }
  /**
   * @class Roles
   */


  if (typeof Roles === 'undefined') {
    Roles = {}; // eslint-disable-line no-global-assign
  }

  var getGroupsForUserDeprecationWarning = false;
  Object.assign(Roles, {
    /**
     * Used as a global group (now scope) name. Not used anymore.
     *
     * @property GLOBAL_GROUP
     * @static
     * @deprecated
     */
    GLOBAL_GROUP: null,

    /**
     * Create a new role.
     *
     * @method createRole
     * @param {String} roleName Name of role.
     * @param {Object} [options] Options:
     *   - `unlessExists`: if `true`, exception will not be thrown in the role already exists
     * @return {String} ID of the new role or null.
     * @static
     */
    createRole: function (roleName, options) {
      Roles._checkRoleName(roleName);

      options = Object.assign({
        unlessExists: false
      }, options);
      var result = Meteor.roles.upsert({
        _id: roleName
      }, {
        $setOnInsert: {
          children: []
        }
      });

      if (!result.insertedId) {
        if (options.unlessExists) return null;
        throw new Error('Role \'' + roleName + '\' already exists.');
      }

      return result.insertedId;
    },

    /**
     * Delete an existing role.
     *
     * If the role is set for any user, it is automatically unset.
     *
     * @method deleteRole
     * @param {String} roleName Name of role.
     * @static
     */
    deleteRole: function (roleName) {
      var roles;
      var inheritedRoles;

      Roles._checkRoleName(roleName); // Remove all assignments


      Meteor.roleAssignment.remove({
        'role._id': roleName
      });

      do {
        // For all roles who have it as a dependency ...
        roles = Roles._getParentRoleNames(Meteor.roles.findOne({
          _id: roleName
        }));
        Meteor.roles.find({
          _id: {
            $in: roles
          }
        }).fetch().forEach(r => {
          Meteor.roles.update({
            _id: r._id
          }, {
            $pull: {
              children: {
                _id: roleName
              }
            }
          });
          inheritedRoles = Roles._getInheritedRoleNames(Meteor.roles.findOne({
            _id: r._id
          }));
          Meteor.roleAssignment.update({
            'role._id': r._id
          }, {
            $set: {
              inheritedRoles: [r._id, ...inheritedRoles].map(r2 => ({
                _id: r2
              }))
            }
          }, {
            multi: true
          });
        });
      } while (roles.length > 0); // And finally remove the role itself


      Meteor.roles.remove({
        _id: roleName
      });
    },

    /**
     * Rename an existing role.
     *
     * @method renameRole
     * @param {String} oldName Old name of a role.
     * @param {String} newName New name of a role.
     * @static
     */
    renameRole: function (oldName, newName) {
      var role;
      var count;

      Roles._checkRoleName(oldName);

      Roles._checkRoleName(newName);

      if (oldName === newName) return;
      role = Meteor.roles.findOne({
        _id: oldName
      });

      if (!role) {
        throw new Error('Role \'' + oldName + '\' does not exist.');
      }

      role._id = newName;
      Meteor.roles.insert(role);

      do {
        count = Meteor.roleAssignment.update({
          'role._id': oldName
        }, {
          $set: {
            'role._id': newName
          }
        }, {
          multi: true
        });
      } while (count > 0);

      do {
        count = Meteor.roleAssignment.update({
          'inheritedRoles._id': oldName
        }, {
          $set: {
            'inheritedRoles.$._id': newName
          }
        }, {
          multi: true
        });
      } while (count > 0);

      do {
        count = Meteor.roles.update({
          'children._id': oldName
        }, {
          $set: {
            'children.$._id': newName
          }
        }, {
          multi: true
        });
      } while (count > 0);

      Meteor.roles.remove({
        _id: oldName
      });
    },

    /**
     * Add role parent to roles.
     *
     * Previous parents are kept (role can have multiple parents). For users which have the
     * parent role set, new subroles are added automatically.
     *
     * @method addRolesToParent
     * @param {Array|String} rolesNames Name(s) of role(s).
     * @param {String} parentName Name of parent role.
     * @static
     */
    addRolesToParent: function (rolesNames, parentName) {
      // ensure arrays
      if (!Array.isArray(rolesNames)) rolesNames = [rolesNames];
      rolesNames.forEach(function (roleName) {
        Roles._addRoleToParent(roleName, parentName);
      });
    },

    /**
     * @method _addRoleToParent
     * @param {String} roleName Name of role.
     * @param {String} parentName Name of parent role.
     * @private
     * @static
     */
    _addRoleToParent: function (roleName, parentName) {
      var role;
      var count;

      Roles._checkRoleName(roleName);

      Roles._checkRoleName(parentName); // query to get role's children


      role = Meteor.roles.findOne({
        _id: roleName
      });

      if (!role) {
        throw new Error('Role \'' + roleName + '\' does not exist.');
      } // detect cycles


      if (Roles._getInheritedRoleNames(role).includes(parentName)) {
        throw new Error('Roles \'' + roleName + '\' and \'' + parentName + '\' would form a cycle.');
      }

      count = Meteor.roles.update({
        _id: parentName,
        'children._id': {
          $ne: role._id
        }
      }, {
        $push: {
          children: {
            _id: role._id
          }
        }
      }); // if there was no change, parent role might not exist, or role is
      // already a subrole; in any case we do not have anything more to do

      if (!count) return;
      Meteor.roleAssignment.update({
        'inheritedRoles._id': parentName
      }, {
        $push: {
          inheritedRoles: {
            $each: [role._id, ...Roles._getInheritedRoleNames(role)].map(r => ({
              _id: r
            }))
          }
        }
      }, {
        multi: true
      });
    },

    /**
     * Remove role parent from roles.
     *
     * Other parents are kept (role can have multiple parents). For users which have the
     * parent role set, removed subrole is removed automatically.
     *
     * @method removeRolesFromParent
     * @param {Array|String} rolesNames Name(s) of role(s).
     * @param {String} parentName Name of parent role.
     * @static
     */
    removeRolesFromParent: function (rolesNames, parentName) {
      // ensure arrays
      if (!Array.isArray(rolesNames)) rolesNames = [rolesNames];
      rolesNames.forEach(function (roleName) {
        Roles._removeRoleFromParent(roleName, parentName);
      });
    },

    /**
     * @method _removeRoleFromParent
     * @param {String} roleName Name of role.
     * @param {String} parentName Name of parent role.
     * @private
     * @static
     */
    _removeRoleFromParent: function (roleName, parentName) {
      Roles._checkRoleName(roleName);

      Roles._checkRoleName(parentName); // check for role existence
      // this would not really be needed, but we are trying to match addRolesToParent


      let role = Meteor.roles.findOne({
        _id: roleName
      }, {
        fields: {
          _id: 1
        }
      });

      if (!role) {
        throw new Error('Role \'' + roleName + '\' does not exist.');
      }

      const count = Meteor.roles.update({
        _id: parentName
      }, {
        $pull: {
          children: {
            _id: role._id
          }
        }
      }); // if there was no change, parent role might not exist, or role was
      // already not a subrole; in any case we do not have anything more to do

      if (!count) return; // For all roles who have had it as a dependency ...

      const roles = [...Roles._getParentRoleNames(Meteor.roles.findOne({
        _id: parentName
      })), parentName];
      Meteor.roles.find({
        _id: {
          $in: roles
        }
      }).fetch().forEach(r => {
        const inheritedRoles = Roles._getInheritedRoleNames(Meteor.roles.findOne({
          _id: r._id
        }));

        Meteor.roleAssignment.update({
          'role._id': r._id,
          'inheritedRoles._id': role._id
        }, {
          $set: {
            inheritedRoles: [r._id, ...inheritedRoles].map(r2 => ({
              _id: r2
            }))
          }
        }, {
          multi: true
        });
      });
    },

    /**
     * Add users to roles.
     *
     * Adds roles to existing roles for each user.
     *
     * @example
     *     Roles.addUsersToRoles(userId, 'admin')
     *     Roles.addUsersToRoles(userId, ['view-secrets'], 'example.com')
     *     Roles.addUsersToRoles([user1, user2], ['user','editor'])
     *     Roles.addUsersToRoles([user1, user2], ['glorious-admin', 'perform-action'], 'example.org')
     *
     * @method addUsersToRoles
     * @param {Array|String} users User ID(s) or object(s) with an `_id` field.
     * @param {Array|String} roles Name(s) of roles to add users to. Roles have to exist.
     * @param {Object|String} [options] Options:
     *   - `scope`: name of the scope, or `null` for the global role
     *   - `ifExists`: if `true`, do not throw an exception if the role does not exist
     *
     * Alternatively, it can be a scope name string.
     * @static
     */
    addUsersToRoles: function (users, roles, options) {
      var id;
      if (!users) throw new Error('Missing \'users\' param.');
      if (!roles) throw new Error('Missing \'roles\' param.');
      options = Roles._normalizeOptions(options); // ensure arrays

      if (!Array.isArray(users)) users = [users];
      if (!Array.isArray(roles)) roles = [roles];

      Roles._checkScopeName(options.scope);

      options = Object.assign({
        ifExists: false
      }, options);
      users.forEach(function (user) {
        if (typeof user === 'object') {
          id = user._id;
        } else {
          id = user;
        }

        roles.forEach(function (role) {
          Roles._addUserToRole(id, role, options);
        });
      });
    },

    /**
     * Set users' roles.
     *
     * Replaces all existing roles with a new set of roles.
     *
     * @example
     *     Roles.setUserRoles(userId, 'admin')
     *     Roles.setUserRoles(userId, ['view-secrets'], 'example.com')
     *     Roles.setUserRoles([user1, user2], ['user','editor'])
     *     Roles.setUserRoles([user1, user2], ['glorious-admin', 'perform-action'], 'example.org')
     *
     * @method setUserRoles
     * @param {Array|String} users User ID(s) or object(s) with an `_id` field.
     * @param {Array|String} roles Name(s) of roles to add users to. Roles have to exist.
     * @param {Object|String} [options] Options:
     *   - `scope`: name of the scope, or `null` for the global role
     *   - `anyScope`: if `true`, remove all roles the user has, of any scope, if `false`, only the one in the same scope
     *   - `ifExists`: if `true`, do not throw an exception if the role does not exist
     *
     * Alternatively, it can be a scope name string.
     * @static
     */
    setUserRoles: function (users, roles, options) {
      var id;
      if (!users) throw new Error('Missing \'users\' param.');
      if (!roles) throw new Error('Missing \'roles\' param.');
      options = Roles._normalizeOptions(options); // ensure arrays

      if (!Array.isArray(users)) users = [users];
      if (!Array.isArray(roles)) roles = [roles];

      Roles._checkScopeName(options.scope);

      options = Object.assign({
        ifExists: false,
        anyScope: false
      }, options);
      users.forEach(function (user) {
        if (typeof user === 'object') {
          id = user._id;
        } else {
          id = user;
        } // we first clear all roles for the user


        const selector = {
          'user._id': id
        };

        if (!options.anyScope) {
          selector.scope = options.scope;
        }

        Meteor.roleAssignment.remove(selector); // and then add all

        roles.forEach(function (role) {
          Roles._addUserToRole(id, role, options);
        });
      });
    },

    /**
     * Add one user to one role.
     *
     * @method _addUserToRole
     * @param {String} userId The user ID.
     * @param {String} roleName Name of the role to add the user to. The role have to exist.
     * @param {Object} options Options:
     *   - `scope`: name of the scope, or `null` for the global role
     *   - `ifExists`: if `true`, do not throw an exception if the role does not exist
     * @private
     * @static
     */
    _addUserToRole: function (userId, roleName, options) {
      Roles._checkRoleName(roleName);

      Roles._checkScopeName(options.scope);

      if (!userId) {
        return;
      }

      const role = Meteor.roles.findOne({
        _id: roleName
      }, {
        fields: {
          children: 1
        }
      });

      if (!role) {
        if (options.ifExists) {
          return [];
        } else {
          throw new Error('Role \'' + roleName + '\' does not exist.');
        }
      } // This might create duplicates, because we don't have a unique index, but that's all right. In case there are two, withdrawing the role will effectively kill them both.


      const res = Meteor.roleAssignment.upsert({
        'user._id': userId,
        'role._id': roleName,
        scope: options.scope
      }, {
        $setOnInsert: {
          user: {
            _id: userId
          },
          role: {
            _id: roleName
          },
          scope: options.scope
        }
      });

      if (res.insertedId) {
        Meteor.roleAssignment.update({
          _id: res.insertedId
        }, {
          $set: {
            inheritedRoles: [roleName, ...Roles._getInheritedRoleNames(role)].map(r => ({
              _id: r
            }))
          }
        });
      }

      return res;
    },

    /**
     * Returns an array of role names the given role name is a child of.
     *
     * @example
     *     Roles._getParentRoleNames({ _id: 'admin', children; [] })
     *
     * @method _getParentRoleNames
     * @param {object} role The role object
     * @private
     * @static
     */
    _getParentRoleNames: function (role) {
      var parentRoles;

      if (!role) {
        return [];
      }

      parentRoles = new Set([role._id]);
      parentRoles.forEach(roleName => {
        Meteor.roles.find({
          'children._id': roleName
        }).fetch().forEach(parentRole => {
          parentRoles.add(parentRole._id);
        });
      });
      parentRoles.delete(role._id);
      return [...parentRoles];
    },

    /**
     * Returns an array of role names the given role name is a parent of.
     *
     * @example
     *     Roles._getInheritedRoleNames({ _id: 'admin', children; [] })
     *
     * @method _getInheritedRoleNames
     * @param {object} role The role object
     * @private
     * @static
     */
    _getInheritedRoleNames: function (role) {
      const inheritedRoles = new Set();
      const nestedRoles = new Set([role]);
      nestedRoles.forEach(r => {
        const roles = Meteor.roles.find({
          _id: {
            $in: r.children.map(r => r._id)
          }
        }, {
          fields: {
            children: 1
          }
        }).fetch();
        roles.forEach(r2 => {
          inheritedRoles.add(r2._id);
          nestedRoles.add(r2);
        });
      });
      return [...inheritedRoles];
    },

    /**
     * Remove users from assigned roles.
     *
     * @example
     *     Roles.removeUsersFromRoles(userId, 'admin')
     *     Roles.removeUsersFromRoles([userId, user2], ['editor'])
     *     Roles.removeUsersFromRoles(userId, ['user'], 'group1')
     *
     * @method removeUsersFromRoles
     * @param {Array|String} users User ID(s) or object(s) with an `_id` field.
     * @param {Array|String} roles Name(s) of roles to remove users from. Roles have to exist.
     * @param {Object|String} [options] Options:
     *   - `scope`: name of the scope, or `null` for the global role
     *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
     *
     * Alternatively, it can be a scope name string.
     * @static
     */
    removeUsersFromRoles: function (users, roles, options) {
      if (!users) throw new Error('Missing \'users\' param.');
      if (!roles) throw new Error('Missing \'roles\' param.');
      options = Roles._normalizeOptions(options); // ensure arrays

      if (!Array.isArray(users)) users = [users];
      if (!Array.isArray(roles)) roles = [roles];

      Roles._checkScopeName(options.scope);

      users.forEach(function (user) {
        if (!user) return;
        roles.forEach(function (role) {
          let id;

          if (typeof user === 'object') {
            id = user._id;
          } else {
            id = user;
          }

          Roles._removeUserFromRole(id, role, options);
        });
      });
    },

    /**
     * Remove one user from one role.
     *
     * @method _removeUserFromRole
     * @param {String} userId The user ID.
     * @param {String} roleName Name of the role to add the user to. The role have to exist.
     * @param {Object} options Options:
     *   - `scope`: name of the scope, or `null` for the global role
     *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
     * @private
     * @static
     */
    _removeUserFromRole: function (userId, roleName, options) {
      Roles._checkRoleName(roleName);

      Roles._checkScopeName(options.scope);

      if (!userId) return;
      const selector = {
        'user._id': userId,
        'role._id': roleName
      };

      if (!options.anyScope) {
        selector.scope = options.scope;
      }

      Meteor.roleAssignment.remove(selector);
    },

    /**
     * Check if user has specified roles.
     *
     * @example
     *     // global roles
     *     Roles.userIsInRole(user, 'admin')
     *     Roles.userIsInRole(user, ['admin','editor'])
     *     Roles.userIsInRole(userId, 'admin')
     *     Roles.userIsInRole(userId, ['admin','editor'])
     *
     *     // scope roles (global roles are still checked)
     *     Roles.userIsInRole(user, 'admin', 'group1')
     *     Roles.userIsInRole(userId, ['admin','editor'], 'group1')
     *     Roles.userIsInRole(userId, ['admin','editor'], {scope: 'group1'})
     *
     * @method userIsInRole
     * @param {String|Object} user User ID or an actual user object.
     * @param {Array|String} roles Name of role or an array of roles to check against. If array,
     *                             will return `true` if user is in _any_ role.
     *                             Roles do not have to exist.
     * @param {Object|String} [options] Options:
     *   - `scope`: name of the scope; if supplied, limits check to just that scope
     *     the user's global roles will always be checked whether scope is specified or not
     *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
     *
     * Alternatively, it can be a scope name string.
     * @return {Boolean} `true` if user is in _any_ of the target roles
     * @static
     */
    userIsInRole: function (user, roles, options) {
      var id;
      var selector;
      options = Roles._normalizeOptions(options); // ensure array to simplify code

      if (!Array.isArray(roles)) roles = [roles];
      roles = roles.filter(r => r != null);
      if (!roles.length) return false;

      Roles._checkScopeName(options.scope);

      options = Object.assign({
        anyScope: false
      }, options);

      if (user && typeof user === 'object') {
        id = user._id;
      } else {
        id = user;
      }

      if (!id) return false;
      if (typeof id !== 'string') return false;
      selector = {
        'user._id': id
      };

      if (!options.anyScope) {
        selector.scope = {
          $in: [options.scope, null]
        };
      }

      return roles.some(roleName => {
        selector['inheritedRoles._id'] = roleName;
        return Meteor.roleAssignment.find(selector, {
          limit: 1
        }).count() > 0;
      });
    },

    /**
     * Retrieve user's roles.
     *
     * @method getRolesForUser
     * @param {String|Object} user User ID or an actual user object.
     * @param {Object|String} [options] Options:
     *   - `scope`: name of scope to provide roles for; if not specified, global roles are returned
     *   - `anyScope`: if set, role can be in any scope (`scope` and `onlyAssigned` options are ignored)
     *   - `onlyScoped`: if set, only roles in the specified scope are returned
     *   - `onlyAssigned`: return only assigned roles and not automatically inferred (like subroles)
     *   - `fullObjects`: return full roles objects (`true`) or just names (`false`) (`onlyAssigned` option is ignored) (default `false`)
     *     If you have a use-case for this option, please file a feature-request. You shouldn't need to use it as it's
     *     result strongly dependant on the internal data structure of this plugin.
     *
     * Alternatively, it can be a scope name string.
     * @return {Array} Array of user's roles, unsorted.
     * @static
     */
    getRolesForUser: function (user, options) {
      var id;
      var selector;
      var filter;
      var roles;
      options = Roles._normalizeOptions(options);

      Roles._checkScopeName(options.scope);

      options = Object.assign({
        fullObjects: false,
        onlyAssigned: false,
        anyScope: false,
        onlyScoped: false
      }, options);

      if (user && typeof user === 'object') {
        id = user._id;
      } else {
        id = user;
      }

      if (!id) return [];
      selector = {
        'user._id': id
      };
      filter = {
        fields: {
          'inheritedRoles._id': 1
        }
      };

      if (!options.anyScope) {
        selector.scope = {
          $in: [options.scope]
        };

        if (!options.onlyScoped) {
          selector.scope.$in.push(null);
        }
      }

      if (options.onlyAssigned) {
        delete filter.fields['inheritedRoles._id'];
        filter.fields['role._id'] = 1;
      }

      if (options.fullObjects) {
        delete filter.fields;
      }

      roles = Meteor.roleAssignment.find(selector, filter).fetch();

      if (options.fullObjects) {
        return roles;
      }

      return [...new Set(roles.reduce((rev, current) => {
        if (current.inheritedRoles) {
          return rev.concat(current.inheritedRoles.map(r => r._id));
        } else if (current.role) {
          rev.push(current.role._id);
        }

        return rev;
      }, []))];
    },

    /**
     * Retrieve cursor of all existing roles.
     *
     * @method getAllRoles
     * @param {Object} [queryOptions] Options which are passed directly
     *                                through to `Meteor.roles.find(query, options)`.
     * @return {Cursor} Cursor of existing roles.
     * @static
     */
    getAllRoles: function (queryOptions) {
      queryOptions = queryOptions || {
        sort: {
          _id: 1
        }
      };
      return Meteor.roles.find({}, queryOptions);
    },

    /**
     * Retrieve all users who are in target role.
     *
     * Options:
     *
     * @method getUsersInRole
     * @param {Array|String} roles Name of role or an array of roles. If array, users
     *                             returned will have at least one of the roles
     *                             specified but need not have _all_ roles.
     *                             Roles do not have to exist.
     * @param {Object|String} [options] Options:
     *   - `scope`: name of the scope to restrict roles to; user's global
     *     roles will also be checked
     *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
     *   - `onlyScoped`: if set, only roles in the specified scope are returned
     *   - `queryOptions`: options which are passed directly
     *     through to `Meteor.users.find(query, options)`
     *
     * Alternatively, it can be a scope name string.
     * @param {Object} [queryOptions] Options which are passed directly
     *                                through to `Meteor.users.find(query, options)`
     * @return {Cursor} Cursor of users in roles.
     * @static
     */
    getUsersInRole: function (roles, options, queryOptions) {
      var ids;
      ids = Roles.getUserAssignmentsForRole(roles, options).fetch().map(a => a.user._id);
      return Meteor.users.find({
        _id: {
          $in: ids
        }
      }, options && options.queryOptions || queryOptions || {});
    },

    /**
     * Retrieve all assignments of a user which are for the target role.
     *
     * Options:
     *
     * @method getUserAssignmentsForRole
     * @param {Array|String} roles Name of role or an array of roles. If array, users
     *                             returned will have at least one of the roles
     *                             specified but need not have _all_ roles.
     *                             Roles do not have to exist.
     * @param {Object|String} [options] Options:
     *   - `scope`: name of the scope to restrict roles to; user's global
     *     roles will also be checked
     *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
     *   - `queryOptions`: options which are passed directly
     *     through to `Meteor.roleAssignment.find(query, options)`
      * Alternatively, it can be a scope name string.
     * @return {Cursor} Cursor of user assignments for roles.
     * @static
     */
    getUserAssignmentsForRole: function (roles, options) {
      options = Roles._normalizeOptions(options);
      options = Object.assign({
        anyScope: false,
        queryOptions: {}
      }, options);
      return Roles._getUsersInRoleCursor(roles, options, options.queryOptions);
    },

    /**
     * @method _getUsersInRoleCursor
     * @param {Array|String} roles Name of role or an array of roles. If array, ids of users are
     *                             returned which have at least one of the roles
     *                             assigned but need not have _all_ roles.
     *                             Roles do not have to exist.
     * @param {Object|String} [options] Options:
     *   - `scope`: name of the scope to restrict roles to; user's global
     *     roles will also be checked
     *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
     *
     * Alternatively, it can be a scope name string.
     * @param {Object} [filter] Options which are passed directly
     *                                through to `Meteor.roleAssignment.find(query, options)`
     * @return {Object} Cursor to the assignment documents
     * @private
     * @static
     */
    _getUsersInRoleCursor: function (roles, options, filter) {
      var selector;
      options = Roles._normalizeOptions(options);
      options = Object.assign({
        anyScope: false,
        onlyScoped: false
      }, options); // ensure array to simplify code

      if (!Array.isArray(roles)) roles = [roles];

      Roles._checkScopeName(options.scope);

      filter = Object.assign({
        fields: {
          'user._id': 1
        }
      }, filter);
      selector = {
        'inheritedRoles._id': {
          $in: roles
        }
      };

      if (!options.anyScope) {
        selector.scope = {
          $in: [options.scope]
        };

        if (!options.onlyScoped) {
          selector.scope.$in.push(null);
        }
      }

      return Meteor.roleAssignment.find(selector, filter);
    },

    /**
     * Deprecated. Use `getScopesForUser` instead.
     *
     * @method getGroupsForUser
     * @static
     * @deprecated
     */
    getGroupsForUser: function () {
      if (!getGroupsForUserDeprecationWarning) {
        getGroupsForUserDeprecationWarning = true;
        console && console.warn('getGroupsForUser has been deprecated. Use getScopesForUser instead.');
      }

      return Roles.getScopesForUser(...arguments);
    },

    /**
     * Retrieve users scopes, if any.
     *
     * @method getScopesForUser
     * @param {String|Object} user User ID or an actual user object.
     * @param {Array|String} [roles] Name of roles to restrict scopes to.
     *
     * @return {Array} Array of user's scopes, unsorted.
     * @static
     */
    getScopesForUser: function (user, roles) {
      var scopes;
      var id;
      if (roles && !Array.isArray(roles)) roles = [roles];

      if (user && typeof user === 'object') {
        id = user._id;
      } else {
        id = user;
      }

      if (!id) return [];
      const selector = {
        'user._id': id,
        scope: {
          $ne: null
        }
      };

      if (roles) {
        selector['inheritedRoles._id'] = {
          $in: roles
        };
      }

      scopes = Meteor.roleAssignment.find(selector, {
        fields: {
          scope: 1
        }
      }).fetch().map(obi => obi.scope);
      return [...new Set(scopes)];
    },

    /**
     * Rename a scope.
     *
     * Roles assigned with a given scope are changed to be under the new scope.
     *
     * @method renameScope
     * @param {String} oldName Old name of a scope.
     * @param {String} newName New name of a scope.
     * @static
     */
    renameScope: function (oldName, newName) {
      var count;

      Roles._checkScopeName(oldName);

      Roles._checkScopeName(newName);

      if (oldName === newName) return;

      do {
        count = Meteor.roleAssignment.update({
          scope: oldName
        }, {
          $set: {
            scope: newName
          }
        }, {
          multi: true
        });
      } while (count > 0);
    },

    /**
     * Remove a scope.
     *
     * Roles assigned with a given scope are removed.
     *
     * @method removeScope
     * @param {String} name The name of a scope.
     * @static
     */
    removeScope: function (name) {
      Roles._checkScopeName(name);

      Meteor.roleAssignment.remove({
        scope: name
      });
    },

    /**
     * Throw an exception if `roleName` is an invalid role name.
     *
     * @method _checkRoleName
     * @param {String} roleName A role name to match against.
     * @private
     * @static
     */
    _checkRoleName: function (roleName) {
      if (!roleName || typeof roleName !== 'string' || roleName.trim() !== roleName) {
        throw new Error('Invalid role name \'' + roleName + '\'.');
      }
    },

    /**
     * Find out if a role is an ancestor of another role.
     *
     * WARNING: If you check this on the client, please make sure all roles are published.
     *
     * @method isParentOf
     * @param {String} parentRoleName The role you want to research.
     * @param {String} childRoleName The role you expect to be among the children of parentRoleName.
     * @static
     */
    isParentOf: function (parentRoleName, childRoleName) {
      if (parentRoleName === childRoleName) {
        return true;
      }

      if (parentRoleName == null || childRoleName == null) {
        return false;
      }

      Roles._checkRoleName(parentRoleName);

      Roles._checkRoleName(childRoleName);

      var rolesToCheck = [parentRoleName];

      while (rolesToCheck.length !== 0) {
        var roleName = rolesToCheck.pop();

        if (roleName === childRoleName) {
          return true;
        }

        var role = Meteor.roles.findOne({
          _id: roleName
        }); // This should not happen, but this is a problem to address at some other time.

        if (!role) continue;
        rolesToCheck = rolesToCheck.concat(role.children.map(r => r._id));
      }

      return false;
    },

    /**
     * Normalize options.
     *
     * @method _normalizeOptions
     * @param {Object} options Options to normalize.
     * @return {Object} Normalized options.
     * @private
     * @static
     */
    _normalizeOptions: function (options) {
      options = options === undefined ? {} : options;

      if (options === null || typeof options === 'string') {
        options = {
          scope: options
        };
      }

      options.scope = Roles._normalizeScopeName(options.scope);
      return options;
    },

    /**
     * Normalize scope name.
     *
     * @method _normalizeScopeName
     * @param {String} scopeName A scope name to normalize.
     * @return {String} Normalized scope name.
     * @private
     * @static
     */
    _normalizeScopeName: function (scopeName) {
      // map undefined and null to null
      if (scopeName == null) {
        return null;
      } else {
        return scopeName;
      }
    },

    /**
     * Throw an exception if `scopeName` is an invalid scope name.
     *
     * @method _checkRoleName
     * @param {String} scopeName A scope name to match against.
     * @private
     * @static
     */
    _checkScopeName: function (scopeName) {
      if (scopeName === null) return;

      if (!scopeName || typeof scopeName !== 'string' || scopeName.trim() !== scopeName) {
        throw new Error('Invalid scope name \'' + scopeName + '\'.');
      }
    }
  });
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"roles_server.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/alanning_roles/roles/roles_server.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* global Meteor, Roles */
Meteor.roleAssignment._ensureIndex({
  'user._id': 1,
  'inheritedRoles._id': 1,
  scope: 1
});

Meteor.roleAssignment._ensureIndex({
  'user._id': 1,
  'role._id': 1,
  scope: 1
});

Meteor.roleAssignment._ensureIndex({
  'role._id': 1
});

Meteor.roleAssignment._ensureIndex({
  scope: 1,
  'user._id': 1,
  'inheritedRoles._id': 1
}); // Adding userId and roleId might speed up other queries depending on the first index


Meteor.roleAssignment._ensureIndex({
  'inheritedRoles._id': 1
});

Meteor.roles._ensureIndex({
  'children._id': 1
});
/*
 * Publish logged-in user's roles so client-side checks can work.
 *
 * Use a named publish function so clients can check `ready()` state.
 */


Meteor.publish('_roles', function () {
  var loggedInUserId = this.userId;
  var fields = {
    roles: 1
  };

  if (!loggedInUserId) {
    this.ready();
    return;
  }

  return Meteor.users.find({
    _id: loggedInUserId
  }, {
    fields: fields
  });
});
Object.assign(Roles, {
  /**
   * @method _isNewRole
   * @param {Object} role `Meteor.roles` document.
   * @return {Boolean} Returns `true` if the `role` is in the new format.
   *                   If it is ambiguous or it is not, returns `false`.
   * @for Roles
   * @private
   * @static
   */
  _isNewRole: function (role) {
    return !('name' in role) && 'children' in role;
  },

  /**
   * @method _isOldRole
   * @param {Object} role `Meteor.roles` document.
   * @return {Boolean} Returns `true` if the `role` is in the old format.
   *                   If it is ambiguous or it is not, returns `false`.
   * @for Roles
   * @private
   * @static
   */
  _isOldRole: function (role) {
    return 'name' in role && !('children' in role);
  },

  /**
   * @method _isNewField
   * @param {Array} roles `Meteor.users` document `roles` field.
   * @return {Boolean} Returns `true` if the `roles` field is in the new format.
   *                   If it is ambiguous or it is not, returns `false`.
   * @for Roles
   * @private
   * @static
   */
  _isNewField: function (roles) {
    return Array.isArray(roles) && typeof roles[0] === 'object';
  },

  /**
   * @method _isOldField
   * @param {Array} roles `Meteor.users` document `roles` field.
   * @return {Boolean} Returns `true` if the `roles` field is in the old format.
   *                   If it is ambiguous or it is not, returns `false`.
   * @for Roles
   * @private
   * @static
   */
  _isOldField: function (roles) {
    return Array.isArray(roles) && typeof roles[0] === 'string' || typeof roles === 'object' && !Array.isArray(roles);
  },

  /**
   * @method _convertToNewRole
   * @param {Object} oldRole `Meteor.roles` document.
   * @return {Object} Converted `role` to the new format.
   * @for Roles
   * @private
   * @static
   */
  _convertToNewRole: function (oldRole) {
    if (!(typeof oldRole.name === 'string')) throw new Error("Role name '" + oldRole.name + "' is not a string.");
    return {
      _id: oldRole.name,
      children: []
    };
  },

  /**
   * @method _convertToOldRole
   * @param {Object} newRole `Meteor.roles` document.
   * @return {Object} Converted `role` to the old format.
   * @for Roles
   * @private
   * @static
   */
  _convertToOldRole: function (newRole) {
    if (!(typeof newRole._id === 'string')) throw new Error("Role name '" + newRole._id + "' is not a string.");
    return {
      name: newRole._id
    };
  },

  /**
   * @method _convertToNewField
   * @param {Array} oldRoles `Meteor.users` document `roles` field in the old format.
   * @param {Boolean} convertUnderscoresToDots Should we convert underscores to dots in group names.
   * @return {Array} Converted `roles` to the new format.
   * @for Roles
   * @private
   * @static
   */
  _convertToNewField: function (oldRoles, convertUnderscoresToDots) {
    var roles = [];

    if (Array.isArray(oldRoles)) {
      oldRoles.forEach(function (role, index) {
        if (!(typeof role === 'string')) throw new Error("Role '" + role + "' is not a string.");
        roles.push({
          _id: role,
          scope: null,
          assigned: true
        });
      });
    } else if (typeof oldRoles === 'object') {
      Object.entries(oldRoles).forEach(_ref => {
        let [group, rolesArray] = _ref;

        if (group === '__global_roles__') {
          group = null;
        } else if (convertUnderscoresToDots) {
          // unescape
          group = group.replace(/_/g, '.');
        }

        rolesArray.forEach(function (role) {
          if (!(typeof role === 'string')) throw new Error("Role '" + role + "' is not a string.");
          roles.push({
            _id: role,
            scope: group,
            assigned: true
          });
        });
      });
    }

    return roles;
  },

  /**
   * @method _convertToOldField
   * @param {Array} newRoles `Meteor.users` document `roles` field in the new format.
   * @param {Boolean} usingGroups Should we use groups or not.
   * @return {Array} Converted `roles` to the old format.
   * @for Roles
   * @private
   * @static
   */
  _convertToOldField: function (newRoles, usingGroups) {
    var roles;

    if (usingGroups) {
      roles = {};
    } else {
      roles = [];
    }

    newRoles.forEach(function (userRole) {
      if (!(typeof userRole === 'object')) throw new Error("Role '" + userRole + "' is not an object."); // We assume that we are converting back a failed migration, so values can only be
      // what were valid values in 1.0. So no group names starting with $ and no subroles.

      if (userRole.scope) {
        if (!usingGroups) throw new Error("Role '" + userRole._id + "' with scope '" + userRole.scope + "' without enabled groups."); // escape

        var scope = userRole.scope.replace(/\./g, '_');
        if (scope[0] === '$') throw new Error("Group name '" + scope + "' start with $.");
        roles[scope] = roles[scope] || [];
        roles[scope].push(userRole._id);
      } else {
        if (usingGroups) {
          roles.__global_roles__ = roles.__global_roles__ || [];

          roles.__global_roles__.push(userRole._id);
        } else {
          roles.push(userRole._id);
        }
      }
    });
    return roles;
  },

  /**
   * @method _defaultUpdateUser
   * @param {Object} user `Meteor.users` document.
   * @param {Array|Object} roles Value to which user's `roles` field should be set.
   * @for Roles
   * @private
   * @static
   */
  _defaultUpdateUser: function (user, roles) {
    Meteor.users.update({
      _id: user._id,
      // making sure nothing changed in meantime
      roles: user.roles
    }, {
      $set: {
        roles
      }
    });
  },

  /**
   * @method _defaultUpdateRole
   * @param {Object} oldRole Old `Meteor.roles` document.
   * @param {Object} newRole New `Meteor.roles` document.
   * @for Roles
   * @private
   * @static
   */
  _defaultUpdateRole: function (oldRole, newRole) {
    Meteor.roles.remove(oldRole._id);
    Meteor.roles.insert(newRole);
  },

  /**
   * @method _dropCollectionIndex
   * @param {Object} collection Collection on which to drop the index.
   * @param {String} indexName Name of the index to drop.
   * @for Roles
   * @private
   * @static
   */
  _dropCollectionIndex: function (collection, indexName) {
    try {
      collection._dropIndex(indexName);
    } catch (e) {
      if (e.name !== 'MongoError') throw e;
      if (!/index not found/.test(e.err || e.errmsg)) throw e;
    }
  },

  /**
   * Migrates `Meteor.users` and `Meteor.roles` to the new format.
   *
   * @method _forwardMigrate
   * @param {Function} updateUser Function which updates the user object. Default `_defaultUpdateUser`.
   * @param {Function} updateRole Function which updates the role object. Default `_defaultUpdateRole`.
   * @param {Boolean} convertUnderscoresToDots Should we convert underscores to dots in group names.
   * @for Roles
   * @private
   * @static
   */
  _forwardMigrate: function (updateUser, updateRole, convertUnderscoresToDots) {
    updateUser = updateUser || Roles._defaultUpdateUser;
    updateRole = updateRole || Roles._defaultUpdateRole;

    Roles._dropCollectionIndex(Meteor.roles, 'name_1');

    Meteor.roles.find().forEach(function (role, index, cursor) {
      if (!Roles._isNewRole(role)) {
        updateRole(role, Roles._convertToNewRole(role));
      }
    });
    Meteor.users.find().forEach(function (user, index, cursor) {
      if (!Roles._isNewField(user.roles)) {
        updateUser(user, Roles._convertToNewField(user.roles, convertUnderscoresToDots));
      }
    });
  },

  /**
   * Moves the assignments from `Meteor.users` to `Meteor.roleAssignment`.
   *
   * @method _forwardMigrate2
   * @param {Object} userSelector An opportunity to share the work among instances. It's advisable to do the division based on user-id.
   * @for Roles
   * @private
   * @static
   */
  _forwardMigrate2: function (userSelector) {
    userSelector = userSelector || {};
    Object.assign(userSelector, {
      roles: {
        $ne: null
      }
    });
    Meteor.users.find(userSelector).forEach(function (user, index) {
      user.roles.filter(r => r.assigned).forEach(r => {
        // Added `ifExists` to make it less error-prone
        Roles._addUserToRole(user._id, r._id, {
          scope: r.scope,
          ifExists: true
        });
      });
      Meteor.users.update({
        _id: user._id
      }, {
        $unset: {
          roles: ''
        }
      });
    }); // No need to keep the indexes around

    Roles._dropCollectionIndex(Meteor.users, 'roles._id_1_roles.scope_1');

    Roles._dropCollectionIndex(Meteor.users, 'roles.scope_1');
  },

  /**
   * Migrates `Meteor.users` and `Meteor.roles` to the old format.
   *
   * We assume that we are converting back a failed migration, so values can only be
   * what were valid values in the old format. So no group names starting with `$` and
   * no subroles.
   *
   * @method _backwardMigrate
   * @param {Function} updateUser Function which updates the user object. Default `_defaultUpdateUser`.
   * @param {Function} updateRole Function which updates the role object. Default `_defaultUpdateRole`.
   * @param {Boolean} usingGroups Should we use groups or not.
   * @for Roles
   * @private
   * @static
   */
  _backwardMigrate: function (updateUser, updateRole, usingGroups) {
    updateUser = updateUser || Roles._defaultUpdateUser;
    updateRole = updateRole || Roles._defaultUpdateRole;

    Roles._dropCollectionIndex(Meteor.users, 'roles._id_1_roles.scope_1');

    Roles._dropCollectionIndex(Meteor.users, 'roles.scope_1');

    Meteor.roles.find().forEach(function (role, index, cursor) {
      if (!Roles._isOldRole(role)) {
        updateRole(role, Roles._convertToOldRole(role));
      }
    });
    Meteor.users.find().forEach(function (user, index, cursor) {
      if (!Roles._isOldField(user.roles)) {
        updateUser(user, Roles._convertToOldField(user.roles, usingGroups));
      }
    });
  },

  /**
   * Moves the assignments from `Meteor.roleAssignment` back to to `Meteor.users`.
   *
   * @method _backwardMigrate2
   * @param {Object} assignmentSelector An opportunity to share the work among instances. It's advisable to do the division based on user-id.
   * @for Roles
   * @private
   * @static
   */
  _backwardMigrate2: function (assignmentSelector) {
    assignmentSelector = assignmentSelector || {};

    Meteor.users._ensureIndex({
      'roles._id': 1,
      'roles.scope': 1
    });

    Meteor.users._ensureIndex({
      'roles.scope': 1
    });

    Meteor.roleAssignment.find(assignmentSelector).forEach(r => {
      const roles = Meteor.users.findOne({
        _id: r.user._id
      }).roles || [];
      const currentRole = roles.find(oldRole => oldRole._id === r.role._id && oldRole.scope === r.scope);

      if (currentRole) {
        currentRole.assigned = true;
      } else {
        roles.push({
          _id: r.role._id,
          scope: r.scope,
          assigned: true
        });
        r.inheritedRoles.forEach(inheritedRole => {
          const currentInheritedRole = roles.find(oldRole => oldRole._id === inheritedRole._id && oldRole.scope === r.scope);

          if (!currentInheritedRole) {
            roles.push({
              _id: inheritedRole._id,
              scope: r.scope,
              assigned: false
            });
          }
        });
      }

      Meteor.users.update({
        _id: r.user._id
      }, {
        $set: {
          roles
        }
      });
      Meteor.roleAssignment.remove({
        _id: r._id
      });
    });
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/alanning:roles/roles/roles_common.js");
require("/node_modules/meteor/alanning:roles/roles/roles_server.js");

/* Exports */
Package._define("alanning:roles", {
  Roles: Roles
});

})();

//# sourceURL=meteor://💻app/packages/alanning_roles.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWxhbm5pbmc6cm9sZXMvcm9sZXMvcm9sZXNfY29tbW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hbGFubmluZzpyb2xlcy9yb2xlcy9yb2xlc19zZXJ2ZXIuanMiXSwibmFtZXMiOlsiTWV0ZW9yIiwicm9sZXMiLCJNb25nbyIsIkNvbGxlY3Rpb24iLCJyb2xlQXNzaWdubWVudCIsIlJvbGVzIiwiZ2V0R3JvdXBzRm9yVXNlckRlcHJlY2F0aW9uV2FybmluZyIsIk9iamVjdCIsImFzc2lnbiIsIkdMT0JBTF9HUk9VUCIsImNyZWF0ZVJvbGUiLCJyb2xlTmFtZSIsIm9wdGlvbnMiLCJfY2hlY2tSb2xlTmFtZSIsInVubGVzc0V4aXN0cyIsInJlc3VsdCIsInVwc2VydCIsIl9pZCIsIiRzZXRPbkluc2VydCIsImNoaWxkcmVuIiwiaW5zZXJ0ZWRJZCIsIkVycm9yIiwiZGVsZXRlUm9sZSIsImluaGVyaXRlZFJvbGVzIiwicmVtb3ZlIiwiX2dldFBhcmVudFJvbGVOYW1lcyIsImZpbmRPbmUiLCJmaW5kIiwiJGluIiwiZmV0Y2giLCJmb3JFYWNoIiwiciIsInVwZGF0ZSIsIiRwdWxsIiwiX2dldEluaGVyaXRlZFJvbGVOYW1lcyIsIiRzZXQiLCJtYXAiLCJyMiIsIm11bHRpIiwibGVuZ3RoIiwicmVuYW1lUm9sZSIsIm9sZE5hbWUiLCJuZXdOYW1lIiwicm9sZSIsImNvdW50IiwiaW5zZXJ0IiwiYWRkUm9sZXNUb1BhcmVudCIsInJvbGVzTmFtZXMiLCJwYXJlbnROYW1lIiwiQXJyYXkiLCJpc0FycmF5IiwiX2FkZFJvbGVUb1BhcmVudCIsImluY2x1ZGVzIiwiJG5lIiwiJHB1c2giLCIkZWFjaCIsInJlbW92ZVJvbGVzRnJvbVBhcmVudCIsIl9yZW1vdmVSb2xlRnJvbVBhcmVudCIsImZpZWxkcyIsImFkZFVzZXJzVG9Sb2xlcyIsInVzZXJzIiwiaWQiLCJfbm9ybWFsaXplT3B0aW9ucyIsIl9jaGVja1Njb3BlTmFtZSIsInNjb3BlIiwiaWZFeGlzdHMiLCJ1c2VyIiwiX2FkZFVzZXJUb1JvbGUiLCJzZXRVc2VyUm9sZXMiLCJhbnlTY29wZSIsInNlbGVjdG9yIiwidXNlcklkIiwicmVzIiwicGFyZW50Um9sZXMiLCJTZXQiLCJwYXJlbnRSb2xlIiwiYWRkIiwiZGVsZXRlIiwibmVzdGVkUm9sZXMiLCJyZW1vdmVVc2Vyc0Zyb21Sb2xlcyIsIl9yZW1vdmVVc2VyRnJvbVJvbGUiLCJ1c2VySXNJblJvbGUiLCJmaWx0ZXIiLCJzb21lIiwibGltaXQiLCJnZXRSb2xlc0ZvclVzZXIiLCJmdWxsT2JqZWN0cyIsIm9ubHlBc3NpZ25lZCIsIm9ubHlTY29wZWQiLCJwdXNoIiwicmVkdWNlIiwicmV2IiwiY3VycmVudCIsImNvbmNhdCIsImdldEFsbFJvbGVzIiwicXVlcnlPcHRpb25zIiwic29ydCIsImdldFVzZXJzSW5Sb2xlIiwiaWRzIiwiZ2V0VXNlckFzc2lnbm1lbnRzRm9yUm9sZSIsImEiLCJfZ2V0VXNlcnNJblJvbGVDdXJzb3IiLCJnZXRHcm91cHNGb3JVc2VyIiwiY29uc29sZSIsIndhcm4iLCJnZXRTY29wZXNGb3JVc2VyIiwic2NvcGVzIiwib2JpIiwicmVuYW1lU2NvcGUiLCJyZW1vdmVTY29wZSIsIm5hbWUiLCJ0cmltIiwiaXNQYXJlbnRPZiIsInBhcmVudFJvbGVOYW1lIiwiY2hpbGRSb2xlTmFtZSIsInJvbGVzVG9DaGVjayIsInBvcCIsInVuZGVmaW5lZCIsIl9ub3JtYWxpemVTY29wZU5hbWUiLCJzY29wZU5hbWUiLCJfZW5zdXJlSW5kZXgiLCJwdWJsaXNoIiwibG9nZ2VkSW5Vc2VySWQiLCJyZWFkeSIsIl9pc05ld1JvbGUiLCJfaXNPbGRSb2xlIiwiX2lzTmV3RmllbGQiLCJfaXNPbGRGaWVsZCIsIl9jb252ZXJ0VG9OZXdSb2xlIiwib2xkUm9sZSIsIl9jb252ZXJ0VG9PbGRSb2xlIiwibmV3Um9sZSIsIl9jb252ZXJ0VG9OZXdGaWVsZCIsIm9sZFJvbGVzIiwiY29udmVydFVuZGVyc2NvcmVzVG9Eb3RzIiwiaW5kZXgiLCJhc3NpZ25lZCIsImVudHJpZXMiLCJncm91cCIsInJvbGVzQXJyYXkiLCJyZXBsYWNlIiwiX2NvbnZlcnRUb09sZEZpZWxkIiwibmV3Um9sZXMiLCJ1c2luZ0dyb3VwcyIsInVzZXJSb2xlIiwiX19nbG9iYWxfcm9sZXNfXyIsIl9kZWZhdWx0VXBkYXRlVXNlciIsIl9kZWZhdWx0VXBkYXRlUm9sZSIsIl9kcm9wQ29sbGVjdGlvbkluZGV4IiwiY29sbGVjdGlvbiIsImluZGV4TmFtZSIsIl9kcm9wSW5kZXgiLCJlIiwidGVzdCIsImVyciIsImVycm1zZyIsIl9mb3J3YXJkTWlncmF0ZSIsInVwZGF0ZVVzZXIiLCJ1cGRhdGVSb2xlIiwiY3Vyc29yIiwiX2ZvcndhcmRNaWdyYXRlMiIsInVzZXJTZWxlY3RvciIsIiR1bnNldCIsIl9iYWNrd2FyZE1pZ3JhdGUiLCJfYmFja3dhcmRNaWdyYXRlMiIsImFzc2lnbm1lbnRTZWxlY3RvciIsImN1cnJlbnRSb2xlIiwiaW5oZXJpdGVkUm9sZSIsImN1cnJlbnRJbmhlcml0ZWRSb2xlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUksQ0FBQ0EsTUFBTSxDQUFDQyxLQUFaLEVBQW1CO0FBQ2pCRCxVQUFNLENBQUNDLEtBQVAsR0FBZSxJQUFJQyxLQUFLLENBQUNDLFVBQVYsQ0FBcUIsT0FBckIsQ0FBZjtBQUNEOztBQUVELE1BQUksQ0FBQ0gsTUFBTSxDQUFDSSxjQUFaLEVBQTRCO0FBQzFCSixVQUFNLENBQUNJLGNBQVAsR0FBd0IsSUFBSUYsS0FBSyxDQUFDQyxVQUFWLENBQXFCLGlCQUFyQixDQUF4QjtBQUNEO0FBRUQ7QUFDQTtBQUNB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YyxDQUFDLENBQUNkO0FBQVQsT0FBN0I7QUFDRCxLQTVCRDtBQTZCRDtBQXhXa0IsQ0FBckIsRSIsImZpbGUiOiIvcGFja2FnZXMvYWxhbm5pbmdfcm9sZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWwgTWV0ZW9yLCBSb2xlcywgTW9uZ28gKi9cblxuLyoqXG4gKiBQcm92aWRlcyBmdW5jdGlvbnMgcmVsYXRlZCB0byB1c2VyIGF1dGhvcml6YXRpb24uIENvbXBhdGlibGUgd2l0aCBidWlsdC1pbiBNZXRlb3IgYWNjb3VudHMgcGFja2FnZXMuXG4gKlxuICogUm9sZXMgYXJlIGFjY2Vzc2libGUgdGhyb2doIGBNZXRlb3Iucm9sZXNgIGNvbGxlY3Rpb24gYW5kIGRvY3VtZW50cyBjb25zaXN0IG9mOlxuICogIC0gYF9pZGA6IHJvbGUgbmFtZVxuICogIC0gYGNoaWxkcmVuYDogbGlzdCBvZiBzdWJkb2N1bWVudHM6XG4gKiAgICAtIGBfaWRgXG4gKlxuICogQ2hpbGRyZW4gbGlzdCBlbGVtZW50cyBhcmUgc3ViZG9jdW1lbnRzIHNvIHRoYXQgdGhleSBjYW4gYmUgZWFzaWVyIGV4dGVuZGVkIGluIHRoZSBmdXR1cmUgb3IgYnkgcGx1Z2lucy5cbiAqXG4gKiBSb2xlcyBjYW4gaGF2ZSBtdWx0aXBsZSBwYXJlbnRzIGFuZCBjYW4gYmUgY2hpbGRyZW4gKHN1YnJvbGVzKSBvZiBtdWx0aXBsZSByb2xlcy5cbiAqXG4gKiBFeGFtcGxlOiBge19pZDogJ2FkbWluJywgY2hpbGRyZW46IFt7X2lkOiAnZWRpdG9yJ31dfWBcbiAqXG4gKiBUaGUgYXNzaWdubWVudCBvZiBhIHJvbGUgdG8gYSB1c2VyIGlzIHN0b3JlZCBpbiBhIGNvbGxlY3Rpb24sIGFjY2Vzc2libGUgdGhyb3VnaCBgTWV0ZW9yLnJvbGVBc3NpZ25tZW50YC5cbiAqIEl0J3MgZG9jdW1lbnRzIGNvbnNpc3Qgb2ZcbiAqICAtIGBfaWRgOiBJbnRlcm5hbCBNb25nb0RCIGlkXG4gKiAgLSBgcm9sZWA6IEEgcm9sZSBvYmplY3Qgd2hpY2ggZ290IGFzc2lnbmVkLiBVc3VhbGx5IG9ubHkgY29udGFpbnMgdGhlIGBfaWRgIHByb3BlcnR5XG4gKiAgLSBgdXNlcmA6IEEgdXNlciBvYmplY3QsIHVzdWFsbHkgb25seSBjb250YWlucyB0aGUgYF9pZGAgcHJvcGVydHlcbiAqICAtIGBzY29wZWA6IHNjb3BlIG5hbWVcbiAqICAtIGBpbmhlcml0ZWRSb2xlc2A6IEEgbGlzdCBvZiBhbGwgdGhlIHJvbGVzIG9iamVjdHMgaW5oZXJpdGVkIGJ5IHRoZSBhc3NpZ25lZCByb2xlLlxuICpcbiAqIEBtb2R1bGUgUm9sZXNcbiAqL1xuaWYgKCFNZXRlb3Iucm9sZXMpIHtcbiAgTWV0ZW9yLnJvbGVzID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ3JvbGVzJylcbn1cblxuaWYgKCFNZXRlb3Iucm9sZUFzc2lnbm1lbnQpIHtcbiAgTWV0ZW9yLnJvbGVBc3NpZ25tZW50ID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ3JvbGUtYXNzaWdubWVudCcpXG59XG5cbi8qKlxuICogQGNsYXNzIFJvbGVzXG4gKi9cbmlmICh0eXBlb2YgUm9sZXMgPT09ICd1bmRlZmluZWQnKSB7XG4gIFJvbGVzID0ge30gLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1nbG9iYWwtYXNzaWduXG59XG5cbnZhciBnZXRHcm91cHNGb3JVc2VyRGVwcmVjYXRpb25XYXJuaW5nID0gZmFsc2VcblxuT2JqZWN0LmFzc2lnbihSb2xlcywge1xuXG4gIC8qKlxuICAgKiBVc2VkIGFzIGEgZ2xvYmFsIGdyb3VwIChub3cgc2NvcGUpIG5hbWUuIE5vdCB1c2VkIGFueW1vcmUuXG4gICAqXG4gICAqIEBwcm9wZXJ0eSBHTE9CQUxfR1JPVVBcbiAgICogQHN0YXRpY1xuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgR0xPQkFMX0dST1VQOiBudWxsLFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgcm9sZS5cbiAgICpcbiAgICogQG1ldGhvZCBjcmVhdGVSb2xlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSByb2xlTmFtZSBOYW1lIG9mIHJvbGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gT3B0aW9uczpcbiAgICogICAtIGB1bmxlc3NFeGlzdHNgOiBpZiBgdHJ1ZWAsIGV4Y2VwdGlvbiB3aWxsIG5vdCBiZSB0aHJvd24gaW4gdGhlIHJvbGUgYWxyZWFkeSBleGlzdHNcbiAgICogQHJldHVybiB7U3RyaW5nfSBJRCBvZiB0aGUgbmV3IHJvbGUgb3IgbnVsbC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgY3JlYXRlUm9sZTogZnVuY3Rpb24gKHJvbGVOYW1lLCBvcHRpb25zKSB7XG4gICAgUm9sZXMuX2NoZWNrUm9sZU5hbWUocm9sZU5hbWUpXG5cbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICB1bmxlc3NFeGlzdHM6IGZhbHNlXG4gICAgfSwgb3B0aW9ucylcblxuICAgIHZhciByZXN1bHQgPSBNZXRlb3Iucm9sZXMudXBzZXJ0KHsgX2lkOiByb2xlTmFtZSB9LCB7ICRzZXRPbkluc2VydDogeyBjaGlsZHJlbjogW10gfSB9KVxuXG4gICAgaWYgKCFyZXN1bHQuaW5zZXJ0ZWRJZCkge1xuICAgICAgaWYgKG9wdGlvbnMudW5sZXNzRXhpc3RzKSByZXR1cm4gbnVsbFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSb2xlIFxcJycgKyByb2xlTmFtZSArICdcXCcgYWxyZWFkeSBleGlzdHMuJylcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0Lmluc2VydGVkSWRcbiAgfSxcblxuICAvKipcbiAgICogRGVsZXRlIGFuIGV4aXN0aW5nIHJvbGUuXG4gICAqXG4gICAqIElmIHRoZSByb2xlIGlzIHNldCBmb3IgYW55IHVzZXIsIGl0IGlzIGF1dG9tYXRpY2FsbHkgdW5zZXQuXG4gICAqXG4gICAqIEBtZXRob2QgZGVsZXRlUm9sZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gcm9sZU5hbWUgTmFtZSBvZiByb2xlLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBkZWxldGVSb2xlOiBmdW5jdGlvbiAocm9sZU5hbWUpIHtcbiAgICB2YXIgcm9sZXNcbiAgICB2YXIgaW5oZXJpdGVkUm9sZXNcblxuICAgIFJvbGVzLl9jaGVja1JvbGVOYW1lKHJvbGVOYW1lKVxuXG4gICAgLy8gUmVtb3ZlIGFsbCBhc3NpZ25tZW50c1xuICAgIE1ldGVvci5yb2xlQXNzaWdubWVudC5yZW1vdmUoe1xuICAgICAgJ3JvbGUuX2lkJzogcm9sZU5hbWVcbiAgICB9KVxuXG4gICAgZG8ge1xuICAgICAgLy8gRm9yIGFsbCByb2xlcyB3aG8gaGF2ZSBpdCBhcyBhIGRlcGVuZGVuY3kgLi4uXG4gICAgICByb2xlcyA9IFJvbGVzLl9nZXRQYXJlbnRSb2xlTmFtZXMoTWV0ZW9yLnJvbGVzLmZpbmRPbmUoeyBfaWQ6IHJvbGVOYW1lIH0pKVxuXG4gICAgICBNZXRlb3Iucm9sZXMuZmluZCh7IF9pZDogeyAkaW46IHJvbGVzIH0gfSkuZmV0Y2goKS5mb3JFYWNoKHIgPT4ge1xuICAgICAgICBNZXRlb3Iucm9sZXMudXBkYXRlKHtcbiAgICAgICAgICBfaWQ6IHIuX2lkXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAkcHVsbDoge1xuICAgICAgICAgICAgY2hpbGRyZW46IHtcbiAgICAgICAgICAgICAgX2lkOiByb2xlTmFtZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICBpbmhlcml0ZWRSb2xlcyA9IFJvbGVzLl9nZXRJbmhlcml0ZWRSb2xlTmFtZXMoTWV0ZW9yLnJvbGVzLmZpbmRPbmUoeyBfaWQ6IHIuX2lkIH0pKVxuICAgICAgICBNZXRlb3Iucm9sZUFzc2lnbm1lbnQudXBkYXRlKHtcbiAgICAgICAgICAncm9sZS5faWQnOiByLl9pZFxuICAgICAgICB9LCB7XG4gICAgICAgICAgJHNldDoge1xuICAgICAgICAgICAgaW5oZXJpdGVkUm9sZXM6IFtyLl9pZCwgLi4uaW5oZXJpdGVkUm9sZXNdLm1hcChyMiA9PiAoeyBfaWQ6IHIyIH0pKVxuICAgICAgICAgIH1cbiAgICAgICAgfSwgeyBtdWx0aTogdHJ1ZSB9KVxuICAgICAgfSlcbiAgICB9IHdoaWxlIChyb2xlcy5sZW5ndGggPiAwKVxuXG4gICAgLy8gQW5kIGZpbmFsbHkgcmVtb3ZlIHRoZSByb2xlIGl0c2VsZlxuICAgIE1ldGVvci5yb2xlcy5yZW1vdmUoeyBfaWQ6IHJvbGVOYW1lIH0pXG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbmFtZSBhbiBleGlzdGluZyByb2xlLlxuICAgKlxuICAgKiBAbWV0aG9kIHJlbmFtZVJvbGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG9sZE5hbWUgT2xkIG5hbWUgb2YgYSByb2xlLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmV3TmFtZSBOZXcgbmFtZSBvZiBhIHJvbGUuXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIHJlbmFtZVJvbGU6IGZ1bmN0aW9uIChvbGROYW1lLCBuZXdOYW1lKSB7XG4gICAgdmFyIHJvbGVcbiAgICB2YXIgY291bnRcblxuICAgIFJvbGVzLl9jaGVja1JvbGVOYW1lKG9sZE5hbWUpXG4gICAgUm9sZXMuX2NoZWNrUm9sZU5hbWUobmV3TmFtZSlcblxuICAgIGlmIChvbGROYW1lID09PSBuZXdOYW1lKSByZXR1cm5cblxuICAgIHJvbGUgPSBNZXRlb3Iucm9sZXMuZmluZE9uZSh7IF9pZDogb2xkTmFtZSB9KVxuXG4gICAgaWYgKCFyb2xlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JvbGUgXFwnJyArIG9sZE5hbWUgKyAnXFwnIGRvZXMgbm90IGV4aXN0LicpXG4gICAgfVxuXG4gICAgcm9sZS5faWQgPSBuZXdOYW1lXG5cbiAgICBNZXRlb3Iucm9sZXMuaW5zZXJ0KHJvbGUpXG5cbiAgICBkbyB7XG4gICAgICBjb3VudCA9IE1ldGVvci5yb2xlQXNzaWdubWVudC51cGRhdGUoe1xuICAgICAgICAncm9sZS5faWQnOiBvbGROYW1lXG4gICAgICB9LCB7XG4gICAgICAgICRzZXQ6IHtcbiAgICAgICAgICAncm9sZS5faWQnOiBuZXdOYW1lXG4gICAgICAgIH1cbiAgICAgIH0sIHsgbXVsdGk6IHRydWUgfSlcbiAgICB9IHdoaWxlIChjb3VudCA+IDApXG5cbiAgICBkbyB7XG4gICAgICBjb3VudCA9IE1ldGVvci5yb2xlQXNzaWdubWVudC51cGRhdGUoe1xuICAgICAgICAnaW5oZXJpdGVkUm9sZXMuX2lkJzogb2xkTmFtZVxuICAgICAgfSwge1xuICAgICAgICAkc2V0OiB7XG4gICAgICAgICAgJ2luaGVyaXRlZFJvbGVzLiQuX2lkJzogbmV3TmFtZVxuICAgICAgICB9XG4gICAgICB9LCB7IG11bHRpOiB0cnVlIH0pXG4gICAgfSB3aGlsZSAoY291bnQgPiAwKVxuXG4gICAgZG8ge1xuICAgICAgY291bnQgPSBNZXRlb3Iucm9sZXMudXBkYXRlKHtcbiAgICAgICAgJ2NoaWxkcmVuLl9pZCc6IG9sZE5hbWVcbiAgICAgIH0sIHtcbiAgICAgICAgJHNldDoge1xuICAgICAgICAgICdjaGlsZHJlbi4kLl9pZCc6IG5ld05hbWVcbiAgICAgICAgfVxuICAgICAgfSwgeyBtdWx0aTogdHJ1ZSB9KVxuICAgIH0gd2hpbGUgKGNvdW50ID4gMClcblxuICAgIE1ldGVvci5yb2xlcy5yZW1vdmUoeyBfaWQ6IG9sZE5hbWUgfSlcbiAgfSxcblxuICAvKipcbiAgICogQWRkIHJvbGUgcGFyZW50IHRvIHJvbGVzLlxuICAgKlxuICAgKiBQcmV2aW91cyBwYXJlbnRzIGFyZSBrZXB0IChyb2xlIGNhbiBoYXZlIG11bHRpcGxlIHBhcmVudHMpLiBGb3IgdXNlcnMgd2hpY2ggaGF2ZSB0aGVcbiAgICogcGFyZW50IHJvbGUgc2V0LCBuZXcgc3Vicm9sZXMgYXJlIGFkZGVkIGF1dG9tYXRpY2FsbHkuXG4gICAqXG4gICAqIEBtZXRob2QgYWRkUm9sZXNUb1BhcmVudFxuICAgKiBAcGFyYW0ge0FycmF5fFN0cmluZ30gcm9sZXNOYW1lcyBOYW1lKHMpIG9mIHJvbGUocykuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXJlbnROYW1lIE5hbWUgb2YgcGFyZW50IHJvbGUuXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGFkZFJvbGVzVG9QYXJlbnQ6IGZ1bmN0aW9uIChyb2xlc05hbWVzLCBwYXJlbnROYW1lKSB7XG4gICAgLy8gZW5zdXJlIGFycmF5c1xuICAgIGlmICghQXJyYXkuaXNBcnJheShyb2xlc05hbWVzKSkgcm9sZXNOYW1lcyA9IFtyb2xlc05hbWVzXVxuXG4gICAgcm9sZXNOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChyb2xlTmFtZSkge1xuICAgICAgUm9sZXMuX2FkZFJvbGVUb1BhcmVudChyb2xlTmFtZSwgcGFyZW50TmFtZSlcbiAgICB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9hZGRSb2xlVG9QYXJlbnRcbiAgICogQHBhcmFtIHtTdHJpbmd9IHJvbGVOYW1lIE5hbWUgb2Ygcm9sZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmVudE5hbWUgTmFtZSBvZiBwYXJlbnQgcm9sZS5cbiAgICogQHByaXZhdGVcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgX2FkZFJvbGVUb1BhcmVudDogZnVuY3Rpb24gKHJvbGVOYW1lLCBwYXJlbnROYW1lKSB7XG4gICAgdmFyIHJvbGVcbiAgICB2YXIgY291bnRcblxuICAgIFJvbGVzLl9jaGVja1JvbGVOYW1lKHJvbGVOYW1lKVxuICAgIFJvbGVzLl9jaGVja1JvbGVOYW1lKHBhcmVudE5hbWUpXG5cbiAgICAvLyBxdWVyeSB0byBnZXQgcm9sZSdzIGNoaWxkcmVuXG4gICAgcm9sZSA9IE1ldGVvci5yb2xlcy5maW5kT25lKHsgX2lkOiByb2xlTmFtZSB9KVxuXG4gICAgaWYgKCFyb2xlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JvbGUgXFwnJyArIHJvbGVOYW1lICsgJ1xcJyBkb2VzIG5vdCBleGlzdC4nKVxuICAgIH1cblxuICAgIC8vIGRldGVjdCBjeWNsZXNcbiAgICBpZiAoUm9sZXMuX2dldEluaGVyaXRlZFJvbGVOYW1lcyhyb2xlKS5pbmNsdWRlcyhwYXJlbnROYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSb2xlcyBcXCcnICsgcm9sZU5hbWUgKyAnXFwnIGFuZCBcXCcnICsgcGFyZW50TmFtZSArICdcXCcgd291bGQgZm9ybSBhIGN5Y2xlLicpXG4gICAgfVxuXG4gICAgY291bnQgPSBNZXRlb3Iucm9sZXMudXBkYXRlKHtcbiAgICAgIF9pZDogcGFyZW50TmFtZSxcbiAgICAgICdjaGlsZHJlbi5faWQnOiB7XG4gICAgICAgICRuZTogcm9sZS5faWRcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICAkcHVzaDoge1xuICAgICAgICBjaGlsZHJlbjoge1xuICAgICAgICAgIF9pZDogcm9sZS5faWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBpZiB0aGVyZSB3YXMgbm8gY2hhbmdlLCBwYXJlbnQgcm9sZSBtaWdodCBub3QgZXhpc3QsIG9yIHJvbGUgaXNcbiAgICAvLyBhbHJlYWR5IGEgc3Vicm9sZTsgaW4gYW55IGNhc2Ugd2UgZG8gbm90IGhhdmUgYW55dGhpbmcgbW9yZSB0byBkb1xuICAgIGlmICghY291bnQpIHJldHVyblxuXG4gICAgTWV0ZW9yLnJvbGVBc3NpZ25tZW50LnVwZGF0ZSh7XG4gICAgICAnaW5oZXJpdGVkUm9sZXMuX2lkJzogcGFyZW50TmFtZVxuICAgIH0sIHtcbiAgICAgICRwdXNoOiB7XG4gICAgICAgIGluaGVyaXRlZFJvbGVzOiB7ICRlYWNoOiBbcm9sZS5faWQsIC4uLlJvbGVzLl9nZXRJbmhlcml0ZWRSb2xlTmFtZXMocm9sZSldLm1hcChyID0+ICh7IF9pZDogciB9KSkgfVxuICAgICAgfVxuICAgIH0sIHsgbXVsdGk6IHRydWUgfSlcbiAgfSxcblxuICAvKipcbiAgICogUmVtb3ZlIHJvbGUgcGFyZW50IGZyb20gcm9sZXMuXG4gICAqXG4gICAqIE90aGVyIHBhcmVudHMgYXJlIGtlcHQgKHJvbGUgY2FuIGhhdmUgbXVsdGlwbGUgcGFyZW50cykuIEZvciB1c2VycyB3aGljaCBoYXZlIHRoZVxuICAgKiBwYXJlbnQgcm9sZSBzZXQsIHJlbW92ZWQgc3Vicm9sZSBpcyByZW1vdmVkIGF1dG9tYXRpY2FsbHkuXG4gICAqXG4gICAqIEBtZXRob2QgcmVtb3ZlUm9sZXNGcm9tUGFyZW50XG4gICAqIEBwYXJhbSB7QXJyYXl8U3RyaW5nfSByb2xlc05hbWVzIE5hbWUocykgb2Ygcm9sZShzKS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhcmVudE5hbWUgTmFtZSBvZiBwYXJlbnQgcm9sZS5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgcmVtb3ZlUm9sZXNGcm9tUGFyZW50OiBmdW5jdGlvbiAocm9sZXNOYW1lcywgcGFyZW50TmFtZSkge1xuICAgIC8vIGVuc3VyZSBhcnJheXNcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocm9sZXNOYW1lcykpIHJvbGVzTmFtZXMgPSBbcm9sZXNOYW1lc11cblxuICAgIHJvbGVzTmFtZXMuZm9yRWFjaChmdW5jdGlvbiAocm9sZU5hbWUpIHtcbiAgICAgIFJvbGVzLl9yZW1vdmVSb2xlRnJvbVBhcmVudChyb2xlTmFtZSwgcGFyZW50TmFtZSlcbiAgICB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9yZW1vdmVSb2xlRnJvbVBhcmVudFxuICAgKiBAcGFyYW0ge1N0cmluZ30gcm9sZU5hbWUgTmFtZSBvZiByb2xlLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGFyZW50TmFtZSBOYW1lIG9mIHBhcmVudCByb2xlLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfcmVtb3ZlUm9sZUZyb21QYXJlbnQ6IGZ1bmN0aW9uIChyb2xlTmFtZSwgcGFyZW50TmFtZSkge1xuICAgIFJvbGVzLl9jaGVja1JvbGVOYW1lKHJvbGVOYW1lKVxuICAgIFJvbGVzLl9jaGVja1JvbGVOYW1lKHBhcmVudE5hbWUpXG5cbiAgICAvLyBjaGVjayBmb3Igcm9sZSBleGlzdGVuY2VcbiAgICAvLyB0aGlzIHdvdWxkIG5vdCByZWFsbHkgYmUgbmVlZGVkLCBidXQgd2UgYXJlIHRyeWluZyB0byBtYXRjaCBhZGRSb2xlc1RvUGFyZW50XG4gICAgbGV0IHJvbGUgPSBNZXRlb3Iucm9sZXMuZmluZE9uZSh7IF9pZDogcm9sZU5hbWUgfSwgeyBmaWVsZHM6IHsgX2lkOiAxIH0gfSlcblxuICAgIGlmICghcm9sZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSb2xlIFxcJycgKyByb2xlTmFtZSArICdcXCcgZG9lcyBub3QgZXhpc3QuJylcbiAgICB9XG5cbiAgICBjb25zdCBjb3VudCA9IE1ldGVvci5yb2xlcy51cGRhdGUoe1xuICAgICAgX2lkOiBwYXJlbnROYW1lXG4gICAgfSwge1xuICAgICAgJHB1bGw6IHtcbiAgICAgICAgY2hpbGRyZW46IHtcbiAgICAgICAgICBfaWQ6IHJvbGUuX2lkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gaWYgdGhlcmUgd2FzIG5vIGNoYW5nZSwgcGFyZW50IHJvbGUgbWlnaHQgbm90IGV4aXN0LCBvciByb2xlIHdhc1xuICAgIC8vIGFscmVhZHkgbm90IGEgc3Vicm9sZTsgaW4gYW55IGNhc2Ugd2UgZG8gbm90IGhhdmUgYW55dGhpbmcgbW9yZSB0byBkb1xuICAgIGlmICghY291bnQpIHJldHVyblxuXG4gICAgLy8gRm9yIGFsbCByb2xlcyB3aG8gaGF2ZSBoYWQgaXQgYXMgYSBkZXBlbmRlbmN5IC4uLlxuICAgIGNvbnN0IHJvbGVzID0gWy4uLlJvbGVzLl9nZXRQYXJlbnRSb2xlTmFtZXMoTWV0ZW9yLnJvbGVzLmZpbmRPbmUoeyBfaWQ6IHBhcmVudE5hbWUgfSkpLCBwYXJlbnROYW1lXVxuXG4gICAgTWV0ZW9yLnJvbGVzLmZpbmQoeyBfaWQ6IHsgJGluOiByb2xlcyB9IH0pLmZldGNoKCkuZm9yRWFjaChyID0+IHtcbiAgICAgIGNvbnN0IGluaGVyaXRlZFJvbGVzID0gUm9sZXMuX2dldEluaGVyaXRlZFJvbGVOYW1lcyhNZXRlb3Iucm9sZXMuZmluZE9uZSh7IF9pZDogci5faWQgfSkpXG4gICAgICBNZXRlb3Iucm9sZUFzc2lnbm1lbnQudXBkYXRlKHtcbiAgICAgICAgJ3JvbGUuX2lkJzogci5faWQsXG4gICAgICAgICdpbmhlcml0ZWRSb2xlcy5faWQnOiByb2xlLl9pZFxuICAgICAgfSwge1xuICAgICAgICAkc2V0OiB7XG4gICAgICAgICAgaW5oZXJpdGVkUm9sZXM6IFtyLl9pZCwgLi4uaW5oZXJpdGVkUm9sZXNdLm1hcChyMiA9PiAoeyBfaWQ6IHIyIH0pKVxuICAgICAgICB9XG4gICAgICB9LCB7IG11bHRpOiB0cnVlIH0pXG4gICAgfSlcbiAgfSxcblxuICAvKipcbiAgICogQWRkIHVzZXJzIHRvIHJvbGVzLlxuICAgKlxuICAgKiBBZGRzIHJvbGVzIHRvIGV4aXN0aW5nIHJvbGVzIGZvciBlYWNoIHVzZXIuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqICAgICBSb2xlcy5hZGRVc2Vyc1RvUm9sZXModXNlcklkLCAnYWRtaW4nKVxuICAgKiAgICAgUm9sZXMuYWRkVXNlcnNUb1JvbGVzKHVzZXJJZCwgWyd2aWV3LXNlY3JldHMnXSwgJ2V4YW1wbGUuY29tJylcbiAgICogICAgIFJvbGVzLmFkZFVzZXJzVG9Sb2xlcyhbdXNlcjEsIHVzZXIyXSwgWyd1c2VyJywnZWRpdG9yJ10pXG4gICAqICAgICBSb2xlcy5hZGRVc2Vyc1RvUm9sZXMoW3VzZXIxLCB1c2VyMl0sIFsnZ2xvcmlvdXMtYWRtaW4nLCAncGVyZm9ybS1hY3Rpb24nXSwgJ2V4YW1wbGUub3JnJylcbiAgICpcbiAgICogQG1ldGhvZCBhZGRVc2Vyc1RvUm9sZXNcbiAgICogQHBhcmFtIHtBcnJheXxTdHJpbmd9IHVzZXJzIFVzZXIgSUQocykgb3Igb2JqZWN0KHMpIHdpdGggYW4gYF9pZGAgZmllbGQuXG4gICAqIEBwYXJhbSB7QXJyYXl8U3RyaW5nfSByb2xlcyBOYW1lKHMpIG9mIHJvbGVzIHRvIGFkZCB1c2VycyB0by4gUm9sZXMgaGF2ZSB0byBleGlzdC5cbiAgICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBbb3B0aW9uc10gT3B0aW9uczpcbiAgICogICAtIGBzY29wZWA6IG5hbWUgb2YgdGhlIHNjb3BlLCBvciBgbnVsbGAgZm9yIHRoZSBnbG9iYWwgcm9sZVxuICAgKiAgIC0gYGlmRXhpc3RzYDogaWYgYHRydWVgLCBkbyBub3QgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIHRoZSByb2xlIGRvZXMgbm90IGV4aXN0XG4gICAqXG4gICAqIEFsdGVybmF0aXZlbHksIGl0IGNhbiBiZSBhIHNjb3BlIG5hbWUgc3RyaW5nLlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBhZGRVc2Vyc1RvUm9sZXM6IGZ1bmN0aW9uICh1c2Vycywgcm9sZXMsIG9wdGlvbnMpIHtcbiAgICB2YXIgaWRcblxuICAgIGlmICghdXNlcnMpIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBcXCd1c2Vyc1xcJyBwYXJhbS4nKVxuICAgIGlmICghcm9sZXMpIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBcXCdyb2xlc1xcJyBwYXJhbS4nKVxuXG4gICAgb3B0aW9ucyA9IFJvbGVzLl9ub3JtYWxpemVPcHRpb25zKG9wdGlvbnMpXG5cbiAgICAvLyBlbnN1cmUgYXJyYXlzXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHVzZXJzKSkgdXNlcnMgPSBbdXNlcnNdXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHJvbGVzKSkgcm9sZXMgPSBbcm9sZXNdXG5cbiAgICBSb2xlcy5fY2hlY2tTY29wZU5hbWUob3B0aW9ucy5zY29wZSlcblxuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIGlmRXhpc3RzOiBmYWxzZVxuICAgIH0sIG9wdGlvbnMpXG5cbiAgICB1c2Vycy5mb3JFYWNoKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICBpZiAodHlwZW9mIHVzZXIgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlkID0gdXNlci5faWRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlkID0gdXNlclxuICAgICAgfVxuXG4gICAgICByb2xlcy5mb3JFYWNoKGZ1bmN0aW9uIChyb2xlKSB7XG4gICAgICAgIFJvbGVzLl9hZGRVc2VyVG9Sb2xlKGlkLCByb2xlLCBvcHRpb25zKVxuICAgICAgfSlcbiAgICB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBTZXQgdXNlcnMnIHJvbGVzLlxuICAgKlxuICAgKiBSZXBsYWNlcyBhbGwgZXhpc3Rpbmcgcm9sZXMgd2l0aCBhIG5ldyBzZXQgb2Ygcm9sZXMuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqICAgICBSb2xlcy5zZXRVc2VyUm9sZXModXNlcklkLCAnYWRtaW4nKVxuICAgKiAgICAgUm9sZXMuc2V0VXNlclJvbGVzKHVzZXJJZCwgWyd2aWV3LXNlY3JldHMnXSwgJ2V4YW1wbGUuY29tJylcbiAgICogICAgIFJvbGVzLnNldFVzZXJSb2xlcyhbdXNlcjEsIHVzZXIyXSwgWyd1c2VyJywnZWRpdG9yJ10pXG4gICAqICAgICBSb2xlcy5zZXRVc2VyUm9sZXMoW3VzZXIxLCB1c2VyMl0sIFsnZ2xvcmlvdXMtYWRtaW4nLCAncGVyZm9ybS1hY3Rpb24nXSwgJ2V4YW1wbGUub3JnJylcbiAgICpcbiAgICogQG1ldGhvZCBzZXRVc2VyUm9sZXNcbiAgICogQHBhcmFtIHtBcnJheXxTdHJpbmd9IHVzZXJzIFVzZXIgSUQocykgb3Igb2JqZWN0KHMpIHdpdGggYW4gYF9pZGAgZmllbGQuXG4gICAqIEBwYXJhbSB7QXJyYXl8U3RyaW5nfSByb2xlcyBOYW1lKHMpIG9mIHJvbGVzIHRvIGFkZCB1c2VycyB0by4gUm9sZXMgaGF2ZSB0byBleGlzdC5cbiAgICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBbb3B0aW9uc10gT3B0aW9uczpcbiAgICogICAtIGBzY29wZWA6IG5hbWUgb2YgdGhlIHNjb3BlLCBvciBgbnVsbGAgZm9yIHRoZSBnbG9iYWwgcm9sZVxuICAgKiAgIC0gYGFueVNjb3BlYDogaWYgYHRydWVgLCByZW1vdmUgYWxsIHJvbGVzIHRoZSB1c2VyIGhhcywgb2YgYW55IHNjb3BlLCBpZiBgZmFsc2VgLCBvbmx5IHRoZSBvbmUgaW4gdGhlIHNhbWUgc2NvcGVcbiAgICogICAtIGBpZkV4aXN0c2A6IGlmIGB0cnVlYCwgZG8gbm90IHRocm93IGFuIGV4Y2VwdGlvbiBpZiB0aGUgcm9sZSBkb2VzIG5vdCBleGlzdFxuICAgKlxuICAgKiBBbHRlcm5hdGl2ZWx5LCBpdCBjYW4gYmUgYSBzY29wZSBuYW1lIHN0cmluZy5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgc2V0VXNlclJvbGVzOiBmdW5jdGlvbiAodXNlcnMsIHJvbGVzLCBvcHRpb25zKSB7XG4gICAgdmFyIGlkXG5cbiAgICBpZiAoIXVzZXJzKSB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgXFwndXNlcnNcXCcgcGFyYW0uJylcbiAgICBpZiAoIXJvbGVzKSB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgXFwncm9sZXNcXCcgcGFyYW0uJylcblxuICAgIG9wdGlvbnMgPSBSb2xlcy5fbm9ybWFsaXplT3B0aW9ucyhvcHRpb25zKVxuXG4gICAgLy8gZW5zdXJlIGFycmF5c1xuICAgIGlmICghQXJyYXkuaXNBcnJheSh1c2VycykpIHVzZXJzID0gW3VzZXJzXVxuICAgIGlmICghQXJyYXkuaXNBcnJheShyb2xlcykpIHJvbGVzID0gW3JvbGVzXVxuXG4gICAgUm9sZXMuX2NoZWNrU2NvcGVOYW1lKG9wdGlvbnMuc2NvcGUpXG5cbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBpZkV4aXN0czogZmFsc2UsXG4gICAgICBhbnlTY29wZTogZmFsc2VcbiAgICB9LCBvcHRpb25zKVxuXG4gICAgdXNlcnMuZm9yRWFjaChmdW5jdGlvbiAodXNlcikge1xuICAgICAgaWYgKHR5cGVvZiB1c2VyID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpZCA9IHVzZXIuX2lkXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZCA9IHVzZXJcbiAgICAgIH1cbiAgICAgIC8vIHdlIGZpcnN0IGNsZWFyIGFsbCByb2xlcyBmb3IgdGhlIHVzZXJcbiAgICAgIGNvbnN0IHNlbGVjdG9yID0geyAndXNlci5faWQnOiBpZCB9XG4gICAgICBpZiAoIW9wdGlvbnMuYW55U2NvcGUpIHtcbiAgICAgICAgc2VsZWN0b3Iuc2NvcGUgPSBvcHRpb25zLnNjb3BlXG4gICAgICB9XG5cbiAgICAgIE1ldGVvci5yb2xlQXNzaWdubWVudC5yZW1vdmUoc2VsZWN0b3IpXG5cbiAgICAgIC8vIGFuZCB0aGVuIGFkZCBhbGxcbiAgICAgIHJvbGVzLmZvckVhY2goZnVuY3Rpb24gKHJvbGUpIHtcbiAgICAgICAgUm9sZXMuX2FkZFVzZXJUb1JvbGUoaWQsIHJvbGUsIG9wdGlvbnMpXG4gICAgICB9KVxuICAgIH0pXG4gIH0sXG5cbiAgLyoqXG4gICAqIEFkZCBvbmUgdXNlciB0byBvbmUgcm9sZS5cbiAgICpcbiAgICogQG1ldGhvZCBfYWRkVXNlclRvUm9sZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gdXNlcklkIFRoZSB1c2VyIElELlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcm9sZU5hbWUgTmFtZSBvZiB0aGUgcm9sZSB0byBhZGQgdGhlIHVzZXIgdG8uIFRoZSByb2xlIGhhdmUgdG8gZXhpc3QuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIE9wdGlvbnM6XG4gICAqICAgLSBgc2NvcGVgOiBuYW1lIG9mIHRoZSBzY29wZSwgb3IgYG51bGxgIGZvciB0aGUgZ2xvYmFsIHJvbGVcbiAgICogICAtIGBpZkV4aXN0c2A6IGlmIGB0cnVlYCwgZG8gbm90IHRocm93IGFuIGV4Y2VwdGlvbiBpZiB0aGUgcm9sZSBkb2VzIG5vdCBleGlzdFxuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfYWRkVXNlclRvUm9sZTogZnVuY3Rpb24gKHVzZXJJZCwgcm9sZU5hbWUsIG9wdGlvbnMpIHtcbiAgICBSb2xlcy5fY2hlY2tSb2xlTmFtZShyb2xlTmFtZSlcbiAgICBSb2xlcy5fY2hlY2tTY29wZU5hbWUob3B0aW9ucy5zY29wZSlcblxuICAgIGlmICghdXNlcklkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCByb2xlID0gTWV0ZW9yLnJvbGVzLmZpbmRPbmUoeyBfaWQ6IHJvbGVOYW1lIH0sIHsgZmllbGRzOiB7IGNoaWxkcmVuOiAxIH0gfSlcblxuICAgIGlmICghcm9sZSkge1xuICAgICAgaWYgKG9wdGlvbnMuaWZFeGlzdHMpIHtcbiAgICAgICAgcmV0dXJuIFtdXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JvbGUgXFwnJyArIHJvbGVOYW1lICsgJ1xcJyBkb2VzIG5vdCBleGlzdC4nKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoaXMgbWlnaHQgY3JlYXRlIGR1cGxpY2F0ZXMsIGJlY2F1c2Ugd2UgZG9uJ3QgaGF2ZSBhIHVuaXF1ZSBpbmRleCwgYnV0IHRoYXQncyBhbGwgcmlnaHQuIEluIGNhc2UgdGhlcmUgYXJlIHR3bywgd2l0aGRyYXdpbmcgdGhlIHJvbGUgd2lsbCBlZmZlY3RpdmVseSBraWxsIHRoZW0gYm90aC5cbiAgICBjb25zdCByZXMgPSBNZXRlb3Iucm9sZUFzc2lnbm1lbnQudXBzZXJ0KHtcbiAgICAgICd1c2VyLl9pZCc6IHVzZXJJZCxcbiAgICAgICdyb2xlLl9pZCc6IHJvbGVOYW1lLFxuICAgICAgc2NvcGU6IG9wdGlvbnMuc2NvcGVcbiAgICB9LCB7XG4gICAgICAkc2V0T25JbnNlcnQ6IHtcbiAgICAgICAgdXNlcjogeyBfaWQ6IHVzZXJJZCB9LFxuICAgICAgICByb2xlOiB7IF9pZDogcm9sZU5hbWUgfSxcbiAgICAgICAgc2NvcGU6IG9wdGlvbnMuc2NvcGVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYgKHJlcy5pbnNlcnRlZElkKSB7XG4gICAgICBNZXRlb3Iucm9sZUFzc2lnbm1lbnQudXBkYXRlKHsgX2lkOiByZXMuaW5zZXJ0ZWRJZCB9LCB7XG4gICAgICAgICRzZXQ6IHtcbiAgICAgICAgICBpbmhlcml0ZWRSb2xlczogW3JvbGVOYW1lLCAuLi5Sb2xlcy5fZ2V0SW5oZXJpdGVkUm9sZU5hbWVzKHJvbGUpXS5tYXAociA9PiAoeyBfaWQ6IHIgfSkpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHJvbGUgbmFtZXMgdGhlIGdpdmVuIHJvbGUgbmFtZSBpcyBhIGNoaWxkIG9mLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAgICAgUm9sZXMuX2dldFBhcmVudFJvbGVOYW1lcyh7IF9pZDogJ2FkbWluJywgY2hpbGRyZW47IFtdIH0pXG4gICAqXG4gICAqIEBtZXRob2QgX2dldFBhcmVudFJvbGVOYW1lc1xuICAgKiBAcGFyYW0ge29iamVjdH0gcm9sZSBUaGUgcm9sZSBvYmplY3RcbiAgICogQHByaXZhdGVcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgX2dldFBhcmVudFJvbGVOYW1lczogZnVuY3Rpb24gKHJvbGUpIHtcbiAgICB2YXIgcGFyZW50Um9sZXNcblxuICAgIGlmICghcm9sZSkge1xuICAgICAgcmV0dXJuIFtdXG4gICAgfVxuXG4gICAgcGFyZW50Um9sZXMgPSBuZXcgU2V0KFtyb2xlLl9pZF0pXG5cbiAgICBwYXJlbnRSb2xlcy5mb3JFYWNoKHJvbGVOYW1lID0+IHtcbiAgICAgIE1ldGVvci5yb2xlcy5maW5kKHsgJ2NoaWxkcmVuLl9pZCc6IHJvbGVOYW1lIH0pLmZldGNoKCkuZm9yRWFjaChwYXJlbnRSb2xlID0+IHtcbiAgICAgICAgcGFyZW50Um9sZXMuYWRkKHBhcmVudFJvbGUuX2lkKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgcGFyZW50Um9sZXMuZGVsZXRlKHJvbGUuX2lkKVxuXG4gICAgcmV0dXJuIFsuLi5wYXJlbnRSb2xlc11cbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiByb2xlIG5hbWVzIHRoZSBnaXZlbiByb2xlIG5hbWUgaXMgYSBwYXJlbnQgb2YuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqICAgICBSb2xlcy5fZ2V0SW5oZXJpdGVkUm9sZU5hbWVzKHsgX2lkOiAnYWRtaW4nLCBjaGlsZHJlbjsgW10gfSlcbiAgICpcbiAgICogQG1ldGhvZCBfZ2V0SW5oZXJpdGVkUm9sZU5hbWVzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSByb2xlIFRoZSByb2xlIG9iamVjdFxuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfZ2V0SW5oZXJpdGVkUm9sZU5hbWVzOiBmdW5jdGlvbiAocm9sZSkge1xuICAgIGNvbnN0IGluaGVyaXRlZFJvbGVzID0gbmV3IFNldCgpXG4gICAgY29uc3QgbmVzdGVkUm9sZXMgPSBuZXcgU2V0KFtyb2xlXSlcblxuICAgIG5lc3RlZFJvbGVzLmZvckVhY2gociA9PiB7XG4gICAgICBjb25zdCByb2xlcyA9IE1ldGVvci5yb2xlcy5maW5kKHsgX2lkOiB7ICRpbjogci5jaGlsZHJlbi5tYXAociA9PiByLl9pZCkgfSB9LCB7IGZpZWxkczogeyBjaGlsZHJlbjogMSB9IH0pLmZldGNoKClcblxuICAgICAgcm9sZXMuZm9yRWFjaChyMiA9PiB7XG4gICAgICAgIGluaGVyaXRlZFJvbGVzLmFkZChyMi5faWQpXG4gICAgICAgIG5lc3RlZFJvbGVzLmFkZChyMilcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIHJldHVybiBbLi4uaW5oZXJpdGVkUm9sZXNdXG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbW92ZSB1c2VycyBmcm9tIGFzc2lnbmVkIHJvbGVzLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAgICAgUm9sZXMucmVtb3ZlVXNlcnNGcm9tUm9sZXModXNlcklkLCAnYWRtaW4nKVxuICAgKiAgICAgUm9sZXMucmVtb3ZlVXNlcnNGcm9tUm9sZXMoW3VzZXJJZCwgdXNlcjJdLCBbJ2VkaXRvciddKVxuICAgKiAgICAgUm9sZXMucmVtb3ZlVXNlcnNGcm9tUm9sZXModXNlcklkLCBbJ3VzZXInXSwgJ2dyb3VwMScpXG4gICAqXG4gICAqIEBtZXRob2QgcmVtb3ZlVXNlcnNGcm9tUm9sZXNcbiAgICogQHBhcmFtIHtBcnJheXxTdHJpbmd9IHVzZXJzIFVzZXIgSUQocykgb3Igb2JqZWN0KHMpIHdpdGggYW4gYF9pZGAgZmllbGQuXG4gICAqIEBwYXJhbSB7QXJyYXl8U3RyaW5nfSByb2xlcyBOYW1lKHMpIG9mIHJvbGVzIHRvIHJlbW92ZSB1c2VycyBmcm9tLiBSb2xlcyBoYXZlIHRvIGV4aXN0LlxuICAgKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IFtvcHRpb25zXSBPcHRpb25zOlxuICAgKiAgIC0gYHNjb3BlYDogbmFtZSBvZiB0aGUgc2NvcGUsIG9yIGBudWxsYCBmb3IgdGhlIGdsb2JhbCByb2xlXG4gICAqICAgLSBgYW55U2NvcGVgOiBpZiBzZXQsIHJvbGUgY2FuIGJlIGluIGFueSBzY29wZSAoYHNjb3BlYCBvcHRpb24gaXMgaWdub3JlZClcbiAgICpcbiAgICogQWx0ZXJuYXRpdmVseSwgaXQgY2FuIGJlIGEgc2NvcGUgbmFtZSBzdHJpbmcuXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIHJlbW92ZVVzZXJzRnJvbVJvbGVzOiBmdW5jdGlvbiAodXNlcnMsIHJvbGVzLCBvcHRpb25zKSB7XG4gICAgaWYgKCF1c2VycykgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIFxcJ3VzZXJzXFwnIHBhcmFtLicpXG4gICAgaWYgKCFyb2xlcykgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIFxcJ3JvbGVzXFwnIHBhcmFtLicpXG5cbiAgICBvcHRpb25zID0gUm9sZXMuX25vcm1hbGl6ZU9wdGlvbnMob3B0aW9ucylcblxuICAgIC8vIGVuc3VyZSBhcnJheXNcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodXNlcnMpKSB1c2VycyA9IFt1c2Vyc11cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocm9sZXMpKSByb2xlcyA9IFtyb2xlc11cblxuICAgIFJvbGVzLl9jaGVja1Njb3BlTmFtZShvcHRpb25zLnNjb3BlKVxuXG4gICAgdXNlcnMuZm9yRWFjaChmdW5jdGlvbiAodXNlcikge1xuICAgICAgaWYgKCF1c2VyKSByZXR1cm5cblxuICAgICAgcm9sZXMuZm9yRWFjaChmdW5jdGlvbiAocm9sZSkge1xuICAgICAgICBsZXQgaWRcbiAgICAgICAgaWYgKHR5cGVvZiB1c2VyID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIGlkID0gdXNlci5faWRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZCA9IHVzZXJcbiAgICAgICAgfVxuXG4gICAgICAgIFJvbGVzLl9yZW1vdmVVc2VyRnJvbVJvbGUoaWQsIHJvbGUsIG9wdGlvbnMpXG4gICAgICB9KVxuICAgIH0pXG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbW92ZSBvbmUgdXNlciBmcm9tIG9uZSByb2xlLlxuICAgKlxuICAgKiBAbWV0aG9kIF9yZW1vdmVVc2VyRnJvbVJvbGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHVzZXJJZCBUaGUgdXNlciBJRC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHJvbGVOYW1lIE5hbWUgb2YgdGhlIHJvbGUgdG8gYWRkIHRoZSB1c2VyIHRvLiBUaGUgcm9sZSBoYXZlIHRvIGV4aXN0LlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBPcHRpb25zOlxuICAgKiAgIC0gYHNjb3BlYDogbmFtZSBvZiB0aGUgc2NvcGUsIG9yIGBudWxsYCBmb3IgdGhlIGdsb2JhbCByb2xlXG4gICAqICAgLSBgYW55U2NvcGVgOiBpZiBzZXQsIHJvbGUgY2FuIGJlIGluIGFueSBzY29wZSAoYHNjb3BlYCBvcHRpb24gaXMgaWdub3JlZClcbiAgICogQHByaXZhdGVcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgX3JlbW92ZVVzZXJGcm9tUm9sZTogZnVuY3Rpb24gKHVzZXJJZCwgcm9sZU5hbWUsIG9wdGlvbnMpIHtcbiAgICBSb2xlcy5fY2hlY2tSb2xlTmFtZShyb2xlTmFtZSlcbiAgICBSb2xlcy5fY2hlY2tTY29wZU5hbWUob3B0aW9ucy5zY29wZSlcblxuICAgIGlmICghdXNlcklkKSByZXR1cm5cblxuICAgIGNvbnN0IHNlbGVjdG9yID0ge1xuICAgICAgJ3VzZXIuX2lkJzogdXNlcklkLFxuICAgICAgJ3JvbGUuX2lkJzogcm9sZU5hbWVcbiAgICB9XG5cbiAgICBpZiAoIW9wdGlvbnMuYW55U2NvcGUpIHtcbiAgICAgIHNlbGVjdG9yLnNjb3BlID0gb3B0aW9ucy5zY29wZVxuICAgIH1cblxuICAgIE1ldGVvci5yb2xlQXNzaWdubWVudC5yZW1vdmUoc2VsZWN0b3IpXG4gIH0sXG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHVzZXIgaGFzIHNwZWNpZmllZCByb2xlcy5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogICAgIC8vIGdsb2JhbCByb2xlc1xuICAgKiAgICAgUm9sZXMudXNlcklzSW5Sb2xlKHVzZXIsICdhZG1pbicpXG4gICAqICAgICBSb2xlcy51c2VySXNJblJvbGUodXNlciwgWydhZG1pbicsJ2VkaXRvciddKVxuICAgKiAgICAgUm9sZXMudXNlcklzSW5Sb2xlKHVzZXJJZCwgJ2FkbWluJylcbiAgICogICAgIFJvbGVzLnVzZXJJc0luUm9sZSh1c2VySWQsIFsnYWRtaW4nLCdlZGl0b3InXSlcbiAgICpcbiAgICogICAgIC8vIHNjb3BlIHJvbGVzIChnbG9iYWwgcm9sZXMgYXJlIHN0aWxsIGNoZWNrZWQpXG4gICAqICAgICBSb2xlcy51c2VySXNJblJvbGUodXNlciwgJ2FkbWluJywgJ2dyb3VwMScpXG4gICAqICAgICBSb2xlcy51c2VySXNJblJvbGUodXNlcklkLCBbJ2FkbWluJywnZWRpdG9yJ10sICdncm91cDEnKVxuICAgKiAgICAgUm9sZXMudXNlcklzSW5Sb2xlKHVzZXJJZCwgWydhZG1pbicsJ2VkaXRvciddLCB7c2NvcGU6ICdncm91cDEnfSlcbiAgICpcbiAgICogQG1ldGhvZCB1c2VySXNJblJvbGVcbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSB1c2VyIFVzZXIgSUQgb3IgYW4gYWN0dWFsIHVzZXIgb2JqZWN0LlxuICAgKiBAcGFyYW0ge0FycmF5fFN0cmluZ30gcm9sZXMgTmFtZSBvZiByb2xlIG9yIGFuIGFycmF5IG9mIHJvbGVzIHRvIGNoZWNrIGFnYWluc3QuIElmIGFycmF5LFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lsbCByZXR1cm4gYHRydWVgIGlmIHVzZXIgaXMgaW4gX2FueV8gcm9sZS5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJvbGVzIGRvIG5vdCBoYXZlIHRvIGV4aXN0LlxuICAgKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IFtvcHRpb25zXSBPcHRpb25zOlxuICAgKiAgIC0gYHNjb3BlYDogbmFtZSBvZiB0aGUgc2NvcGU7IGlmIHN1cHBsaWVkLCBsaW1pdHMgY2hlY2sgdG8ganVzdCB0aGF0IHNjb3BlXG4gICAqICAgICB0aGUgdXNlcidzIGdsb2JhbCByb2xlcyB3aWxsIGFsd2F5cyBiZSBjaGVja2VkIHdoZXRoZXIgc2NvcGUgaXMgc3BlY2lmaWVkIG9yIG5vdFxuICAgKiAgIC0gYGFueVNjb3BlYDogaWYgc2V0LCByb2xlIGNhbiBiZSBpbiBhbnkgc2NvcGUgKGBzY29wZWAgb3B0aW9uIGlzIGlnbm9yZWQpXG4gICAqXG4gICAqIEFsdGVybmF0aXZlbHksIGl0IGNhbiBiZSBhIHNjb3BlIG5hbWUgc3RyaW5nLlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBgdHJ1ZWAgaWYgdXNlciBpcyBpbiBfYW55XyBvZiB0aGUgdGFyZ2V0IHJvbGVzXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIHVzZXJJc0luUm9sZTogZnVuY3Rpb24gKHVzZXIsIHJvbGVzLCBvcHRpb25zKSB7XG4gICAgdmFyIGlkXG4gICAgdmFyIHNlbGVjdG9yXG5cbiAgICBvcHRpb25zID0gUm9sZXMuX25vcm1hbGl6ZU9wdGlvbnMob3B0aW9ucylcblxuICAgIC8vIGVuc3VyZSBhcnJheSB0byBzaW1wbGlmeSBjb2RlXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHJvbGVzKSkgcm9sZXMgPSBbcm9sZXNdXG5cbiAgICByb2xlcyA9IHJvbGVzLmZpbHRlcihyID0+IHIgIT0gbnVsbClcblxuICAgIGlmICghcm9sZXMubGVuZ3RoKSByZXR1cm4gZmFsc2VcblxuICAgIFJvbGVzLl9jaGVja1Njb3BlTmFtZShvcHRpb25zLnNjb3BlKVxuXG4gICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgYW55U2NvcGU6IGZhbHNlXG4gICAgfSwgb3B0aW9ucylcblxuICAgIGlmICh1c2VyICYmIHR5cGVvZiB1c2VyID09PSAnb2JqZWN0Jykge1xuICAgICAgaWQgPSB1c2VyLl9pZFxuICAgIH0gZWxzZSB7XG4gICAgICBpZCA9IHVzZXJcbiAgICB9XG5cbiAgICBpZiAoIWlkKSByZXR1cm4gZmFsc2VcbiAgICBpZiAodHlwZW9mIGlkICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlXG5cbiAgICBzZWxlY3RvciA9IHtcbiAgICAgICd1c2VyLl9pZCc6IGlkXG4gICAgfVxuXG4gICAgaWYgKCFvcHRpb25zLmFueVNjb3BlKSB7XG4gICAgICBzZWxlY3Rvci5zY29wZSA9IHsgJGluOiBbb3B0aW9ucy5zY29wZSwgbnVsbF0gfVxuICAgIH1cblxuICAgIHJldHVybiByb2xlcy5zb21lKChyb2xlTmFtZSkgPT4ge1xuICAgICAgc2VsZWN0b3JbJ2luaGVyaXRlZFJvbGVzLl9pZCddID0gcm9sZU5hbWVcblxuICAgICAgcmV0dXJuIE1ldGVvci5yb2xlQXNzaWdubWVudC5maW5kKHNlbGVjdG9yLCB7IGxpbWl0OiAxIH0pLmNvdW50KCkgPiAwXG4gICAgfSlcbiAgfSxcblxuICAvKipcbiAgICogUmV0cmlldmUgdXNlcidzIHJvbGVzLlxuICAgKlxuICAgKiBAbWV0aG9kIGdldFJvbGVzRm9yVXNlclxuICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IHVzZXIgVXNlciBJRCBvciBhbiBhY3R1YWwgdXNlciBvYmplY3QuXG4gICAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gW29wdGlvbnNdIE9wdGlvbnM6XG4gICAqICAgLSBgc2NvcGVgOiBuYW1lIG9mIHNjb3BlIHRvIHByb3ZpZGUgcm9sZXMgZm9yOyBpZiBub3Qgc3BlY2lmaWVkLCBnbG9iYWwgcm9sZXMgYXJlIHJldHVybmVkXG4gICAqICAgLSBgYW55U2NvcGVgOiBpZiBzZXQsIHJvbGUgY2FuIGJlIGluIGFueSBzY29wZSAoYHNjb3BlYCBhbmQgYG9ubHlBc3NpZ25lZGAgb3B0aW9ucyBhcmUgaWdub3JlZClcbiAgICogICAtIGBvbmx5U2NvcGVkYDogaWYgc2V0LCBvbmx5IHJvbGVzIGluIHRoZSBzcGVjaWZpZWQgc2NvcGUgYXJlIHJldHVybmVkXG4gICAqICAgLSBgb25seUFzc2lnbmVkYDogcmV0dXJuIG9ubHkgYXNzaWduZWQgcm9sZXMgYW5kIG5vdCBhdXRvbWF0aWNhbGx5IGluZmVycmVkIChsaWtlIHN1YnJvbGVzKVxuICAgKiAgIC0gYGZ1bGxPYmplY3RzYDogcmV0dXJuIGZ1bGwgcm9sZXMgb2JqZWN0cyAoYHRydWVgKSBvciBqdXN0IG5hbWVzIChgZmFsc2VgKSAoYG9ubHlBc3NpZ25lZGAgb3B0aW9uIGlzIGlnbm9yZWQpIChkZWZhdWx0IGBmYWxzZWApXG4gICAqICAgICBJZiB5b3UgaGF2ZSBhIHVzZS1jYXNlIGZvciB0aGlzIG9wdGlvbiwgcGxlYXNlIGZpbGUgYSBmZWF0dXJlLXJlcXVlc3QuIFlvdSBzaG91bGRuJ3QgbmVlZCB0byB1c2UgaXQgYXMgaXQnc1xuICAgKiAgICAgcmVzdWx0IHN0cm9uZ2x5IGRlcGVuZGFudCBvbiB0aGUgaW50ZXJuYWwgZGF0YSBzdHJ1Y3R1cmUgb2YgdGhpcyBwbHVnaW4uXG4gICAqXG4gICAqIEFsdGVybmF0aXZlbHksIGl0IGNhbiBiZSBhIHNjb3BlIG5hbWUgc3RyaW5nLlxuICAgKiBAcmV0dXJuIHtBcnJheX0gQXJyYXkgb2YgdXNlcidzIHJvbGVzLCB1bnNvcnRlZC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgZ2V0Um9sZXNGb3JVc2VyOiBmdW5jdGlvbiAodXNlciwgb3B0aW9ucykge1xuICAgIHZhciBpZFxuICAgIHZhciBzZWxlY3RvclxuICAgIHZhciBmaWx0ZXJcbiAgICB2YXIgcm9sZXNcblxuICAgIG9wdGlvbnMgPSBSb2xlcy5fbm9ybWFsaXplT3B0aW9ucyhvcHRpb25zKVxuXG4gICAgUm9sZXMuX2NoZWNrU2NvcGVOYW1lKG9wdGlvbnMuc2NvcGUpXG5cbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBmdWxsT2JqZWN0czogZmFsc2UsXG4gICAgICBvbmx5QXNzaWduZWQ6IGZhbHNlLFxuICAgICAgYW55U2NvcGU6IGZhbHNlLFxuICAgICAgb25seVNjb3BlZDogZmFsc2VcbiAgICB9LCBvcHRpb25zKVxuXG4gICAgaWYgKHVzZXIgJiYgdHlwZW9mIHVzZXIgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZCA9IHVzZXIuX2lkXG4gICAgfSBlbHNlIHtcbiAgICAgIGlkID0gdXNlclxuICAgIH1cblxuICAgIGlmICghaWQpIHJldHVybiBbXVxuXG4gICAgc2VsZWN0b3IgPSB7XG4gICAgICAndXNlci5faWQnOiBpZFxuICAgIH1cblxuICAgIGZpbHRlciA9IHtcbiAgICAgIGZpZWxkczogeyAnaW5oZXJpdGVkUm9sZXMuX2lkJzogMSB9XG4gICAgfVxuXG4gICAgaWYgKCFvcHRpb25zLmFueVNjb3BlKSB7XG4gICAgICBzZWxlY3Rvci5zY29wZSA9IHsgJGluOiBbb3B0aW9ucy5zY29wZV0gfVxuXG4gICAgICBpZiAoIW9wdGlvbnMub25seVNjb3BlZCkge1xuICAgICAgICBzZWxlY3Rvci5zY29wZS4kaW4ucHVzaChudWxsKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLm9ubHlBc3NpZ25lZCkge1xuICAgICAgZGVsZXRlIGZpbHRlci5maWVsZHNbJ2luaGVyaXRlZFJvbGVzLl9pZCddXG4gICAgICBmaWx0ZXIuZmllbGRzWydyb2xlLl9pZCddID0gMVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmZ1bGxPYmplY3RzKSB7XG4gICAgICBkZWxldGUgZmlsdGVyLmZpZWxkc1xuICAgIH1cblxuICAgIHJvbGVzID0gTWV0ZW9yLnJvbGVBc3NpZ25tZW50LmZpbmQoc2VsZWN0b3IsIGZpbHRlcikuZmV0Y2goKVxuXG4gICAgaWYgKG9wdGlvbnMuZnVsbE9iamVjdHMpIHtcbiAgICAgIHJldHVybiByb2xlc1xuICAgIH1cblxuICAgIHJldHVybiBbLi4ubmV3IFNldChyb2xlcy5yZWR1Y2UoKHJldiwgY3VycmVudCkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnQuaW5oZXJpdGVkUm9sZXMpIHtcbiAgICAgICAgcmV0dXJuIHJldi5jb25jYXQoY3VycmVudC5pbmhlcml0ZWRSb2xlcy5tYXAociA9PiByLl9pZCkpXG4gICAgICB9IGVsc2UgaWYgKGN1cnJlbnQucm9sZSkge1xuICAgICAgICByZXYucHVzaChjdXJyZW50LnJvbGUuX2lkKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJldlxuICAgIH0sIFtdKSldXG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIGN1cnNvciBvZiBhbGwgZXhpc3Rpbmcgcm9sZXMuXG4gICAqXG4gICAqIEBtZXRob2QgZ2V0QWxsUm9sZXNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtxdWVyeU9wdGlvbnNdIE9wdGlvbnMgd2hpY2ggYXJlIHBhc3NlZCBkaXJlY3RseVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3VnaCB0byBgTWV0ZW9yLnJvbGVzLmZpbmQocXVlcnksIG9wdGlvbnMpYC5cbiAgICogQHJldHVybiB7Q3Vyc29yfSBDdXJzb3Igb2YgZXhpc3Rpbmcgcm9sZXMuXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGdldEFsbFJvbGVzOiBmdW5jdGlvbiAocXVlcnlPcHRpb25zKSB7XG4gICAgcXVlcnlPcHRpb25zID0gcXVlcnlPcHRpb25zIHx8IHsgc29ydDogeyBfaWQ6IDEgfSB9XG5cbiAgICByZXR1cm4gTWV0ZW9yLnJvbGVzLmZpbmQoe30sIHF1ZXJ5T3B0aW9ucylcbiAgfSxcblxuICAvKipcbiAgICogUmV0cmlldmUgYWxsIHVzZXJzIHdobyBhcmUgaW4gdGFyZ2V0IHJvbGUuXG4gICAqXG4gICAqIE9wdGlvbnM6XG4gICAqXG4gICAqIEBtZXRob2QgZ2V0VXNlcnNJblJvbGVcbiAgICogQHBhcmFtIHtBcnJheXxTdHJpbmd9IHJvbGVzIE5hbWUgb2Ygcm9sZSBvciBhbiBhcnJheSBvZiByb2xlcy4gSWYgYXJyYXksIHVzZXJzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm5lZCB3aWxsIGhhdmUgYXQgbGVhc3Qgb25lIG9mIHRoZSByb2xlc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlY2lmaWVkIGJ1dCBuZWVkIG5vdCBoYXZlIF9hbGxfIHJvbGVzLlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUm9sZXMgZG8gbm90IGhhdmUgdG8gZXhpc3QuXG4gICAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gW29wdGlvbnNdIE9wdGlvbnM6XG4gICAqICAgLSBgc2NvcGVgOiBuYW1lIG9mIHRoZSBzY29wZSB0byByZXN0cmljdCByb2xlcyB0bzsgdXNlcidzIGdsb2JhbFxuICAgKiAgICAgcm9sZXMgd2lsbCBhbHNvIGJlIGNoZWNrZWRcbiAgICogICAtIGBhbnlTY29wZWA6IGlmIHNldCwgcm9sZSBjYW4gYmUgaW4gYW55IHNjb3BlIChgc2NvcGVgIG9wdGlvbiBpcyBpZ25vcmVkKVxuICAgKiAgIC0gYG9ubHlTY29wZWRgOiBpZiBzZXQsIG9ubHkgcm9sZXMgaW4gdGhlIHNwZWNpZmllZCBzY29wZSBhcmUgcmV0dXJuZWRcbiAgICogICAtIGBxdWVyeU9wdGlvbnNgOiBvcHRpb25zIHdoaWNoIGFyZSBwYXNzZWQgZGlyZWN0bHlcbiAgICogICAgIHRocm91Z2ggdG8gYE1ldGVvci51c2Vycy5maW5kKHF1ZXJ5LCBvcHRpb25zKWBcbiAgICpcbiAgICogQWx0ZXJuYXRpdmVseSwgaXQgY2FuIGJlIGEgc2NvcGUgbmFtZSBzdHJpbmcuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbcXVlcnlPcHRpb25zXSBPcHRpb25zIHdoaWNoIGFyZSBwYXNzZWQgZGlyZWN0bHlcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm91Z2ggdG8gYE1ldGVvci51c2Vycy5maW5kKHF1ZXJ5LCBvcHRpb25zKWBcbiAgICogQHJldHVybiB7Q3Vyc29yfSBDdXJzb3Igb2YgdXNlcnMgaW4gcm9sZXMuXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGdldFVzZXJzSW5Sb2xlOiBmdW5jdGlvbiAocm9sZXMsIG9wdGlvbnMsIHF1ZXJ5T3B0aW9ucykge1xuICAgIHZhciBpZHNcblxuICAgIGlkcyA9IFJvbGVzLmdldFVzZXJBc3NpZ25tZW50c0ZvclJvbGUocm9sZXMsIG9wdGlvbnMpLmZldGNoKCkubWFwKGEgPT4gYS51c2VyLl9pZClcblxuICAgIHJldHVybiBNZXRlb3IudXNlcnMuZmluZCh7IF9pZDogeyAkaW46IGlkcyB9IH0sICgob3B0aW9ucyAmJiBvcHRpb25zLnF1ZXJ5T3B0aW9ucykgfHwgcXVlcnlPcHRpb25zKSB8fCB7fSlcbiAgfSxcblxuICAvKipcbiAgICogUmV0cmlldmUgYWxsIGFzc2lnbm1lbnRzIG9mIGEgdXNlciB3aGljaCBhcmUgZm9yIHRoZSB0YXJnZXQgcm9sZS5cbiAgICpcbiAgICogT3B0aW9uczpcbiAgICpcbiAgICogQG1ldGhvZCBnZXRVc2VyQXNzaWdubWVudHNGb3JSb2xlXG4gICAqIEBwYXJhbSB7QXJyYXl8U3RyaW5nfSByb2xlcyBOYW1lIG9mIHJvbGUgb3IgYW4gYXJyYXkgb2Ygcm9sZXMuIElmIGFycmF5LCB1c2Vyc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuZWQgd2lsbCBoYXZlIGF0IGxlYXN0IG9uZSBvZiB0aGUgcm9sZXNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNpZmllZCBidXQgbmVlZCBub3QgaGF2ZSBfYWxsXyByb2xlcy5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJvbGVzIGRvIG5vdCBoYXZlIHRvIGV4aXN0LlxuICAgKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IFtvcHRpb25zXSBPcHRpb25zOlxuICAgKiAgIC0gYHNjb3BlYDogbmFtZSBvZiB0aGUgc2NvcGUgdG8gcmVzdHJpY3Qgcm9sZXMgdG87IHVzZXIncyBnbG9iYWxcbiAgICogICAgIHJvbGVzIHdpbGwgYWxzbyBiZSBjaGVja2VkXG4gICAqICAgLSBgYW55U2NvcGVgOiBpZiBzZXQsIHJvbGUgY2FuIGJlIGluIGFueSBzY29wZSAoYHNjb3BlYCBvcHRpb24gaXMgaWdub3JlZClcbiAgICogICAtIGBxdWVyeU9wdGlvbnNgOiBvcHRpb25zIHdoaWNoIGFyZSBwYXNzZWQgZGlyZWN0bHlcbiAgICogICAgIHRocm91Z2ggdG8gYE1ldGVvci5yb2xlQXNzaWdubWVudC5maW5kKHF1ZXJ5LCBvcHRpb25zKWBcblxuICAgKiBBbHRlcm5hdGl2ZWx5LCBpdCBjYW4gYmUgYSBzY29wZSBuYW1lIHN0cmluZy5cbiAgICogQHJldHVybiB7Q3Vyc29yfSBDdXJzb3Igb2YgdXNlciBhc3NpZ25tZW50cyBmb3Igcm9sZXMuXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGdldFVzZXJBc3NpZ25tZW50c0ZvclJvbGU6IGZ1bmN0aW9uIChyb2xlcywgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBSb2xlcy5fbm9ybWFsaXplT3B0aW9ucyhvcHRpb25zKVxuXG4gICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgYW55U2NvcGU6IGZhbHNlLFxuICAgICAgcXVlcnlPcHRpb25zOiB7fVxuICAgIH0sIG9wdGlvbnMpXG5cbiAgICByZXR1cm4gUm9sZXMuX2dldFVzZXJzSW5Sb2xlQ3Vyc29yKHJvbGVzLCBvcHRpb25zLCBvcHRpb25zLnF1ZXJ5T3B0aW9ucylcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfZ2V0VXNlcnNJblJvbGVDdXJzb3JcbiAgICogQHBhcmFtIHtBcnJheXxTdHJpbmd9IHJvbGVzIE5hbWUgb2Ygcm9sZSBvciBhbiBhcnJheSBvZiByb2xlcy4gSWYgYXJyYXksIGlkcyBvZiB1c2VycyBhcmVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybmVkIHdoaWNoIGhhdmUgYXQgbGVhc3Qgb25lIG9mIHRoZSByb2xlc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWduZWQgYnV0IG5lZWQgbm90IGhhdmUgX2FsbF8gcm9sZXMuXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSb2xlcyBkbyBub3QgaGF2ZSB0byBleGlzdC5cbiAgICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBbb3B0aW9uc10gT3B0aW9uczpcbiAgICogICAtIGBzY29wZWA6IG5hbWUgb2YgdGhlIHNjb3BlIHRvIHJlc3RyaWN0IHJvbGVzIHRvOyB1c2VyJ3MgZ2xvYmFsXG4gICAqICAgICByb2xlcyB3aWxsIGFsc28gYmUgY2hlY2tlZFxuICAgKiAgIC0gYGFueVNjb3BlYDogaWYgc2V0LCByb2xlIGNhbiBiZSBpbiBhbnkgc2NvcGUgKGBzY29wZWAgb3B0aW9uIGlzIGlnbm9yZWQpXG4gICAqXG4gICAqIEFsdGVybmF0aXZlbHksIGl0IGNhbiBiZSBhIHNjb3BlIG5hbWUgc3RyaW5nLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW2ZpbHRlcl0gT3B0aW9ucyB3aGljaCBhcmUgcGFzc2VkIGRpcmVjdGx5XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdWdoIHRvIGBNZXRlb3Iucm9sZUFzc2lnbm1lbnQuZmluZChxdWVyeSwgb3B0aW9ucylgXG4gICAqIEByZXR1cm4ge09iamVjdH0gQ3Vyc29yIHRvIHRoZSBhc3NpZ25tZW50IGRvY3VtZW50c1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfZ2V0VXNlcnNJblJvbGVDdXJzb3I6IGZ1bmN0aW9uIChyb2xlcywgb3B0aW9ucywgZmlsdGVyKSB7XG4gICAgdmFyIHNlbGVjdG9yXG5cbiAgICBvcHRpb25zID0gUm9sZXMuX25vcm1hbGl6ZU9wdGlvbnMob3B0aW9ucylcblxuICAgIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIGFueVNjb3BlOiBmYWxzZSxcbiAgICAgIG9ubHlTY29wZWQ6IGZhbHNlXG4gICAgfSwgb3B0aW9ucylcblxuICAgIC8vIGVuc3VyZSBhcnJheSB0byBzaW1wbGlmeSBjb2RlXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHJvbGVzKSkgcm9sZXMgPSBbcm9sZXNdXG5cbiAgICBSb2xlcy5fY2hlY2tTY29wZU5hbWUob3B0aW9ucy5zY29wZSlcblxuICAgIGZpbHRlciA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgZmllbGRzOiB7ICd1c2VyLl9pZCc6IDEgfVxuICAgIH0sIGZpbHRlcilcblxuICAgIHNlbGVjdG9yID0ge1xuICAgICAgJ2luaGVyaXRlZFJvbGVzLl9pZCc6IHsgJGluOiByb2xlcyB9XG4gICAgfVxuXG4gICAgaWYgKCFvcHRpb25zLmFueVNjb3BlKSB7XG4gICAgICBzZWxlY3Rvci5zY29wZSA9IHsgJGluOiBbb3B0aW9ucy5zY29wZV0gfVxuXG4gICAgICBpZiAoIW9wdGlvbnMub25seVNjb3BlZCkge1xuICAgICAgICBzZWxlY3Rvci5zY29wZS4kaW4ucHVzaChudWxsKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBNZXRlb3Iucm9sZUFzc2lnbm1lbnQuZmluZChzZWxlY3RvciwgZmlsdGVyKVxuICB9LFxuXG4gIC8qKlxuICAgKiBEZXByZWNhdGVkLiBVc2UgYGdldFNjb3Blc0ZvclVzZXJgIGluc3RlYWQuXG4gICAqXG4gICAqIEBtZXRob2QgZ2V0R3JvdXBzRm9yVXNlclxuICAgKiBAc3RhdGljXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBnZXRHcm91cHNGb3JVc2VyOiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgIGlmICghZ2V0R3JvdXBzRm9yVXNlckRlcHJlY2F0aW9uV2FybmluZykge1xuICAgICAgZ2V0R3JvdXBzRm9yVXNlckRlcHJlY2F0aW9uV2FybmluZyA9IHRydWVcbiAgICAgIGNvbnNvbGUgJiYgY29uc29sZS53YXJuKCdnZXRHcm91cHNGb3JVc2VyIGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFVzZSBnZXRTY29wZXNGb3JVc2VyIGluc3RlYWQuJylcbiAgICB9XG5cbiAgICByZXR1cm4gUm9sZXMuZ2V0U2NvcGVzRm9yVXNlciguLi5hcmdzKVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB1c2VycyBzY29wZXMsIGlmIGFueS5cbiAgICpcbiAgICogQG1ldGhvZCBnZXRTY29wZXNGb3JVc2VyXG4gICAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gdXNlciBVc2VyIElEIG9yIGFuIGFjdHVhbCB1c2VyIG9iamVjdC5cbiAgICogQHBhcmFtIHtBcnJheXxTdHJpbmd9IFtyb2xlc10gTmFtZSBvZiByb2xlcyB0byByZXN0cmljdCBzY29wZXMgdG8uXG4gICAqXG4gICAqIEByZXR1cm4ge0FycmF5fSBBcnJheSBvZiB1c2VyJ3Mgc2NvcGVzLCB1bnNvcnRlZC5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgZ2V0U2NvcGVzRm9yVXNlcjogZnVuY3Rpb24gKHVzZXIsIHJvbGVzKSB7XG4gICAgdmFyIHNjb3Blc1xuICAgIHZhciBpZFxuXG4gICAgaWYgKHJvbGVzICYmICFBcnJheS5pc0FycmF5KHJvbGVzKSkgcm9sZXMgPSBbcm9sZXNdXG5cbiAgICBpZiAodXNlciAmJiB0eXBlb2YgdXNlciA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlkID0gdXNlci5faWRcbiAgICB9IGVsc2Uge1xuICAgICAgaWQgPSB1c2VyXG4gICAgfVxuXG4gICAgaWYgKCFpZCkgcmV0dXJuIFtdXG5cbiAgICBjb25zdCBzZWxlY3RvciA9IHtcbiAgICAgICd1c2VyLl9pZCc6IGlkLFxuICAgICAgc2NvcGU6IHsgJG5lOiBudWxsIH1cbiAgICB9XG5cbiAgICBpZiAocm9sZXMpIHtcbiAgICAgIHNlbGVjdG9yWydpbmhlcml0ZWRSb2xlcy5faWQnXSA9IHsgJGluOiByb2xlcyB9XG4gICAgfVxuXG4gICAgc2NvcGVzID0gTWV0ZW9yLnJvbGVBc3NpZ25tZW50LmZpbmQoc2VsZWN0b3IsIHsgZmllbGRzOiB7IHNjb3BlOiAxIH0gfSkuZmV0Y2goKS5tYXAob2JpID0+IG9iaS5zY29wZSlcblxuICAgIHJldHVybiBbLi4ubmV3IFNldChzY29wZXMpXVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZW5hbWUgYSBzY29wZS5cbiAgICpcbiAgICogUm9sZXMgYXNzaWduZWQgd2l0aCBhIGdpdmVuIHNjb3BlIGFyZSBjaGFuZ2VkIHRvIGJlIHVuZGVyIHRoZSBuZXcgc2NvcGUuXG4gICAqXG4gICAqIEBtZXRob2QgcmVuYW1lU2NvcGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG9sZE5hbWUgT2xkIG5hbWUgb2YgYSBzY29wZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5ld05hbWUgTmV3IG5hbWUgb2YgYSBzY29wZS5cbiAgICogQHN0YXRpY1xuICAgKi9cbiAgcmVuYW1lU2NvcGU6IGZ1bmN0aW9uIChvbGROYW1lLCBuZXdOYW1lKSB7XG4gICAgdmFyIGNvdW50XG5cbiAgICBSb2xlcy5fY2hlY2tTY29wZU5hbWUob2xkTmFtZSlcbiAgICBSb2xlcy5fY2hlY2tTY29wZU5hbWUobmV3TmFtZSlcblxuICAgIGlmIChvbGROYW1lID09PSBuZXdOYW1lKSByZXR1cm5cblxuICAgIGRvIHtcbiAgICAgIGNvdW50ID0gTWV0ZW9yLnJvbGVBc3NpZ25tZW50LnVwZGF0ZSh7XG4gICAgICAgIHNjb3BlOiBvbGROYW1lXG4gICAgICB9LCB7XG4gICAgICAgICRzZXQ6IHtcbiAgICAgICAgICBzY29wZTogbmV3TmFtZVxuICAgICAgICB9XG4gICAgICB9LCB7IG11bHRpOiB0cnVlIH0pXG4gICAgfSB3aGlsZSAoY291bnQgPiAwKVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBzY29wZS5cbiAgICpcbiAgICogUm9sZXMgYXNzaWduZWQgd2l0aCBhIGdpdmVuIHNjb3BlIGFyZSByZW1vdmVkLlxuICAgKlxuICAgKiBAbWV0aG9kIHJlbW92ZVNjb3BlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIGEgc2NvcGUuXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIHJlbW92ZVNjb3BlOiBmdW5jdGlvbiAobmFtZSkge1xuICAgIFJvbGVzLl9jaGVja1Njb3BlTmFtZShuYW1lKVxuXG4gICAgTWV0ZW9yLnJvbGVBc3NpZ25tZW50LnJlbW92ZSh7IHNjb3BlOiBuYW1lIH0pXG4gIH0sXG5cbiAgLyoqXG4gICAqIFRocm93IGFuIGV4Y2VwdGlvbiBpZiBgcm9sZU5hbWVgIGlzIGFuIGludmFsaWQgcm9sZSBuYW1lLlxuICAgKlxuICAgKiBAbWV0aG9kIF9jaGVja1JvbGVOYW1lXG4gICAqIEBwYXJhbSB7U3RyaW5nfSByb2xlTmFtZSBBIHJvbGUgbmFtZSB0byBtYXRjaCBhZ2FpbnN0LlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfY2hlY2tSb2xlTmFtZTogZnVuY3Rpb24gKHJvbGVOYW1lKSB7XG4gICAgaWYgKCFyb2xlTmFtZSB8fCB0eXBlb2Ygcm9sZU5hbWUgIT09ICdzdHJpbmcnIHx8IHJvbGVOYW1lLnRyaW0oKSAhPT0gcm9sZU5hbWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCByb2xlIG5hbWUgXFwnJyArIHJvbGVOYW1lICsgJ1xcJy4nKVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogRmluZCBvdXQgaWYgYSByb2xlIGlzIGFuIGFuY2VzdG9yIG9mIGFub3RoZXIgcm9sZS5cbiAgICpcbiAgICogV0FSTklORzogSWYgeW91IGNoZWNrIHRoaXMgb24gdGhlIGNsaWVudCwgcGxlYXNlIG1ha2Ugc3VyZSBhbGwgcm9sZXMgYXJlIHB1Ymxpc2hlZC5cbiAgICpcbiAgICogQG1ldGhvZCBpc1BhcmVudE9mXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXJlbnRSb2xlTmFtZSBUaGUgcm9sZSB5b3Ugd2FudCB0byByZXNlYXJjaC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGNoaWxkUm9sZU5hbWUgVGhlIHJvbGUgeW91IGV4cGVjdCB0byBiZSBhbW9uZyB0aGUgY2hpbGRyZW4gb2YgcGFyZW50Um9sZU5hbWUuXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIGlzUGFyZW50T2Y6IGZ1bmN0aW9uIChwYXJlbnRSb2xlTmFtZSwgY2hpbGRSb2xlTmFtZSkge1xuICAgIGlmIChwYXJlbnRSb2xlTmFtZSA9PT0gY2hpbGRSb2xlTmFtZSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAocGFyZW50Um9sZU5hbWUgPT0gbnVsbCB8fCBjaGlsZFJvbGVOYW1lID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIFJvbGVzLl9jaGVja1JvbGVOYW1lKHBhcmVudFJvbGVOYW1lKVxuICAgIFJvbGVzLl9jaGVja1JvbGVOYW1lKGNoaWxkUm9sZU5hbWUpXG5cbiAgICB2YXIgcm9sZXNUb0NoZWNrID0gW3BhcmVudFJvbGVOYW1lXVxuICAgIHdoaWxlIChyb2xlc1RvQ2hlY2subGVuZ3RoICE9PSAwKSB7XG4gICAgICB2YXIgcm9sZU5hbWUgPSByb2xlc1RvQ2hlY2sucG9wKClcblxuICAgICAgaWYgKHJvbGVOYW1lID09PSBjaGlsZFJvbGVOYW1lKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG5cbiAgICAgIHZhciByb2xlID0gTWV0ZW9yLnJvbGVzLmZpbmRPbmUoeyBfaWQ6IHJvbGVOYW1lIH0pXG5cbiAgICAgIC8vIFRoaXMgc2hvdWxkIG5vdCBoYXBwZW4sIGJ1dCB0aGlzIGlzIGEgcHJvYmxlbSB0byBhZGRyZXNzIGF0IHNvbWUgb3RoZXIgdGltZS5cbiAgICAgIGlmICghcm9sZSkgY29udGludWVcblxuICAgICAgcm9sZXNUb0NoZWNrID0gcm9sZXNUb0NoZWNrLmNvbmNhdChyb2xlLmNoaWxkcmVuLm1hcChyID0+IHIuX2lkKSlcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfSxcblxuICAvKipcbiAgICogTm9ybWFsaXplIG9wdGlvbnMuXG4gICAqXG4gICAqIEBtZXRob2QgX25vcm1hbGl6ZU9wdGlvbnNcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgT3B0aW9ucyB0byBub3JtYWxpemUuXG4gICAqIEByZXR1cm4ge09iamVjdH0gTm9ybWFsaXplZCBvcHRpb25zLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfbm9ybWFsaXplT3B0aW9uczogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyA9PT0gdW5kZWZpbmVkID8ge30gOiBvcHRpb25zXG5cbiAgICBpZiAob3B0aW9ucyA9PT0gbnVsbCB8fCB0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIG9wdGlvbnMgPSB7IHNjb3BlOiBvcHRpb25zIH1cbiAgICB9XG5cbiAgICBvcHRpb25zLnNjb3BlID0gUm9sZXMuX25vcm1hbGl6ZVNjb3BlTmFtZShvcHRpb25zLnNjb3BlKVxuXG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfSxcblxuICAvKipcbiAgICogTm9ybWFsaXplIHNjb3BlIG5hbWUuXG4gICAqXG4gICAqIEBtZXRob2QgX25vcm1hbGl6ZVNjb3BlTmFtZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2NvcGVOYW1lIEEgc2NvcGUgbmFtZSB0byBub3JtYWxpemUuXG4gICAqIEByZXR1cm4ge1N0cmluZ30gTm9ybWFsaXplZCBzY29wZSBuYW1lLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfbm9ybWFsaXplU2NvcGVOYW1lOiBmdW5jdGlvbiAoc2NvcGVOYW1lKSB7XG4gICAgLy8gbWFwIHVuZGVmaW5lZCBhbmQgbnVsbCB0byBudWxsXG4gICAgaWYgKHNjb3BlTmFtZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc2NvcGVOYW1lXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBUaHJvdyBhbiBleGNlcHRpb24gaWYgYHNjb3BlTmFtZWAgaXMgYW4gaW52YWxpZCBzY29wZSBuYW1lLlxuICAgKlxuICAgKiBAbWV0aG9kIF9jaGVja1JvbGVOYW1lXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzY29wZU5hbWUgQSBzY29wZSBuYW1lIHRvIG1hdGNoIGFnYWluc3QuXG4gICAqIEBwcml2YXRlXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIF9jaGVja1Njb3BlTmFtZTogZnVuY3Rpb24gKHNjb3BlTmFtZSkge1xuICAgIGlmIChzY29wZU5hbWUgPT09IG51bGwpIHJldHVyblxuXG4gICAgaWYgKCFzY29wZU5hbWUgfHwgdHlwZW9mIHNjb3BlTmFtZSAhPT0gJ3N0cmluZycgfHwgc2NvcGVOYW1lLnRyaW0oKSAhPT0gc2NvcGVOYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2NvcGUgbmFtZSBcXCcnICsgc2NvcGVOYW1lICsgJ1xcJy4nKVxuICAgIH1cbiAgfVxufSlcbiIsIi8qIGdsb2JhbCBNZXRlb3IsIFJvbGVzICovXG5cbk1ldGVvci5yb2xlQXNzaWdubWVudC5fZW5zdXJlSW5kZXgoeyAndXNlci5faWQnOiAxLCAnaW5oZXJpdGVkUm9sZXMuX2lkJzogMSwgc2NvcGU6IDEgfSlcbk1ldGVvci5yb2xlQXNzaWdubWVudC5fZW5zdXJlSW5kZXgoeyAndXNlci5faWQnOiAxLCAncm9sZS5faWQnOiAxLCBzY29wZTogMSB9KVxuTWV0ZW9yLnJvbGVBc3NpZ25tZW50Ll9lbnN1cmVJbmRleCh7ICdyb2xlLl9pZCc6IDEgfSlcbk1ldGVvci5yb2xlQXNzaWdubWVudC5fZW5zdXJlSW5kZXgoeyBzY29wZTogMSwgJ3VzZXIuX2lkJzogMSwgJ2luaGVyaXRlZFJvbGVzLl9pZCc6IDEgfSkgLy8gQWRkaW5nIHVzZXJJZCBhbmQgcm9sZUlkIG1pZ2h0IHNwZWVkIHVwIG90aGVyIHF1ZXJpZXMgZGVwZW5kaW5nIG9uIHRoZSBmaXJzdCBpbmRleFxuTWV0ZW9yLnJvbGVBc3NpZ25tZW50Ll9lbnN1cmVJbmRleCh7ICdpbmhlcml0ZWRSb2xlcy5faWQnOiAxIH0pXG5cbk1ldGVvci5yb2xlcy5fZW5zdXJlSW5kZXgoeyAnY2hpbGRyZW4uX2lkJzogMSB9KVxuXG4vKlxuICogUHVibGlzaCBsb2dnZWQtaW4gdXNlcidzIHJvbGVzIHNvIGNsaWVudC1zaWRlIGNoZWNrcyBjYW4gd29yay5cbiAqXG4gKiBVc2UgYSBuYW1lZCBwdWJsaXNoIGZ1bmN0aW9uIHNvIGNsaWVudHMgY2FuIGNoZWNrIGByZWFkeSgpYCBzdGF0ZS5cbiAqL1xuTWV0ZW9yLnB1Ymxpc2goJ19yb2xlcycsIGZ1bmN0aW9uICgpIHtcbiAgdmFyIGxvZ2dlZEluVXNlcklkID0gdGhpcy51c2VySWRcbiAgdmFyIGZpZWxkcyA9IHsgcm9sZXM6IDEgfVxuXG4gIGlmICghbG9nZ2VkSW5Vc2VySWQpIHtcbiAgICB0aGlzLnJlYWR5KClcbiAgICByZXR1cm5cbiAgfVxuXG4gIHJldHVybiBNZXRlb3IudXNlcnMuZmluZChcbiAgICB7IF9pZDogbG9nZ2VkSW5Vc2VySWQgfSxcbiAgICB7IGZpZWxkczogZmllbGRzIH1cbiAgKVxufSlcblxuT2JqZWN0LmFzc2lnbihSb2xlcywge1xuICAvKipcbiAgICogQG1ldGhvZCBfaXNOZXdSb2xlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSByb2xlIGBNZXRlb3Iucm9sZXNgIGRvY3VtZW50LlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHJvbGVgIGlzIGluIHRoZSBuZXcgZm9ybWF0LlxuICAgKiAgICAgICAgICAgICAgICAgICBJZiBpdCBpcyBhbWJpZ3VvdXMgb3IgaXQgaXMgbm90LCByZXR1cm5zIGBmYWxzZWAuXG4gICAqIEBmb3IgUm9sZXNcbiAgICogQHByaXZhdGVcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgX2lzTmV3Um9sZTogZnVuY3Rpb24gKHJvbGUpIHtcbiAgICByZXR1cm4gISgnbmFtZScgaW4gcm9sZSkgJiYgJ2NoaWxkcmVuJyBpbiByb2xlXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX2lzT2xkUm9sZVxuICAgKiBAcGFyYW0ge09iamVjdH0gcm9sZSBgTWV0ZW9yLnJvbGVzYCBkb2N1bWVudC5cbiAgICogQHJldHVybiB7Qm9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGByb2xlYCBpcyBpbiB0aGUgb2xkIGZvcm1hdC5cbiAgICogICAgICAgICAgICAgICAgICAgSWYgaXQgaXMgYW1iaWd1b3VzIG9yIGl0IGlzIG5vdCwgcmV0dXJucyBgZmFsc2VgLlxuICAgKiBAZm9yIFJvbGVzXG4gICAqIEBwcml2YXRlXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIF9pc09sZFJvbGU6IGZ1bmN0aW9uIChyb2xlKSB7XG4gICAgcmV0dXJuICduYW1lJyBpbiByb2xlICYmICEoJ2NoaWxkcmVuJyBpbiByb2xlKVxuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9pc05ld0ZpZWxkXG4gICAqIEBwYXJhbSB7QXJyYXl9IHJvbGVzIGBNZXRlb3IudXNlcnNgIGRvY3VtZW50IGByb2xlc2AgZmllbGQuXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgcm9sZXNgIGZpZWxkIGlzIGluIHRoZSBuZXcgZm9ybWF0LlxuICAgKiAgICAgICAgICAgICAgICAgICBJZiBpdCBpcyBhbWJpZ3VvdXMgb3IgaXQgaXMgbm90LCByZXR1cm5zIGBmYWxzZWAuXG4gICAqIEBmb3IgUm9sZXNcbiAgICogQHByaXZhdGVcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgX2lzTmV3RmllbGQ6IGZ1bmN0aW9uIChyb2xlcykge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHJvbGVzKSAmJiAodHlwZW9mIHJvbGVzWzBdID09PSAnb2JqZWN0JylcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfaXNPbGRGaWVsZFxuICAgKiBAcGFyYW0ge0FycmF5fSByb2xlcyBgTWV0ZW9yLnVzZXJzYCBkb2N1bWVudCBgcm9sZXNgIGZpZWxkLlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHJvbGVzYCBmaWVsZCBpcyBpbiB0aGUgb2xkIGZvcm1hdC5cbiAgICogICAgICAgICAgICAgICAgICAgSWYgaXQgaXMgYW1iaWd1b3VzIG9yIGl0IGlzIG5vdCwgcmV0dXJucyBgZmFsc2VgLlxuICAgKiBAZm9yIFJvbGVzXG4gICAqIEBwcml2YXRlXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIF9pc09sZEZpZWxkOiBmdW5jdGlvbiAocm9sZXMpIHtcbiAgICByZXR1cm4gKEFycmF5LmlzQXJyYXkocm9sZXMpICYmICh0eXBlb2Ygcm9sZXNbMF0gPT09ICdzdHJpbmcnKSkgfHwgKCh0eXBlb2Ygcm9sZXMgPT09ICdvYmplY3QnKSAmJiAhQXJyYXkuaXNBcnJheShyb2xlcykpXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX2NvbnZlcnRUb05ld1JvbGVcbiAgICogQHBhcmFtIHtPYmplY3R9IG9sZFJvbGUgYE1ldGVvci5yb2xlc2AgZG9jdW1lbnQuXG4gICAqIEByZXR1cm4ge09iamVjdH0gQ29udmVydGVkIGByb2xlYCB0byB0aGUgbmV3IGZvcm1hdC5cbiAgICogQGZvciBSb2xlc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfY29udmVydFRvTmV3Um9sZTogZnVuY3Rpb24gKG9sZFJvbGUpIHtcbiAgICBpZiAoISh0eXBlb2Ygb2xkUm9sZS5uYW1lID09PSAnc3RyaW5nJykpIHRocm93IG5ldyBFcnJvcihcIlJvbGUgbmFtZSAnXCIgKyBvbGRSb2xlLm5hbWUgKyBcIicgaXMgbm90IGEgc3RyaW5nLlwiKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIF9pZDogb2xkUm9sZS5uYW1lLFxuICAgICAgY2hpbGRyZW46IFtdXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAbWV0aG9kIF9jb252ZXJ0VG9PbGRSb2xlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBuZXdSb2xlIGBNZXRlb3Iucm9sZXNgIGRvY3VtZW50LlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IENvbnZlcnRlZCBgcm9sZWAgdG8gdGhlIG9sZCBmb3JtYXQuXG4gICAqIEBmb3IgUm9sZXNcbiAgICogQHByaXZhdGVcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgX2NvbnZlcnRUb09sZFJvbGU6IGZ1bmN0aW9uIChuZXdSb2xlKSB7XG4gICAgaWYgKCEodHlwZW9mIG5ld1JvbGUuX2lkID09PSAnc3RyaW5nJykpIHRocm93IG5ldyBFcnJvcihcIlJvbGUgbmFtZSAnXCIgKyBuZXdSb2xlLl9pZCArIFwiJyBpcyBub3QgYSBzdHJpbmcuXCIpXG5cbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogbmV3Um9sZS5faWRcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX2NvbnZlcnRUb05ld0ZpZWxkXG4gICAqIEBwYXJhbSB7QXJyYXl9IG9sZFJvbGVzIGBNZXRlb3IudXNlcnNgIGRvY3VtZW50IGByb2xlc2AgZmllbGQgaW4gdGhlIG9sZCBmb3JtYXQuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gY29udmVydFVuZGVyc2NvcmVzVG9Eb3RzIFNob3VsZCB3ZSBjb252ZXJ0IHVuZGVyc2NvcmVzIHRvIGRvdHMgaW4gZ3JvdXAgbmFtZXMuXG4gICAqIEByZXR1cm4ge0FycmF5fSBDb252ZXJ0ZWQgYHJvbGVzYCB0byB0aGUgbmV3IGZvcm1hdC5cbiAgICogQGZvciBSb2xlc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfY29udmVydFRvTmV3RmllbGQ6IGZ1bmN0aW9uIChvbGRSb2xlcywgY29udmVydFVuZGVyc2NvcmVzVG9Eb3RzKSB7XG4gICAgdmFyIHJvbGVzID0gW11cbiAgICBpZiAoQXJyYXkuaXNBcnJheShvbGRSb2xlcykpIHtcbiAgICAgIG9sZFJvbGVzLmZvckVhY2goZnVuY3Rpb24gKHJvbGUsIGluZGV4KSB7XG4gICAgICAgIGlmICghKHR5cGVvZiByb2xlID09PSAnc3RyaW5nJykpIHRocm93IG5ldyBFcnJvcihcIlJvbGUgJ1wiICsgcm9sZSArIFwiJyBpcyBub3QgYSBzdHJpbmcuXCIpXG5cbiAgICAgICAgcm9sZXMucHVzaCh7XG4gICAgICAgICAgX2lkOiByb2xlLFxuICAgICAgICAgIHNjb3BlOiBudWxsLFxuICAgICAgICAgIGFzc2lnbmVkOiB0cnVlXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG9sZFJvbGVzID09PSAnb2JqZWN0Jykge1xuICAgICAgT2JqZWN0LmVudHJpZXMob2xkUm9sZXMpLmZvckVhY2goKFtncm91cCwgcm9sZXNBcnJheV0pID0+IHtcbiAgICAgICAgaWYgKGdyb3VwID09PSAnX19nbG9iYWxfcm9sZXNfXycpIHtcbiAgICAgICAgICBncm91cCA9IG51bGxcbiAgICAgICAgfSBlbHNlIGlmIChjb252ZXJ0VW5kZXJzY29yZXNUb0RvdHMpIHtcbiAgICAgICAgICAvLyB1bmVzY2FwZVxuICAgICAgICAgIGdyb3VwID0gZ3JvdXAucmVwbGFjZSgvXy9nLCAnLicpXG4gICAgICAgIH1cblxuICAgICAgICByb2xlc0FycmF5LmZvckVhY2goZnVuY3Rpb24gKHJvbGUpIHtcbiAgICAgICAgICBpZiAoISh0eXBlb2Ygcm9sZSA9PT0gJ3N0cmluZycpKSB0aHJvdyBuZXcgRXJyb3IoXCJSb2xlICdcIiArIHJvbGUgKyBcIicgaXMgbm90IGEgc3RyaW5nLlwiKVxuXG4gICAgICAgICAgcm9sZXMucHVzaCh7XG4gICAgICAgICAgICBfaWQ6IHJvbGUsXG4gICAgICAgICAgICBzY29wZTogZ3JvdXAsXG4gICAgICAgICAgICBhc3NpZ25lZDogdHJ1ZVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gcm9sZXNcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfY29udmVydFRvT2xkRmllbGRcbiAgICogQHBhcmFtIHtBcnJheX0gbmV3Um9sZXMgYE1ldGVvci51c2Vyc2AgZG9jdW1lbnQgYHJvbGVzYCBmaWVsZCBpbiB0aGUgbmV3IGZvcm1hdC5cbiAgICogQHBhcmFtIHtCb29sZWFufSB1c2luZ0dyb3VwcyBTaG91bGQgd2UgdXNlIGdyb3VwcyBvciBub3QuXG4gICAqIEByZXR1cm4ge0FycmF5fSBDb252ZXJ0ZWQgYHJvbGVzYCB0byB0aGUgb2xkIGZvcm1hdC5cbiAgICogQGZvciBSb2xlc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfY29udmVydFRvT2xkRmllbGQ6IGZ1bmN0aW9uIChuZXdSb2xlcywgdXNpbmdHcm91cHMpIHtcbiAgICB2YXIgcm9sZXNcblxuICAgIGlmICh1c2luZ0dyb3Vwcykge1xuICAgICAgcm9sZXMgPSB7fVxuICAgIH0gZWxzZSB7XG4gICAgICByb2xlcyA9IFtdXG4gICAgfVxuXG4gICAgbmV3Um9sZXMuZm9yRWFjaChmdW5jdGlvbiAodXNlclJvbGUpIHtcbiAgICAgIGlmICghKHR5cGVvZiB1c2VyUm9sZSA9PT0gJ29iamVjdCcpKSB0aHJvdyBuZXcgRXJyb3IoXCJSb2xlICdcIiArIHVzZXJSb2xlICsgXCInIGlzIG5vdCBhbiBvYmplY3QuXCIpXG5cbiAgICAgIC8vIFdlIGFzc3VtZSB0aGF0IHdlIGFyZSBjb252ZXJ0aW5nIGJhY2sgYSBmYWlsZWQgbWlncmF0aW9uLCBzbyB2YWx1ZXMgY2FuIG9ubHkgYmVcbiAgICAgIC8vIHdoYXQgd2VyZSB2YWxpZCB2YWx1ZXMgaW4gMS4wLiBTbyBubyBncm91cCBuYW1lcyBzdGFydGluZyB3aXRoICQgYW5kIG5vIHN1YnJvbGVzLlxuXG4gICAgICBpZiAodXNlclJvbGUuc2NvcGUpIHtcbiAgICAgICAgaWYgKCF1c2luZ0dyb3VwcykgdGhyb3cgbmV3IEVycm9yKFwiUm9sZSAnXCIgKyB1c2VyUm9sZS5faWQgKyBcIicgd2l0aCBzY29wZSAnXCIgKyB1c2VyUm9sZS5zY29wZSArIFwiJyB3aXRob3V0IGVuYWJsZWQgZ3JvdXBzLlwiKVxuXG4gICAgICAgIC8vIGVzY2FwZVxuICAgICAgICB2YXIgc2NvcGUgPSB1c2VyUm9sZS5zY29wZS5yZXBsYWNlKC9cXC4vZywgJ18nKVxuXG4gICAgICAgIGlmIChzY29wZVswXSA9PT0gJyQnKSB0aHJvdyBuZXcgRXJyb3IoXCJHcm91cCBuYW1lICdcIiArIHNjb3BlICsgXCInIHN0YXJ0IHdpdGggJC5cIilcblxuICAgICAgICByb2xlc1tzY29wZV0gPSByb2xlc1tzY29wZV0gfHwgW11cbiAgICAgICAgcm9sZXNbc2NvcGVdLnB1c2godXNlclJvbGUuX2lkKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHVzaW5nR3JvdXBzKSB7XG4gICAgICAgICAgcm9sZXMuX19nbG9iYWxfcm9sZXNfXyA9IHJvbGVzLl9fZ2xvYmFsX3JvbGVzX18gfHwgW11cbiAgICAgICAgICByb2xlcy5fX2dsb2JhbF9yb2xlc19fLnB1c2godXNlclJvbGUuX2lkKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJvbGVzLnB1c2godXNlclJvbGUuX2lkKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gcm9sZXNcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfZGVmYXVsdFVwZGF0ZVVzZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IHVzZXIgYE1ldGVvci51c2Vyc2AgZG9jdW1lbnQuXG4gICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSByb2xlcyBWYWx1ZSB0byB3aGljaCB1c2VyJ3MgYHJvbGVzYCBmaWVsZCBzaG91bGQgYmUgc2V0LlxuICAgKiBAZm9yIFJvbGVzXG4gICAqIEBwcml2YXRlXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIF9kZWZhdWx0VXBkYXRlVXNlcjogZnVuY3Rpb24gKHVzZXIsIHJvbGVzKSB7XG4gICAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7XG4gICAgICBfaWQ6IHVzZXIuX2lkLFxuICAgICAgLy8gbWFraW5nIHN1cmUgbm90aGluZyBjaGFuZ2VkIGluIG1lYW50aW1lXG4gICAgICByb2xlczogdXNlci5yb2xlc1xuICAgIH0sIHtcbiAgICAgICRzZXQ6IHsgcm9sZXMgfVxuICAgIH0pXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBtZXRob2QgX2RlZmF1bHRVcGRhdGVSb2xlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvbGRSb2xlIE9sZCBgTWV0ZW9yLnJvbGVzYCBkb2N1bWVudC5cbiAgICogQHBhcmFtIHtPYmplY3R9IG5ld1JvbGUgTmV3IGBNZXRlb3Iucm9sZXNgIGRvY3VtZW50LlxuICAgKiBAZm9yIFJvbGVzXG4gICAqIEBwcml2YXRlXG4gICAqIEBzdGF0aWNcbiAgICovXG4gIF9kZWZhdWx0VXBkYXRlUm9sZTogZnVuY3Rpb24gKG9sZFJvbGUsIG5ld1JvbGUpIHtcbiAgICBNZXRlb3Iucm9sZXMucmVtb3ZlKG9sZFJvbGUuX2lkKVxuICAgIE1ldGVvci5yb2xlcy5pbnNlcnQobmV3Um9sZSlcbiAgfSxcblxuICAvKipcbiAgICogQG1ldGhvZCBfZHJvcENvbGxlY3Rpb25JbmRleFxuICAgKiBAcGFyYW0ge09iamVjdH0gY29sbGVjdGlvbiBDb2xsZWN0aW9uIG9uIHdoaWNoIHRvIGRyb3AgdGhlIGluZGV4LlxuICAgKiBAcGFyYW0ge1N0cmluZ30gaW5kZXhOYW1lIE5hbWUgb2YgdGhlIGluZGV4IHRvIGRyb3AuXG4gICAqIEBmb3IgUm9sZXNcbiAgICogQHByaXZhdGVcbiAgICogQHN0YXRpY1xuICAgKi9cbiAgX2Ryb3BDb2xsZWN0aW9uSW5kZXg6IGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBpbmRleE5hbWUpIHtcbiAgICB0cnkge1xuICAgICAgY29sbGVjdGlvbi5fZHJvcEluZGV4KGluZGV4TmFtZSlcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5uYW1lICE9PSAnTW9uZ29FcnJvcicpIHRocm93IGVcbiAgICAgIGlmICghL2luZGV4IG5vdCBmb3VuZC8udGVzdChlLmVyciB8fCBlLmVycm1zZykpIHRocm93IGVcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIE1pZ3JhdGVzIGBNZXRlb3IudXNlcnNgIGFuZCBgTWV0ZW9yLnJvbGVzYCB0byB0aGUgbmV3IGZvcm1hdC5cbiAgICpcbiAgICogQG1ldGhvZCBfZm9yd2FyZE1pZ3JhdGVcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gdXBkYXRlVXNlciBGdW5jdGlvbiB3aGljaCB1cGRhdGVzIHRoZSB1c2VyIG9iamVjdC4gRGVmYXVsdCBgX2RlZmF1bHRVcGRhdGVVc2VyYC5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gdXBkYXRlUm9sZSBGdW5jdGlvbiB3aGljaCB1cGRhdGVzIHRoZSByb2xlIG9iamVjdC4gRGVmYXVsdCBgX2RlZmF1bHRVcGRhdGVSb2xlYC5cbiAgICogQHBhcmFtIHtCb29sZWFufSBjb252ZXJ0VW5kZXJzY29yZXNUb0RvdHMgU2hvdWxkIHdlIGNvbnZlcnQgdW5kZXJzY29yZXMgdG8gZG90cyBpbiBncm91cCBuYW1lcy5cbiAgICogQGZvciBSb2xlc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfZm9yd2FyZE1pZ3JhdGU6IGZ1bmN0aW9uICh1cGRhdGVVc2VyLCB1cGRhdGVSb2xlLCBjb252ZXJ0VW5kZXJzY29yZXNUb0RvdHMpIHtcbiAgICB1cGRhdGVVc2VyID0gdXBkYXRlVXNlciB8fCBSb2xlcy5fZGVmYXVsdFVwZGF0ZVVzZXJcbiAgICB1cGRhdGVSb2xlID0gdXBkYXRlUm9sZSB8fCBSb2xlcy5fZGVmYXVsdFVwZGF0ZVJvbGVcblxuICAgIFJvbGVzLl9kcm9wQ29sbGVjdGlvbkluZGV4KE1ldGVvci5yb2xlcywgJ25hbWVfMScpXG5cbiAgICBNZXRlb3Iucm9sZXMuZmluZCgpLmZvckVhY2goZnVuY3Rpb24gKHJvbGUsIGluZGV4LCBjdXJzb3IpIHtcbiAgICAgIGlmICghUm9sZXMuX2lzTmV3Um9sZShyb2xlKSkge1xuICAgICAgICB1cGRhdGVSb2xlKHJvbGUsIFJvbGVzLl9jb252ZXJ0VG9OZXdSb2xlKHJvbGUpKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBNZXRlb3IudXNlcnMuZmluZCgpLmZvckVhY2goZnVuY3Rpb24gKHVzZXIsIGluZGV4LCBjdXJzb3IpIHtcbiAgICAgIGlmICghUm9sZXMuX2lzTmV3RmllbGQodXNlci5yb2xlcykpIHtcbiAgICAgICAgdXBkYXRlVXNlcih1c2VyLCBSb2xlcy5fY29udmVydFRvTmV3RmllbGQodXNlci5yb2xlcywgY29udmVydFVuZGVyc2NvcmVzVG9Eb3RzKSlcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBNb3ZlcyB0aGUgYXNzaWdubWVudHMgZnJvbSBgTWV0ZW9yLnVzZXJzYCB0byBgTWV0ZW9yLnJvbGVBc3NpZ25tZW50YC5cbiAgICpcbiAgICogQG1ldGhvZCBfZm9yd2FyZE1pZ3JhdGUyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB1c2VyU2VsZWN0b3IgQW4gb3Bwb3J0dW5pdHkgdG8gc2hhcmUgdGhlIHdvcmsgYW1vbmcgaW5zdGFuY2VzLiBJdCdzIGFkdmlzYWJsZSB0byBkbyB0aGUgZGl2aXNpb24gYmFzZWQgb24gdXNlci1pZC5cbiAgICogQGZvciBSb2xlc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfZm9yd2FyZE1pZ3JhdGUyOiBmdW5jdGlvbiAodXNlclNlbGVjdG9yKSB7XG4gICAgdXNlclNlbGVjdG9yID0gdXNlclNlbGVjdG9yIHx8IHt9XG4gICAgT2JqZWN0LmFzc2lnbih1c2VyU2VsZWN0b3IsIHsgcm9sZXM6IHsgJG5lOiBudWxsIH0gfSlcblxuICAgIE1ldGVvci51c2Vycy5maW5kKHVzZXJTZWxlY3RvcikuZm9yRWFjaChmdW5jdGlvbiAodXNlciwgaW5kZXgpIHtcbiAgICAgIHVzZXIucm9sZXMuZmlsdGVyKChyKSA9PiByLmFzc2lnbmVkKS5mb3JFYWNoKHIgPT4ge1xuICAgICAgICAvLyBBZGRlZCBgaWZFeGlzdHNgIHRvIG1ha2UgaXQgbGVzcyBlcnJvci1wcm9uZVxuICAgICAgICBSb2xlcy5fYWRkVXNlclRvUm9sZSh1c2VyLl9pZCwgci5faWQsIHsgc2NvcGU6IHIuc2NvcGUsIGlmRXhpc3RzOiB0cnVlIH0pXG4gICAgICB9KVxuXG4gICAgICBNZXRlb3IudXNlcnMudXBkYXRlKHsgX2lkOiB1c2VyLl9pZCB9LCB7ICR1bnNldDogeyByb2xlczogJycgfSB9KVxuICAgIH0pXG5cbiAgICAvLyBObyBuZWVkIHRvIGtlZXAgdGhlIGluZGV4ZXMgYXJvdW5kXG4gICAgUm9sZXMuX2Ryb3BDb2xsZWN0aW9uSW5kZXgoTWV0ZW9yLnVzZXJzLCAncm9sZXMuX2lkXzFfcm9sZXMuc2NvcGVfMScpXG4gICAgUm9sZXMuX2Ryb3BDb2xsZWN0aW9uSW5kZXgoTWV0ZW9yLnVzZXJzLCAncm9sZXMuc2NvcGVfMScpXG4gIH0sXG5cbiAgLyoqXG4gICAqIE1pZ3JhdGVzIGBNZXRlb3IudXNlcnNgIGFuZCBgTWV0ZW9yLnJvbGVzYCB0byB0aGUgb2xkIGZvcm1hdC5cbiAgICpcbiAgICogV2UgYXNzdW1lIHRoYXQgd2UgYXJlIGNvbnZlcnRpbmcgYmFjayBhIGZhaWxlZCBtaWdyYXRpb24sIHNvIHZhbHVlcyBjYW4gb25seSBiZVxuICAgKiB3aGF0IHdlcmUgdmFsaWQgdmFsdWVzIGluIHRoZSBvbGQgZm9ybWF0LiBTbyBubyBncm91cCBuYW1lcyBzdGFydGluZyB3aXRoIGAkYCBhbmRcbiAgICogbm8gc3Vicm9sZXMuXG4gICAqXG4gICAqIEBtZXRob2QgX2JhY2t3YXJkTWlncmF0ZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSB1cGRhdGVVc2VyIEZ1bmN0aW9uIHdoaWNoIHVwZGF0ZXMgdGhlIHVzZXIgb2JqZWN0LiBEZWZhdWx0IGBfZGVmYXVsdFVwZGF0ZVVzZXJgLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSB1cGRhdGVSb2xlIEZ1bmN0aW9uIHdoaWNoIHVwZGF0ZXMgdGhlIHJvbGUgb2JqZWN0LiBEZWZhdWx0IGBfZGVmYXVsdFVwZGF0ZVJvbGVgLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IHVzaW5nR3JvdXBzIFNob3VsZCB3ZSB1c2UgZ3JvdXBzIG9yIG5vdC5cbiAgICogQGZvciBSb2xlc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfYmFja3dhcmRNaWdyYXRlOiBmdW5jdGlvbiAodXBkYXRlVXNlciwgdXBkYXRlUm9sZSwgdXNpbmdHcm91cHMpIHtcbiAgICB1cGRhdGVVc2VyID0gdXBkYXRlVXNlciB8fCBSb2xlcy5fZGVmYXVsdFVwZGF0ZVVzZXJcbiAgICB1cGRhdGVSb2xlID0gdXBkYXRlUm9sZSB8fCBSb2xlcy5fZGVmYXVsdFVwZGF0ZVJvbGVcblxuICAgIFJvbGVzLl9kcm9wQ29sbGVjdGlvbkluZGV4KE1ldGVvci51c2VycywgJ3JvbGVzLl9pZF8xX3JvbGVzLnNjb3BlXzEnKVxuICAgIFJvbGVzLl9kcm9wQ29sbGVjdGlvbkluZGV4KE1ldGVvci51c2VycywgJ3JvbGVzLnNjb3BlXzEnKVxuXG4gICAgTWV0ZW9yLnJvbGVzLmZpbmQoKS5mb3JFYWNoKGZ1bmN0aW9uIChyb2xlLCBpbmRleCwgY3Vyc29yKSB7XG4gICAgICBpZiAoIVJvbGVzLl9pc09sZFJvbGUocm9sZSkpIHtcbiAgICAgICAgdXBkYXRlUm9sZShyb2xlLCBSb2xlcy5fY29udmVydFRvT2xkUm9sZShyb2xlKSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgTWV0ZW9yLnVzZXJzLmZpbmQoKS5mb3JFYWNoKGZ1bmN0aW9uICh1c2VyLCBpbmRleCwgY3Vyc29yKSB7XG4gICAgICBpZiAoIVJvbGVzLl9pc09sZEZpZWxkKHVzZXIucm9sZXMpKSB7XG4gICAgICAgIHVwZGF0ZVVzZXIodXNlciwgUm9sZXMuX2NvbnZlcnRUb09sZEZpZWxkKHVzZXIucm9sZXMsIHVzaW5nR3JvdXBzKSlcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBNb3ZlcyB0aGUgYXNzaWdubWVudHMgZnJvbSBgTWV0ZW9yLnJvbGVBc3NpZ25tZW50YCBiYWNrIHRvIHRvIGBNZXRlb3IudXNlcnNgLlxuICAgKlxuICAgKiBAbWV0aG9kIF9iYWNrd2FyZE1pZ3JhdGUyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhc3NpZ25tZW50U2VsZWN0b3IgQW4gb3Bwb3J0dW5pdHkgdG8gc2hhcmUgdGhlIHdvcmsgYW1vbmcgaW5zdGFuY2VzLiBJdCdzIGFkdmlzYWJsZSB0byBkbyB0aGUgZGl2aXNpb24gYmFzZWQgb24gdXNlci1pZC5cbiAgICogQGZvciBSb2xlc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAc3RhdGljXG4gICAqL1xuICBfYmFja3dhcmRNaWdyYXRlMjogZnVuY3Rpb24gKGFzc2lnbm1lbnRTZWxlY3Rvcikge1xuICAgIGFzc2lnbm1lbnRTZWxlY3RvciA9IGFzc2lnbm1lbnRTZWxlY3RvciB8fCB7fVxuXG4gICAgTWV0ZW9yLnVzZXJzLl9lbnN1cmVJbmRleCh7ICdyb2xlcy5faWQnOiAxLCAncm9sZXMuc2NvcGUnOiAxIH0pXG4gICAgTWV0ZW9yLnVzZXJzLl9lbnN1cmVJbmRleCh7ICdyb2xlcy5zY29wZSc6IDEgfSlcblxuICAgIE1ldGVvci5yb2xlQXNzaWdubWVudC5maW5kKGFzc2lnbm1lbnRTZWxlY3RvcikuZm9yRWFjaChyID0+IHtcbiAgICAgIGNvbnN0IHJvbGVzID0gTWV0ZW9yLnVzZXJzLmZpbmRPbmUoeyBfaWQ6IHIudXNlci5faWQgfSkucm9sZXMgfHwgW11cblxuICAgICAgY29uc3QgY3VycmVudFJvbGUgPSByb2xlcy5maW5kKG9sZFJvbGUgPT4gb2xkUm9sZS5faWQgPT09IHIucm9sZS5faWQgJiYgb2xkUm9sZS5zY29wZSA9PT0gci5zY29wZSlcbiAgICAgIGlmIChjdXJyZW50Um9sZSkge1xuICAgICAgICBjdXJyZW50Um9sZS5hc3NpZ25lZCA9IHRydWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJvbGVzLnB1c2goe1xuICAgICAgICAgIF9pZDogci5yb2xlLl9pZCxcbiAgICAgICAgICBzY29wZTogci5zY29wZSxcbiAgICAgICAgICBhc3NpZ25lZDogdHJ1ZVxuICAgICAgICB9KVxuXG4gICAgICAgIHIuaW5oZXJpdGVkUm9sZXMuZm9yRWFjaChpbmhlcml0ZWRSb2xlID0+IHtcbiAgICAgICAgICBjb25zdCBjdXJyZW50SW5oZXJpdGVkUm9sZSA9IHJvbGVzLmZpbmQob2xkUm9sZSA9PiBvbGRSb2xlLl9pZCA9PT0gaW5oZXJpdGVkUm9sZS5faWQgJiYgb2xkUm9sZS5zY29wZSA9PT0gci5zY29wZSlcblxuICAgICAgICAgIGlmICghY3VycmVudEluaGVyaXRlZFJvbGUpIHtcbiAgICAgICAgICAgIHJvbGVzLnB1c2goe1xuICAgICAgICAgICAgICBfaWQ6IGluaGVyaXRlZFJvbGUuX2lkLFxuICAgICAgICAgICAgICBzY29wZTogci5zY29wZSxcbiAgICAgICAgICAgICAgYXNzaWduZWQ6IGZhbHNlXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgTWV0ZW9yLnVzZXJzLnVwZGF0ZSh7IF9pZDogci51c2VyLl9pZCB9LCB7ICRzZXQ6IHsgcm9sZXMgfSB9KVxuICAgICAgTWV0ZW9yLnJvbGVBc3NpZ25tZW50LnJlbW92ZSh7IF9pZDogci5faWQgfSlcbiAgICB9KVxuICB9XG59KVxuIl19
