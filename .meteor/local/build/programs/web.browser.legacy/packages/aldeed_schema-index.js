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
var Collection2 = Package['aldeed:collection2'].Collection2;
var Mongo = Package.mongo.Mongo;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package.modules.meteorBabelHelpers;
var Promise = Package.promise.Promise;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

var require = meteorInstall({"node_modules":{"meteor":{"aldeed:schema-index":{"client.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                        //
// packages/aldeed_schema-index/client.js                                                 //
//                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////
                                                                                          //
module.link("./common");
////////////////////////////////////////////////////////////////////////////////////////////

},"common.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                        //
// packages/aldeed_schema-index/common.js                                                 //
//                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////
                                                                                          //
var SimpleSchema;
module.link("simpl-schema", {
  "default": function (v) {
    SimpleSchema = v;
  }
}, 0);
var Collection2;
module.link("meteor/aldeed:collection2", {
  "default": function (v) {
    Collection2 = v;
  }
}, 1);
// Extend the schema options allowed by SimpleSchema
SimpleSchema.extendOptions(['index', // one of Number, String, Boolean
'unique', // Boolean
'sparse' // Boolean
]);
Collection2.on('schema.attached', function (collection, ss) {
  // Define validation error messages
  if (ss.version >= 2 && ss.messageBox && typeof ss.messageBox.messages === 'function') {
    ss.messageBox.messages({
      en: {
        notUnique: '{{label}} must be unique'
      }
    });
  }
});
////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/aldeed:schema-index/client.js");

/* Exports */
Package._define("aldeed:schema-index", exports);

})();
