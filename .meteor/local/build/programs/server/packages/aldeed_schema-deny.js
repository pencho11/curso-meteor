(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Collection2 = Package['aldeed:collection2'].Collection2;
var ECMAScript = Package.ecmascript.ECMAScript;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"aldeed:schema-deny":{"deny.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                        //
// packages/aldeed_schema-deny/deny.js                                                    //
//                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////
                                                                                          //
let SimpleSchema;
module.link("simpl-schema", {
  default(v) {
    SimpleSchema = v;
  }

}, 0);
let Collection2;
module.link("meteor/aldeed:collection2", {
  default(v) {
    Collection2 = v;
  }

}, 1);
// Extend the schema options allowed by SimpleSchema
SimpleSchema.extendOptions(['denyInsert', 'denyUpdate']);
Collection2.on('schema.attached', function (collection, ss) {
  if (ss.version >= 2 && ss.messageBox && typeof ss.messageBox.messages === 'function') {
    ss.messageBox.messages({
      en: {
        insertNotAllowed: '{{label}} cannot be set during an insert',
        updateNotAllowed: '{{label}} cannot be set during an update'
      }
    });
  }

  ss.addValidator(function () {
    if (!this.isSet) return;
    const def = this.definition;
    if (def.denyInsert && this.isInsert) return 'insertNotAllowed';
    if (def.denyUpdate && (this.isUpdate || this.isUpsert)) return 'updateNotAllowed';
  });
});
////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/aldeed:schema-deny/deny.js");

/* Exports */
Package._define("aldeed:schema-deny", exports);

})();

//# sourceURL=meteor://💻app/packages/aldeed_schema-deny.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWxkZWVkOnNjaGVtYS1kZW55L2RlbnkuanMiXSwibmFtZXMiOlsiU2ltcGxlU2NoZW1hIiwibW9kdWxlIiwibGluayIsImRlZmF1bHQiLCJ2IiwiQ29sbGVjdGlvbjIiLCJleHRlbmRPcHRpb25zIiwib24iLCJjb2xsZWN0aW9uIiwic3MiLCJ2ZXJzaW9uIiwibWVzc2FnZUJveCIsIm1lc3NhZ2VzIiwiZW4iLCJpbnNlcnROb3RBbGxvd2VkIiwidXBkYXRlTm90QWxsb3dlZCIsImFkZFZhbGlkYXRvciIsImlzU2V0IiwiZGVmIiwiZGVmaW5pdGlvbiIsImRlbnlJbnNlcnQiLCJpc0luc2VydCIsImRlbnlVcGRhdGUiLCJpc1VwZGF0ZSIsImlzVXBzZXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFJQSxZQUFKO0FBQWlCQyxNQUFNLENBQUNDLElBQVAsQ0FBWSxjQUFaLEVBQTJCO0FBQUNDLFNBQU8sQ0FBQ0MsQ0FBRCxFQUFHO0FBQUNKLGdCQUFZLEdBQUNJLENBQWI7QUFBZTs7QUFBM0IsQ0FBM0IsRUFBd0QsQ0FBeEQ7QUFBMkQsSUFBSUMsV0FBSjtBQUFnQkosTUFBTSxDQUFDQyxJQUFQLENBQVksMkJBQVosRUFBd0M7QUFBQ0MsU0FBTyxDQUFDQyxDQUFELEVBQUc7QUFBQ0MsZUFBVyxHQUFDRCxDQUFaO0FBQWM7O0FBQTFCLENBQXhDLEVBQW9FLENBQXBFO0FBSTVGO0FBQ0FKLFlBQVksQ0FBQ00sYUFBYixDQUEyQixDQUFDLFlBQUQsRUFBZSxZQUFmLENBQTNCO0FBRUFELFdBQVcsQ0FBQ0UsRUFBWixDQUFlLGlCQUFmLEVBQWtDLFVBQVVDLFVBQVYsRUFBc0JDLEVBQXRCLEVBQTBCO0FBQzFELE1BQUlBLEVBQUUsQ0FBQ0MsT0FBSCxJQUFjLENBQWQsSUFBbUJELEVBQUUsQ0FBQ0UsVUFBdEIsSUFBb0MsT0FBT0YsRUFBRSxDQUFDRSxVQUFILENBQWNDLFFBQXJCLEtBQWtDLFVBQTFFLEVBQXNGO0FBQ3BGSCxNQUFFLENBQUNFLFVBQUgsQ0FBY0MsUUFBZCxDQUF1QjtBQUNyQkMsUUFBRSxFQUFFO0FBQ0ZDLHdCQUFnQixFQUFFLDBDQURoQjtBQUVGQyx3QkFBZ0IsRUFBRTtBQUZoQjtBQURpQixLQUF2QjtBQU1EOztBQUVETixJQUFFLENBQUNPLFlBQUgsQ0FBZ0IsWUFBVztBQUN6QixRQUFJLENBQUMsS0FBS0MsS0FBVixFQUFpQjtBQUVqQixVQUFNQyxHQUFHLEdBQUcsS0FBS0MsVUFBakI7QUFFQSxRQUFJRCxHQUFHLENBQUNFLFVBQUosSUFBa0IsS0FBS0MsUUFBM0IsRUFBcUMsT0FBTyxrQkFBUDtBQUNyQyxRQUFJSCxHQUFHLENBQUNJLFVBQUosS0FBbUIsS0FBS0MsUUFBTCxJQUFpQixLQUFLQyxRQUF6QyxDQUFKLEVBQXdELE9BQU8sa0JBQVA7QUFDekQsR0FQRDtBQVFELENBbEJELEUiLCJmaWxlIjoiL3BhY2thZ2VzL2FsZGVlZF9zY2hlbWEtZGVueS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGNvbGxlY3Rpb24yIGNoZWNrcyB0byBtYWtlIHN1cmUgdGhhdCBzaW1wbC1zY2hlbWEgcGFja2FnZSBpcyBhZGRlZFxuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuaW1wb3J0IENvbGxlY3Rpb24yIGZyb20gJ21ldGVvci9hbGRlZWQ6Y29sbGVjdGlvbjInO1xuXG4vLyBFeHRlbmQgdGhlIHNjaGVtYSBvcHRpb25zIGFsbG93ZWQgYnkgU2ltcGxlU2NoZW1hXG5TaW1wbGVTY2hlbWEuZXh0ZW5kT3B0aW9ucyhbJ2RlbnlJbnNlcnQnLCAnZGVueVVwZGF0ZSddKTtcblxuQ29sbGVjdGlvbjIub24oJ3NjaGVtYS5hdHRhY2hlZCcsIGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBzcykge1xuICBpZiAoc3MudmVyc2lvbiA+PSAyICYmIHNzLm1lc3NhZ2VCb3ggJiYgdHlwZW9mIHNzLm1lc3NhZ2VCb3gubWVzc2FnZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBzcy5tZXNzYWdlQm94Lm1lc3NhZ2VzKHtcbiAgICAgIGVuOiB7XG4gICAgICAgIGluc2VydE5vdEFsbG93ZWQ6ICd7e2xhYmVsfX0gY2Fubm90IGJlIHNldCBkdXJpbmcgYW4gaW5zZXJ0JyxcbiAgICAgICAgdXBkYXRlTm90QWxsb3dlZDogJ3t7bGFiZWx9fSBjYW5ub3QgYmUgc2V0IGR1cmluZyBhbiB1cGRhdGUnXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzcy5hZGRWYWxpZGF0b3IoZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLmlzU2V0KSByZXR1cm47XG5cbiAgICBjb25zdCBkZWYgPSB0aGlzLmRlZmluaXRpb247XG5cbiAgICBpZiAoZGVmLmRlbnlJbnNlcnQgJiYgdGhpcy5pc0luc2VydCkgcmV0dXJuICdpbnNlcnROb3RBbGxvd2VkJztcbiAgICBpZiAoZGVmLmRlbnlVcGRhdGUgJiYgKHRoaXMuaXNVcGRhdGUgfHwgdGhpcy5pc1Vwc2VydCkpIHJldHVybiAndXBkYXRlTm90QWxsb3dlZCc7XG4gIH0pO1xufSk7XG4iXX0=
