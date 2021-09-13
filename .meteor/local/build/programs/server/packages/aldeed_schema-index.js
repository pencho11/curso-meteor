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

var require = meteorInstall({"node_modules":{"meteor":{"aldeed:schema-index":{"server.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/aldeed_schema-index/server.js                                                                //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
let Collection2;
module.link("meteor/aldeed:collection2", {
  default(v) {
    Collection2 = v;
  }

}, 0);
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 1);
module.link("./common");
Collection2.on('schema.attached', (collection, ss) => {
  function ensureIndex(index, name, unique, sparse) {
    Meteor.startup(() => {
      collection._collection._ensureIndex(index, {
        background: true,
        name,
        unique,
        sparse
      });
    });
  }

  function dropIndex(indexName) {
    Meteor.startup(() => {
      try {
        collection._collection._dropIndex(indexName);
      } catch (err) {// no index with that name, which is what we want
      }
    });
  }

  const propName = ss.version === 2 ? 'mergedSchema' : 'schema'; // Loop over fields definitions and ensure collection indexes (server side only)

  const schema = ss[propName]();
  Object.keys(schema).forEach(fieldName => {
    const definition = schema[fieldName];

    if ('index' in definition || definition.unique === true) {
      const index = {}; // If they specified `unique: true` but not `index`,
      // we assume `index: 1` to set up the unique index in mongo

      let indexValue;

      if ('index' in definition) {
        indexValue = definition.index;
        if (indexValue === true) indexValue = 1;
      } else {
        indexValue = 1;
      }

      const indexName = "c2_".concat(fieldName); // In the index object, we want object array keys without the ".$" piece

      const idxFieldName = fieldName.replace(/\.\$\./g, '.');
      index[idxFieldName] = indexValue;
      const unique = !!definition.unique && (indexValue === 1 || indexValue === -1);
      let sparse = definition.sparse || false; // If unique and optional, force sparse to prevent errors

      if (!sparse && unique && definition.optional) sparse = true;

      if (indexValue === false) {
        dropIndex(indexName);
      } else {
        ensureIndex(index, indexName, unique, sparse);
      }
    }
  });
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////

},"common.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/aldeed_schema-index/common.js                                                                //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
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
SimpleSchema.extendOptions(['index', // one of Number, String, Boolean
'unique', // Boolean
'sparse' // Boolean
]);
Collection2.on('schema.attached', (collection, ss) => {
  // Define validation error messages
  if (ss.version >= 2 && ss.messageBox && typeof ss.messageBox.messages === 'function') {
    ss.messageBox.messages({
      en: {
        notUnique: '{{label}} must be unique'
      }
    });
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/aldeed:schema-index/server.js");

/* Exports */
Package._define("aldeed:schema-index", exports);

})();

//# sourceURL=meteor://💻app/packages/aldeed_schema-index.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWxkZWVkOnNjaGVtYS1pbmRleC9zZXJ2ZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FsZGVlZDpzY2hlbWEtaW5kZXgvY29tbW9uLmpzIl0sIm5hbWVzIjpbIkNvbGxlY3Rpb24yIiwibW9kdWxlIiwibGluayIsImRlZmF1bHQiLCJ2IiwiTWV0ZW9yIiwib24iLCJjb2xsZWN0aW9uIiwic3MiLCJlbnN1cmVJbmRleCIsImluZGV4IiwibmFtZSIsInVuaXF1ZSIsInNwYXJzZSIsInN0YXJ0dXAiLCJfY29sbGVjdGlvbiIsIl9lbnN1cmVJbmRleCIsImJhY2tncm91bmQiLCJkcm9wSW5kZXgiLCJpbmRleE5hbWUiLCJfZHJvcEluZGV4IiwiZXJyIiwicHJvcE5hbWUiLCJ2ZXJzaW9uIiwic2NoZW1hIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJmaWVsZE5hbWUiLCJkZWZpbml0aW9uIiwiaW5kZXhWYWx1ZSIsImlkeEZpZWxkTmFtZSIsInJlcGxhY2UiLCJvcHRpb25hbCIsIlNpbXBsZVNjaGVtYSIsImV4dGVuZE9wdGlvbnMiLCJtZXNzYWdlQm94IiwibWVzc2FnZXMiLCJlbiIsIm5vdFVuaXF1ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBSUEsV0FBSjtBQUFnQkMsTUFBTSxDQUFDQyxJQUFQLENBQVksMkJBQVosRUFBd0M7QUFBQ0MsU0FBTyxDQUFDQyxDQUFELEVBQUc7QUFBQ0osZUFBVyxHQUFDSSxDQUFaO0FBQWM7O0FBQTFCLENBQXhDLEVBQW9FLENBQXBFO0FBQXVFLElBQUlDLE1BQUo7QUFBV0osTUFBTSxDQUFDQyxJQUFQLENBQVksZUFBWixFQUE0QjtBQUFDRyxRQUFNLENBQUNELENBQUQsRUFBRztBQUFDQyxVQUFNLEdBQUNELENBQVA7QUFBUzs7QUFBcEIsQ0FBNUIsRUFBa0QsQ0FBbEQ7QUFBcURILE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLFVBQVo7QUFLdkpGLFdBQVcsQ0FBQ00sRUFBWixDQUFlLGlCQUFmLEVBQWtDLENBQUNDLFVBQUQsRUFBYUMsRUFBYixLQUFvQjtBQUNwRCxXQUFTQyxXQUFULENBQXFCQyxLQUFyQixFQUE0QkMsSUFBNUIsRUFBa0NDLE1BQWxDLEVBQTBDQyxNQUExQyxFQUFrRDtBQUNoRFIsVUFBTSxDQUFDUyxPQUFQLENBQWUsTUFBTTtBQUNuQlAsZ0JBQVUsQ0FBQ1EsV0FBWCxDQUF1QkMsWUFBdkIsQ0FBb0NOLEtBQXBDLEVBQTJDO0FBQ3pDTyxrQkFBVSxFQUFFLElBRDZCO0FBRXpDTixZQUZ5QztBQUd6Q0MsY0FIeUM7QUFJekNDO0FBSnlDLE9BQTNDO0FBTUQsS0FQRDtBQVFEOztBQUVELFdBQVNLLFNBQVQsQ0FBbUJDLFNBQW5CLEVBQThCO0FBQzVCZCxVQUFNLENBQUNTLE9BQVAsQ0FBZSxNQUFNO0FBQ25CLFVBQUk7QUFDRlAsa0JBQVUsQ0FBQ1EsV0FBWCxDQUF1QkssVUFBdkIsQ0FBa0NELFNBQWxDO0FBQ0QsT0FGRCxDQUVFLE9BQU9FLEdBQVAsRUFBWSxDQUNaO0FBQ0Q7QUFDRixLQU5EO0FBT0Q7O0FBRUQsUUFBTUMsUUFBUSxHQUFHZCxFQUFFLENBQUNlLE9BQUgsS0FBZSxDQUFmLEdBQW1CLGNBQW5CLEdBQW9DLFFBQXJELENBdEJvRCxDQXdCcEQ7O0FBQ0EsUUFBTUMsTUFBTSxHQUFHaEIsRUFBRSxDQUFDYyxRQUFELENBQUYsRUFBZjtBQUNBRyxRQUFNLENBQUNDLElBQVAsQ0FBWUYsTUFBWixFQUFvQkcsT0FBcEIsQ0FBNkJDLFNBQUQsSUFBZTtBQUN6QyxVQUFNQyxVQUFVLEdBQUdMLE1BQU0sQ0FBQ0ksU0FBRCxDQUF6Qjs7QUFDQSxRQUFJLFdBQVdDLFVBQVgsSUFBeUJBLFVBQVUsQ0FBQ2pCLE1BQVgsS0FBc0IsSUFBbkQsRUFBeUQ7QUFDdkQsWUFBTUYsS0FBSyxHQUFHLEVBQWQsQ0FEdUQsQ0FFdkQ7QUFDQTs7QUFDQSxVQUFJb0IsVUFBSjs7QUFDQSxVQUFJLFdBQVdELFVBQWYsRUFBMkI7QUFDekJDLGtCQUFVLEdBQUdELFVBQVUsQ0FBQ25CLEtBQXhCO0FBQ0EsWUFBSW9CLFVBQVUsS0FBSyxJQUFuQixFQUF5QkEsVUFBVSxHQUFHLENBQWI7QUFDMUIsT0FIRCxNQUdPO0FBQ0xBLGtCQUFVLEdBQUcsQ0FBYjtBQUNEOztBQUVELFlBQU1YLFNBQVMsZ0JBQVNTLFNBQVQsQ0FBZixDQVp1RCxDQWF2RDs7QUFDQSxZQUFNRyxZQUFZLEdBQUdILFNBQVMsQ0FBQ0ksT0FBVixDQUFrQixTQUFsQixFQUE2QixHQUE3QixDQUFyQjtBQUNBdEIsV0FBSyxDQUFDcUIsWUFBRCxDQUFMLEdBQXNCRCxVQUF0QjtBQUNBLFlBQU1sQixNQUFNLEdBQUcsQ0FBQyxDQUFDaUIsVUFBVSxDQUFDakIsTUFBYixLQUF3QmtCLFVBQVUsS0FBSyxDQUFmLElBQW9CQSxVQUFVLEtBQUssQ0FBQyxDQUE1RCxDQUFmO0FBQ0EsVUFBSWpCLE1BQU0sR0FBR2dCLFVBQVUsQ0FBQ2hCLE1BQVgsSUFBcUIsS0FBbEMsQ0FqQnVELENBbUJ2RDs7QUFDQSxVQUFJLENBQUNBLE1BQUQsSUFBV0QsTUFBWCxJQUFxQmlCLFVBQVUsQ0FBQ0ksUUFBcEMsRUFBOENwQixNQUFNLEdBQUcsSUFBVDs7QUFFOUMsVUFBSWlCLFVBQVUsS0FBSyxLQUFuQixFQUEwQjtBQUN4QlosaUJBQVMsQ0FBQ0MsU0FBRCxDQUFUO0FBQ0QsT0FGRCxNQUVPO0FBQ0xWLG1CQUFXLENBQUNDLEtBQUQsRUFBUVMsU0FBUixFQUFtQlAsTUFBbkIsRUFBMkJDLE1BQTNCLENBQVg7QUFDRDtBQUNGO0FBQ0YsR0E5QkQ7QUErQkQsQ0F6REQsRTs7Ozs7Ozs7Ozs7QUNMQSxJQUFJcUIsWUFBSjtBQUFpQmpDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLGNBQVosRUFBMkI7QUFBQ0MsU0FBTyxDQUFDQyxDQUFELEVBQUc7QUFBQzhCLGdCQUFZLEdBQUM5QixDQUFiO0FBQWU7O0FBQTNCLENBQTNCLEVBQXdELENBQXhEO0FBQTJELElBQUlKLFdBQUo7QUFBZ0JDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLDJCQUFaLEVBQXdDO0FBQUNDLFNBQU8sQ0FBQ0MsQ0FBRCxFQUFHO0FBQUNKLGVBQVcsR0FBQ0ksQ0FBWjtBQUFjOztBQUExQixDQUF4QyxFQUFvRSxDQUFwRTtBQUk1RjtBQUNBOEIsWUFBWSxDQUFDQyxhQUFiLENBQTJCLENBQ3pCLE9BRHlCLEVBQ2hCO0FBQ1QsUUFGeUIsRUFFZjtBQUNWLFFBSHlCLENBR2Y7QUFIZSxDQUEzQjtBQU1BbkMsV0FBVyxDQUFDTSxFQUFaLENBQWUsaUJBQWYsRUFBa0MsQ0FBQ0MsVUFBRCxFQUFhQyxFQUFiLEtBQW9CO0FBQ3BEO0FBQ0EsTUFBSUEsRUFBRSxDQUFDZSxPQUFILElBQWMsQ0FBZCxJQUFtQmYsRUFBRSxDQUFDNEIsVUFBdEIsSUFBb0MsT0FBTzVCLEVBQUUsQ0FBQzRCLFVBQUgsQ0FBY0MsUUFBckIsS0FBa0MsVUFBMUUsRUFBc0Y7QUFDcEY3QixNQUFFLENBQUM0QixVQUFILENBQWNDLFFBQWQsQ0FBdUI7QUFDckJDLFFBQUUsRUFBRTtBQUNGQyxpQkFBUyxFQUFFO0FBRFQ7QUFEaUIsS0FBdkI7QUFLRDtBQUNGLENBVEQsRSIsImZpbGUiOiIvcGFja2FnZXMvYWxkZWVkX3NjaGVtYS1pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb2xsZWN0aW9uMiBmcm9tICdtZXRlb3IvYWxkZWVkOmNvbGxlY3Rpb24yJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG5pbXBvcnQgJy4vY29tbW9uJztcblxuQ29sbGVjdGlvbjIub24oJ3NjaGVtYS5hdHRhY2hlZCcsIChjb2xsZWN0aW9uLCBzcykgPT4ge1xuICBmdW5jdGlvbiBlbnN1cmVJbmRleChpbmRleCwgbmFtZSwgdW5pcXVlLCBzcGFyc2UpIHtcbiAgICBNZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gICAgICBjb2xsZWN0aW9uLl9jb2xsZWN0aW9uLl9lbnN1cmVJbmRleChpbmRleCwge1xuICAgICAgICBiYWNrZ3JvdW5kOiB0cnVlLFxuICAgICAgICBuYW1lLFxuICAgICAgICB1bmlxdWUsXG4gICAgICAgIHNwYXJzZSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZHJvcEluZGV4KGluZGV4TmFtZSkge1xuICAgIE1ldGVvci5zdGFydHVwKCgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbGxlY3Rpb24uX2NvbGxlY3Rpb24uX2Ryb3BJbmRleChpbmRleE5hbWUpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIC8vIG5vIGluZGV4IHdpdGggdGhhdCBuYW1lLCB3aGljaCBpcyB3aGF0IHdlIHdhbnRcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0IHByb3BOYW1lID0gc3MudmVyc2lvbiA9PT0gMiA/ICdtZXJnZWRTY2hlbWEnIDogJ3NjaGVtYSc7XG5cbiAgLy8gTG9vcCBvdmVyIGZpZWxkcyBkZWZpbml0aW9ucyBhbmQgZW5zdXJlIGNvbGxlY3Rpb24gaW5kZXhlcyAoc2VydmVyIHNpZGUgb25seSlcbiAgY29uc3Qgc2NoZW1hID0gc3NbcHJvcE5hbWVdKCk7XG4gIE9iamVjdC5rZXlzKHNjaGVtYSkuZm9yRWFjaCgoZmllbGROYW1lKSA9PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbiA9IHNjaGVtYVtmaWVsZE5hbWVdO1xuICAgIGlmICgnaW5kZXgnIGluIGRlZmluaXRpb24gfHwgZGVmaW5pdGlvbi51bmlxdWUgPT09IHRydWUpIHtcbiAgICAgIGNvbnN0IGluZGV4ID0ge307XG4gICAgICAvLyBJZiB0aGV5IHNwZWNpZmllZCBgdW5pcXVlOiB0cnVlYCBidXQgbm90IGBpbmRleGAsXG4gICAgICAvLyB3ZSBhc3N1bWUgYGluZGV4OiAxYCB0byBzZXQgdXAgdGhlIHVuaXF1ZSBpbmRleCBpbiBtb25nb1xuICAgICAgbGV0IGluZGV4VmFsdWU7XG4gICAgICBpZiAoJ2luZGV4JyBpbiBkZWZpbml0aW9uKSB7XG4gICAgICAgIGluZGV4VmFsdWUgPSBkZWZpbml0aW9uLmluZGV4O1xuICAgICAgICBpZiAoaW5kZXhWYWx1ZSA9PT0gdHJ1ZSkgaW5kZXhWYWx1ZSA9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmRleFZhbHVlID0gMTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaW5kZXhOYW1lID0gYGMyXyR7ZmllbGROYW1lfWA7XG4gICAgICAvLyBJbiB0aGUgaW5kZXggb2JqZWN0LCB3ZSB3YW50IG9iamVjdCBhcnJheSBrZXlzIHdpdGhvdXQgdGhlIFwiLiRcIiBwaWVjZVxuICAgICAgY29uc3QgaWR4RmllbGROYW1lID0gZmllbGROYW1lLnJlcGxhY2UoL1xcLlxcJFxcLi9nLCAnLicpO1xuICAgICAgaW5kZXhbaWR4RmllbGROYW1lXSA9IGluZGV4VmFsdWU7XG4gICAgICBjb25zdCB1bmlxdWUgPSAhIWRlZmluaXRpb24udW5pcXVlICYmIChpbmRleFZhbHVlID09PSAxIHx8IGluZGV4VmFsdWUgPT09IC0xKTtcbiAgICAgIGxldCBzcGFyc2UgPSBkZWZpbml0aW9uLnNwYXJzZSB8fCBmYWxzZTtcblxuICAgICAgLy8gSWYgdW5pcXVlIGFuZCBvcHRpb25hbCwgZm9yY2Ugc3BhcnNlIHRvIHByZXZlbnQgZXJyb3JzXG4gICAgICBpZiAoIXNwYXJzZSAmJiB1bmlxdWUgJiYgZGVmaW5pdGlvbi5vcHRpb25hbCkgc3BhcnNlID0gdHJ1ZTtcblxuICAgICAgaWYgKGluZGV4VmFsdWUgPT09IGZhbHNlKSB7XG4gICAgICAgIGRyb3BJbmRleChpbmRleE5hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW5zdXJlSW5kZXgoaW5kZXgsIGluZGV4TmFtZSwgdW5pcXVlLCBzcGFyc2UpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59KTtcbiIsIi8vIGNvbGxlY3Rpb24yIGNoZWNrcyB0byBtYWtlIHN1cmUgdGhhdCBzaW1wbC1zY2hlbWEgcGFja2FnZSBpcyBhZGRlZFxuaW1wb3J0IFNpbXBsZVNjaGVtYSBmcm9tICdzaW1wbC1zY2hlbWEnO1xuaW1wb3J0IENvbGxlY3Rpb24yIGZyb20gJ21ldGVvci9hbGRlZWQ6Y29sbGVjdGlvbjInO1xuXG4vLyBFeHRlbmQgdGhlIHNjaGVtYSBvcHRpb25zIGFsbG93ZWQgYnkgU2ltcGxlU2NoZW1hXG5TaW1wbGVTY2hlbWEuZXh0ZW5kT3B0aW9ucyhbXG4gICdpbmRleCcsIC8vIG9uZSBvZiBOdW1iZXIsIFN0cmluZywgQm9vbGVhblxuICAndW5pcXVlJywgLy8gQm9vbGVhblxuICAnc3BhcnNlJywgLy8gQm9vbGVhblxuXSk7XG5cbkNvbGxlY3Rpb24yLm9uKCdzY2hlbWEuYXR0YWNoZWQnLCAoY29sbGVjdGlvbiwgc3MpID0+IHtcbiAgLy8gRGVmaW5lIHZhbGlkYXRpb24gZXJyb3IgbWVzc2FnZXNcbiAgaWYgKHNzLnZlcnNpb24gPj0gMiAmJiBzcy5tZXNzYWdlQm94ICYmIHR5cGVvZiBzcy5tZXNzYWdlQm94Lm1lc3NhZ2VzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgc3MubWVzc2FnZUJveC5tZXNzYWdlcyh7XG4gICAgICBlbjoge1xuICAgICAgICBub3RVbmlxdWU6ICd7e2xhYmVsfX0gbXVzdCBiZSB1bmlxdWUnLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxufSk7XG4iXX0=
