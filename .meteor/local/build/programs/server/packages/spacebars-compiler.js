(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var _ = Package.underscore._;
var HTML = Package.htmljs.HTML;
var HTMLTools = Package['html-tools'].HTMLTools;
var BlazeTools = Package['blaze-tools'].BlazeTools;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var SpacebarsCompiler;

var require = meteorInstall({"node_modules":{"meteor":{"spacebars-compiler":{"preamble.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/spacebars-compiler/preamble.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  SpacebarsCompiler: () => SpacebarsCompiler
});
let CodeGen, builtInBlockHelpers, isReservedName;
module.link("./codegen", {
  CodeGen(v) {
    CodeGen = v;
  },

  builtInBlockHelpers(v) {
    builtInBlockHelpers = v;
  },

  isReservedName(v) {
    isReservedName = v;
  }

}, 0);
let optimize;
module.link("./optimizer", {
  optimize(v) {
    optimize = v;
  }

}, 1);
let parse, compile, codeGen, TemplateTagReplacer, beautify;
module.link("./compiler", {
  parse(v) {
    parse = v;
  },

  compile(v) {
    compile = v;
  },

  codeGen(v) {
    codeGen = v;
  },

  TemplateTagReplacer(v) {
    TemplateTagReplacer = v;
  },

  beautify(v) {
    beautify = v;
  }

}, 2);
let TemplateTag;
module.link("./templatetag", {
  TemplateTag(v) {
    TemplateTag = v;
  }

}, 3);
module.runSetters(SpacebarsCompiler = {
  CodeGen,
  _builtInBlockHelpers: builtInBlockHelpers,
  isReservedName,
  optimize,
  parse,
  compile,
  codeGen,
  _TemplateTagReplacer: TemplateTagReplacer,
  _beautify: beautify,
  TemplateTag
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"codegen.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/spacebars-compiler/codegen.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  CodeGen: () => CodeGen,
  builtInBlockHelpers: () => builtInBlockHelpers,
  isReservedName: () => isReservedName
});
let HTMLTools;
module.link("meteor/html-tools", {
  HTMLTools(v) {
    HTMLTools = v;
  }

}, 0);
let HTML;
module.link("meteor/htmljs", {
  HTML(v) {
    HTML = v;
  }

}, 1);
let BlazeTools;
module.link("meteor/blaze-tools", {
  BlazeTools(v) {
    BlazeTools = v;
  }

}, 2);
let codeGen;
module.link("./compiler", {
  codeGen(v) {
    codeGen = v;
  }

}, 3);

function CodeGen() {}

const builtInBlockHelpers = {
  'if': 'Blaze.If',
  'unless': 'Blaze.Unless',
  'with': 'Spacebars.With',
  'each': 'Blaze.Each',
  'let': 'Blaze.Let'
};
// Mapping of "macros" which, when preceded by `Template.`, expand
// to special code rather than following the lookup rules for dotted
// symbols.
var builtInTemplateMacros = {
  // `view` is a local variable defined in the generated render
  // function for the template in which `Template.contentBlock` or
  // `Template.elseBlock` is invoked.
  'contentBlock': 'view.templateContentBlock',
  'elseBlock': 'view.templateElseBlock',
  // Confusingly, this makes `{{> Template.dynamic}}` an alias
  // for `{{> __dynamic}}`, where "__dynamic" is the template that
  // implements the dynamic template feature.
  'dynamic': 'Template.__dynamic',
  'subscriptionsReady': 'view.templateInstance().subscriptionsReady()'
};
var additionalReservedNames = ["body", "toString", "instance", "constructor", "toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "__defineGetter__", "__lookupGetter__", "__defineSetter__", "__lookupSetter__", "__proto__", "dynamic", "registerHelper", "currentData", "parentData", "_migrateTemplate", "_applyHmrChanges", "__pendingReplacement"]; // A "reserved name" can't be used as a <template> name.  This
// function is used by the template file scanner.
//
// Note that the runtime imposes additional restrictions, for example
// banning the name "body" and names of built-in object properties
// like "toString".

function isReservedName(name) {
  return builtInBlockHelpers.hasOwnProperty(name) || builtInTemplateMacros.hasOwnProperty(name) || _.indexOf(additionalReservedNames, name) > -1;
}

var makeObjectLiteral = function (obj) {
  var parts = [];

  for (var k in obj) parts.push(BlazeTools.toObjectLiteralKey(k) + ': ' + obj[k]);

  return '{' + parts.join(', ') + '}';
};

_.extend(CodeGen.prototype, {
  codeGenTemplateTag: function (tag) {
    var self = this;

    if (tag.position === HTMLTools.TEMPLATE_TAG_POSITION.IN_START_TAG) {
      // Special dynamic attributes: `<div {{attrs}}>...`
      // only `tag.type === 'DOUBLE'` allowed (by earlier validation)
      return BlazeTools.EmitCode('function () { return ' + self.codeGenMustache(tag.path, tag.args, 'attrMustache') + '; }');
    } else {
      if (tag.type === 'DOUBLE' || tag.type === 'TRIPLE') {
        var code = self.codeGenMustache(tag.path, tag.args);

        if (tag.type === 'TRIPLE') {
          code = 'Spacebars.makeRaw(' + code + ')';
        }

        if (tag.position !== HTMLTools.TEMPLATE_TAG_POSITION.IN_ATTRIBUTE) {
          // Reactive attributes are already wrapped in a function,
          // and there's no fine-grained reactivity.
          // Anywhere else, we need to create a View.
          code = 'Blaze.View(' + BlazeTools.toJSLiteral('lookup:' + tag.path.join('.')) + ', ' + 'function () { return ' + code + '; })';
        }

        return BlazeTools.EmitCode(code);
      } else if (tag.type === 'INCLUSION' || tag.type === 'BLOCKOPEN') {
        var path = tag.path;
        var args = tag.args;

        if (tag.type === 'BLOCKOPEN' && builtInBlockHelpers.hasOwnProperty(path[0])) {
          // if, unless, with, each.
          //
          // If someone tries to do `{{> if}}`, we don't
          // get here, but an error is thrown when we try to codegen the path.
          // Note: If we caught these errors earlier, while scanning, we'd be able to
          // provide nice line numbers.
          if (path.length > 1) throw new Error("Unexpected dotted path beginning with " + path[0]);
          if (!args.length) throw new Error("#" + path[0] + " requires an argument");
          var dataCode = null; // #each has a special treatment as it features two different forms:
          // - {{#each people}}
          // - {{#each person in people}}

          if (path[0] === 'each' && args.length >= 2 && args[1][0] === 'PATH' && args[1][1].length && args[1][1][0] === 'in') {
            // minimum conditions are met for each-in.  now validate this
            // isn't some weird case.
            var eachUsage = "Use either {{#each items}} or " + "{{#each item in items}} form of #each.";
            var inArg = args[1];

            if (!(args.length >= 3 && inArg[1].length === 1)) {
              // we don't have at least 3 space-separated parts after #each, or
              // inArg doesn't look like ['PATH',['in']]
              throw new Error("Malformed #each. " + eachUsage);
            } // split out the variable name and sequence arguments


            var variableArg = args[0];

            if (!(variableArg[0] === "PATH" && variableArg[1].length === 1 && variableArg[1][0].replace(/\./g, ''))) {
              throw new Error("Bad variable name in #each");
            }

            var variable = variableArg[1][0];
            dataCode = 'function () { return { _sequence: ' + self.codeGenInclusionData(args.slice(2)) + ', _variable: ' + BlazeTools.toJSLiteral(variable) + ' }; }';
          } else if (path[0] === 'let') {
            var dataProps = {};

            _.each(args, function (arg) {
              if (arg.length !== 3) {
                // not a keyword arg (x=y)
                throw new Error("Incorrect form of #let");
              }

              var argKey = arg[2];
              dataProps[argKey] = 'function () { return Spacebars.call(' + self.codeGenArgValue(arg) + '); }';
            });

            dataCode = makeObjectLiteral(dataProps);
          }

          if (!dataCode) {
            // `args` must exist (tag.args.length > 0)
            dataCode = self.codeGenInclusionDataFunc(args) || 'null';
          } // `content` must exist


          var contentBlock = 'content' in tag ? self.codeGenBlock(tag.content) : null; // `elseContent` may not exist

          var elseContentBlock = 'elseContent' in tag ? self.codeGenBlock(tag.elseContent) : null;
          var callArgs = [dataCode, contentBlock];
          if (elseContentBlock) callArgs.push(elseContentBlock);
          return BlazeTools.EmitCode(builtInBlockHelpers[path[0]] + '(' + callArgs.join(', ') + ')');
        } else {
          var compCode = self.codeGenPath(path, {
            lookupTemplate: true
          });

          if (path.length > 1) {
            // capture reactivity
            compCode = 'function () { return Spacebars.call(' + compCode + '); }';
          }

          var dataCode = self.codeGenInclusionDataFunc(tag.args);
          var content = 'content' in tag ? self.codeGenBlock(tag.content) : null;
          var elseContent = 'elseContent' in tag ? self.codeGenBlock(tag.elseContent) : null;
          var includeArgs = [compCode];

          if (content) {
            includeArgs.push(content);
            if (elseContent) includeArgs.push(elseContent);
          }

          var includeCode = 'Spacebars.include(' + includeArgs.join(', ') + ')'; // calling convention compat -- set the data context around the
          // entire inclusion, so that if the name of the inclusion is
          // a helper function, it gets the data context in `this`.
          // This makes for a pretty confusing calling convention --
          // In `{{#foo bar}}`, `foo` is evaluated in the context of `bar`
          // -- but it's what we shipped for 0.8.0.  The rationale is that
          // `{{#foo bar}}` is sugar for `{{#with bar}}{{#foo}}...`.

          if (dataCode) {
            includeCode = 'Blaze._TemplateWith(' + dataCode + ', function () { return ' + includeCode + '; })';
          } // XXX BACK COMPAT - UI is the old name, Template is the new


          if ((path[0] === 'UI' || path[0] === 'Template') && (path[1] === 'contentBlock' || path[1] === 'elseBlock')) {
            // Call contentBlock and elseBlock in the appropriate scope
            includeCode = 'Blaze._InOuterTemplateScope(view, function () { return ' + includeCode + '; })';
          }

          return BlazeTools.EmitCode(includeCode);
        }
      } else if (tag.type === 'ESCAPE') {
        return tag.value;
      } else {
        // Can't get here; TemplateTag validation should catch any
        // inappropriate tag types that might come out of the parser.
        throw new Error("Unexpected template tag type: " + tag.type);
      }
    }
  },
  // `path` is an array of at least one string.
  //
  // If `path.length > 1`, the generated code may be reactive
  // (i.e. it may invalidate the current computation).
  //
  // No code is generated to call the result if it's a function.
  //
  // Options:
  //
  // - lookupTemplate {Boolean} If true, generated code also looks in
  //   the list of templates. (After helpers, before data context).
  //   Used when generating code for `{{> foo}}` or `{{#foo}}`. Only
  //   used for non-dotted paths.
  codeGenPath: function (path, opts) {
    if (builtInBlockHelpers.hasOwnProperty(path[0])) throw new Error("Can't use the built-in '" + path[0] + "' here"); // Let `{{#if Template.contentBlock}}` check whether this template was
    // invoked via inclusion or as a block helper, in addition to supporting
    // `{{> Template.contentBlock}}`.
    // XXX BACK COMPAT - UI is the old name, Template is the new

    if (path.length >= 2 && (path[0] === 'UI' || path[0] === 'Template') && builtInTemplateMacros.hasOwnProperty(path[1])) {
      if (path.length > 2) throw new Error("Unexpected dotted path beginning with " + path[0] + '.' + path[1]);
      return builtInTemplateMacros[path[1]];
    }

    var firstPathItem = BlazeTools.toJSLiteral(path[0]);
    var lookupMethod = 'lookup';
    if (opts && opts.lookupTemplate && path.length === 1) lookupMethod = 'lookupTemplate';
    var code = 'view.' + lookupMethod + '(' + firstPathItem + ')';

    if (path.length > 1) {
      code = 'Spacebars.dot(' + code + ', ' + _.map(path.slice(1), BlazeTools.toJSLiteral).join(', ') + ')';
    }

    return code;
  },
  // Generates code for an `[argType, argValue]` argument spec,
  // ignoring the third element (keyword argument name) if present.
  //
  // The resulting code may be reactive (in the case of a PATH of
  // more than one element) and is not wrapped in a closure.
  codeGenArgValue: function (arg) {
    var self = this;
    var argType = arg[0];
    var argValue = arg[1];
    var argCode;

    switch (argType) {
      case 'STRING':
      case 'NUMBER':
      case 'BOOLEAN':
      case 'NULL':
        argCode = BlazeTools.toJSLiteral(argValue);
        break;

      case 'PATH':
        argCode = self.codeGenPath(argValue);
        break;

      case 'EXPR':
        // The format of EXPR is ['EXPR', { type: 'EXPR', path: [...], args: { ... } }]
        argCode = self.codeGenMustache(argValue.path, argValue.args, 'dataMustache');
        break;

      default:
        // can't get here
        throw new Error("Unexpected arg type: " + argType);
    }

    return argCode;
  },
  // Generates a call to `Spacebars.fooMustache` on evaluated arguments.
  // The resulting code has no function literals and must be wrapped in
  // one for fine-grained reactivity.
  codeGenMustache: function (path, args, mustacheType) {
    var self = this;
    var nameCode = self.codeGenPath(path);
    var argCode = self.codeGenMustacheArgs(args);
    var mustache = mustacheType || 'mustache';
    return 'Spacebars.' + mustache + '(' + nameCode + (argCode ? ', ' + argCode.join(', ') : '') + ')';
  },
  // returns: array of source strings, or null if no
  // args at all.
  codeGenMustacheArgs: function (tagArgs) {
    var self = this;
    var kwArgs = null; // source -> source

    var args = null; // [source]
    // tagArgs may be null

    _.each(tagArgs, function (arg) {
      var argCode = self.codeGenArgValue(arg);

      if (arg.length > 2) {
        // keyword argument (represented as [type, value, name])
        kwArgs = kwArgs || {};
        kwArgs[arg[2]] = argCode;
      } else {
        // positional argument
        args = args || [];
        args.push(argCode);
      }
    }); // put kwArgs in options dictionary at end of args


    if (kwArgs) {
      args = args || [];
      args.push('Spacebars.kw(' + makeObjectLiteral(kwArgs) + ')');
    }

    return args;
  },
  codeGenBlock: function (content) {
    return codeGen(content);
  },
  codeGenInclusionData: function (args) {
    var self = this;

    if (!args.length) {
      // e.g. `{{#foo}}`
      return null;
    } else if (args[0].length === 3) {
      // keyword arguments only, e.g. `{{> point x=1 y=2}}`
      var dataProps = {};

      _.each(args, function (arg) {
        var argKey = arg[2];
        dataProps[argKey] = 'Spacebars.call(' + self.codeGenArgValue(arg) + ')';
      });

      return makeObjectLiteral(dataProps);
    } else if (args[0][0] !== 'PATH') {
      // literal first argument, e.g. `{{> foo "blah"}}`
      //
      // tag validation has confirmed, in this case, that there is only
      // one argument (`args.length === 1`)
      return self.codeGenArgValue(args[0]);
    } else if (args.length === 1) {
      // one argument, must be a PATH
      return 'Spacebars.call(' + self.codeGenPath(args[0][1]) + ')';
    } else {
      // Multiple positional arguments; treat them as a nested
      // "data mustache"
      return self.codeGenMustache(args[0][1], args.slice(1), 'dataMustache');
    }
  },
  codeGenInclusionDataFunc: function (args) {
    var self = this;
    var dataCode = self.codeGenInclusionData(args);

    if (dataCode) {
      return 'function () { return ' + dataCode + '; }';
    } else {
      return null;
    }
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"compiler.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/spacebars-compiler/compiler.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  parse: () => parse,
  compile: () => compile,
  TemplateTagReplacer: () => TemplateTagReplacer,
  codeGen: () => codeGen,
  beautify: () => beautify
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let HTMLTools;
module.link("meteor/html-tools", {
  HTMLTools(v) {
    HTMLTools = v;
  }

}, 1);
let HTML;
module.link("meteor/htmljs", {
  HTML(v) {
    HTML = v;
  }

}, 2);
let BlazeTools;
module.link("meteor/blaze-tools", {
  BlazeTools(v) {
    BlazeTools = v;
  }

}, 3);
let CodeGen;
module.link("./codegen", {
  CodeGen(v) {
    CodeGen = v;
  }

}, 4);
let optimize;
module.link("./optimizer", {
  optimize(v) {
    optimize = v;
  }

}, 5);
let ReactComponentSiblingForbidder;
module.link("./react", {
  ReactComponentSiblingForbidder(v) {
    ReactComponentSiblingForbidder = v;
  }

}, 6);
let TemplateTag;
module.link("./templatetag", {
  TemplateTag(v) {
    TemplateTag = v;
  }

}, 7);
let removeWhitespace;
module.link("./whitespace", {
  removeWhitespace(v) {
    removeWhitespace = v;
  }

}, 8);
var UglifyJSMinify = null;

if (Meteor.isServer) {
  UglifyJSMinify = Npm.require('uglify-js').minify;
}

function parse(input) {
  return HTMLTools.parseFragment(input, {
    getTemplateTag: TemplateTag.parseCompleteTag
  });
}

function compile(input, options) {
  var tree = parse(input);
  return codeGen(tree, options);
}

const TemplateTagReplacer = HTML.TransformingVisitor.extend();
TemplateTagReplacer.def({
  visitObject: function (x) {
    if (x instanceof HTMLTools.TemplateTag) {
      // Make sure all TemplateTags in attributes have the right
      // `.position` set on them.  This is a bit of a hack
      // (we shouldn't be mutating that here), but it allows
      // cleaner codegen of "synthetic" attributes like TEXTAREA's
      // "value", where the template tags were originally not
      // in an attribute.
      if (this.inAttributeValue) x.position = HTMLTools.TEMPLATE_TAG_POSITION.IN_ATTRIBUTE;
      return this.codegen.codeGenTemplateTag(x);
    }

    return HTML.TransformingVisitor.prototype.visitObject.call(this, x);
  },
  visitAttributes: function (attrs) {
    if (attrs instanceof HTMLTools.TemplateTag) return this.codegen.codeGenTemplateTag(attrs); // call super (e.g. for case where `attrs` is an array)

    return HTML.TransformingVisitor.prototype.visitAttributes.call(this, attrs);
  },
  visitAttribute: function (name, value, tag) {
    this.inAttributeValue = true;
    var result = this.visit(value);
    this.inAttributeValue = false;

    if (result !== value) {
      // some template tags must have been replaced, because otherwise
      // we try to keep things `===` when transforming.  Wrap the code
      // in a function as per the rules.  You can't have
      // `{id: Blaze.View(...)}` as an attributes dict because the View
      // would be rendered more than once; you need to wrap it in a function
      // so that it's a different View each time.
      return BlazeTools.EmitCode(this.codegen.codeGenBlock(result));
    }

    return result;
  }
});

function codeGen(parseTree, options) {
  // is this a template, rather than a block passed to
  // a block helper, say
  var isTemplate = options && options.isTemplate;
  var isBody = options && options.isBody;
  var whitespace = options && options.whitespace;
  var sourceName = options && options.sourceName;
  var tree = parseTree; // The flags `isTemplate` and `isBody` are kind of a hack.

  if (isTemplate || isBody) {
    if (typeof whitespace === 'string' && whitespace.toLowerCase() === 'strip') {
      tree = removeWhitespace(tree);
    } // optimizing fragments would require being smarter about whether we are
    // in a TEXTAREA, say.


    tree = optimize(tree);
  } // throws an error if using `{{> React}}` with siblings


  new ReactComponentSiblingForbidder({
    sourceName: sourceName
  }).visit(tree);
  var codegen = new CodeGen();
  tree = new TemplateTagReplacer({
    codegen: codegen
  }).visit(tree);
  var code = '(function () { ';

  if (isTemplate || isBody) {
    code += 'var view = this; ';
  }

  code += 'return ';
  code += BlazeTools.toJS(tree);
  code += '; })';
  code = beautify(code);
  return code;
}

function beautify(code) {
  if (!UglifyJSMinify) {
    return code;
  }

  var result = UglifyJSMinify(code, {
    fromString: true,
    mangle: false,
    compress: false,
    output: {
      beautify: true,
      indent_level: 2,
      width: 80
    }
  });
  var output = result.code; // Uglify interprets our expression as a statement and may add a semicolon.
  // Strip trailing semicolon.

  output = output.replace(/;$/, '');
  return output;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"optimizer.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/spacebars-compiler/optimizer.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  toRaw: () => toRaw,
  TreeTransformer: () => TreeTransformer,
  optimize: () => optimize
});
let HTMLTools;
module.link("meteor/html-tools", {
  HTMLTools(v) {
    HTMLTools = v;
  }

}, 0);
let HTML;
module.link("meteor/htmljs", {
  HTML(v) {
    HTML = v;
  }

}, 1);

// Optimize parts of an HTMLjs tree into raw HTML strings when they don't
// contain template tags.
var constant = function (value) {
  return function () {
    return value;
  };
};

var OPTIMIZABLE = {
  NONE: 0,
  PARTS: 1,
  FULL: 2
}; // We can only turn content into an HTML string if it contains no template
// tags and no "tricky" HTML tags.  If we can optimize the entire content
// into a string, we return OPTIMIZABLE.FULL.  If the we are given an
// unoptimizable node, we return OPTIMIZABLE.NONE.  If we are given a tree
// that contains an unoptimizable node somewhere, we return OPTIMIZABLE.PARTS.
//
// For example, we always create SVG elements programmatically, since SVG
// doesn't have innerHTML.  If we are given an SVG element, we return NONE.
// However, if we are given a big tree that contains SVG somewhere, we
// return PARTS so that the optimizer can descend into the tree and optimize
// other parts of it.

var CanOptimizeVisitor = HTML.Visitor.extend();
CanOptimizeVisitor.def({
  visitNull: constant(OPTIMIZABLE.FULL),
  visitPrimitive: constant(OPTIMIZABLE.FULL),
  visitComment: constant(OPTIMIZABLE.FULL),
  visitCharRef: constant(OPTIMIZABLE.FULL),
  visitRaw: constant(OPTIMIZABLE.FULL),
  visitObject: constant(OPTIMIZABLE.NONE),
  visitFunction: constant(OPTIMIZABLE.NONE),
  visitArray: function (x) {
    for (var i = 0; i < x.length; i++) if (this.visit(x[i]) !== OPTIMIZABLE.FULL) return OPTIMIZABLE.PARTS;

    return OPTIMIZABLE.FULL;
  },
  visitTag: function (tag) {
    var tagName = tag.tagName;

    if (tagName === 'textarea') {
      // optimizing into a TEXTAREA's RCDATA would require being a little
      // more clever.
      return OPTIMIZABLE.NONE;
    } else if (tagName === 'script') {
      // script tags don't work when rendered from strings
      return OPTIMIZABLE.NONE;
    } else if (!(HTML.isKnownElement(tagName) && !HTML.isKnownSVGElement(tagName))) {
      // foreign elements like SVG can't be stringified for innerHTML.
      return OPTIMIZABLE.NONE;
    } else if (tagName === 'table') {
      // Avoid ever producing HTML containing `<table><tr>...`, because the
      // browser will insert a TBODY.  If we just `createElement("table")` and
      // `createElement("tr")`, on the other hand, no TBODY is necessary
      // (assuming IE 8+).
      return OPTIMIZABLE.PARTS;
    } else if (tagName === 'tr') {
      return OPTIMIZABLE.PARTS;
    }

    var children = tag.children;

    for (var i = 0; i < children.length; i++) if (this.visit(children[i]) !== OPTIMIZABLE.FULL) return OPTIMIZABLE.PARTS;

    if (this.visitAttributes(tag.attrs) !== OPTIMIZABLE.FULL) return OPTIMIZABLE.PARTS;
    return OPTIMIZABLE.FULL;
  },
  visitAttributes: function (attrs) {
    if (attrs) {
      var isArray = HTML.isArray(attrs);

      for (var i = 0; i < (isArray ? attrs.length : 1); i++) {
        var a = isArray ? attrs[i] : attrs;
        if (typeof a !== 'object' || a instanceof HTMLTools.TemplateTag) return OPTIMIZABLE.PARTS;

        for (var k in a) if (this.visit(a[k]) !== OPTIMIZABLE.FULL) return OPTIMIZABLE.PARTS;
      }
    }

    return OPTIMIZABLE.FULL;
  }
});

var getOptimizability = function (content) {
  return new CanOptimizeVisitor().visit(content);
};

function toRaw(x) {
  return HTML.Raw(HTML.toHTML(x));
}

const TreeTransformer = HTML.TransformingVisitor.extend();
TreeTransformer.def({
  visitAttributes: function (attrs
  /*, ...*/
  ) {
    // pass template tags through by default
    if (attrs instanceof HTMLTools.TemplateTag) return attrs;
    return HTML.TransformingVisitor.prototype.visitAttributes.apply(this, arguments);
  }
}); // Replace parts of the HTMLjs tree that have no template tags (or
// tricky HTML tags) with HTML.Raw objects containing raw HTML.

var OptimizingVisitor = TreeTransformer.extend();
OptimizingVisitor.def({
  visitNull: toRaw,
  visitPrimitive: toRaw,
  visitComment: toRaw,
  visitCharRef: toRaw,
  visitArray: function (array) {
    var optimizability = getOptimizability(array);

    if (optimizability === OPTIMIZABLE.FULL) {
      return toRaw(array);
    } else if (optimizability === OPTIMIZABLE.PARTS) {
      return TreeTransformer.prototype.visitArray.call(this, array);
    } else {
      return array;
    }
  },
  visitTag: function (tag) {
    var optimizability = getOptimizability(tag);

    if (optimizability === OPTIMIZABLE.FULL) {
      return toRaw(tag);
    } else if (optimizability === OPTIMIZABLE.PARTS) {
      return TreeTransformer.prototype.visitTag.call(this, tag);
    } else {
      return tag;
    }
  },
  visitChildren: function (children) {
    // don't optimize the children array into a Raw object!
    return TreeTransformer.prototype.visitArray.call(this, children);
  },
  visitAttributes: function (attrs) {
    return attrs;
  }
}); // Combine consecutive HTML.Raws.  Remove empty ones.

var RawCompactingVisitor = TreeTransformer.extend();
RawCompactingVisitor.def({
  visitArray: function (array) {
    var result = [];

    for (var i = 0; i < array.length; i++) {
      var item = array[i];

      if (item instanceof HTML.Raw && (!item.value || result.length && result[result.length - 1] instanceof HTML.Raw)) {
        // two cases: item is an empty Raw, or previous item is
        // a Raw as well.  In the latter case, replace the previous
        // Raw with a longer one that includes the new Raw.
        if (item.value) {
          result[result.length - 1] = HTML.Raw(result[result.length - 1].value + item.value);
        }
      } else {
        result.push(this.visit(item));
      }
    }

    return result;
  }
}); // Replace pointless Raws like `HTMl.Raw('foo')` that contain no special
// characters with simple strings.

var RawReplacingVisitor = TreeTransformer.extend();
RawReplacingVisitor.def({
  visitRaw: function (raw) {
    var html = raw.value;

    if (html.indexOf('&') < 0 && html.indexOf('<') < 0) {
      return html;
    } else {
      return raw;
    }
  }
});

function optimize(tree) {
  tree = new OptimizingVisitor().visit(tree);
  tree = new RawCompactingVisitor().visit(tree);
  tree = new RawReplacingVisitor().visit(tree);
  return tree;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"react.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/spacebars-compiler/react.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  ReactComponentSiblingForbidder: () => ReactComponentSiblingForbidder
});
let HTMLTools;
module.link("meteor/html-tools", {
  HTMLTools(v) {
    HTMLTools = v;
  }

}, 0);
let HTML;
module.link("meteor/htmljs", {
  HTML(v) {
    HTML = v;
  }

}, 1);
let BlazeTools;
module.link("meteor/blaze-tools", {
  BlazeTools(v) {
    BlazeTools = v;
  }

}, 2);
const ReactComponentSiblingForbidder = HTML.Visitor.extend();
ReactComponentSiblingForbidder.def({
  visitArray: function (array, parentTag) {
    for (var i = 0; i < array.length; i++) {
      this.visit(array[i], parentTag);
    }
  },
  visitObject: function (obj, parentTag) {
    if (obj.type === "INCLUSION" && obj.path.length === 1 && obj.path[0] === "React") {
      if (!parentTag) {
        throw new Error("{{> React}} must be used in a container element" + (this.sourceName ? " in " + this.sourceName : "") + ". Learn more at https://github.com/meteor/meteor/wiki/React-components-must-be-the-only-thing-in-their-wrapper-element");
      }

      var numSiblings = 0;

      for (var i = 0; i < parentTag.children.length; i++) {
        var child = parentTag.children[i];

        if (child !== obj && !(typeof child === "string" && child.match(/^\s*$/))) {
          numSiblings++;
        }
      }

      if (numSiblings > 0) {
        throw new Error("{{> React}} must be used as the only child in a container element" + (this.sourceName ? " in " + this.sourceName : "") + ". Learn more at https://github.com/meteor/meteor/wiki/React-components-must-be-the-only-thing-in-their-wrapper-element");
      }
    }
  },
  visitTag: function (tag) {
    this.visitArray(tag.children, tag
    /*parentTag*/
    );
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"templatetag.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/spacebars-compiler/templatetag.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  TemplateTag: () => TemplateTag
});
let HTMLTools;
module.link("meteor/html-tools", {
  HTMLTools(v) {
    HTMLTools = v;
  }

}, 0);
let HTML;
module.link("meteor/htmljs", {
  HTML(v) {
    HTML = v;
  }

}, 1);
let BlazeTools;
module.link("meteor/blaze-tools", {
  BlazeTools(v) {
    BlazeTools = v;
  }

}, 2);
// A TemplateTag is the result of parsing a single `{{...}}` tag.
//
// The `.type` of a TemplateTag is one of:
//
// - `"DOUBLE"` - `{{foo}}`
// - `"TRIPLE"` - `{{{foo}}}`
// - `"EXPR"` - `(foo)`
// - `"COMMENT"` - `{{! foo}}`
// - `"BLOCKCOMMENT" - `{{!-- foo--}}`
// - `"INCLUSION"` - `{{> foo}}`
// - `"BLOCKOPEN"` - `{{#foo}}`
// - `"BLOCKCLOSE"` - `{{/foo}}`
// - `"ELSE"` - `{{else}}`
// - `"ESCAPE"` - `{{|`, `{{{|`, `{{{{|` and so on
//
// Besides `type`, the mandatory properties of a TemplateTag are:
//
// - `path` - An array of one or more strings.  The path of `{{foo.bar}}`
//   is `["foo", "bar"]`.  Applies to DOUBLE, TRIPLE, INCLUSION, BLOCKOPEN,
//   BLOCKCLOSE, and ELSE.
//
// - `args` - An array of zero or more argument specs.  An argument spec
//   is a two or three element array, consisting of a type, value, and
//   optional keyword name.  For example, the `args` of `{{foo "bar" x=3}}`
//   are `[["STRING", "bar"], ["NUMBER", 3, "x"]]`.  Applies to DOUBLE,
//   TRIPLE, INCLUSION, BLOCKOPEN, and ELSE.
//
// - `value` - A string of the comment's text. Applies to COMMENT and
//   BLOCKCOMMENT.
//
// These additional are typically set during parsing:
//
// - `position` - The HTMLTools.TEMPLATE_TAG_POSITION specifying at what sort
//   of site the TemplateTag was encountered (e.g. at element level or as
//   part of an attribute value). Its absence implies
//   TEMPLATE_TAG_POSITION.ELEMENT.
//
// - `content` and `elseContent` - When a BLOCKOPEN tag's contents are
//   parsed, they are put here.  `elseContent` will only be present if
//   an `{{else}}` was found.
var TEMPLATE_TAG_POSITION = HTMLTools.TEMPLATE_TAG_POSITION;

function TemplateTag() {
  HTMLTools.TemplateTag.apply(this, arguments);
}

TemplateTag.prototype = new HTMLTools.TemplateTag();
TemplateTag.prototype.constructorName = 'SpacebarsCompiler.TemplateTag';

var makeStacheTagStartRegex = function (r) {
  return new RegExp(r.source + /(?![{>!#/])/.source, r.ignoreCase ? 'i' : '');
}; // "starts" regexes are used to see what type of template
// tag the parser is looking at.  They must match a non-empty
// result, but not the interesting part of the tag.


var starts = {
  ESCAPE: /^\{\{(?=\{*\|)/,
  ELSE: makeStacheTagStartRegex(/^\{\{\s*else(\s+(?!\s)|(?=[}]))/i),
  DOUBLE: makeStacheTagStartRegex(/^\{\{\s*(?!\s)/),
  TRIPLE: makeStacheTagStartRegex(/^\{\{\{\s*(?!\s)/),
  BLOCKCOMMENT: makeStacheTagStartRegex(/^\{\{\s*!--/),
  COMMENT: makeStacheTagStartRegex(/^\{\{\s*!/),
  INCLUSION: makeStacheTagStartRegex(/^\{\{\s*>\s*(?!\s)/),
  BLOCKOPEN: makeStacheTagStartRegex(/^\{\{\s*#\s*(?!\s)/),
  BLOCKCLOSE: makeStacheTagStartRegex(/^\{\{\s*\/\s*(?!\s)/)
};
var ends = {
  DOUBLE: /^\s*\}\}/,
  TRIPLE: /^\s*\}\}\}/,
  EXPR: /^\s*\)/
};
var endsString = {
  DOUBLE: '}}',
  TRIPLE: '}}}',
  EXPR: ')'
}; // Parse a tag from the provided scanner or string.  If the input
// doesn't start with `{{`, returns null.  Otherwise, either succeeds
// and returns a SpacebarsCompiler.TemplateTag, or throws an error (using
// `scanner.fatal` if a scanner is provided).

TemplateTag.parse = function (scannerOrString) {
  var scanner = scannerOrString;
  if (typeof scanner === 'string') scanner = new HTMLTools.Scanner(scannerOrString);
  if (!(scanner.peek() === '{' && scanner.rest().slice(0, 2) === '{{')) return null;

  var run = function (regex) {
    // regex is assumed to start with `^`
    var result = regex.exec(scanner.rest());
    if (!result) return null;
    var ret = result[0];
    scanner.pos += ret.length;
    return ret;
  };

  var advance = function (amount) {
    scanner.pos += amount;
  };

  var scanIdentifier = function (isFirstInPath) {
    var id = BlazeTools.parseExtendedIdentifierName(scanner);

    if (!id) {
      expected('IDENTIFIER');
    }

    if (isFirstInPath && (id === 'null' || id === 'true' || id === 'false')) scanner.fatal("Can't use null, true, or false, as an identifier at start of path");
    return id;
  };

  var scanPath = function () {
    var segments = []; // handle initial `.`, `..`, `./`, `../`, `../..`, `../../`, etc

    var dots;

    if (dots = run(/^[\.\/]+/)) {
      var ancestorStr = '.'; // eg `../../..` maps to `....`

      var endsWithSlash = /\/$/.test(dots);
      if (endsWithSlash) dots = dots.slice(0, -1);

      _.each(dots.split('/'), function (dotClause, index) {
        if (index === 0) {
          if (dotClause !== '.' && dotClause !== '..') expected("`.`, `..`, `./` or `../`");
        } else {
          if (dotClause !== '..') expected("`..` or `../`");
        }

        if (dotClause === '..') ancestorStr += '.';
      });

      segments.push(ancestorStr);
      if (!endsWithSlash) return segments;
    }

    while (true) {
      // scan a path segment
      if (run(/^\[/)) {
        var seg = run(/^[\s\S]*?\]/);
        if (!seg) error("Unterminated path segment");
        seg = seg.slice(0, -1);
        if (!seg && !segments.length) error("Path can't start with empty string");
        segments.push(seg);
      } else {
        var id = scanIdentifier(!segments.length);

        if (id === 'this') {
          if (!segments.length) {
            // initial `this`
            segments.push('.');
          } else {
            error("Can only use `this` at the beginning of a path.\nInstead of `foo.this` or `../this`, just write `foo` or `..`.");
          }
        } else {
          segments.push(id);
        }
      }

      var sep = run(/^[\.\/]/);
      if (!sep) break;
    }

    return segments;
  }; // scan the keyword portion of a keyword argument
  // (the "foo" portion in "foo=bar").
  // Result is either the keyword matched, or null
  // if we're not at a keyword argument position.


  var scanArgKeyword = function () {
    var match = /^([^\{\}\(\)\>#=\s"'\[\]]+)\s*=\s*/.exec(scanner.rest());

    if (match) {
      scanner.pos += match[0].length;
      return match[1];
    } else {
      return null;
    }
  }; // scan an argument; succeeds or errors.
  // Result is an array of two or three items:
  // type , value, and (indicating a keyword argument)
  // keyword name.


  var scanArg = function () {
    var keyword = scanArgKeyword(); // null if not parsing a kwarg

    var value = scanArgValue();
    return keyword ? value.concat(keyword) : value;
  }; // scan an argument value (for keyword or positional arguments);
  // succeeds or errors.  Result is an array of type, value.


  var scanArgValue = function () {
    var startPos = scanner.pos;
    var result;

    if (result = BlazeTools.parseNumber(scanner)) {
      return ['NUMBER', result.value];
    } else if (result = BlazeTools.parseStringLiteral(scanner)) {
      return ['STRING', result.value];
    } else if (/^[\.\[]/.test(scanner.peek())) {
      return ['PATH', scanPath()];
    } else if (run(/^\(/)) {
      return ['EXPR', scanExpr('EXPR')];
    } else if (result = BlazeTools.parseExtendedIdentifierName(scanner)) {
      var id = result;

      if (id === 'null') {
        return ['NULL', null];
      } else if (id === 'true' || id === 'false') {
        return ['BOOLEAN', id === 'true'];
      } else {
        scanner.pos = startPos; // unconsume `id`

        return ['PATH', scanPath()];
      }
    } else {
      expected('identifier, number, string, boolean, null, or a sub expression enclosed in "(", ")"');
    }
  };

  var scanExpr = function (type) {
    var endType = type;
    if (type === 'INCLUSION' || type === 'BLOCKOPEN' || type === 'ELSE') endType = 'DOUBLE';
    var tag = new TemplateTag();
    tag.type = type;
    tag.path = scanPath();
    tag.args = [];
    var foundKwArg = false;

    while (true) {
      run(/^\s*/);
      if (run(ends[endType])) break;else if (/^[})]/.test(scanner.peek())) {
        expected('`' + endsString[endType] + '`');
      }
      var newArg = scanArg();

      if (newArg.length === 3) {
        foundKwArg = true;
      } else {
        if (foundKwArg) error("Can't have a non-keyword argument after a keyword argument");
      }

      tag.args.push(newArg); // expect a whitespace or a closing ')' or '}'

      if (run(/^(?=[\s})])/) !== '') expected('space');
    }

    return tag;
  };

  var type;

  var error = function (msg) {
    scanner.fatal(msg);
  };

  var expected = function (what) {
    error('Expected ' + what);
  }; // must do ESCAPE first, immediately followed by ELSE
  // order of others doesn't matter


  if (run(starts.ESCAPE)) type = 'ESCAPE';else if (run(starts.ELSE)) type = 'ELSE';else if (run(starts.DOUBLE)) type = 'DOUBLE';else if (run(starts.TRIPLE)) type = 'TRIPLE';else if (run(starts.BLOCKCOMMENT)) type = 'BLOCKCOMMENT';else if (run(starts.COMMENT)) type = 'COMMENT';else if (run(starts.INCLUSION)) type = 'INCLUSION';else if (run(starts.BLOCKOPEN)) type = 'BLOCKOPEN';else if (run(starts.BLOCKCLOSE)) type = 'BLOCKCLOSE';else error('Unknown stache tag');
  var tag = new TemplateTag();
  tag.type = type;

  if (type === 'BLOCKCOMMENT') {
    var result = run(/^[\s\S]*?--\s*?\}\}/);
    if (!result) error("Unclosed block comment");
    tag.value = result.slice(0, result.lastIndexOf('--'));
  } else if (type === 'COMMENT') {
    var result = run(/^[\s\S]*?\}\}/);
    if (!result) error("Unclosed comment");
    tag.value = result.slice(0, -2);
  } else if (type === 'BLOCKCLOSE') {
    tag.path = scanPath();
    if (!run(ends.DOUBLE)) expected('`}}`');
  } else if (type === 'ELSE') {
    if (!run(ends.DOUBLE)) {
      tag = scanExpr(type);
    }
  } else if (type === 'ESCAPE') {
    var result = run(/^\{*\|/);
    tag.value = '{{' + result.slice(0, -1);
  } else {
    // DOUBLE, TRIPLE, BLOCKOPEN, INCLUSION
    tag = scanExpr(type);
  }

  return tag;
}; // Returns a SpacebarsCompiler.TemplateTag parsed from `scanner`, leaving scanner
// at its original position.
//
// An error will still be thrown if there is not a valid template tag at
// the current position.


TemplateTag.peek = function (scanner) {
  var startPos = scanner.pos;
  var result = TemplateTag.parse(scanner);
  scanner.pos = startPos;
  return result;
}; // Like `TemplateTag.parse`, but in the case of blocks, parse the complete
// `{{#foo}}...{{/foo}}` with `content` and possible `elseContent`, rather
// than just the BLOCKOPEN tag.
//
// In addition:
//
// - Throws an error if `{{else}}` or `{{/foo}}` tag is encountered.
//
// - Returns `null` for a COMMENT.  (This case is distinguishable from
//   parsing no tag by the fact that the scanner is advanced.)
//
// - Takes an HTMLTools.TEMPLATE_TAG_POSITION `position` and sets it as the
//   TemplateTag's `.position` property.
//
// - Validates the tag's well-formedness and legality at in its position.


TemplateTag.parseCompleteTag = function (scannerOrString, position) {
  var scanner = scannerOrString;
  if (typeof scanner === 'string') scanner = new HTMLTools.Scanner(scannerOrString);
  var startPos = scanner.pos; // for error messages

  var result = TemplateTag.parse(scannerOrString);
  if (!result) return result;
  if (result.type === 'BLOCKCOMMENT') return null;
  if (result.type === 'COMMENT') return null;
  if (result.type === 'ELSE') scanner.fatal("Unexpected {{else}}");
  if (result.type === 'BLOCKCLOSE') scanner.fatal("Unexpected closing template tag");
  position = position || TEMPLATE_TAG_POSITION.ELEMENT;
  if (position !== TEMPLATE_TAG_POSITION.ELEMENT) result.position = position;

  if (result.type === 'BLOCKOPEN') {
    // parse block contents
    // Construct a string version of `.path` for comparing start and
    // end tags.  For example, `foo/[0]` was parsed into `["foo", "0"]`
    // and now becomes `foo,0`.  This form may also show up in error
    // messages.
    var blockName = result.path.join(',');
    var textMode = null;

    if (blockName === 'markdown' || position === TEMPLATE_TAG_POSITION.IN_RAWTEXT) {
      textMode = HTML.TEXTMODE.STRING;
    } else if (position === TEMPLATE_TAG_POSITION.IN_RCDATA || position === TEMPLATE_TAG_POSITION.IN_ATTRIBUTE) {
      textMode = HTML.TEXTMODE.RCDATA;
    }

    var parserOptions = {
      getTemplateTag: TemplateTag.parseCompleteTag,
      shouldStop: isAtBlockCloseOrElse,
      textMode: textMode
    };
    result.textMode = textMode;
    result.content = HTMLTools.parseFragment(scanner, parserOptions);
    if (scanner.rest().slice(0, 2) !== '{{') scanner.fatal("Expected {{else}} or block close for " + blockName);
    var lastPos = scanner.pos; // save for error messages

    var tmplTag = TemplateTag.parse(scanner); // {{else}} or {{/foo}}

    var lastElseContentTag = result;

    while (tmplTag.type === 'ELSE') {
      if (lastElseContentTag === null) {
        scanner.fatal("Unexpected else after {{else}}");
      }

      if (tmplTag.path) {
        lastElseContentTag.elseContent = new TemplateTag();
        lastElseContentTag.elseContent.type = 'BLOCKOPEN';
        lastElseContentTag.elseContent.path = tmplTag.path;
        lastElseContentTag.elseContent.args = tmplTag.args;
        lastElseContentTag.elseContent.textMode = textMode;
        lastElseContentTag.elseContent.content = HTMLTools.parseFragment(scanner, parserOptions);
        lastElseContentTag = lastElseContentTag.elseContent;
      } else {
        // parse {{else}} and content up to close tag
        lastElseContentTag.elseContent = HTMLTools.parseFragment(scanner, parserOptions);
        lastElseContentTag = null;
      }

      if (scanner.rest().slice(0, 2) !== '{{') scanner.fatal("Expected block close for " + blockName);
      lastPos = scanner.pos;
      tmplTag = TemplateTag.parse(scanner);
    }

    if (tmplTag.type === 'BLOCKCLOSE') {
      var blockName2 = tmplTag.path.join(',');

      if (blockName !== blockName2) {
        scanner.pos = lastPos;
        scanner.fatal('Expected tag to close ' + blockName + ', found ' + blockName2);
      }
    } else {
      scanner.pos = lastPos;
      scanner.fatal('Expected tag to close ' + blockName + ', found ' + tmplTag.type);
    }
  }

  var finalPos = scanner.pos;
  scanner.pos = startPos;
  validateTag(result, scanner);
  scanner.pos = finalPos;
  return result;
};

var isAtBlockCloseOrElse = function (scanner) {
  // Detect `{{else}}` or `{{/foo}}`.
  //
  // We do as much work ourselves before deferring to `TemplateTag.peek`,
  // for efficiency (we're called for every input token) and to be
  // less obtrusive, because `TemplateTag.peek` will throw an error if it
  // sees `{{` followed by a malformed tag.
  var rest, type;
  return scanner.peek() === '{' && (rest = scanner.rest()).slice(0, 2) === '{{' && /^\{\{\s*(\/|else\b)/.test(rest) && (type = TemplateTag.peek(scanner).type) && (type === 'BLOCKCLOSE' || type === 'ELSE');
}; // Validate that `templateTag` is correctly formed and legal for its
// HTML position.  Use `scanner` to report errors. On success, does
// nothing.


var validateTag = function (ttag, scanner) {
  if (ttag.type === 'INCLUSION' || ttag.type === 'BLOCKOPEN') {
    var args = ttag.args;

    if (ttag.path[0] === 'each' && args[1] && args[1][0] === 'PATH' && args[1][1][0] === 'in') {// For slightly better error messages, we detect the each-in case
      // here in order not to complain if the user writes `{{#each 3 in x}}`
      // that "3 is not a function"
    } else {
      if (args.length > 1 && args[0].length === 2 && args[0][0] !== 'PATH') {
        // we have a positional argument that is not a PATH followed by
        // other arguments
        scanner.fatal("First argument must be a function, to be called on " + "the rest of the arguments; found " + args[0][0]);
      }
    }
  }

  var position = ttag.position || TEMPLATE_TAG_POSITION.ELEMENT;

  if (position === TEMPLATE_TAG_POSITION.IN_ATTRIBUTE) {
    if (ttag.type === 'DOUBLE' || ttag.type === 'ESCAPE') {
      return;
    } else if (ttag.type === 'BLOCKOPEN') {
      var path = ttag.path;
      var path0 = path[0];

      if (!(path.length === 1 && (path0 === 'if' || path0 === 'unless' || path0 === 'with' || path0 === 'each'))) {
        scanner.fatal("Custom block helpers are not allowed in an HTML attribute, only built-in ones like #each and #if");
      }
    } else {
      scanner.fatal(ttag.type + " template tag is not allowed in an HTML attribute");
    }
  } else if (position === TEMPLATE_TAG_POSITION.IN_START_TAG) {
    if (!(ttag.type === 'DOUBLE')) {
      scanner.fatal("Reactive HTML attributes must either have a constant name or consist of a single {{helper}} providing a dictionary of names and values.  A template tag of type " + ttag.type + " is not allowed here.");
    }

    if (scanner.peek() === '=') {
      scanner.fatal("Template tags are not allowed in attribute names, only in attribute values or in the form of a single {{helper}} that evaluates to a dictionary of name=value pairs.");
    }
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"whitespace.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/spacebars-compiler/whitespace.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  removeWhitespace: () => removeWhitespace
});
let HTML;
module.link("meteor/htmljs", {
  HTML(v) {
    HTML = v;
  }

}, 0);
let TreeTransformer, toRaw;
module.link("./optimizer", {
  TreeTransformer(v) {
    TreeTransformer = v;
  },

  toRaw(v) {
    toRaw = v;
  }

}, 1);

function compactRaw(array) {
  var result = [];

  for (var i = 0; i < array.length; i++) {
    var item = array[i];

    if (item instanceof HTML.Raw) {
      if (!item.value) {
        continue;
      }

      if (result.length && result[result.length - 1] instanceof HTML.Raw) {
        result[result.length - 1] = HTML.Raw(result[result.length - 1].value + item.value);
        continue;
      }
    }

    result.push(item);
  }

  return result;
}

function replaceIfContainsNewline(match) {
  if (match.indexOf('\n') >= 0) {
    return '';
  }

  return match;
}

function stripWhitespace(array) {
  var result = [];

  for (var i = 0; i < array.length; i++) {
    var item = array[i];

    if (item instanceof HTML.Raw) {
      // remove nodes that contain only whitespace & a newline
      if (item.value.indexOf('\n') !== -1 && !/\S/.test(item.value)) {
        continue;
      } // Trim any preceding whitespace, if it contains a newline


      var newStr = item.value;
      newStr = newStr.replace(/^\s+/, replaceIfContainsNewline);
      newStr = newStr.replace(/\s+$/, replaceIfContainsNewline);
      item.value = newStr;
    }

    result.push(item);
  }

  return result;
}

var WhitespaceRemovingVisitor = TreeTransformer.extend();
WhitespaceRemovingVisitor.def({
  visitNull: toRaw,
  visitPrimitive: toRaw,
  visitCharRef: toRaw,
  visitArray: function (array) {
    // this.super(array)
    var result = TreeTransformer.prototype.visitArray.call(this, array);
    result = compactRaw(result);
    result = stripWhitespace(result);
    return result;
  },
  visitTag: function (tag) {
    var tagName = tag.tagName; // TODO - List tags that we don't want to strip whitespace for.

    if (tagName === 'textarea' || tagName === 'script' || tagName === 'pre' || !HTML.isKnownElement(tagName) || HTML.isKnownSVGElement(tagName)) {
      return tag;
    }

    return TreeTransformer.prototype.visitTag.call(this, tag);
  },
  visitAttributes: function (attrs) {
    return attrs;
  }
});

function removeWhitespace(tree) {
  tree = new WhitespaceRemovingVisitor().visit(tree);
  return tree;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/spacebars-compiler/preamble.js");

/* Exports */
Package._define("spacebars-compiler", exports, {
  SpacebarsCompiler: SpacebarsCompiler
});

})();

//# sourceURL=meteor://💻app/packages/spacebars-compiler.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc3BhY2ViYXJzLWNvbXBpbGVyL3ByZWFtYmxlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9zcGFjZWJhcnMtY29tcGlsZXIvY29kZWdlbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc3BhY2ViYXJzLWNvbXBpbGVyL2NvbXBpbGVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9zcGFjZWJhcnMtY29tcGlsZXIvb3B0aW1pemVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9zcGFjZWJhcnMtY29tcGlsZXIvcmVhY3QuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3NwYWNlYmFycy1jb21waWxlci90ZW1wbGF0ZXRhZy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc3BhY2ViYXJzLWNvbXBpbGVyL3doaXRlc3BhY2UuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0IiwiU3BhY2ViYXJzQ29tcGlsZXIiLCJDb2RlR2VuIiwiYnVpbHRJbkJsb2NrSGVscGVycyIsImlzUmVzZXJ2ZWROYW1lIiwibGluayIsInYiLCJvcHRpbWl6ZSIsInBhcnNlIiwiY29tcGlsZSIsImNvZGVHZW4iLCJUZW1wbGF0ZVRhZ1JlcGxhY2VyIiwiYmVhdXRpZnkiLCJUZW1wbGF0ZVRhZyIsIl9idWlsdEluQmxvY2tIZWxwZXJzIiwiX1RlbXBsYXRlVGFnUmVwbGFjZXIiLCJfYmVhdXRpZnkiLCJIVE1MVG9vbHMiLCJIVE1MIiwiQmxhemVUb29scyIsImJ1aWx0SW5UZW1wbGF0ZU1hY3JvcyIsImFkZGl0aW9uYWxSZXNlcnZlZE5hbWVzIiwibmFtZSIsImhhc093blByb3BlcnR5IiwiXyIsImluZGV4T2YiLCJtYWtlT2JqZWN0TGl0ZXJhbCIsIm9iaiIsInBhcnRzIiwiayIsInB1c2giLCJ0b09iamVjdExpdGVyYWxLZXkiLCJqb2luIiwiZXh0ZW5kIiwicHJvdG90eXBlIiwiY29kZUdlblRlbXBsYXRlVGFnIiwidGFnIiwic2VsZiIsInBvc2l0aW9uIiwiVEVNUExBVEVfVEFHX1BPU0lUSU9OIiwiSU5fU1RBUlRfVEFHIiwiRW1pdENvZGUiLCJjb2RlR2VuTXVzdGFjaGUiLCJwYXRoIiwiYXJncyIsInR5cGUiLCJjb2RlIiwiSU5fQVRUUklCVVRFIiwidG9KU0xpdGVyYWwiLCJsZW5ndGgiLCJFcnJvciIsImRhdGFDb2RlIiwiZWFjaFVzYWdlIiwiaW5BcmciLCJ2YXJpYWJsZUFyZyIsInJlcGxhY2UiLCJ2YXJpYWJsZSIsImNvZGVHZW5JbmNsdXNpb25EYXRhIiwic2xpY2UiLCJkYXRhUHJvcHMiLCJlYWNoIiwiYXJnIiwiYXJnS2V5IiwiY29kZUdlbkFyZ1ZhbHVlIiwiY29kZUdlbkluY2x1c2lvbkRhdGFGdW5jIiwiY29udGVudEJsb2NrIiwiY29kZUdlbkJsb2NrIiwiY29udGVudCIsImVsc2VDb250ZW50QmxvY2siLCJlbHNlQ29udGVudCIsImNhbGxBcmdzIiwiY29tcENvZGUiLCJjb2RlR2VuUGF0aCIsImxvb2t1cFRlbXBsYXRlIiwiaW5jbHVkZUFyZ3MiLCJpbmNsdWRlQ29kZSIsInZhbHVlIiwib3B0cyIsImZpcnN0UGF0aEl0ZW0iLCJsb29rdXBNZXRob2QiLCJtYXAiLCJhcmdUeXBlIiwiYXJnVmFsdWUiLCJhcmdDb2RlIiwibXVzdGFjaGVUeXBlIiwibmFtZUNvZGUiLCJjb2RlR2VuTXVzdGFjaGVBcmdzIiwibXVzdGFjaGUiLCJ0YWdBcmdzIiwia3dBcmdzIiwiTWV0ZW9yIiwiUmVhY3RDb21wb25lbnRTaWJsaW5nRm9yYmlkZGVyIiwicmVtb3ZlV2hpdGVzcGFjZSIsIlVnbGlmeUpTTWluaWZ5IiwiaXNTZXJ2ZXIiLCJOcG0iLCJyZXF1aXJlIiwibWluaWZ5IiwiaW5wdXQiLCJwYXJzZUZyYWdtZW50IiwiZ2V0VGVtcGxhdGVUYWciLCJwYXJzZUNvbXBsZXRlVGFnIiwib3B0aW9ucyIsInRyZWUiLCJUcmFuc2Zvcm1pbmdWaXNpdG9yIiwiZGVmIiwidmlzaXRPYmplY3QiLCJ4IiwiaW5BdHRyaWJ1dGVWYWx1ZSIsImNvZGVnZW4iLCJjYWxsIiwidmlzaXRBdHRyaWJ1dGVzIiwiYXR0cnMiLCJ2aXNpdEF0dHJpYnV0ZSIsInJlc3VsdCIsInZpc2l0IiwicGFyc2VUcmVlIiwiaXNUZW1wbGF0ZSIsImlzQm9keSIsIndoaXRlc3BhY2UiLCJzb3VyY2VOYW1lIiwidG9Mb3dlckNhc2UiLCJ0b0pTIiwiZnJvbVN0cmluZyIsIm1hbmdsZSIsImNvbXByZXNzIiwib3V0cHV0IiwiaW5kZW50X2xldmVsIiwid2lkdGgiLCJ0b1JhdyIsIlRyZWVUcmFuc2Zvcm1lciIsImNvbnN0YW50IiwiT1BUSU1JWkFCTEUiLCJOT05FIiwiUEFSVFMiLCJGVUxMIiwiQ2FuT3B0aW1pemVWaXNpdG9yIiwiVmlzaXRvciIsInZpc2l0TnVsbCIsInZpc2l0UHJpbWl0aXZlIiwidmlzaXRDb21tZW50IiwidmlzaXRDaGFyUmVmIiwidmlzaXRSYXciLCJ2aXNpdEZ1bmN0aW9uIiwidmlzaXRBcnJheSIsImkiLCJ2aXNpdFRhZyIsInRhZ05hbWUiLCJpc0tub3duRWxlbWVudCIsImlzS25vd25TVkdFbGVtZW50IiwiY2hpbGRyZW4iLCJpc0FycmF5IiwiYSIsImdldE9wdGltaXphYmlsaXR5IiwiUmF3IiwidG9IVE1MIiwiYXBwbHkiLCJhcmd1bWVudHMiLCJPcHRpbWl6aW5nVmlzaXRvciIsImFycmF5Iiwib3B0aW1pemFiaWxpdHkiLCJ2aXNpdENoaWxkcmVuIiwiUmF3Q29tcGFjdGluZ1Zpc2l0b3IiLCJpdGVtIiwiUmF3UmVwbGFjaW5nVmlzaXRvciIsInJhdyIsImh0bWwiLCJwYXJlbnRUYWciLCJudW1TaWJsaW5ncyIsImNoaWxkIiwibWF0Y2giLCJjb25zdHJ1Y3Rvck5hbWUiLCJtYWtlU3RhY2hlVGFnU3RhcnRSZWdleCIsInIiLCJSZWdFeHAiLCJzb3VyY2UiLCJpZ25vcmVDYXNlIiwic3RhcnRzIiwiRVNDQVBFIiwiRUxTRSIsIkRPVUJMRSIsIlRSSVBMRSIsIkJMT0NLQ09NTUVOVCIsIkNPTU1FTlQiLCJJTkNMVVNJT04iLCJCTE9DS09QRU4iLCJCTE9DS0NMT1NFIiwiZW5kcyIsIkVYUFIiLCJlbmRzU3RyaW5nIiwic2Nhbm5lck9yU3RyaW5nIiwic2Nhbm5lciIsIlNjYW5uZXIiLCJwZWVrIiwicmVzdCIsInJ1biIsInJlZ2V4IiwiZXhlYyIsInJldCIsInBvcyIsImFkdmFuY2UiLCJhbW91bnQiLCJzY2FuSWRlbnRpZmllciIsImlzRmlyc3RJblBhdGgiLCJpZCIsInBhcnNlRXh0ZW5kZWRJZGVudGlmaWVyTmFtZSIsImV4cGVjdGVkIiwiZmF0YWwiLCJzY2FuUGF0aCIsInNlZ21lbnRzIiwiZG90cyIsImFuY2VzdG9yU3RyIiwiZW5kc1dpdGhTbGFzaCIsInRlc3QiLCJzcGxpdCIsImRvdENsYXVzZSIsImluZGV4Iiwic2VnIiwiZXJyb3IiLCJzZXAiLCJzY2FuQXJnS2V5d29yZCIsInNjYW5BcmciLCJrZXl3b3JkIiwic2NhbkFyZ1ZhbHVlIiwiY29uY2F0Iiwic3RhcnRQb3MiLCJwYXJzZU51bWJlciIsInBhcnNlU3RyaW5nTGl0ZXJhbCIsInNjYW5FeHByIiwiZW5kVHlwZSIsImZvdW5kS3dBcmciLCJuZXdBcmciLCJtc2ciLCJ3aGF0IiwibGFzdEluZGV4T2YiLCJFTEVNRU5UIiwiYmxvY2tOYW1lIiwidGV4dE1vZGUiLCJJTl9SQVdURVhUIiwiVEVYVE1PREUiLCJTVFJJTkciLCJJTl9SQ0RBVEEiLCJSQ0RBVEEiLCJwYXJzZXJPcHRpb25zIiwic2hvdWxkU3RvcCIsImlzQXRCbG9ja0Nsb3NlT3JFbHNlIiwibGFzdFBvcyIsInRtcGxUYWciLCJsYXN0RWxzZUNvbnRlbnRUYWciLCJibG9ja05hbWUyIiwiZmluYWxQb3MiLCJ2YWxpZGF0ZVRhZyIsInR0YWciLCJwYXRoMCIsImNvbXBhY3RSYXciLCJyZXBsYWNlSWZDb250YWluc05ld2xpbmUiLCJzdHJpcFdoaXRlc3BhY2UiLCJuZXdTdHIiLCJXaGl0ZXNwYWNlUmVtb3ZpbmdWaXNpdG9yIl0sIm1h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RzhJLGVBQWUsQ0FBQzlJLE1BQUQsQ0FBeEI7QUFDQSxXQUFPQSxNQUFQO0FBQ0QsR0FWMkI7QUFXNUJnQyxVQUFRLEVBQUUsVUFBVTlHLEdBQVYsRUFBZTtBQUN2QixRQUFJK0csT0FBTyxHQUFHL0csR0FBRyxDQUFDK0csT0FBbEIsQ0FEdUIsQ0FFdkI7O0FBQ0EsUUFBSUEsT0FBTyxLQUFLLFVBQVosSUFBMEJBLE9BQU8sS0FBSyxRQUF0QyxJQUFrREEsT0FBTyxLQUFLLEtBQTlELElBQ0MsQ0FBQ2pJLElBQUksQ0FBQ2tJLGNBQUwsQ0FBb0JELE9BQXBCLENBREYsSUFDa0NqSSxJQUFJLENBQUNtSSxpQkFBTCxDQUF1QkYsT0FBdkIsQ0FEdEMsRUFDdUU7QUFDckUsYUFBTy9HLEdBQVA7QUFDRDs7QUFDRCxXQUFPOEYsZUFBZSxDQUFDaEcsU0FBaEIsQ0FBMEJnSCxRQUExQixDQUFtQ3BDLElBQW5DLENBQXdDLElBQXhDLEVBQThDMUUsR0FBOUMsQ0FBUDtBQUNELEdBbkIyQjtBQW9CNUIyRSxpQkFBZSxFQUFFLFVBQVVDLEtBQVYsRUFBaUI7QUFDaEMsV0FBT0EsS0FBUDtBQUNEO0FBdEIyQixDQUE5Qjs7QUEwQk8sU0FBU3BCLGdCQUFULENBQTBCVyxJQUExQixFQUFnQztBQUNyQ0EsTUFBSSxHQUFJLElBQUkySix5QkFBSixFQUFELENBQWdDL0ksS0FBaEMsQ0FBc0NaLElBQXRDLENBQVA7QUFDQSxTQUFPQSxJQUFQO0FBQ0QsQyIsImZpbGUiOiIvcGFja2FnZXMvc3BhY2ViYXJzLWNvbXBpbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29kZUdlbiwgYnVpbHRJbkJsb2NrSGVscGVycywgaXNSZXNlcnZlZE5hbWUgfSBmcm9tICcuL2NvZGVnZW4nO1xuaW1wb3J0IHsgb3B0aW1pemUgfSBmcm9tICcuL29wdGltaXplcic7XG5pbXBvcnQgeyBwYXJzZSwgY29tcGlsZSwgY29kZUdlbiwgVGVtcGxhdGVUYWdSZXBsYWNlciwgYmVhdXRpZnkgfSBmcm9tICcuL2NvbXBpbGVyJztcbmltcG9ydCB7IFRlbXBsYXRlVGFnIH0gZnJvbSAnLi90ZW1wbGF0ZXRhZyc7XG5cblNwYWNlYmFyc0NvbXBpbGVyID0ge1xuICBDb2RlR2VuLFxuICBfYnVpbHRJbkJsb2NrSGVscGVyczogYnVpbHRJbkJsb2NrSGVscGVycyxcbiAgaXNSZXNlcnZlZE5hbWUsXG4gIG9wdGltaXplLFxuICBwYXJzZSxcbiAgY29tcGlsZSxcbiAgY29kZUdlbixcbiAgX1RlbXBsYXRlVGFnUmVwbGFjZXI6IFRlbXBsYXRlVGFnUmVwbGFjZXIsXG4gIF9iZWF1dGlmeTogYmVhdXRpZnksXG4gIFRlbXBsYXRlVGFnLFxufTtcblxuZXhwb3J0IHsgU3BhY2ViYXJzQ29tcGlsZXIgfTtcbiIsImltcG9ydCB7IEhUTUxUb29scyB9IGZyb20gJ21ldGVvci9odG1sLXRvb2xzJztcbmltcG9ydCB7IEhUTUwgfSBmcm9tICdtZXRlb3IvaHRtbGpzJztcbmltcG9ydCB7IEJsYXplVG9vbHMgfSBmcm9tICdtZXRlb3IvYmxhemUtdG9vbHMnO1xuaW1wb3J0IHsgY29kZUdlbiB9IGZyb20gJy4vY29tcGlsZXInO1xuXG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gQ29kZS1nZW5lcmF0aW9uIG9mIHRlbXBsYXRlIHRhZ3NcblxuLy8gVGhlIGBDb2RlR2VuYCBjbGFzcyBjdXJyZW50bHkgaGFzIG5vIGluc3RhbmNlIHN0YXRlLCBidXQgaW4gdGhlb3J5XG4vLyBpdCBjb3VsZCBiZSB1c2VmdWwgdG8gdHJhY2sgcGVyLWZ1bmN0aW9uIHN0YXRlLCBsaWtlIHdoZXRoZXIgd2Vcbi8vIG5lZWQgdG8gZW1pdCBgdmFyIHNlbGYgPSB0aGlzYCBvciBub3QuXG5leHBvcnQgZnVuY3Rpb24gQ29kZUdlbigpIHt9XG5cbmV4cG9ydCBjb25zdCBidWlsdEluQmxvY2tIZWxwZXJzID0ge1xuICAnaWYnOiAnQmxhemUuSWYnLFxuICAndW5sZXNzJzogJ0JsYXplLlVubGVzcycsXG4gICd3aXRoJzogJ1NwYWNlYmFycy5XaXRoJyxcbiAgJ2VhY2gnOiAnQmxhemUuRWFjaCcsXG4gICdsZXQnOiAnQmxhemUuTGV0J1xufTtcblxuXG4vLyBNYXBwaW5nIG9mIFwibWFjcm9zXCIgd2hpY2gsIHdoZW4gcHJlY2VkZWQgYnkgYFRlbXBsYXRlLmAsIGV4cGFuZFxuLy8gdG8gc3BlY2lhbCBjb2RlIHJhdGhlciB0aGFuIGZvbGxvd2luZyB0aGUgbG9va3VwIHJ1bGVzIGZvciBkb3R0ZWRcbi8vIHN5bWJvbHMuXG52YXIgYnVpbHRJblRlbXBsYXRlTWFjcm9zID0ge1xuICAvLyBgdmlld2AgaXMgYSBsb2NhbCB2YXJpYWJsZSBkZWZpbmVkIGluIHRoZSBnZW5lcmF0ZWQgcmVuZGVyXG4gIC8vIGZ1bmN0aW9uIGZvciB0aGUgdGVtcGxhdGUgaW4gd2hpY2ggYFRlbXBsYXRlLmNvbnRlbnRCbG9ja2Agb3JcbiAgLy8gYFRlbXBsYXRlLmVsc2VCbG9ja2AgaXMgaW52b2tlZC5cbiAgJ2NvbnRlbnRCbG9jayc6ICd2aWV3LnRlbXBsYXRlQ29udGVudEJsb2NrJyxcbiAgJ2Vsc2VCbG9jayc6ICd2aWV3LnRlbXBsYXRlRWxzZUJsb2NrJyxcblxuICAvLyBDb25mdXNpbmdseSwgdGhpcyBtYWtlcyBge3s+IFRlbXBsYXRlLmR5bmFtaWN9fWAgYW4gYWxpYXNcbiAgLy8gZm9yIGB7ez4gX19keW5hbWljfX1gLCB3aGVyZSBcIl9fZHluYW1pY1wiIGlzIHRoZSB0ZW1wbGF0ZSB0aGF0XG4gIC8vIGltcGxlbWVudHMgdGhlIGR5bmFtaWMgdGVtcGxhdGUgZmVhdHVyZS5cbiAgJ2R5bmFtaWMnOiAnVGVtcGxhdGUuX19keW5hbWljJyxcblxuICAnc3Vic2NyaXB0aW9uc1JlYWR5JzogJ3ZpZXcudGVtcGxhdGVJbnN0YW5jZSgpLnN1YnNjcmlwdGlvbnNSZWFkeSgpJ1xufTtcblxudmFyIGFkZGl0aW9uYWxSZXNlcnZlZE5hbWVzID0gW1wiYm9keVwiLCBcInRvU3RyaW5nXCIsIFwiaW5zdGFuY2VcIiwgIFwiY29uc3RydWN0b3JcIixcbiAgXCJ0b1N0cmluZ1wiLCBcInRvTG9jYWxlU3RyaW5nXCIsIFwidmFsdWVPZlwiLCBcImhhc093blByb3BlcnR5XCIsIFwiaXNQcm90b3R5cGVPZlwiLFxuICBcInByb3BlcnR5SXNFbnVtZXJhYmxlXCIsIFwiX19kZWZpbmVHZXR0ZXJfX1wiLCBcIl9fbG9va3VwR2V0dGVyX19cIixcbiAgXCJfX2RlZmluZVNldHRlcl9fXCIsIFwiX19sb29rdXBTZXR0ZXJfX1wiLCBcIl9fcHJvdG9fX1wiLCBcImR5bmFtaWNcIixcbiAgXCJyZWdpc3RlckhlbHBlclwiLCBcImN1cnJlbnREYXRhXCIsIFwicGFyZW50RGF0YVwiLCBcIl9taWdyYXRlVGVtcGxhdGVcIixcbiAgXCJfYXBwbHlIbXJDaGFuZ2VzXCIsIFwiX19wZW5kaW5nUmVwbGFjZW1lbnRcIlxuXTtcblxuLy8gQSBcInJlc2VydmVkIG5hbWVcIiBjYW4ndCBiZSB1c2VkIGFzIGEgPHRlbXBsYXRlPiBuYW1lLiAgVGhpc1xuLy8gZnVuY3Rpb24gaXMgdXNlZCBieSB0aGUgdGVtcGxhdGUgZmlsZSBzY2FubmVyLlxuLy9cbi8vIE5vdGUgdGhhdCB0aGUgcnVudGltZSBpbXBvc2VzIGFkZGl0aW9uYWwgcmVzdHJpY3Rpb25zLCBmb3IgZXhhbXBsZVxuLy8gYmFubmluZyB0aGUgbmFtZSBcImJvZHlcIiBhbmQgbmFtZXMgb2YgYnVpbHQtaW4gb2JqZWN0IHByb3BlcnRpZXNcbi8vIGxpa2UgXCJ0b1N0cmluZ1wiLlxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVzZXJ2ZWROYW1lKG5hbWUpIHtcbiAgcmV0dXJuIGJ1aWx0SW5CbG9ja0hlbHBlcnMuaGFzT3duUHJvcGVydHkobmFtZSkgfHxcbiAgICBidWlsdEluVGVtcGxhdGVNYWNyb3MuaGFzT3duUHJvcGVydHkobmFtZSkgfHxcbiAgICBfLmluZGV4T2YoYWRkaXRpb25hbFJlc2VydmVkTmFtZXMsIG5hbWUpID4gLTE7XG59XG5cbnZhciBtYWtlT2JqZWN0TGl0ZXJhbCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIHBhcnRzID0gW107XG4gIGZvciAodmFyIGsgaW4gb2JqKVxuICAgIHBhcnRzLnB1c2goQmxhemVUb29scy50b09iamVjdExpdGVyYWxLZXkoaykgKyAnOiAnICsgb2JqW2tdKTtcbiAgcmV0dXJuICd7JyArIHBhcnRzLmpvaW4oJywgJykgKyAnfSc7XG59O1xuXG5fLmV4dGVuZChDb2RlR2VuLnByb3RvdHlwZSwge1xuICBjb2RlR2VuVGVtcGxhdGVUYWc6IGZ1bmN0aW9uICh0YWcpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHRhZy5wb3NpdGlvbiA9PT0gSFRNTFRvb2xzLlRFTVBMQVRFX1RBR19QT1NJVElPTi5JTl9TVEFSVF9UQUcpIHtcbiAgICAgIC8vIFNwZWNpYWwgZHluYW1pYyBhdHRyaWJ1dGVzOiBgPGRpdiB7e2F0dHJzfX0+Li4uYFxuICAgICAgLy8gb25seSBgdGFnLnR5cGUgPT09ICdET1VCTEUnYCBhbGxvd2VkIChieSBlYXJsaWVyIHZhbGlkYXRpb24pXG4gICAgICByZXR1cm4gQmxhemVUb29scy5FbWl0Q29kZSgnZnVuY3Rpb24gKCkgeyByZXR1cm4gJyArXG4gICAgICAgICAgc2VsZi5jb2RlR2VuTXVzdGFjaGUodGFnLnBhdGgsIHRhZy5hcmdzLCAnYXR0ck11c3RhY2hlJylcbiAgICAgICAgICArICc7IH0nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRhZy50eXBlID09PSAnRE9VQkxFJyB8fCB0YWcudHlwZSA9PT0gJ1RSSVBMRScpIHtcbiAgICAgICAgdmFyIGNvZGUgPSBzZWxmLmNvZGVHZW5NdXN0YWNoZSh0YWcucGF0aCwgdGFnLmFyZ3MpO1xuICAgICAgICBpZiAodGFnLnR5cGUgPT09ICdUUklQTEUnKSB7XG4gICAgICAgICAgY29kZSA9ICdTcGFjZWJhcnMubWFrZVJhdygnICsgY29kZSArICcpJztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnLnBvc2l0aW9uICE9PSBIVE1MVG9vbHMuVEVNUExBVEVfVEFHX1BPU0lUSU9OLklOX0FUVFJJQlVURSkge1xuICAgICAgICAgIC8vIFJlYWN0aXZlIGF0dHJpYnV0ZXMgYXJlIGFscmVhZHkgd3JhcHBlZCBpbiBhIGZ1bmN0aW9uLFxuICAgICAgICAgIC8vIGFuZCB0aGVyZSdzIG5vIGZpbmUtZ3JhaW5lZCByZWFjdGl2aXR5LlxuICAgICAgICAgIC8vIEFueXdoZXJlIGVsc2UsIHdlIG5lZWQgdG8gY3JlYXRlIGEgVmlldy5cbiAgICAgICAgICBjb2RlID0gJ0JsYXplLlZpZXcoJyArXG4gICAgICAgICAgICBCbGF6ZVRvb2xzLnRvSlNMaXRlcmFsKCdsb29rdXA6JyArIHRhZy5wYXRoLmpvaW4oJy4nKSkgKyAnLCAnICtcbiAgICAgICAgICAgICdmdW5jdGlvbiAoKSB7IHJldHVybiAnICsgY29kZSArICc7IH0pJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQmxhemVUb29scy5FbWl0Q29kZShjb2RlKTtcbiAgICAgIH0gZWxzZSBpZiAodGFnLnR5cGUgPT09ICdJTkNMVVNJT04nIHx8IHRhZy50eXBlID09PSAnQkxPQ0tPUEVOJykge1xuICAgICAgICB2YXIgcGF0aCA9IHRhZy5wYXRoO1xuICAgICAgICB2YXIgYXJncyA9IHRhZy5hcmdzO1xuXG4gICAgICAgIGlmICh0YWcudHlwZSA9PT0gJ0JMT0NLT1BFTicgJiZcbiAgICAgICAgICAgIGJ1aWx0SW5CbG9ja0hlbHBlcnMuaGFzT3duUHJvcGVydHkocGF0aFswXSkpIHtcbiAgICAgICAgICAvLyBpZiwgdW5sZXNzLCB3aXRoLCBlYWNoLlxuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gSWYgc29tZW9uZSB0cmllcyB0byBkbyBge3s+IGlmfX1gLCB3ZSBkb24ndFxuICAgICAgICAgIC8vIGdldCBoZXJlLCBidXQgYW4gZXJyb3IgaXMgdGhyb3duIHdoZW4gd2UgdHJ5IHRvIGNvZGVnZW4gdGhlIHBhdGguXG5cbiAgICAgICAgICAvLyBOb3RlOiBJZiB3ZSBjYXVnaHQgdGhlc2UgZXJyb3JzIGVhcmxpZXIsIHdoaWxlIHNjYW5uaW5nLCB3ZSdkIGJlIGFibGUgdG9cbiAgICAgICAgICAvLyBwcm92aWRlIG5pY2UgbGluZSBudW1iZXJzLlxuICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA+IDEpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGRvdHRlZCBwYXRoIGJlZ2lubmluZyB3aXRoIFwiICsgcGF0aFswXSk7XG4gICAgICAgICAgaWYgKCEgYXJncy5sZW5ndGgpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIjXCIgKyBwYXRoWzBdICsgXCIgcmVxdWlyZXMgYW4gYXJndW1lbnRcIik7XG5cbiAgICAgICAgICB2YXIgZGF0YUNvZGUgPSBudWxsO1xuICAgICAgICAgIC8vICNlYWNoIGhhcyBhIHNwZWNpYWwgdHJlYXRtZW50IGFzIGl0IGZlYXR1cmVzIHR3byBkaWZmZXJlbnQgZm9ybXM6XG4gICAgICAgICAgLy8gLSB7eyNlYWNoIHBlb3BsZX19XG4gICAgICAgICAgLy8gLSB7eyNlYWNoIHBlcnNvbiBpbiBwZW9wbGV9fVxuICAgICAgICAgIGlmIChwYXRoWzBdID09PSAnZWFjaCcgJiYgYXJncy5sZW5ndGggPj0gMiAmJiBhcmdzWzFdWzBdID09PSAnUEFUSCcgJiZcbiAgICAgICAgICAgICAgYXJnc1sxXVsxXS5sZW5ndGggJiYgYXJnc1sxXVsxXVswXSA9PT0gJ2luJykge1xuICAgICAgICAgICAgLy8gbWluaW11bSBjb25kaXRpb25zIGFyZSBtZXQgZm9yIGVhY2gtaW4uICBub3cgdmFsaWRhdGUgdGhpc1xuICAgICAgICAgICAgLy8gaXNuJ3Qgc29tZSB3ZWlyZCBjYXNlLlxuICAgICAgICAgICAgdmFyIGVhY2hVc2FnZSA9IFwiVXNlIGVpdGhlciB7eyNlYWNoIGl0ZW1zfX0gb3IgXCIgK1xuICAgICAgICAgICAgICAgICAgXCJ7eyNlYWNoIGl0ZW0gaW4gaXRlbXN9fSBmb3JtIG9mICNlYWNoLlwiO1xuICAgICAgICAgICAgdmFyIGluQXJnID0gYXJnc1sxXTtcbiAgICAgICAgICAgIGlmICghIChhcmdzLmxlbmd0aCA+PSAzICYmIGluQXJnWzFdLmxlbmd0aCA9PT0gMSkpIHtcbiAgICAgICAgICAgICAgLy8gd2UgZG9uJ3QgaGF2ZSBhdCBsZWFzdCAzIHNwYWNlLXNlcGFyYXRlZCBwYXJ0cyBhZnRlciAjZWFjaCwgb3JcbiAgICAgICAgICAgICAgLy8gaW5BcmcgZG9lc24ndCBsb29rIGxpa2UgWydQQVRIJyxbJ2luJ11dXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1hbGZvcm1lZCAjZWFjaC4gXCIgKyBlYWNoVXNhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gc3BsaXQgb3V0IHRoZSB2YXJpYWJsZSBuYW1lIGFuZCBzZXF1ZW5jZSBhcmd1bWVudHNcbiAgICAgICAgICAgIHZhciB2YXJpYWJsZUFyZyA9IGFyZ3NbMF07XG4gICAgICAgICAgICBpZiAoISAodmFyaWFibGVBcmdbMF0gPT09IFwiUEFUSFwiICYmIHZhcmlhYmxlQXJnWzFdLmxlbmd0aCA9PT0gMSAmJlxuICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlQXJnWzFdWzBdLnJlcGxhY2UoL1xcLi9nLCAnJykpKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkJhZCB2YXJpYWJsZSBuYW1lIGluICNlYWNoXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZhcmlhYmxlID0gdmFyaWFibGVBcmdbMV1bMF07XG4gICAgICAgICAgICBkYXRhQ29kZSA9ICdmdW5jdGlvbiAoKSB7IHJldHVybiB7IF9zZXF1ZW5jZTogJyArXG4gICAgICAgICAgICAgIHNlbGYuY29kZUdlbkluY2x1c2lvbkRhdGEoYXJncy5zbGljZSgyKSkgK1xuICAgICAgICAgICAgICAnLCBfdmFyaWFibGU6ICcgKyBCbGF6ZVRvb2xzLnRvSlNMaXRlcmFsKHZhcmlhYmxlKSArICcgfTsgfSc7XG4gICAgICAgICAgfSBlbHNlIGlmIChwYXRoWzBdID09PSAnbGV0Jykge1xuICAgICAgICAgICAgdmFyIGRhdGFQcm9wcyA9IHt9O1xuICAgICAgICAgICAgXy5lYWNoKGFyZ3MsIGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgICAgICAgaWYgKGFyZy5sZW5ndGggIT09IDMpIHtcbiAgICAgICAgICAgICAgICAvLyBub3QgYSBrZXl3b3JkIGFyZyAoeD15KVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkluY29ycmVjdCBmb3JtIG9mICNsZXRcIik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdmFyIGFyZ0tleSA9IGFyZ1syXTtcbiAgICAgICAgICAgICAgZGF0YVByb3BzW2FyZ0tleV0gPVxuICAgICAgICAgICAgICAgICdmdW5jdGlvbiAoKSB7IHJldHVybiBTcGFjZWJhcnMuY2FsbCgnICtcbiAgICAgICAgICAgICAgICBzZWxmLmNvZGVHZW5BcmdWYWx1ZShhcmcpICsgJyk7IH0nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkYXRhQ29kZSA9IG1ha2VPYmplY3RMaXRlcmFsKGRhdGFQcm9wcyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCEgZGF0YUNvZGUpIHtcbiAgICAgICAgICAgIC8vIGBhcmdzYCBtdXN0IGV4aXN0ICh0YWcuYXJncy5sZW5ndGggPiAwKVxuICAgICAgICAgICAgZGF0YUNvZGUgPSBzZWxmLmNvZGVHZW5JbmNsdXNpb25EYXRhRnVuYyhhcmdzKSB8fCAnbnVsbCc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gYGNvbnRlbnRgIG11c3QgZXhpc3RcbiAgICAgICAgICB2YXIgY29udGVudEJsb2NrID0gKCgnY29udGVudCcgaW4gdGFnKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNvZGVHZW5CbG9jayh0YWcuY29udGVudCkgOiBudWxsKTtcbiAgICAgICAgICAvLyBgZWxzZUNvbnRlbnRgIG1heSBub3QgZXhpc3RcbiAgICAgICAgICB2YXIgZWxzZUNvbnRlbnRCbG9jayA9ICgoJ2Vsc2VDb250ZW50JyBpbiB0YWcpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmNvZGVHZW5CbG9jayh0YWcuZWxzZUNvbnRlbnQpIDogbnVsbCk7XG5cbiAgICAgICAgICB2YXIgY2FsbEFyZ3MgPSBbZGF0YUNvZGUsIGNvbnRlbnRCbG9ja107XG4gICAgICAgICAgaWYgKGVsc2VDb250ZW50QmxvY2spXG4gICAgICAgICAgICBjYWxsQXJncy5wdXNoKGVsc2VDb250ZW50QmxvY2spO1xuXG4gICAgICAgICAgcmV0dXJuIEJsYXplVG9vbHMuRW1pdENvZGUoXG4gICAgICAgICAgICBidWlsdEluQmxvY2tIZWxwZXJzW3BhdGhbMF1dICsgJygnICsgY2FsbEFyZ3Muam9pbignLCAnKSArICcpJyk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgY29tcENvZGUgPSBzZWxmLmNvZGVHZW5QYXRoKHBhdGgsIHtsb29rdXBUZW1wbGF0ZTogdHJ1ZX0pO1xuICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIC8vIGNhcHR1cmUgcmVhY3Rpdml0eVxuICAgICAgICAgICAgY29tcENvZGUgPSAnZnVuY3Rpb24gKCkgeyByZXR1cm4gU3BhY2ViYXJzLmNhbGwoJyArIGNvbXBDb2RlICtcbiAgICAgICAgICAgICAgJyk7IH0nO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciBkYXRhQ29kZSA9IHNlbGYuY29kZUdlbkluY2x1c2lvbkRhdGFGdW5jKHRhZy5hcmdzKTtcbiAgICAgICAgICB2YXIgY29udGVudCA9ICgoJ2NvbnRlbnQnIGluIHRhZykgP1xuICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY29kZUdlbkJsb2NrKHRhZy5jb250ZW50KSA6IG51bGwpO1xuICAgICAgICAgIHZhciBlbHNlQ29udGVudCA9ICgoJ2Vsc2VDb250ZW50JyBpbiB0YWcpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5jb2RlR2VuQmxvY2sodGFnLmVsc2VDb250ZW50KSA6IG51bGwpO1xuXG4gICAgICAgICAgdmFyIGluY2x1ZGVBcmdzID0gW2NvbXBDb2RlXTtcbiAgICAgICAgICBpZiAoY29udGVudCkge1xuICAgICAgICAgICAgaW5jbHVkZUFyZ3MucHVzaChjb250ZW50KTtcbiAgICAgICAgICAgIGlmIChlbHNlQ29udGVudClcbiAgICAgICAgICAgICAgaW5jbHVkZUFyZ3MucHVzaChlbHNlQ29udGVudCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIGluY2x1ZGVDb2RlID1cbiAgICAgICAgICAgICAgICAnU3BhY2ViYXJzLmluY2x1ZGUoJyArIGluY2x1ZGVBcmdzLmpvaW4oJywgJykgKyAnKSc7XG5cbiAgICAgICAgICAvLyBjYWxsaW5nIGNvbnZlbnRpb24gY29tcGF0IC0tIHNldCB0aGUgZGF0YSBjb250ZXh0IGFyb3VuZCB0aGVcbiAgICAgICAgICAvLyBlbnRpcmUgaW5jbHVzaW9uLCBzbyB0aGF0IGlmIHRoZSBuYW1lIG9mIHRoZSBpbmNsdXNpb24gaXNcbiAgICAgICAgICAvLyBhIGhlbHBlciBmdW5jdGlvbiwgaXQgZ2V0cyB0aGUgZGF0YSBjb250ZXh0IGluIGB0aGlzYC5cbiAgICAgICAgICAvLyBUaGlzIG1ha2VzIGZvciBhIHByZXR0eSBjb25mdXNpbmcgY2FsbGluZyBjb252ZW50aW9uIC0tXG4gICAgICAgICAgLy8gSW4gYHt7I2ZvbyBiYXJ9fWAsIGBmb29gIGlzIGV2YWx1YXRlZCBpbiB0aGUgY29udGV4dCBvZiBgYmFyYFxuICAgICAgICAgIC8vIC0tIGJ1dCBpdCdzIHdoYXQgd2Ugc2hpcHBlZCBmb3IgMC44LjAuICBUaGUgcmF0aW9uYWxlIGlzIHRoYXRcbiAgICAgICAgICAvLyBge3sjZm9vIGJhcn19YCBpcyBzdWdhciBmb3IgYHt7I3dpdGggYmFyfX17eyNmb299fS4uLmAuXG4gICAgICAgICAgaWYgKGRhdGFDb2RlKSB7XG4gICAgICAgICAgICBpbmNsdWRlQ29kZSA9XG4gICAgICAgICAgICAgICdCbGF6ZS5fVGVtcGxhdGVXaXRoKCcgKyBkYXRhQ29kZSArICcsIGZ1bmN0aW9uICgpIHsgcmV0dXJuICcgK1xuICAgICAgICAgICAgICBpbmNsdWRlQ29kZSArICc7IH0pJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBYWFggQkFDSyBDT01QQVQgLSBVSSBpcyB0aGUgb2xkIG5hbWUsIFRlbXBsYXRlIGlzIHRoZSBuZXdcbiAgICAgICAgICBpZiAoKHBhdGhbMF0gPT09ICdVSScgfHwgcGF0aFswXSA9PT0gJ1RlbXBsYXRlJykgJiZcbiAgICAgICAgICAgICAgKHBhdGhbMV0gPT09ICdjb250ZW50QmxvY2snIHx8IHBhdGhbMV0gPT09ICdlbHNlQmxvY2snKSkge1xuICAgICAgICAgICAgLy8gQ2FsbCBjb250ZW50QmxvY2sgYW5kIGVsc2VCbG9jayBpbiB0aGUgYXBwcm9wcmlhdGUgc2NvcGVcbiAgICAgICAgICAgIGluY2x1ZGVDb2RlID0gJ0JsYXplLl9Jbk91dGVyVGVtcGxhdGVTY29wZSh2aWV3LCBmdW5jdGlvbiAoKSB7IHJldHVybiAnXG4gICAgICAgICAgICAgICsgaW5jbHVkZUNvZGUgKyAnOyB9KSc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIEJsYXplVG9vbHMuRW1pdENvZGUoaW5jbHVkZUNvZGUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRhZy50eXBlID09PSAnRVNDQVBFJykge1xuICAgICAgICByZXR1cm4gdGFnLnZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQ2FuJ3QgZ2V0IGhlcmU7IFRlbXBsYXRlVGFnIHZhbGlkYXRpb24gc2hvdWxkIGNhdGNoIGFueVxuICAgICAgICAvLyBpbmFwcHJvcHJpYXRlIHRhZyB0eXBlcyB0aGF0IG1pZ2h0IGNvbWUgb3V0IG9mIHRoZSBwYXJzZXIuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgdGVtcGxhdGUgdGFnIHR5cGU6IFwiICsgdGFnLnR5cGUpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvLyBgcGF0aGAgaXMgYW4gYXJyYXkgb2YgYXQgbGVhc3Qgb25lIHN0cmluZy5cbiAgLy9cbiAgLy8gSWYgYHBhdGgubGVuZ3RoID4gMWAsIHRoZSBnZW5lcmF0ZWQgY29kZSBtYXkgYmUgcmVhY3RpdmVcbiAgLy8gKGkuZS4gaXQgbWF5IGludmFsaWRhdGUgdGhlIGN1cnJlbnQgY29tcHV0YXRpb24pLlxuICAvL1xuICAvLyBObyBjb2RlIGlzIGdlbmVyYXRlZCB0byBjYWxsIHRoZSByZXN1bHQgaWYgaXQncyBhIGZ1bmN0aW9uLlxuICAvL1xuICAvLyBPcHRpb25zOlxuICAvL1xuICAvLyAtIGxvb2t1cFRlbXBsYXRlIHtCb29sZWFufSBJZiB0cnVlLCBnZW5lcmF0ZWQgY29kZSBhbHNvIGxvb2tzIGluXG4gIC8vICAgdGhlIGxpc3Qgb2YgdGVtcGxhdGVzLiAoQWZ0ZXIgaGVscGVycywgYmVmb3JlIGRhdGEgY29udGV4dCkuXG4gIC8vICAgVXNlZCB3aGVuIGdlbmVyYXRpbmcgY29kZSBmb3IgYHt7PiBmb299fWAgb3IgYHt7I2Zvb319YC4gT25seVxuICAvLyAgIHVzZWQgZm9yIG5vbi1kb3R0ZWQgcGF0aHMuXG4gIGNvZGVHZW5QYXRoOiBmdW5jdGlvbiAocGF0aCwgb3B0cykge1xuICAgIGlmIChidWlsdEluQmxvY2tIZWxwZXJzLmhhc093blByb3BlcnR5KHBhdGhbMF0pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuJ3QgdXNlIHRoZSBidWlsdC1pbiAnXCIgKyBwYXRoWzBdICsgXCInIGhlcmVcIik7XG4gICAgLy8gTGV0IGB7eyNpZiBUZW1wbGF0ZS5jb250ZW50QmxvY2t9fWAgY2hlY2sgd2hldGhlciB0aGlzIHRlbXBsYXRlIHdhc1xuICAgIC8vIGludm9rZWQgdmlhIGluY2x1c2lvbiBvciBhcyBhIGJsb2NrIGhlbHBlciwgaW4gYWRkaXRpb24gdG8gc3VwcG9ydGluZ1xuICAgIC8vIGB7ez4gVGVtcGxhdGUuY29udGVudEJsb2NrfX1gLlxuICAgIC8vIFhYWCBCQUNLIENPTVBBVCAtIFVJIGlzIHRoZSBvbGQgbmFtZSwgVGVtcGxhdGUgaXMgdGhlIG5ld1xuICAgIGlmIChwYXRoLmxlbmd0aCA+PSAyICYmXG4gICAgICAgIChwYXRoWzBdID09PSAnVUknIHx8IHBhdGhbMF0gPT09ICdUZW1wbGF0ZScpXG4gICAgICAgICYmIGJ1aWx0SW5UZW1wbGF0ZU1hY3Jvcy5oYXNPd25Qcm9wZXJ0eShwYXRoWzFdKSkge1xuICAgICAgaWYgKHBhdGgubGVuZ3RoID4gMilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBkb3R0ZWQgcGF0aCBiZWdpbm5pbmcgd2l0aCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoWzBdICsgJy4nICsgcGF0aFsxXSk7XG4gICAgICByZXR1cm4gYnVpbHRJblRlbXBsYXRlTWFjcm9zW3BhdGhbMV1dO1xuICAgIH1cblxuICAgIHZhciBmaXJzdFBhdGhJdGVtID0gQmxhemVUb29scy50b0pTTGl0ZXJhbChwYXRoWzBdKTtcbiAgICB2YXIgbG9va3VwTWV0aG9kID0gJ2xvb2t1cCc7XG4gICAgaWYgKG9wdHMgJiYgb3B0cy5sb29rdXBUZW1wbGF0ZSAmJiBwYXRoLmxlbmd0aCA9PT0gMSlcbiAgICAgIGxvb2t1cE1ldGhvZCA9ICdsb29rdXBUZW1wbGF0ZSc7XG4gICAgdmFyIGNvZGUgPSAndmlldy4nICsgbG9va3VwTWV0aG9kICsgJygnICsgZmlyc3RQYXRoSXRlbSArICcpJztcblxuICAgIGlmIChwYXRoLmxlbmd0aCA+IDEpIHtcbiAgICAgIGNvZGUgPSAnU3BhY2ViYXJzLmRvdCgnICsgY29kZSArICcsICcgK1xuICAgICAgICBfLm1hcChwYXRoLnNsaWNlKDEpLCBCbGF6ZVRvb2xzLnRvSlNMaXRlcmFsKS5qb2luKCcsICcpICsgJyknO1xuICAgIH1cblxuICAgIHJldHVybiBjb2RlO1xuICB9LFxuXG4gIC8vIEdlbmVyYXRlcyBjb2RlIGZvciBhbiBgW2FyZ1R5cGUsIGFyZ1ZhbHVlXWAgYXJndW1lbnQgc3BlYyxcbiAgLy8gaWdub3JpbmcgdGhlIHRoaXJkIGVsZW1lbnQgKGtleXdvcmQgYXJndW1lbnQgbmFtZSkgaWYgcHJlc2VudC5cbiAgLy9cbiAgLy8gVGhlIHJlc3VsdGluZyBjb2RlIG1heSBiZSByZWFjdGl2ZSAoaW4gdGhlIGNhc2Ugb2YgYSBQQVRIIG9mXG4gIC8vIG1vcmUgdGhhbiBvbmUgZWxlbWVudCkgYW5kIGlzIG5vdCB3cmFwcGVkIGluIGEgY2xvc3VyZS5cbiAgY29kZUdlbkFyZ1ZhbHVlOiBmdW5jdGlvbiAoYXJnKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIGFyZ1R5cGUgPSBhcmdbMF07XG4gICAgdmFyIGFyZ1ZhbHVlID0gYXJnWzFdO1xuXG4gICAgdmFyIGFyZ0NvZGU7XG4gICAgc3dpdGNoIChhcmdUeXBlKSB7XG4gICAgY2FzZSAnU1RSSU5HJzpcbiAgICBjYXNlICdOVU1CRVInOlxuICAgIGNhc2UgJ0JPT0xFQU4nOlxuICAgIGNhc2UgJ05VTEwnOlxuICAgICAgYXJnQ29kZSA9IEJsYXplVG9vbHMudG9KU0xpdGVyYWwoYXJnVmFsdWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUEFUSCc6XG4gICAgICBhcmdDb2RlID0gc2VsZi5jb2RlR2VuUGF0aChhcmdWYWx1ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdFWFBSJzpcbiAgICAgIC8vIFRoZSBmb3JtYXQgb2YgRVhQUiBpcyBbJ0VYUFInLCB7IHR5cGU6ICdFWFBSJywgcGF0aDogWy4uLl0sIGFyZ3M6IHsgLi4uIH0gfV1cbiAgICAgIGFyZ0NvZGUgPSBzZWxmLmNvZGVHZW5NdXN0YWNoZShhcmdWYWx1ZS5wYXRoLCBhcmdWYWx1ZS5hcmdzLCAnZGF0YU11c3RhY2hlJyk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgLy8gY2FuJ3QgZ2V0IGhlcmVcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgYXJnIHR5cGU6IFwiICsgYXJnVHlwZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyZ0NvZGU7XG4gIH0sXG5cbiAgLy8gR2VuZXJhdGVzIGEgY2FsbCB0byBgU3BhY2ViYXJzLmZvb011c3RhY2hlYCBvbiBldmFsdWF0ZWQgYXJndW1lbnRzLlxuICAvLyBUaGUgcmVzdWx0aW5nIGNvZGUgaGFzIG5vIGZ1bmN0aW9uIGxpdGVyYWxzIGFuZCBtdXN0IGJlIHdyYXBwZWQgaW5cbiAgLy8gb25lIGZvciBmaW5lLWdyYWluZWQgcmVhY3Rpdml0eS5cbiAgY29kZUdlbk11c3RhY2hlOiBmdW5jdGlvbiAocGF0aCwgYXJncywgbXVzdGFjaGVUeXBlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIG5hbWVDb2RlID0gc2VsZi5jb2RlR2VuUGF0aChwYXRoKTtcbiAgICB2YXIgYXJnQ29kZSA9IHNlbGYuY29kZUdlbk11c3RhY2hlQXJncyhhcmdzKTtcbiAgICB2YXIgbXVzdGFjaGUgPSAobXVzdGFjaGVUeXBlIHx8ICdtdXN0YWNoZScpO1xuXG4gICAgcmV0dXJuICdTcGFjZWJhcnMuJyArIG11c3RhY2hlICsgJygnICsgbmFtZUNvZGUgK1xuICAgICAgKGFyZ0NvZGUgPyAnLCAnICsgYXJnQ29kZS5qb2luKCcsICcpIDogJycpICsgJyknO1xuICB9LFxuXG4gIC8vIHJldHVybnM6IGFycmF5IG9mIHNvdXJjZSBzdHJpbmdzLCBvciBudWxsIGlmIG5vXG4gIC8vIGFyZ3MgYXQgYWxsLlxuICBjb2RlR2VuTXVzdGFjaGVBcmdzOiBmdW5jdGlvbiAodGFnQXJncykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHZhciBrd0FyZ3MgPSBudWxsOyAvLyBzb3VyY2UgLT4gc291cmNlXG4gICAgdmFyIGFyZ3MgPSBudWxsOyAvLyBbc291cmNlXVxuXG4gICAgLy8gdGFnQXJncyBtYXkgYmUgbnVsbFxuICAgIF8uZWFjaCh0YWdBcmdzLCBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICB2YXIgYXJnQ29kZSA9IHNlbGYuY29kZUdlbkFyZ1ZhbHVlKGFyZyk7XG5cbiAgICAgIGlmIChhcmcubGVuZ3RoID4gMikge1xuICAgICAgICAvLyBrZXl3b3JkIGFyZ3VtZW50IChyZXByZXNlbnRlZCBhcyBbdHlwZSwgdmFsdWUsIG5hbWVdKVxuICAgICAgICBrd0FyZ3MgPSAoa3dBcmdzIHx8IHt9KTtcbiAgICAgICAga3dBcmdzW2FyZ1syXV0gPSBhcmdDb2RlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcG9zaXRpb25hbCBhcmd1bWVudFxuICAgICAgICBhcmdzID0gKGFyZ3MgfHwgW10pO1xuICAgICAgICBhcmdzLnB1c2goYXJnQ29kZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBwdXQga3dBcmdzIGluIG9wdGlvbnMgZGljdGlvbmFyeSBhdCBlbmQgb2YgYXJnc1xuICAgIGlmIChrd0FyZ3MpIHtcbiAgICAgIGFyZ3MgPSAoYXJncyB8fCBbXSk7XG4gICAgICBhcmdzLnB1c2goJ1NwYWNlYmFycy5rdygnICsgbWFrZU9iamVjdExpdGVyYWwoa3dBcmdzKSArICcpJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyZ3M7XG4gIH0sXG5cbiAgY29kZUdlbkJsb2NrOiBmdW5jdGlvbiAoY29udGVudCkge1xuICAgIHJldHVybiBjb2RlR2VuKGNvbnRlbnQpO1xuICB9LFxuXG4gIGNvZGVHZW5JbmNsdXNpb25EYXRhOiBmdW5jdGlvbiAoYXJncykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICghIGFyZ3MubGVuZ3RoKSB7XG4gICAgICAvLyBlLmcuIGB7eyNmb299fWBcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAoYXJnc1swXS5sZW5ndGggPT09IDMpIHtcbiAgICAgIC8vIGtleXdvcmQgYXJndW1lbnRzIG9ubHksIGUuZy4gYHt7PiBwb2ludCB4PTEgeT0yfX1gXG4gICAgICB2YXIgZGF0YVByb3BzID0ge307XG4gICAgICBfLmVhY2goYXJncywgZnVuY3Rpb24gKGFyZykge1xuICAgICAgICB2YXIgYXJnS2V5ID0gYXJnWzJdO1xuICAgICAgICBkYXRhUHJvcHNbYXJnS2V5XSA9ICdTcGFjZWJhcnMuY2FsbCgnICsgc2VsZi5jb2RlR2VuQXJnVmFsdWUoYXJnKSArICcpJztcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG1ha2VPYmplY3RMaXRlcmFsKGRhdGFQcm9wcyk7XG4gICAgfSBlbHNlIGlmIChhcmdzWzBdWzBdICE9PSAnUEFUSCcpIHtcbiAgICAgIC8vIGxpdGVyYWwgZmlyc3QgYXJndW1lbnQsIGUuZy4gYHt7PiBmb28gXCJibGFoXCJ9fWBcbiAgICAgIC8vXG4gICAgICAvLyB0YWcgdmFsaWRhdGlvbiBoYXMgY29uZmlybWVkLCBpbiB0aGlzIGNhc2UsIHRoYXQgdGhlcmUgaXMgb25seVxuICAgICAgLy8gb25lIGFyZ3VtZW50IChgYXJncy5sZW5ndGggPT09IDFgKVxuICAgICAgcmV0dXJuIHNlbGYuY29kZUdlbkFyZ1ZhbHVlKGFyZ3NbMF0pO1xuICAgIH0gZWxzZSBpZiAoYXJncy5sZW5ndGggPT09IDEpIHtcbiAgICAgIC8vIG9uZSBhcmd1bWVudCwgbXVzdCBiZSBhIFBBVEhcbiAgICAgIHJldHVybiAnU3BhY2ViYXJzLmNhbGwoJyArIHNlbGYuY29kZUdlblBhdGgoYXJnc1swXVsxXSkgKyAnKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE11bHRpcGxlIHBvc2l0aW9uYWwgYXJndW1lbnRzOyB0cmVhdCB0aGVtIGFzIGEgbmVzdGVkXG4gICAgICAvLyBcImRhdGEgbXVzdGFjaGVcIlxuICAgICAgcmV0dXJuIHNlbGYuY29kZUdlbk11c3RhY2hlKGFyZ3NbMF1bMV0sIGFyZ3Muc2xpY2UoMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGFNdXN0YWNoZScpO1xuICAgIH1cblxuICB9LFxuXG4gIGNvZGVHZW5JbmNsdXNpb25EYXRhRnVuYzogZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRhdGFDb2RlID0gc2VsZi5jb2RlR2VuSW5jbHVzaW9uRGF0YShhcmdzKTtcbiAgICBpZiAoZGF0YUNvZGUpIHtcbiAgICAgIHJldHVybiAnZnVuY3Rpb24gKCkgeyByZXR1cm4gJyArIGRhdGFDb2RlICsgJzsgfSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG59KTtcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgSFRNTFRvb2xzIH0gZnJvbSAnbWV0ZW9yL2h0bWwtdG9vbHMnO1xuaW1wb3J0IHsgSFRNTCB9IGZyb20gJ21ldGVvci9odG1sanMnO1xuaW1wb3J0IHsgQmxhemVUb29scyB9IGZyb20gJ21ldGVvci9ibGF6ZS10b29scyc7XG5pbXBvcnQgeyBDb2RlR2VuIH0gZnJvbSAnLi9jb2RlZ2VuJztcbmltcG9ydCB7IG9wdGltaXplIH0gZnJvbSAnLi9vcHRpbWl6ZXInO1xuaW1wb3J0IHsgUmVhY3RDb21wb25lbnRTaWJsaW5nRm9yYmlkZGVyfSBmcm9tICcuL3JlYWN0JztcbmltcG9ydCB7IFRlbXBsYXRlVGFnIH0gZnJvbSAnLi90ZW1wbGF0ZXRhZyc7XG5pbXBvcnQgeyByZW1vdmVXaGl0ZXNwYWNlIH0gZnJvbSAnLi93aGl0ZXNwYWNlJztcblxudmFyIFVnbGlmeUpTTWluaWZ5ID0gbnVsbDtcbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcbiAgVWdsaWZ5SlNNaW5pZnkgPSBOcG0ucmVxdWlyZSgndWdsaWZ5LWpzJykubWluaWZ5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UoaW5wdXQpIHtcbiAgcmV0dXJuIEhUTUxUb29scy5wYXJzZUZyYWdtZW50KFxuICAgIGlucHV0LFxuICAgIHsgZ2V0VGVtcGxhdGVUYWc6IFRlbXBsYXRlVGFnLnBhcnNlQ29tcGxldGVUYWcgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlKGlucHV0LCBvcHRpb25zKSB7XG4gIHZhciB0cmVlID0gcGFyc2UoaW5wdXQpO1xuICByZXR1cm4gY29kZUdlbih0cmVlLCBvcHRpb25zKTtcbn1cblxuZXhwb3J0IGNvbnN0IFRlbXBsYXRlVGFnUmVwbGFjZXIgPSBIVE1MLlRyYW5zZm9ybWluZ1Zpc2l0b3IuZXh0ZW5kKCk7XG5UZW1wbGF0ZVRhZ1JlcGxhY2VyLmRlZih7XG4gIHZpc2l0T2JqZWN0OiBmdW5jdGlvbiAoeCkge1xuICAgIGlmICh4IGluc3RhbmNlb2YgSFRNTFRvb2xzLlRlbXBsYXRlVGFnKSB7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSBhbGwgVGVtcGxhdGVUYWdzIGluIGF0dHJpYnV0ZXMgaGF2ZSB0aGUgcmlnaHRcbiAgICAgIC8vIGAucG9zaXRpb25gIHNldCBvbiB0aGVtLiAgVGhpcyBpcyBhIGJpdCBvZiBhIGhhY2tcbiAgICAgIC8vICh3ZSBzaG91bGRuJ3QgYmUgbXV0YXRpbmcgdGhhdCBoZXJlKSwgYnV0IGl0IGFsbG93c1xuICAgICAgLy8gY2xlYW5lciBjb2RlZ2VuIG9mIFwic3ludGhldGljXCIgYXR0cmlidXRlcyBsaWtlIFRFWFRBUkVBJ3NcbiAgICAgIC8vIFwidmFsdWVcIiwgd2hlcmUgdGhlIHRlbXBsYXRlIHRhZ3Mgd2VyZSBvcmlnaW5hbGx5IG5vdFxuICAgICAgLy8gaW4gYW4gYXR0cmlidXRlLlxuICAgICAgaWYgKHRoaXMuaW5BdHRyaWJ1dGVWYWx1ZSlcbiAgICAgICAgeC5wb3NpdGlvbiA9IEhUTUxUb29scy5URU1QTEFURV9UQUdfUE9TSVRJT04uSU5fQVRUUklCVVRFO1xuXG4gICAgICByZXR1cm4gdGhpcy5jb2RlZ2VuLmNvZGVHZW5UZW1wbGF0ZVRhZyh4KTtcbiAgICB9XG5cbiAgICByZXR1cm4gSFRNTC5UcmFuc2Zvcm1pbmdWaXNpdG9yLnByb3RvdHlwZS52aXNpdE9iamVjdC5jYWxsKHRoaXMsIHgpO1xuICB9LFxuICB2aXNpdEF0dHJpYnV0ZXM6IGZ1bmN0aW9uIChhdHRycykge1xuICAgIGlmIChhdHRycyBpbnN0YW5jZW9mIEhUTUxUb29scy5UZW1wbGF0ZVRhZylcbiAgICAgIHJldHVybiB0aGlzLmNvZGVnZW4uY29kZUdlblRlbXBsYXRlVGFnKGF0dHJzKTtcblxuICAgIC8vIGNhbGwgc3VwZXIgKGUuZy4gZm9yIGNhc2Ugd2hlcmUgYGF0dHJzYCBpcyBhbiBhcnJheSlcbiAgICByZXR1cm4gSFRNTC5UcmFuc2Zvcm1pbmdWaXNpdG9yLnByb3RvdHlwZS52aXNpdEF0dHJpYnV0ZXMuY2FsbCh0aGlzLCBhdHRycyk7XG4gIH0sXG4gIHZpc2l0QXR0cmlidXRlOiBmdW5jdGlvbiAobmFtZSwgdmFsdWUsIHRhZykge1xuICAgIHRoaXMuaW5BdHRyaWJ1dGVWYWx1ZSA9IHRydWU7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMudmlzaXQodmFsdWUpO1xuICAgIHRoaXMuaW5BdHRyaWJ1dGVWYWx1ZSA9IGZhbHNlO1xuXG4gICAgaWYgKHJlc3VsdCAhPT0gdmFsdWUpIHtcbiAgICAgIC8vIHNvbWUgdGVtcGxhdGUgdGFncyBtdXN0IGhhdmUgYmVlbiByZXBsYWNlZCwgYmVjYXVzZSBvdGhlcndpc2VcbiAgICAgIC8vIHdlIHRyeSB0byBrZWVwIHRoaW5ncyBgPT09YCB3aGVuIHRyYW5zZm9ybWluZy4gIFdyYXAgdGhlIGNvZGVcbiAgICAgIC8vIGluIGEgZnVuY3Rpb24gYXMgcGVyIHRoZSBydWxlcy4gIFlvdSBjYW4ndCBoYXZlXG4gICAgICAvLyBge2lkOiBCbGF6ZS5WaWV3KC4uLil9YCBhcyBhbiBhdHRyaWJ1dGVzIGRpY3QgYmVjYXVzZSB0aGUgVmlld1xuICAgICAgLy8gd291bGQgYmUgcmVuZGVyZWQgbW9yZSB0aGFuIG9uY2U7IHlvdSBuZWVkIHRvIHdyYXAgaXQgaW4gYSBmdW5jdGlvblxuICAgICAgLy8gc28gdGhhdCBpdCdzIGEgZGlmZmVyZW50IFZpZXcgZWFjaCB0aW1lLlxuICAgICAgcmV0dXJuIEJsYXplVG9vbHMuRW1pdENvZGUodGhpcy5jb2RlZ2VuLmNvZGVHZW5CbG9jayhyZXN1bHQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb2RlR2VuIChwYXJzZVRyZWUsIG9wdGlvbnMpIHtcbiAgLy8gaXMgdGhpcyBhIHRlbXBsYXRlLCByYXRoZXIgdGhhbiBhIGJsb2NrIHBhc3NlZCB0b1xuICAvLyBhIGJsb2NrIGhlbHBlciwgc2F5XG4gIHZhciBpc1RlbXBsYXRlID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5pc1RlbXBsYXRlKTtcbiAgdmFyIGlzQm9keSA9IChvcHRpb25zICYmIG9wdGlvbnMuaXNCb2R5KTtcbiAgdmFyIHdoaXRlc3BhY2UgPSAob3B0aW9ucyAmJiBvcHRpb25zLndoaXRlc3BhY2UpXG4gIHZhciBzb3VyY2VOYW1lID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5zb3VyY2VOYW1lKTtcblxuICB2YXIgdHJlZSA9IHBhcnNlVHJlZTtcblxuICAvLyBUaGUgZmxhZ3MgYGlzVGVtcGxhdGVgIGFuZCBgaXNCb2R5YCBhcmUga2luZCBvZiBhIGhhY2suXG4gIGlmIChpc1RlbXBsYXRlIHx8IGlzQm9keSkge1xuICAgIGlmICh0eXBlb2Ygd2hpdGVzcGFjZSA9PT0gJ3N0cmluZycgJiYgd2hpdGVzcGFjZS50b0xvd2VyQ2FzZSgpID09PSAnc3RyaXAnKSB7XG4gICAgICB0cmVlID0gcmVtb3ZlV2hpdGVzcGFjZSh0cmVlKTtcbiAgICB9XG4gICAgLy8gb3B0aW1pemluZyBmcmFnbWVudHMgd291bGQgcmVxdWlyZSBiZWluZyBzbWFydGVyIGFib3V0IHdoZXRoZXIgd2UgYXJlXG4gICAgLy8gaW4gYSBURVhUQVJFQSwgc2F5LlxuICAgIHRyZWUgPSBvcHRpbWl6ZSh0cmVlKTtcbiAgfVxuXG4gIC8vIHRocm93cyBhbiBlcnJvciBpZiB1c2luZyBge3s+IFJlYWN0fX1gIHdpdGggc2libGluZ3NcbiAgbmV3IFJlYWN0Q29tcG9uZW50U2libGluZ0ZvcmJpZGRlcih7c291cmNlTmFtZTogc291cmNlTmFtZX0pXG4gICAgLnZpc2l0KHRyZWUpO1xuXG4gIHZhciBjb2RlZ2VuID0gbmV3IENvZGVHZW47XG4gIHRyZWUgPSAobmV3IFRlbXBsYXRlVGFnUmVwbGFjZXIoXG4gICAge2NvZGVnZW46IGNvZGVnZW59KSkudmlzaXQodHJlZSk7XG5cbiAgdmFyIGNvZGUgPSAnKGZ1bmN0aW9uICgpIHsgJztcbiAgaWYgKGlzVGVtcGxhdGUgfHwgaXNCb2R5KSB7XG4gICAgY29kZSArPSAndmFyIHZpZXcgPSB0aGlzOyAnO1xuICB9XG4gIGNvZGUgKz0gJ3JldHVybiAnO1xuICBjb2RlICs9IEJsYXplVG9vbHMudG9KUyh0cmVlKTtcbiAgY29kZSArPSAnOyB9KSc7XG5cbiAgY29kZSA9IGJlYXV0aWZ5KGNvZGUpO1xuXG4gIHJldHVybiBjb2RlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmVhdXRpZnkgKGNvZGUpIHtcbiAgaWYgKCFVZ2xpZnlKU01pbmlmeSkge1xuICAgIHJldHVybiBjb2RlO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IFVnbGlmeUpTTWluaWZ5KGNvZGUsIHtcbiAgICBmcm9tU3RyaW5nOiB0cnVlLFxuICAgIG1hbmdsZTogZmFsc2UsXG4gICAgY29tcHJlc3M6IGZhbHNlLFxuICAgIG91dHB1dDoge1xuICAgICAgYmVhdXRpZnk6IHRydWUsXG4gICAgICBpbmRlbnRfbGV2ZWw6IDIsXG4gICAgICB3aWR0aDogODBcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBvdXRwdXQgPSByZXN1bHQuY29kZTtcbiAgLy8gVWdsaWZ5IGludGVycHJldHMgb3VyIGV4cHJlc3Npb24gYXMgYSBzdGF0ZW1lbnQgYW5kIG1heSBhZGQgYSBzZW1pY29sb24uXG4gIC8vIFN0cmlwIHRyYWlsaW5nIHNlbWljb2xvbi5cbiAgb3V0cHV0ID0gb3V0cHV0LnJlcGxhY2UoLzskLywgJycpO1xuICByZXR1cm4gb3V0cHV0O1xufVxuIiwiaW1wb3J0IHsgSFRNTFRvb2xzIH0gZnJvbSAnbWV0ZW9yL2h0bWwtdG9vbHMnO1xuaW1wb3J0IHsgSFRNTCB9IGZyb20gJ21ldGVvci9odG1sanMnO1xuXG4vLyBPcHRpbWl6ZSBwYXJ0cyBvZiBhbiBIVE1ManMgdHJlZSBpbnRvIHJhdyBIVE1MIHN0cmluZ3Mgd2hlbiB0aGV5IGRvbid0XG4vLyBjb250YWluIHRlbXBsYXRlIHRhZ3MuXG5cbnZhciBjb25zdGFudCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkgeyByZXR1cm4gdmFsdWU7IH07XG59O1xuXG52YXIgT1BUSU1JWkFCTEUgPSB7XG4gIE5PTkU6IDAsXG4gIFBBUlRTOiAxLFxuICBGVUxMOiAyXG59O1xuXG4vLyBXZSBjYW4gb25seSB0dXJuIGNvbnRlbnQgaW50byBhbiBIVE1MIHN0cmluZyBpZiBpdCBjb250YWlucyBubyB0ZW1wbGF0ZVxuLy8gdGFncyBhbmQgbm8gXCJ0cmlja3lcIiBIVE1MIHRhZ3MuICBJZiB3ZSBjYW4gb3B0aW1pemUgdGhlIGVudGlyZSBjb250ZW50XG4vLyBpbnRvIGEgc3RyaW5nLCB3ZSByZXR1cm4gT1BUSU1JWkFCTEUuRlVMTC4gIElmIHRoZSB3ZSBhcmUgZ2l2ZW4gYW5cbi8vIHVub3B0aW1pemFibGUgbm9kZSwgd2UgcmV0dXJuIE9QVElNSVpBQkxFLk5PTkUuICBJZiB3ZSBhcmUgZ2l2ZW4gYSB0cmVlXG4vLyB0aGF0IGNvbnRhaW5zIGFuIHVub3B0aW1pemFibGUgbm9kZSBzb21ld2hlcmUsIHdlIHJldHVybiBPUFRJTUlaQUJMRS5QQVJUUy5cbi8vXG4vLyBGb3IgZXhhbXBsZSwgd2UgYWx3YXlzIGNyZWF0ZSBTVkcgZWxlbWVudHMgcHJvZ3JhbW1hdGljYWxseSwgc2luY2UgU1ZHXG4vLyBkb2Vzbid0IGhhdmUgaW5uZXJIVE1MLiAgSWYgd2UgYXJlIGdpdmVuIGFuIFNWRyBlbGVtZW50LCB3ZSByZXR1cm4gTk9ORS5cbi8vIEhvd2V2ZXIsIGlmIHdlIGFyZSBnaXZlbiBhIGJpZyB0cmVlIHRoYXQgY29udGFpbnMgU1ZHIHNvbWV3aGVyZSwgd2Vcbi8vIHJldHVybiBQQVJUUyBzbyB0aGF0IHRoZSBvcHRpbWl6ZXIgY2FuIGRlc2NlbmQgaW50byB0aGUgdHJlZSBhbmQgb3B0aW1pemVcbi8vIG90aGVyIHBhcnRzIG9mIGl0LlxudmFyIENhbk9wdGltaXplVmlzaXRvciA9IEhUTUwuVmlzaXRvci5leHRlbmQoKTtcbkNhbk9wdGltaXplVmlzaXRvci5kZWYoe1xuICB2aXNpdE51bGw6IGNvbnN0YW50KE9QVElNSVpBQkxFLkZVTEwpLFxuICB2aXNpdFByaW1pdGl2ZTogY29uc3RhbnQoT1BUSU1JWkFCTEUuRlVMTCksXG4gIHZpc2l0Q29tbWVudDogY29uc3RhbnQoT1BUSU1JWkFCTEUuRlVMTCksXG4gIHZpc2l0Q2hhclJlZjogY29uc3RhbnQoT1BUSU1JWkFCTEUuRlVMTCksXG4gIHZpc2l0UmF3OiBjb25zdGFudChPUFRJTUlaQUJMRS5GVUxMKSxcbiAgdmlzaXRPYmplY3Q6IGNvbnN0YW50KE9QVElNSVpBQkxFLk5PTkUpLFxuICB2aXNpdEZ1bmN0aW9uOiBjb25zdGFudChPUFRJTUlaQUJMRS5OT05FKSxcbiAgdmlzaXRBcnJheTogZnVuY3Rpb24gKHgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKyspXG4gICAgICBpZiAodGhpcy52aXNpdCh4W2ldKSAhPT0gT1BUSU1JWkFCTEUuRlVMTClcbiAgICAgICAgcmV0dXJuIE9QVElNSVpBQkxFLlBBUlRTO1xuICAgIHJldHVybiBPUFRJTUlaQUJMRS5GVUxMO1xuICB9LFxuICB2aXNpdFRhZzogZnVuY3Rpb24gKHRhZykge1xuICAgIHZhciB0YWdOYW1lID0gdGFnLnRhZ05hbWU7XG4gICAgaWYgKHRhZ05hbWUgPT09ICd0ZXh0YXJlYScpIHtcbiAgICAgIC8vIG9wdGltaXppbmcgaW50byBhIFRFWFRBUkVBJ3MgUkNEQVRBIHdvdWxkIHJlcXVpcmUgYmVpbmcgYSBsaXR0bGVcbiAgICAgIC8vIG1vcmUgY2xldmVyLlxuICAgICAgcmV0dXJuIE9QVElNSVpBQkxFLk5PTkU7XG4gICAgfSBlbHNlIGlmICh0YWdOYW1lID09PSAnc2NyaXB0Jykge1xuICAgICAgLy8gc2NyaXB0IHRhZ3MgZG9uJ3Qgd29yayB3aGVuIHJlbmRlcmVkIGZyb20gc3RyaW5nc1xuICAgICAgcmV0dXJuIE9QVElNSVpBQkxFLk5PTkU7XG4gICAgfSBlbHNlIGlmICghIChIVE1MLmlzS25vd25FbGVtZW50KHRhZ05hbWUpICYmXG4gICAgICAgICAgICAgICAgICAhIEhUTUwuaXNLbm93blNWR0VsZW1lbnQodGFnTmFtZSkpKSB7XG4gICAgICAvLyBmb3JlaWduIGVsZW1lbnRzIGxpa2UgU1ZHIGNhbid0IGJlIHN0cmluZ2lmaWVkIGZvciBpbm5lckhUTUwuXG4gICAgICByZXR1cm4gT1BUSU1JWkFCTEUuTk9ORTtcbiAgICB9IGVsc2UgaWYgKHRhZ05hbWUgPT09ICd0YWJsZScpIHtcbiAgICAgIC8vIEF2b2lkIGV2ZXIgcHJvZHVjaW5nIEhUTUwgY29udGFpbmluZyBgPHRhYmxlPjx0cj4uLi5gLCBiZWNhdXNlIHRoZVxuICAgICAgLy8gYnJvd3NlciB3aWxsIGluc2VydCBhIFRCT0RZLiAgSWYgd2UganVzdCBgY3JlYXRlRWxlbWVudChcInRhYmxlXCIpYCBhbmRcbiAgICAgIC8vIGBjcmVhdGVFbGVtZW50KFwidHJcIilgLCBvbiB0aGUgb3RoZXIgaGFuZCwgbm8gVEJPRFkgaXMgbmVjZXNzYXJ5XG4gICAgICAvLyAoYXNzdW1pbmcgSUUgOCspLlxuICAgICAgcmV0dXJuIE9QVElNSVpBQkxFLlBBUlRTO1xuICAgIH0gZWxzZSBpZiAodGFnTmFtZSA9PT0gJ3RyJyl7XG4gICAgICByZXR1cm4gT1BUSU1JWkFCTEUuUEFSVFM7XG4gICAgfVxuXG4gICAgdmFyIGNoaWxkcmVuID0gdGFnLmNoaWxkcmVuO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspXG4gICAgICBpZiAodGhpcy52aXNpdChjaGlsZHJlbltpXSkgIT09IE9QVElNSVpBQkxFLkZVTEwpXG4gICAgICAgIHJldHVybiBPUFRJTUlaQUJMRS5QQVJUUztcblxuICAgIGlmICh0aGlzLnZpc2l0QXR0cmlidXRlcyh0YWcuYXR0cnMpICE9PSBPUFRJTUlaQUJMRS5GVUxMKVxuICAgICAgcmV0dXJuIE9QVElNSVpBQkxFLlBBUlRTO1xuXG4gICAgcmV0dXJuIE9QVElNSVpBQkxFLkZVTEw7XG4gIH0sXG4gIHZpc2l0QXR0cmlidXRlczogZnVuY3Rpb24gKGF0dHJzKSB7XG4gICAgaWYgKGF0dHJzKSB7XG4gICAgICB2YXIgaXNBcnJheSA9IEhUTUwuaXNBcnJheShhdHRycyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IChpc0FycmF5ID8gYXR0cnMubGVuZ3RoIDogMSk7IGkrKykge1xuICAgICAgICB2YXIgYSA9IChpc0FycmF5ID8gYXR0cnNbaV0gOiBhdHRycyk7XG4gICAgICAgIGlmICgodHlwZW9mIGEgIT09ICdvYmplY3QnKSB8fCAoYSBpbnN0YW5jZW9mIEhUTUxUb29scy5UZW1wbGF0ZVRhZykpXG4gICAgICAgICAgcmV0dXJuIE9QVElNSVpBQkxFLlBBUlRTO1xuICAgICAgICBmb3IgKHZhciBrIGluIGEpXG4gICAgICAgICAgaWYgKHRoaXMudmlzaXQoYVtrXSkgIT09IE9QVElNSVpBQkxFLkZVTEwpXG4gICAgICAgICAgICByZXR1cm4gT1BUSU1JWkFCTEUuUEFSVFM7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBPUFRJTUlaQUJMRS5GVUxMO1xuICB9XG59KTtcblxudmFyIGdldE9wdGltaXphYmlsaXR5ID0gZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAgcmV0dXJuIChuZXcgQ2FuT3B0aW1pemVWaXNpdG9yKS52aXNpdChjb250ZW50KTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiB0b1Jhdyh4KSB7XG4gIHJldHVybiBIVE1MLlJhdyhIVE1MLnRvSFRNTCh4KSk7XG59XG5cbmV4cG9ydCBjb25zdCBUcmVlVHJhbnNmb3JtZXIgPSBIVE1MLlRyYW5zZm9ybWluZ1Zpc2l0b3IuZXh0ZW5kKCk7XG5UcmVlVHJhbnNmb3JtZXIuZGVmKHtcbiAgdmlzaXRBdHRyaWJ1dGVzOiBmdW5jdGlvbiAoYXR0cnMvKiwgLi4uKi8pIHtcbiAgICAvLyBwYXNzIHRlbXBsYXRlIHRhZ3MgdGhyb3VnaCBieSBkZWZhdWx0XG4gICAgaWYgKGF0dHJzIGluc3RhbmNlb2YgSFRNTFRvb2xzLlRlbXBsYXRlVGFnKVxuICAgICAgcmV0dXJuIGF0dHJzO1xuXG4gICAgcmV0dXJuIEhUTUwuVHJhbnNmb3JtaW5nVmlzaXRvci5wcm90b3R5cGUudmlzaXRBdHRyaWJ1dGVzLmFwcGx5KFxuICAgICAgdGhpcywgYXJndW1lbnRzKTtcbiAgfVxufSk7XG5cbi8vIFJlcGxhY2UgcGFydHMgb2YgdGhlIEhUTUxqcyB0cmVlIHRoYXQgaGF2ZSBubyB0ZW1wbGF0ZSB0YWdzIChvclxuLy8gdHJpY2t5IEhUTUwgdGFncykgd2l0aCBIVE1MLlJhdyBvYmplY3RzIGNvbnRhaW5pbmcgcmF3IEhUTUwuXG52YXIgT3B0aW1pemluZ1Zpc2l0b3IgPSBUcmVlVHJhbnNmb3JtZXIuZXh0ZW5kKCk7XG5PcHRpbWl6aW5nVmlzaXRvci5kZWYoe1xuICB2aXNpdE51bGw6IHRvUmF3LFxuICB2aXNpdFByaW1pdGl2ZTogdG9SYXcsXG4gIHZpc2l0Q29tbWVudDogdG9SYXcsXG4gIHZpc2l0Q2hhclJlZjogdG9SYXcsXG4gIHZpc2l0QXJyYXk6IGZ1bmN0aW9uIChhcnJheSkge1xuICAgIHZhciBvcHRpbWl6YWJpbGl0eSA9IGdldE9wdGltaXphYmlsaXR5KGFycmF5KTtcbiAgICBpZiAob3B0aW1pemFiaWxpdHkgPT09IE9QVElNSVpBQkxFLkZVTEwpIHtcbiAgICAgIHJldHVybiB0b1JhdyhhcnJheSk7XG4gICAgfSBlbHNlIGlmIChvcHRpbWl6YWJpbGl0eSA9PT0gT1BUSU1JWkFCTEUuUEFSVFMpIHtcbiAgICAgIHJldHVybiBUcmVlVHJhbnNmb3JtZXIucHJvdG90eXBlLnZpc2l0QXJyYXkuY2FsbCh0aGlzLCBhcnJheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhcnJheTtcbiAgICB9XG4gIH0sXG4gIHZpc2l0VGFnOiBmdW5jdGlvbiAodGFnKSB7XG4gICAgdmFyIG9wdGltaXphYmlsaXR5ID0gZ2V0T3B0aW1pemFiaWxpdHkodGFnKTtcbiAgICBpZiAob3B0aW1pemFiaWxpdHkgPT09IE9QVElNSVpBQkxFLkZVTEwpIHtcbiAgICAgIHJldHVybiB0b1Jhdyh0YWcpO1xuICAgIH0gZWxzZSBpZiAob3B0aW1pemFiaWxpdHkgPT09IE9QVElNSVpBQkxFLlBBUlRTKSB7XG4gICAgICByZXR1cm4gVHJlZVRyYW5zZm9ybWVyLnByb3RvdHlwZS52aXNpdFRhZy5jYWxsKHRoaXMsIHRhZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0YWc7XG4gICAgfVxuICB9LFxuICB2aXNpdENoaWxkcmVuOiBmdW5jdGlvbiAoY2hpbGRyZW4pIHtcbiAgICAvLyBkb24ndCBvcHRpbWl6ZSB0aGUgY2hpbGRyZW4gYXJyYXkgaW50byBhIFJhdyBvYmplY3QhXG4gICAgcmV0dXJuIFRyZWVUcmFuc2Zvcm1lci5wcm90b3R5cGUudmlzaXRBcnJheS5jYWxsKHRoaXMsIGNoaWxkcmVuKTtcbiAgfSxcbiAgdmlzaXRBdHRyaWJ1dGVzOiBmdW5jdGlvbiAoYXR0cnMpIHtcbiAgICByZXR1cm4gYXR0cnM7XG4gIH1cbn0pO1xuXG4vLyBDb21iaW5lIGNvbnNlY3V0aXZlIEhUTUwuUmF3cy4gIFJlbW92ZSBlbXB0eSBvbmVzLlxudmFyIFJhd0NvbXBhY3RpbmdWaXNpdG9yID0gVHJlZVRyYW5zZm9ybWVyLmV4dGVuZCgpO1xuUmF3Q29tcGFjdGluZ1Zpc2l0b3IuZGVmKHtcbiAgdmlzaXRBcnJheTogZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpdGVtID0gYXJyYXlbaV07XG4gICAgICBpZiAoKGl0ZW0gaW5zdGFuY2VvZiBIVE1MLlJhdykgJiZcbiAgICAgICAgICAoKCEgaXRlbS52YWx1ZSkgfHxcbiAgICAgICAgICAgKHJlc3VsdC5sZW5ndGggJiZcbiAgICAgICAgICAgIChyZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdIGluc3RhbmNlb2YgSFRNTC5SYXcpKSkpIHtcbiAgICAgICAgLy8gdHdvIGNhc2VzOiBpdGVtIGlzIGFuIGVtcHR5IFJhdywgb3IgcHJldmlvdXMgaXRlbSBpc1xuICAgICAgICAvLyBhIFJhdyBhcyB3ZWxsLiAgSW4gdGhlIGxhdHRlciBjYXNlLCByZXBsYWNlIHRoZSBwcmV2aW91c1xuICAgICAgICAvLyBSYXcgd2l0aCBhIGxvbmdlciBvbmUgdGhhdCBpbmNsdWRlcyB0aGUgbmV3IFJhdy5cbiAgICAgICAgaWYgKGl0ZW0udmFsdWUpIHtcbiAgICAgICAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID0gSFRNTC5SYXcoXG4gICAgICAgICAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdLnZhbHVlICsgaXRlbS52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHRoaXMudmlzaXQoaXRlbSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59KTtcblxuLy8gUmVwbGFjZSBwb2ludGxlc3MgUmF3cyBsaWtlIGBIVE1sLlJhdygnZm9vJylgIHRoYXQgY29udGFpbiBubyBzcGVjaWFsXG4vLyBjaGFyYWN0ZXJzIHdpdGggc2ltcGxlIHN0cmluZ3MuXG52YXIgUmF3UmVwbGFjaW5nVmlzaXRvciA9IFRyZWVUcmFuc2Zvcm1lci5leHRlbmQoKTtcblJhd1JlcGxhY2luZ1Zpc2l0b3IuZGVmKHtcbiAgdmlzaXRSYXc6IGZ1bmN0aW9uIChyYXcpIHtcbiAgICB2YXIgaHRtbCA9IHJhdy52YWx1ZTtcbiAgICBpZiAoaHRtbC5pbmRleE9mKCcmJykgPCAwICYmIGh0bWwuaW5kZXhPZignPCcpIDwgMCkge1xuICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByYXc7XG4gICAgfVxuICB9XG59KTtcblxuZXhwb3J0IGZ1bmN0aW9uIG9wdGltaXplICh0cmVlKSB7XG4gIHRyZWUgPSAobmV3IE9wdGltaXppbmdWaXNpdG9yKS52aXNpdCh0cmVlKTtcbiAgdHJlZSA9IChuZXcgUmF3Q29tcGFjdGluZ1Zpc2l0b3IpLnZpc2l0KHRyZWUpO1xuICB0cmVlID0gKG5ldyBSYXdSZXBsYWNpbmdWaXNpdG9yKS52aXNpdCh0cmVlKTtcbiAgcmV0dXJuIHRyZWU7XG59XG4iLCJpbXBvcnQgeyBIVE1MVG9vbHMgfSBmcm9tICdtZXRlb3IvaHRtbC10b29scyc7XG5pbXBvcnQgeyBIVE1MIH0gZnJvbSAnbWV0ZW9yL2h0bWxqcyc7XG5pbXBvcnQgeyBCbGF6ZVRvb2xzIH0gZnJvbSAnbWV0ZW9yL2JsYXplLXRvb2xzJztcblxuLy8gQSB2aXNpdG9yIHRvIGVuc3VyZSB0aGF0IFJlYWN0IGNvbXBvbmVudHMgaW5jbHVkZWQgdmlhIHRoZSBge3s+XG4vLyBSZWFjdH19YCB0ZW1wbGF0ZSBkZWZpbmVkIGluIHRoZSByZWFjdC10ZW1wbGF0ZS1oZWxwZXIgcGFja2FnZSBhcmVcbi8vIHRoZSBvbmx5IGNoaWxkIGluIHRoZWlyIHBhcmVudCBjb21wb25lbnQuIE90aGVyd2lzZSBgUmVhY3QucmVuZGVyYFxuLy8gd291bGQgZWxpbWluYXRlIGFsbCBvZiB0aGVpciBzaWJsaW5nIG5vZGVzLlxuLy9cbi8vIEl0J3MgYSBsaXR0bGUgc3RyYW5nZSB0aGF0IHRoaXMgbG9naWMgaXMgaW4gc3BhY2ViYXJzLWNvbXBpbGVyIGlmXG4vLyBpdCdzIG9ubHkgcmVsZXZhbnQgdG8gYSBzcGVjaWZpYyBwYWNrYWdlIGJ1dCB0aGVyZSdzIG5vIHdheSB0byBoYXZlXG4vLyBhIHBhY2thZ2UgaG9vayBpbnRvIGEgYnVpbGQgcGx1Z2luLlxuZXhwb3J0IGNvbnN0IFJlYWN0Q29tcG9uZW50U2libGluZ0ZvcmJpZGRlciA9IEhUTUwuVmlzaXRvci5leHRlbmQoKTtcblJlYWN0Q29tcG9uZW50U2libGluZ0ZvcmJpZGRlci5kZWYoe1xuICB2aXNpdEFycmF5OiBmdW5jdGlvbiAoYXJyYXksIHBhcmVudFRhZykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMudmlzaXQoYXJyYXlbaV0sIHBhcmVudFRhZyk7XG4gICAgfVxuICB9LFxuICB2aXNpdE9iamVjdDogZnVuY3Rpb24gKG9iaiwgcGFyZW50VGFnKSB7XG4gICAgaWYgKG9iai50eXBlID09PSBcIklOQ0xVU0lPTlwiICYmIG9iai5wYXRoLmxlbmd0aCA9PT0gMSAmJiBvYmoucGF0aFswXSA9PT0gXCJSZWFjdFwiKSB7XG4gICAgICBpZiAoIXBhcmVudFRhZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgXCJ7ez4gUmVhY3R9fSBtdXN0IGJlIHVzZWQgaW4gYSBjb250YWluZXIgZWxlbWVudFwiXG4gICAgICAgICAgICArICh0aGlzLnNvdXJjZU5hbWUgPyAoXCIgaW4gXCIgKyB0aGlzLnNvdXJjZU5hbWUpIDogXCJcIilcbiAgICAgICAgICAgICAgICsgXCIuIExlYXJuIG1vcmUgYXQgaHR0cHM6Ly9naXRodWIuY29tL21ldGVvci9tZXRlb3Ivd2lraS9SZWFjdC1jb21wb25lbnRzLW11c3QtYmUtdGhlLW9ubHktdGhpbmctaW4tdGhlaXItd3JhcHBlci1lbGVtZW50XCIpO1xuICAgICAgfVxuXG4gICAgICB2YXIgbnVtU2libGluZ3MgPSAwO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJlbnRUYWcuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNoaWxkID0gcGFyZW50VGFnLmNoaWxkcmVuW2ldO1xuICAgICAgICBpZiAoY2hpbGQgIT09IG9iaiAmJiAhKHR5cGVvZiBjaGlsZCA9PT0gXCJzdHJpbmdcIiAmJiBjaGlsZC5tYXRjaCgvXlxccyokLykpKSB7XG4gICAgICAgICAgbnVtU2libGluZ3MrKztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobnVtU2libGluZ3MgPiAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBcInt7PiBSZWFjdH19IG11c3QgYmUgdXNlZCBhcyB0aGUgb25seSBjaGlsZCBpbiBhIGNvbnRhaW5lciBlbGVtZW50XCJcbiAgICAgICAgICAgICsgKHRoaXMuc291cmNlTmFtZSA/IChcIiBpbiBcIiArIHRoaXMuc291cmNlTmFtZSkgOiBcIlwiKVxuICAgICAgICAgICAgICAgKyBcIi4gTGVhcm4gbW9yZSBhdCBodHRwczovL2dpdGh1Yi5jb20vbWV0ZW9yL21ldGVvci93aWtpL1JlYWN0LWNvbXBvbmVudHMtbXVzdC1iZS10aGUtb25seS10aGluZy1pbi10aGVpci13cmFwcGVyLWVsZW1lbnRcIik7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICB2aXNpdFRhZzogZnVuY3Rpb24gKHRhZykge1xuICAgIHRoaXMudmlzaXRBcnJheSh0YWcuY2hpbGRyZW4sIHRhZyAvKnBhcmVudFRhZyovKTtcbiAgfVxufSk7XG4iLCJpbXBvcnQgeyBIVE1MVG9vbHMgfSBmcm9tICdtZXRlb3IvaHRtbC10b29scyc7XG5pbXBvcnQgeyBIVE1MIH0gZnJvbSAnbWV0ZW9yL2h0bWxqcyc7XG5pbXBvcnQgeyBCbGF6ZVRvb2xzIH0gZnJvbSAnbWV0ZW9yL2JsYXplLXRvb2xzJztcblxuLy8gQSBUZW1wbGF0ZVRhZyBpcyB0aGUgcmVzdWx0IG9mIHBhcnNpbmcgYSBzaW5nbGUgYHt7Li4ufX1gIHRhZy5cbi8vXG4vLyBUaGUgYC50eXBlYCBvZiBhIFRlbXBsYXRlVGFnIGlzIG9uZSBvZjpcbi8vXG4vLyAtIGBcIkRPVUJMRVwiYCAtIGB7e2Zvb319YFxuLy8gLSBgXCJUUklQTEVcImAgLSBge3t7Zm9vfX19YFxuLy8gLSBgXCJFWFBSXCJgIC0gYChmb28pYFxuLy8gLSBgXCJDT01NRU5UXCJgIC0gYHt7ISBmb299fWBcbi8vIC0gYFwiQkxPQ0tDT01NRU5UXCIgLSBge3shLS0gZm9vLS19fWBcbi8vIC0gYFwiSU5DTFVTSU9OXCJgIC0gYHt7PiBmb299fWBcbi8vIC0gYFwiQkxPQ0tPUEVOXCJgIC0gYHt7I2Zvb319YFxuLy8gLSBgXCJCTE9DS0NMT1NFXCJgIC0gYHt7L2Zvb319YFxuLy8gLSBgXCJFTFNFXCJgIC0gYHt7ZWxzZX19YFxuLy8gLSBgXCJFU0NBUEVcImAgLSBge3t8YCwgYHt7e3xgLCBge3t7e3xgIGFuZCBzbyBvblxuLy9cbi8vIEJlc2lkZXMgYHR5cGVgLCB0aGUgbWFuZGF0b3J5IHByb3BlcnRpZXMgb2YgYSBUZW1wbGF0ZVRhZyBhcmU6XG4vL1xuLy8gLSBgcGF0aGAgLSBBbiBhcnJheSBvZiBvbmUgb3IgbW9yZSBzdHJpbmdzLiAgVGhlIHBhdGggb2YgYHt7Zm9vLmJhcn19YFxuLy8gICBpcyBgW1wiZm9vXCIsIFwiYmFyXCJdYC4gIEFwcGxpZXMgdG8gRE9VQkxFLCBUUklQTEUsIElOQ0xVU0lPTiwgQkxPQ0tPUEVOLFxuLy8gICBCTE9DS0NMT1NFLCBhbmQgRUxTRS5cbi8vXG4vLyAtIGBhcmdzYCAtIEFuIGFycmF5IG9mIHplcm8gb3IgbW9yZSBhcmd1bWVudCBzcGVjcy4gIEFuIGFyZ3VtZW50IHNwZWNcbi8vICAgaXMgYSB0d28gb3IgdGhyZWUgZWxlbWVudCBhcnJheSwgY29uc2lzdGluZyBvZiBhIHR5cGUsIHZhbHVlLCBhbmRcbi8vICAgb3B0aW9uYWwga2V5d29yZCBuYW1lLiAgRm9yIGV4YW1wbGUsIHRoZSBgYXJnc2Agb2YgYHt7Zm9vIFwiYmFyXCIgeD0zfX1gXG4vLyAgIGFyZSBgW1tcIlNUUklOR1wiLCBcImJhclwiXSwgW1wiTlVNQkVSXCIsIDMsIFwieFwiXV1gLiAgQXBwbGllcyB0byBET1VCTEUsXG4vLyAgIFRSSVBMRSwgSU5DTFVTSU9OLCBCTE9DS09QRU4sIGFuZCBFTFNFLlxuLy9cbi8vIC0gYHZhbHVlYCAtIEEgc3RyaW5nIG9mIHRoZSBjb21tZW50J3MgdGV4dC4gQXBwbGllcyB0byBDT01NRU5UIGFuZFxuLy8gICBCTE9DS0NPTU1FTlQuXG4vL1xuLy8gVGhlc2UgYWRkaXRpb25hbCBhcmUgdHlwaWNhbGx5IHNldCBkdXJpbmcgcGFyc2luZzpcbi8vXG4vLyAtIGBwb3NpdGlvbmAgLSBUaGUgSFRNTFRvb2xzLlRFTVBMQVRFX1RBR19QT1NJVElPTiBzcGVjaWZ5aW5nIGF0IHdoYXQgc29ydFxuLy8gICBvZiBzaXRlIHRoZSBUZW1wbGF0ZVRhZyB3YXMgZW5jb3VudGVyZWQgKGUuZy4gYXQgZWxlbWVudCBsZXZlbCBvciBhc1xuLy8gICBwYXJ0IG9mIGFuIGF0dHJpYnV0ZSB2YWx1ZSkuIEl0cyBhYnNlbmNlIGltcGxpZXNcbi8vICAgVEVNUExBVEVfVEFHX1BPU0lUSU9OLkVMRU1FTlQuXG4vL1xuLy8gLSBgY29udGVudGAgYW5kIGBlbHNlQ29udGVudGAgLSBXaGVuIGEgQkxPQ0tPUEVOIHRhZydzIGNvbnRlbnRzIGFyZVxuLy8gICBwYXJzZWQsIHRoZXkgYXJlIHB1dCBoZXJlLiAgYGVsc2VDb250ZW50YCB3aWxsIG9ubHkgYmUgcHJlc2VudCBpZlxuLy8gICBhbiBge3tlbHNlfX1gIHdhcyBmb3VuZC5cblxudmFyIFRFTVBMQVRFX1RBR19QT1NJVElPTiA9IEhUTUxUb29scy5URU1QTEFURV9UQUdfUE9TSVRJT047XG5cbmV4cG9ydCBmdW5jdGlvbiBUZW1wbGF0ZVRhZyAoKSB7XG4gIEhUTUxUb29scy5UZW1wbGF0ZVRhZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5UZW1wbGF0ZVRhZy5wcm90b3R5cGUgPSBuZXcgSFRNTFRvb2xzLlRlbXBsYXRlVGFnO1xuVGVtcGxhdGVUYWcucHJvdG90eXBlLmNvbnN0cnVjdG9yTmFtZSA9ICdTcGFjZWJhcnNDb21waWxlci5UZW1wbGF0ZVRhZyc7XG5cbnZhciBtYWtlU3RhY2hlVGFnU3RhcnRSZWdleCA9IGZ1bmN0aW9uIChyKSB7XG4gIHJldHVybiBuZXcgUmVnRXhwKHIuc291cmNlICsgLyg/IVt7PiEjL10pLy5zb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgIHIuaWdub3JlQ2FzZSA/ICdpJyA6ICcnKTtcbn07XG5cbi8vIFwic3RhcnRzXCIgcmVnZXhlcyBhcmUgdXNlZCB0byBzZWUgd2hhdCB0eXBlIG9mIHRlbXBsYXRlXG4vLyB0YWcgdGhlIHBhcnNlciBpcyBsb29raW5nIGF0LiAgVGhleSBtdXN0IG1hdGNoIGEgbm9uLWVtcHR5XG4vLyByZXN1bHQsIGJ1dCBub3QgdGhlIGludGVyZXN0aW5nIHBhcnQgb2YgdGhlIHRhZy5cbnZhciBzdGFydHMgPSB7XG4gIEVTQ0FQRTogL15cXHtcXHsoPz1cXHsqXFx8KS8sXG4gIEVMU0U6IG1ha2VTdGFjaGVUYWdTdGFydFJlZ2V4KC9eXFx7XFx7XFxzKmVsc2UoXFxzKyg/IVxccyl8KD89W31dKSkvaSksXG4gIERPVUJMRTogbWFrZVN0YWNoZVRhZ1N0YXJ0UmVnZXgoL15cXHtcXHtcXHMqKD8hXFxzKS8pLFxuICBUUklQTEU6IG1ha2VTdGFjaGVUYWdTdGFydFJlZ2V4KC9eXFx7XFx7XFx7XFxzKig/IVxccykvKSxcbiAgQkxPQ0tDT01NRU5UOiBtYWtlU3RhY2hlVGFnU3RhcnRSZWdleCgvXlxce1xce1xccyohLS0vKSxcbiAgQ09NTUVOVDogbWFrZVN0YWNoZVRhZ1N0YXJ0UmVnZXgoL15cXHtcXHtcXHMqIS8pLFxuICBJTkNMVVNJT046IG1ha2VTdGFjaGVUYWdTdGFydFJlZ2V4KC9eXFx7XFx7XFxzKj5cXHMqKD8hXFxzKS8pLFxuICBCTE9DS09QRU46IG1ha2VTdGFjaGVUYWdTdGFydFJlZ2V4KC9eXFx7XFx7XFxzKiNcXHMqKD8hXFxzKS8pLFxuICBCTE9DS0NMT1NFOiBtYWtlU3RhY2hlVGFnU3RhcnRSZWdleCgvXlxce1xce1xccypcXC9cXHMqKD8hXFxzKS8pXG59O1xuXG52YXIgZW5kcyA9IHtcbiAgRE9VQkxFOiAvXlxccypcXH1cXH0vLFxuICBUUklQTEU6IC9eXFxzKlxcfVxcfVxcfS8sXG4gIEVYUFI6IC9eXFxzKlxcKS9cbn07XG5cbnZhciBlbmRzU3RyaW5nID0ge1xuICBET1VCTEU6ICd9fScsXG4gIFRSSVBMRTogJ319fScsXG4gIEVYUFI6ICcpJ1xufTtcblxuLy8gUGFyc2UgYSB0YWcgZnJvbSB0aGUgcHJvdmlkZWQgc2Nhbm5lciBvciBzdHJpbmcuICBJZiB0aGUgaW5wdXRcbi8vIGRvZXNuJ3Qgc3RhcnQgd2l0aCBge3tgLCByZXR1cm5zIG51bGwuICBPdGhlcndpc2UsIGVpdGhlciBzdWNjZWVkc1xuLy8gYW5kIHJldHVybnMgYSBTcGFjZWJhcnNDb21waWxlci5UZW1wbGF0ZVRhZywgb3IgdGhyb3dzIGFuIGVycm9yICh1c2luZ1xuLy8gYHNjYW5uZXIuZmF0YWxgIGlmIGEgc2Nhbm5lciBpcyBwcm92aWRlZCkuXG5UZW1wbGF0ZVRhZy5wYXJzZSA9IGZ1bmN0aW9uIChzY2FubmVyT3JTdHJpbmcpIHtcbiAgdmFyIHNjYW5uZXIgPSBzY2FubmVyT3JTdHJpbmc7XG4gIGlmICh0eXBlb2Ygc2Nhbm5lciA9PT0gJ3N0cmluZycpXG4gICAgc2Nhbm5lciA9IG5ldyBIVE1MVG9vbHMuU2Nhbm5lcihzY2FubmVyT3JTdHJpbmcpO1xuXG4gIGlmICghIChzY2FubmVyLnBlZWsoKSA9PT0gJ3snICYmXG4gICAgICAgICAoc2Nhbm5lci5yZXN0KCkpLnNsaWNlKDAsIDIpID09PSAne3snKSlcbiAgICByZXR1cm4gbnVsbDtcblxuICB2YXIgcnVuID0gZnVuY3Rpb24gKHJlZ2V4KSB7XG4gICAgLy8gcmVnZXggaXMgYXNzdW1lZCB0byBzdGFydCB3aXRoIGBeYFxuICAgIHZhciByZXN1bHQgPSByZWdleC5leGVjKHNjYW5uZXIucmVzdCgpKTtcbiAgICBpZiAoISByZXN1bHQpXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB2YXIgcmV0ID0gcmVzdWx0WzBdO1xuICAgIHNjYW5uZXIucG9zICs9IHJldC5sZW5ndGg7XG4gICAgcmV0dXJuIHJldDtcbiAgfTtcblxuICB2YXIgYWR2YW5jZSA9IGZ1bmN0aW9uIChhbW91bnQpIHtcbiAgICBzY2FubmVyLnBvcyArPSBhbW91bnQ7XG4gIH07XG5cbiAgdmFyIHNjYW5JZGVudGlmaWVyID0gZnVuY3Rpb24gKGlzRmlyc3RJblBhdGgpIHtcbiAgICB2YXIgaWQgPSBCbGF6ZVRvb2xzLnBhcnNlRXh0ZW5kZWRJZGVudGlmaWVyTmFtZShzY2FubmVyKTtcbiAgICBpZiAoISBpZCkge1xuICAgICAgZXhwZWN0ZWQoJ0lERU5USUZJRVInKTtcbiAgICB9XG4gICAgaWYgKGlzRmlyc3RJblBhdGggJiZcbiAgICAgICAgKGlkID09PSAnbnVsbCcgfHwgaWQgPT09ICd0cnVlJyB8fCBpZCA9PT0gJ2ZhbHNlJykpXG4gICAgICBzY2FubmVyLmZhdGFsKFwiQ2FuJ3QgdXNlIG51bGwsIHRydWUsIG9yIGZhbHNlLCBhcyBhbiBpZGVudGlmaWVyIGF0IHN0YXJ0IG9mIHBhdGhcIik7XG5cbiAgICByZXR1cm4gaWQ7XG4gIH07XG5cbiAgdmFyIHNjYW5QYXRoID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWdtZW50cyA9IFtdO1xuXG4gICAgLy8gaGFuZGxlIGluaXRpYWwgYC5gLCBgLi5gLCBgLi9gLCBgLi4vYCwgYC4uLy4uYCwgYC4uLy4uL2AsIGV0Y1xuICAgIHZhciBkb3RzO1xuICAgIGlmICgoZG90cyA9IHJ1bigvXltcXC5cXC9dKy8pKSkge1xuICAgICAgdmFyIGFuY2VzdG9yU3RyID0gJy4nOyAvLyBlZyBgLi4vLi4vLi5gIG1hcHMgdG8gYC4uLi5gXG4gICAgICB2YXIgZW5kc1dpdGhTbGFzaCA9IC9cXC8kLy50ZXN0KGRvdHMpO1xuXG4gICAgICBpZiAoZW5kc1dpdGhTbGFzaClcbiAgICAgICAgZG90cyA9IGRvdHMuc2xpY2UoMCwgLTEpO1xuXG4gICAgICBfLmVhY2goZG90cy5zcGxpdCgnLycpLCBmdW5jdGlvbihkb3RDbGF1c2UsIGluZGV4KSB7XG4gICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgIGlmIChkb3RDbGF1c2UgIT09ICcuJyAmJiBkb3RDbGF1c2UgIT09ICcuLicpXG4gICAgICAgICAgICBleHBlY3RlZChcImAuYCwgYC4uYCwgYC4vYCBvciBgLi4vYFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZG90Q2xhdXNlICE9PSAnLi4nKVxuICAgICAgICAgICAgZXhwZWN0ZWQoXCJgLi5gIG9yIGAuLi9gXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvdENsYXVzZSA9PT0gJy4uJylcbiAgICAgICAgICBhbmNlc3RvclN0ciArPSAnLic7XG4gICAgICB9KTtcblxuICAgICAgc2VnbWVudHMucHVzaChhbmNlc3RvclN0cik7XG5cbiAgICAgIGlmICghZW5kc1dpdGhTbGFzaClcbiAgICAgICAgcmV0dXJuIHNlZ21lbnRzO1xuICAgIH1cblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAvLyBzY2FuIGEgcGF0aCBzZWdtZW50XG5cbiAgICAgIGlmIChydW4oL15cXFsvKSkge1xuICAgICAgICB2YXIgc2VnID0gcnVuKC9eW1xcc1xcU10qP1xcXS8pO1xuICAgICAgICBpZiAoISBzZWcpXG4gICAgICAgICAgZXJyb3IoXCJVbnRlcm1pbmF0ZWQgcGF0aCBzZWdtZW50XCIpO1xuICAgICAgICBzZWcgPSBzZWcuc2xpY2UoMCwgLTEpO1xuICAgICAgICBpZiAoISBzZWcgJiYgISBzZWdtZW50cy5sZW5ndGgpXG4gICAgICAgICAgZXJyb3IoXCJQYXRoIGNhbid0IHN0YXJ0IHdpdGggZW1wdHkgc3RyaW5nXCIpO1xuICAgICAgICBzZWdtZW50cy5wdXNoKHNlZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaWQgPSBzY2FuSWRlbnRpZmllcighIHNlZ21lbnRzLmxlbmd0aCk7XG4gICAgICAgIGlmIChpZCA9PT0gJ3RoaXMnKSB7XG4gICAgICAgICAgaWYgKCEgc2VnbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBpbml0aWFsIGB0aGlzYFxuICAgICAgICAgICAgc2VnbWVudHMucHVzaCgnLicpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnJvcihcIkNhbiBvbmx5IHVzZSBgdGhpc2AgYXQgdGhlIGJlZ2lubmluZyBvZiBhIHBhdGguXFxuSW5zdGVhZCBvZiBgZm9vLnRoaXNgIG9yIGAuLi90aGlzYCwganVzdCB3cml0ZSBgZm9vYCBvciBgLi5gLlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VnbWVudHMucHVzaChpZCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHNlcCA9IHJ1bigvXltcXC5cXC9dLyk7XG4gICAgICBpZiAoISBzZXApXG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBzZWdtZW50cztcbiAgfTtcblxuICAvLyBzY2FuIHRoZSBrZXl3b3JkIHBvcnRpb24gb2YgYSBrZXl3b3JkIGFyZ3VtZW50XG4gIC8vICh0aGUgXCJmb29cIiBwb3J0aW9uIGluIFwiZm9vPWJhclwiKS5cbiAgLy8gUmVzdWx0IGlzIGVpdGhlciB0aGUga2V5d29yZCBtYXRjaGVkLCBvciBudWxsXG4gIC8vIGlmIHdlJ3JlIG5vdCBhdCBhIGtleXdvcmQgYXJndW1lbnQgcG9zaXRpb24uXG4gIHZhciBzY2FuQXJnS2V5d29yZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbWF0Y2ggPSAvXihbXlxce1xcfVxcKFxcKVxcPiM9XFxzXCInXFxbXFxdXSspXFxzKj1cXHMqLy5leGVjKHNjYW5uZXIucmVzdCgpKTtcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIHNjYW5uZXIucG9zICs9IG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgIHJldHVybiBtYXRjaFsxXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9O1xuXG4gIC8vIHNjYW4gYW4gYXJndW1lbnQ7IHN1Y2NlZWRzIG9yIGVycm9ycy5cbiAgLy8gUmVzdWx0IGlzIGFuIGFycmF5IG9mIHR3byBvciB0aHJlZSBpdGVtczpcbiAgLy8gdHlwZSAsIHZhbHVlLCBhbmQgKGluZGljYXRpbmcgYSBrZXl3b3JkIGFyZ3VtZW50KVxuICAvLyBrZXl3b3JkIG5hbWUuXG4gIHZhciBzY2FuQXJnID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBrZXl3b3JkID0gc2NhbkFyZ0tleXdvcmQoKTsgLy8gbnVsbCBpZiBub3QgcGFyc2luZyBhIGt3YXJnXG4gICAgdmFyIHZhbHVlID0gc2NhbkFyZ1ZhbHVlKCk7XG4gICAgcmV0dXJuIGtleXdvcmQgPyB2YWx1ZS5jb25jYXQoa2V5d29yZCkgOiB2YWx1ZTtcbiAgfTtcblxuICAvLyBzY2FuIGFuIGFyZ3VtZW50IHZhbHVlIChmb3Iga2V5d29yZCBvciBwb3NpdGlvbmFsIGFyZ3VtZW50cyk7XG4gIC8vIHN1Y2NlZWRzIG9yIGVycm9ycy4gIFJlc3VsdCBpcyBhbiBhcnJheSBvZiB0eXBlLCB2YWx1ZS5cbiAgdmFyIHNjYW5BcmdWYWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc3RhcnRQb3MgPSBzY2FubmVyLnBvcztcbiAgICB2YXIgcmVzdWx0O1xuICAgIGlmICgocmVzdWx0ID0gQmxhemVUb29scy5wYXJzZU51bWJlcihzY2FubmVyKSkpIHtcbiAgICAgIHJldHVybiBbJ05VTUJFUicsIHJlc3VsdC52YWx1ZV07XG4gICAgfSBlbHNlIGlmICgocmVzdWx0ID0gQmxhemVUb29scy5wYXJzZVN0cmluZ0xpdGVyYWwoc2Nhbm5lcikpKSB7XG4gICAgICByZXR1cm4gWydTVFJJTkcnLCByZXN1bHQudmFsdWVdO1xuICAgIH0gZWxzZSBpZiAoL15bXFwuXFxbXS8udGVzdChzY2FubmVyLnBlZWsoKSkpIHtcbiAgICAgIHJldHVybiBbJ1BBVEgnLCBzY2FuUGF0aCgpXTtcbiAgICB9IGVsc2UgaWYgKHJ1bigvXlxcKC8pKSB7XG4gICAgICByZXR1cm4gWydFWFBSJywgc2NhbkV4cHIoJ0VYUFInKV07XG4gICAgfSBlbHNlIGlmICgocmVzdWx0ID0gQmxhemVUb29scy5wYXJzZUV4dGVuZGVkSWRlbnRpZmllck5hbWUoc2Nhbm5lcikpKSB7XG4gICAgICB2YXIgaWQgPSByZXN1bHQ7XG4gICAgICBpZiAoaWQgPT09ICdudWxsJykge1xuICAgICAgICByZXR1cm4gWydOVUxMJywgbnVsbF07XG4gICAgICB9IGVsc2UgaWYgKGlkID09PSAndHJ1ZScgfHwgaWQgPT09ICdmYWxzZScpIHtcbiAgICAgICAgcmV0dXJuIFsnQk9PTEVBTicsIGlkID09PSAndHJ1ZSddO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2Nhbm5lci5wb3MgPSBzdGFydFBvczsgLy8gdW5jb25zdW1lIGBpZGBcbiAgICAgICAgcmV0dXJuIFsnUEFUSCcsIHNjYW5QYXRoKCldO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBleHBlY3RlZCgnaWRlbnRpZmllciwgbnVtYmVyLCBzdHJpbmcsIGJvb2xlYW4sIG51bGwsIG9yIGEgc3ViIGV4cHJlc3Npb24gZW5jbG9zZWQgaW4gXCIoXCIsIFwiKVwiJyk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBzY2FuRXhwciA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgdmFyIGVuZFR5cGUgPSB0eXBlO1xuICAgIGlmICh0eXBlID09PSAnSU5DTFVTSU9OJyB8fCB0eXBlID09PSAnQkxPQ0tPUEVOJyB8fCB0eXBlID09PSAnRUxTRScpXG4gICAgICBlbmRUeXBlID0gJ0RPVUJMRSc7XG5cbiAgICB2YXIgdGFnID0gbmV3IFRlbXBsYXRlVGFnO1xuICAgIHRhZy50eXBlID0gdHlwZTtcbiAgICB0YWcucGF0aCA9IHNjYW5QYXRoKCk7XG4gICAgdGFnLmFyZ3MgPSBbXTtcbiAgICB2YXIgZm91bmRLd0FyZyA9IGZhbHNlO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBydW4oL15cXHMqLyk7XG4gICAgICBpZiAocnVuKGVuZHNbZW5kVHlwZV0pKVxuICAgICAgICBicmVhaztcbiAgICAgIGVsc2UgaWYgKC9eW30pXS8udGVzdChzY2FubmVyLnBlZWsoKSkpIHtcbiAgICAgICAgZXhwZWN0ZWQoJ2AnICsgZW5kc1N0cmluZ1tlbmRUeXBlXSArICdgJyk7XG4gICAgICB9XG4gICAgICB2YXIgbmV3QXJnID0gc2NhbkFyZygpO1xuICAgICAgaWYgKG5ld0FyZy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgZm91bmRLd0FyZyA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZm91bmRLd0FyZylcbiAgICAgICAgICBlcnJvcihcIkNhbid0IGhhdmUgYSBub24ta2V5d29yZCBhcmd1bWVudCBhZnRlciBhIGtleXdvcmQgYXJndW1lbnRcIik7XG4gICAgICB9XG4gICAgICB0YWcuYXJncy5wdXNoKG5ld0FyZyk7XG5cbiAgICAgIC8vIGV4cGVjdCBhIHdoaXRlc3BhY2Ugb3IgYSBjbG9zaW5nICcpJyBvciAnfSdcbiAgICAgIGlmIChydW4oL14oPz1bXFxzfSldKS8pICE9PSAnJylcbiAgICAgICAgZXhwZWN0ZWQoJ3NwYWNlJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhZztcbiAgfTtcblxuICB2YXIgdHlwZTtcblxuICB2YXIgZXJyb3IgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgc2Nhbm5lci5mYXRhbChtc2cpO1xuICB9O1xuXG4gIHZhciBleHBlY3RlZCA9IGZ1bmN0aW9uICh3aGF0KSB7XG4gICAgZXJyb3IoJ0V4cGVjdGVkICcgKyB3aGF0KTtcbiAgfTtcblxuICAvLyBtdXN0IGRvIEVTQ0FQRSBmaXJzdCwgaW1tZWRpYXRlbHkgZm9sbG93ZWQgYnkgRUxTRVxuICAvLyBvcmRlciBvZiBvdGhlcnMgZG9lc24ndCBtYXR0ZXJcbiAgaWYgKHJ1bihzdGFydHMuRVNDQVBFKSkgdHlwZSA9ICdFU0NBUEUnO1xuICBlbHNlIGlmIChydW4oc3RhcnRzLkVMU0UpKSB0eXBlID0gJ0VMU0UnO1xuICBlbHNlIGlmIChydW4oc3RhcnRzLkRPVUJMRSkpIHR5cGUgPSAnRE9VQkxFJztcbiAgZWxzZSBpZiAocnVuKHN0YXJ0cy5UUklQTEUpKSB0eXBlID0gJ1RSSVBMRSc7XG4gIGVsc2UgaWYgKHJ1bihzdGFydHMuQkxPQ0tDT01NRU5UKSkgdHlwZSA9ICdCTE9DS0NPTU1FTlQnO1xuICBlbHNlIGlmIChydW4oc3RhcnRzLkNPTU1FTlQpKSB0eXBlID0gJ0NPTU1FTlQnO1xuICBlbHNlIGlmIChydW4oc3RhcnRzLklOQ0xVU0lPTikpIHR5cGUgPSAnSU5DTFVTSU9OJztcbiAgZWxzZSBpZiAocnVuKHN0YXJ0cy5CTE9DS09QRU4pKSB0eXBlID0gJ0JMT0NLT1BFTic7XG4gIGVsc2UgaWYgKHJ1bihzdGFydHMuQkxPQ0tDTE9TRSkpIHR5cGUgPSAnQkxPQ0tDTE9TRSc7XG4gIGVsc2VcbiAgICBlcnJvcignVW5rbm93biBzdGFjaGUgdGFnJyk7XG5cbiAgdmFyIHRhZyA9IG5ldyBUZW1wbGF0ZVRhZztcbiAgdGFnLnR5cGUgPSB0eXBlO1xuXG4gIGlmICh0eXBlID09PSAnQkxPQ0tDT01NRU5UJykge1xuICAgIHZhciByZXN1bHQgPSBydW4oL15bXFxzXFxTXSo/LS1cXHMqP1xcfVxcfS8pO1xuICAgIGlmICghIHJlc3VsdClcbiAgICAgIGVycm9yKFwiVW5jbG9zZWQgYmxvY2sgY29tbWVudFwiKTtcbiAgICB0YWcudmFsdWUgPSByZXN1bHQuc2xpY2UoMCwgcmVzdWx0Lmxhc3RJbmRleE9mKCctLScpKTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnQ09NTUVOVCcpIHtcbiAgICB2YXIgcmVzdWx0ID0gcnVuKC9eW1xcc1xcU10qP1xcfVxcfS8pO1xuICAgIGlmICghIHJlc3VsdClcbiAgICAgIGVycm9yKFwiVW5jbG9zZWQgY29tbWVudFwiKTtcbiAgICB0YWcudmFsdWUgPSByZXN1bHQuc2xpY2UoMCwgLTIpO1xuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdCTE9DS0NMT1NFJykge1xuICAgIHRhZy5wYXRoID0gc2NhblBhdGgoKTtcbiAgICBpZiAoISBydW4oZW5kcy5ET1VCTEUpKVxuICAgICAgZXhwZWN0ZWQoJ2B9fWAnKTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnRUxTRScpIHtcbiAgICBpZiAoISBydW4oZW5kcy5ET1VCTEUpKSB7XG4gICAgICB0YWcgPSBzY2FuRXhwcih0eXBlKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0VTQ0FQRScpIHtcbiAgICB2YXIgcmVzdWx0ID0gcnVuKC9eXFx7KlxcfC8pO1xuICAgIHRhZy52YWx1ZSA9ICd7eycgKyByZXN1bHQuc2xpY2UoMCwgLTEpO1xuICB9IGVsc2Uge1xuICAgIC8vIERPVUJMRSwgVFJJUExFLCBCTE9DS09QRU4sIElOQ0xVU0lPTlxuICAgIHRhZyA9IHNjYW5FeHByKHR5cGUpO1xuICB9XG5cbiAgcmV0dXJuIHRhZztcbn07XG5cbi8vIFJldHVybnMgYSBTcGFjZWJhcnNDb21waWxlci5UZW1wbGF0ZVRhZyBwYXJzZWQgZnJvbSBgc2Nhbm5lcmAsIGxlYXZpbmcgc2Nhbm5lclxuLy8gYXQgaXRzIG9yaWdpbmFsIHBvc2l0aW9uLlxuLy9cbi8vIEFuIGVycm9yIHdpbGwgc3RpbGwgYmUgdGhyb3duIGlmIHRoZXJlIGlzIG5vdCBhIHZhbGlkIHRlbXBsYXRlIHRhZyBhdFxuLy8gdGhlIGN1cnJlbnQgcG9zaXRpb24uXG5UZW1wbGF0ZVRhZy5wZWVrID0gZnVuY3Rpb24gKHNjYW5uZXIpIHtcbiAgdmFyIHN0YXJ0UG9zID0gc2Nhbm5lci5wb3M7XG4gIHZhciByZXN1bHQgPSBUZW1wbGF0ZVRhZy5wYXJzZShzY2FubmVyKTtcbiAgc2Nhbm5lci5wb3MgPSBzdGFydFBvcztcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8vIExpa2UgYFRlbXBsYXRlVGFnLnBhcnNlYCwgYnV0IGluIHRoZSBjYXNlIG9mIGJsb2NrcywgcGFyc2UgdGhlIGNvbXBsZXRlXG4vLyBge3sjZm9vfX0uLi57ey9mb299fWAgd2l0aCBgY29udGVudGAgYW5kIHBvc3NpYmxlIGBlbHNlQ29udGVudGAsIHJhdGhlclxuLy8gdGhhbiBqdXN0IHRoZSBCTE9DS09QRU4gdGFnLlxuLy9cbi8vIEluIGFkZGl0aW9uOlxuLy9cbi8vIC0gVGhyb3dzIGFuIGVycm9yIGlmIGB7e2Vsc2V9fWAgb3IgYHt7L2Zvb319YCB0YWcgaXMgZW5jb3VudGVyZWQuXG4vL1xuLy8gLSBSZXR1cm5zIGBudWxsYCBmb3IgYSBDT01NRU5ULiAgKFRoaXMgY2FzZSBpcyBkaXN0aW5ndWlzaGFibGUgZnJvbVxuLy8gICBwYXJzaW5nIG5vIHRhZyBieSB0aGUgZmFjdCB0aGF0IHRoZSBzY2FubmVyIGlzIGFkdmFuY2VkLilcbi8vXG4vLyAtIFRha2VzIGFuIEhUTUxUb29scy5URU1QTEFURV9UQUdfUE9TSVRJT04gYHBvc2l0aW9uYCBhbmQgc2V0cyBpdCBhcyB0aGVcbi8vICAgVGVtcGxhdGVUYWcncyBgLnBvc2l0aW9uYCBwcm9wZXJ0eS5cbi8vXG4vLyAtIFZhbGlkYXRlcyB0aGUgdGFnJ3Mgd2VsbC1mb3JtZWRuZXNzIGFuZCBsZWdhbGl0eSBhdCBpbiBpdHMgcG9zaXRpb24uXG5UZW1wbGF0ZVRhZy5wYXJzZUNvbXBsZXRlVGFnID0gZnVuY3Rpb24gKHNjYW5uZXJPclN0cmluZywgcG9zaXRpb24pIHtcbiAgdmFyIHNjYW5uZXIgPSBzY2FubmVyT3JTdHJpbmc7XG4gIGlmICh0eXBlb2Ygc2Nhbm5lciA9PT0gJ3N0cmluZycpXG4gICAgc2Nhbm5lciA9IG5ldyBIVE1MVG9vbHMuU2Nhbm5lcihzY2FubmVyT3JTdHJpbmcpO1xuXG4gIHZhciBzdGFydFBvcyA9IHNjYW5uZXIucG9zOyAvLyBmb3IgZXJyb3IgbWVzc2FnZXNcbiAgdmFyIHJlc3VsdCA9IFRlbXBsYXRlVGFnLnBhcnNlKHNjYW5uZXJPclN0cmluZyk7XG4gIGlmICghIHJlc3VsdClcbiAgICByZXR1cm4gcmVzdWx0O1xuXG4gIGlmIChyZXN1bHQudHlwZSA9PT0gJ0JMT0NLQ09NTUVOVCcpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgaWYgKHJlc3VsdC50eXBlID09PSAnQ09NTUVOVCcpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgaWYgKHJlc3VsdC50eXBlID09PSAnRUxTRScpXG4gICAgc2Nhbm5lci5mYXRhbChcIlVuZXhwZWN0ZWQge3tlbHNlfX1cIik7XG5cbiAgaWYgKHJlc3VsdC50eXBlID09PSAnQkxPQ0tDTE9TRScpXG4gICAgc2Nhbm5lci5mYXRhbChcIlVuZXhwZWN0ZWQgY2xvc2luZyB0ZW1wbGF0ZSB0YWdcIik7XG5cbiAgcG9zaXRpb24gPSAocG9zaXRpb24gfHwgVEVNUExBVEVfVEFHX1BPU0lUSU9OLkVMRU1FTlQpO1xuICBpZiAocG9zaXRpb24gIT09IFRFTVBMQVRFX1RBR19QT1NJVElPTi5FTEVNRU5UKVxuICAgIHJlc3VsdC5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuXG4gIGlmIChyZXN1bHQudHlwZSA9PT0gJ0JMT0NLT1BFTicpIHtcbiAgICAvLyBwYXJzZSBibG9jayBjb250ZW50c1xuXG4gICAgLy8gQ29uc3RydWN0IGEgc3RyaW5nIHZlcnNpb24gb2YgYC5wYXRoYCBmb3IgY29tcGFyaW5nIHN0YXJ0IGFuZFxuICAgIC8vIGVuZCB0YWdzLiAgRm9yIGV4YW1wbGUsIGBmb28vWzBdYCB3YXMgcGFyc2VkIGludG8gYFtcImZvb1wiLCBcIjBcIl1gXG4gICAgLy8gYW5kIG5vdyBiZWNvbWVzIGBmb28sMGAuICBUaGlzIGZvcm0gbWF5IGFsc28gc2hvdyB1cCBpbiBlcnJvclxuICAgIC8vIG1lc3NhZ2VzLlxuICAgIHZhciBibG9ja05hbWUgPSByZXN1bHQucGF0aC5qb2luKCcsJyk7XG5cbiAgICB2YXIgdGV4dE1vZGUgPSBudWxsO1xuICAgICAgaWYgKGJsb2NrTmFtZSA9PT0gJ21hcmtkb3duJyB8fFxuICAgICAgICAgIHBvc2l0aW9uID09PSBURU1QTEFURV9UQUdfUE9TSVRJT04uSU5fUkFXVEVYVCkge1xuICAgICAgICB0ZXh0TW9kZSA9IEhUTUwuVEVYVE1PREUuU1RSSU5HO1xuICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gVEVNUExBVEVfVEFHX1BPU0lUSU9OLklOX1JDREFUQSB8fFxuICAgICAgICAgICAgICAgICBwb3NpdGlvbiA9PT0gVEVNUExBVEVfVEFHX1BPU0lUSU9OLklOX0FUVFJJQlVURSkge1xuICAgICAgICB0ZXh0TW9kZSA9IEhUTUwuVEVYVE1PREUuUkNEQVRBO1xuICAgICAgfVxuICAgICAgdmFyIHBhcnNlck9wdGlvbnMgPSB7XG4gICAgICAgIGdldFRlbXBsYXRlVGFnOiBUZW1wbGF0ZVRhZy5wYXJzZUNvbXBsZXRlVGFnLFxuICAgICAgICBzaG91bGRTdG9wOiBpc0F0QmxvY2tDbG9zZU9yRWxzZSxcbiAgICAgICAgdGV4dE1vZGU6IHRleHRNb2RlXG4gICAgICB9O1xuICAgIHJlc3VsdC50ZXh0TW9kZSA9IHRleHRNb2RlO1xuICAgIHJlc3VsdC5jb250ZW50ID0gSFRNTFRvb2xzLnBhcnNlRnJhZ21lbnQoc2Nhbm5lciwgcGFyc2VyT3B0aW9ucyk7XG5cbiAgICBpZiAoc2Nhbm5lci5yZXN0KCkuc2xpY2UoMCwgMikgIT09ICd7eycpXG4gICAgICBzY2FubmVyLmZhdGFsKFwiRXhwZWN0ZWQge3tlbHNlfX0gb3IgYmxvY2sgY2xvc2UgZm9yIFwiICsgYmxvY2tOYW1lKTtcblxuICAgIHZhciBsYXN0UG9zID0gc2Nhbm5lci5wb3M7IC8vIHNhdmUgZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgdmFyIHRtcGxUYWcgPSBUZW1wbGF0ZVRhZy5wYXJzZShzY2FubmVyKTsgLy8ge3tlbHNlfX0gb3Ige3svZm9vfX1cblxuICAgIHZhciBsYXN0RWxzZUNvbnRlbnRUYWcgPSByZXN1bHQ7XG4gICAgd2hpbGUgKHRtcGxUYWcudHlwZSA9PT0gJ0VMU0UnKSB7XG4gICAgICBpZiAobGFzdEVsc2VDb250ZW50VGFnID09PSBudWxsKSB7XG4gICAgICAgIHNjYW5uZXIuZmF0YWwoXCJVbmV4cGVjdGVkIGVsc2UgYWZ0ZXIge3tlbHNlfX1cIik7XG4gICAgICB9XG5cbiAgICAgIGlmICh0bXBsVGFnLnBhdGgpIHtcbiAgICAgICAgbGFzdEVsc2VDb250ZW50VGFnLmVsc2VDb250ZW50ID0gbmV3IFRlbXBsYXRlVGFnO1xuICAgICAgICBsYXN0RWxzZUNvbnRlbnRUYWcuZWxzZUNvbnRlbnQudHlwZSA9ICdCTE9DS09QRU4nO1xuICAgICAgICBsYXN0RWxzZUNvbnRlbnRUYWcuZWxzZUNvbnRlbnQucGF0aCA9IHRtcGxUYWcucGF0aDtcbiAgICAgICAgbGFzdEVsc2VDb250ZW50VGFnLmVsc2VDb250ZW50LmFyZ3MgPSB0bXBsVGFnLmFyZ3M7XG4gICAgICAgIGxhc3RFbHNlQ29udGVudFRhZy5lbHNlQ29udGVudC50ZXh0TW9kZSA9IHRleHRNb2RlO1xuICAgICAgICBsYXN0RWxzZUNvbnRlbnRUYWcuZWxzZUNvbnRlbnQuY29udGVudCA9IEhUTUxUb29scy5wYXJzZUZyYWdtZW50KHNjYW5uZXIsIHBhcnNlck9wdGlvbnMpO1xuXG4gICAgICAgIGxhc3RFbHNlQ29udGVudFRhZyA9IGxhc3RFbHNlQ29udGVudFRhZy5lbHNlQ29udGVudDtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBwYXJzZSB7e2Vsc2V9fSBhbmQgY29udGVudCB1cCB0byBjbG9zZSB0YWdcbiAgICAgICAgbGFzdEVsc2VDb250ZW50VGFnLmVsc2VDb250ZW50ID0gSFRNTFRvb2xzLnBhcnNlRnJhZ21lbnQoc2Nhbm5lciwgcGFyc2VyT3B0aW9ucyk7XG5cbiAgICAgICAgbGFzdEVsc2VDb250ZW50VGFnID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHNjYW5uZXIucmVzdCgpLnNsaWNlKDAsIDIpICE9PSAne3snKVxuICAgICAgICBzY2FubmVyLmZhdGFsKFwiRXhwZWN0ZWQgYmxvY2sgY2xvc2UgZm9yIFwiICsgYmxvY2tOYW1lKTtcblxuICAgICAgbGFzdFBvcyA9IHNjYW5uZXIucG9zO1xuICAgICAgdG1wbFRhZyA9IFRlbXBsYXRlVGFnLnBhcnNlKHNjYW5uZXIpO1xuICAgIH1cblxuICAgIGlmICh0bXBsVGFnLnR5cGUgPT09ICdCTE9DS0NMT1NFJykge1xuICAgICAgdmFyIGJsb2NrTmFtZTIgPSB0bXBsVGFnLnBhdGguam9pbignLCcpO1xuICAgICAgaWYgKGJsb2NrTmFtZSAhPT0gYmxvY2tOYW1lMikge1xuICAgICAgICBzY2FubmVyLnBvcyA9IGxhc3RQb3M7XG4gICAgICAgIHNjYW5uZXIuZmF0YWwoJ0V4cGVjdGVkIHRhZyB0byBjbG9zZSAnICsgYmxvY2tOYW1lICsgJywgZm91bmQgJyArXG4gICAgICAgICAgICAgICAgICAgICAgYmxvY2tOYW1lMik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHNjYW5uZXIucG9zID0gbGFzdFBvcztcbiAgICAgIHNjYW5uZXIuZmF0YWwoJ0V4cGVjdGVkIHRhZyB0byBjbG9zZSAnICsgYmxvY2tOYW1lICsgJywgZm91bmQgJyArXG4gICAgICAgICAgICAgICAgICAgIHRtcGxUYWcudHlwZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGZpbmFsUG9zID0gc2Nhbm5lci5wb3M7XG4gIHNjYW5uZXIucG9zID0gc3RhcnRQb3M7XG4gIHZhbGlkYXRlVGFnKHJlc3VsdCwgc2Nhbm5lcik7XG4gIHNjYW5uZXIucG9zID0gZmluYWxQb3M7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbnZhciBpc0F0QmxvY2tDbG9zZU9yRWxzZSA9IGZ1bmN0aW9uIChzY2FubmVyKSB7XG4gIC8vIERldGVjdCBge3tlbHNlfX1gIG9yIGB7ey9mb299fWAuXG4gIC8vXG4gIC8vIFdlIGRvIGFzIG11Y2ggd29yayBvdXJzZWx2ZXMgYmVmb3JlIGRlZmVycmluZyB0byBgVGVtcGxhdGVUYWcucGVla2AsXG4gIC8vIGZvciBlZmZpY2llbmN5ICh3ZSdyZSBjYWxsZWQgZm9yIGV2ZXJ5IGlucHV0IHRva2VuKSBhbmQgdG8gYmVcbiAgLy8gbGVzcyBvYnRydXNpdmUsIGJlY2F1c2UgYFRlbXBsYXRlVGFnLnBlZWtgIHdpbGwgdGhyb3cgYW4gZXJyb3IgaWYgaXRcbiAgLy8gc2VlcyBge3tgIGZvbGxvd2VkIGJ5IGEgbWFsZm9ybWVkIHRhZy5cbiAgdmFyIHJlc3QsIHR5cGU7XG4gIHJldHVybiAoc2Nhbm5lci5wZWVrKCkgPT09ICd7JyAmJlxuICAgICAgICAgIChyZXN0ID0gc2Nhbm5lci5yZXN0KCkpLnNsaWNlKDAsIDIpID09PSAne3snICYmXG4gICAgICAgICAgL15cXHtcXHtcXHMqKFxcL3xlbHNlXFxiKS8udGVzdChyZXN0KSAmJlxuICAgICAgICAgICh0eXBlID0gVGVtcGxhdGVUYWcucGVlayhzY2FubmVyKS50eXBlKSAmJlxuICAgICAgICAgICh0eXBlID09PSAnQkxPQ0tDTE9TRScgfHwgdHlwZSA9PT0gJ0VMU0UnKSk7XG59O1xuXG4vLyBWYWxpZGF0ZSB0aGF0IGB0ZW1wbGF0ZVRhZ2AgaXMgY29ycmVjdGx5IGZvcm1lZCBhbmQgbGVnYWwgZm9yIGl0c1xuLy8gSFRNTCBwb3NpdGlvbi4gIFVzZSBgc2Nhbm5lcmAgdG8gcmVwb3J0IGVycm9ycy4gT24gc3VjY2VzcywgZG9lc1xuLy8gbm90aGluZy5cbnZhciB2YWxpZGF0ZVRhZyA9IGZ1bmN0aW9uICh0dGFnLCBzY2FubmVyKSB7XG5cbiAgaWYgKHR0YWcudHlwZSA9PT0gJ0lOQ0xVU0lPTicgfHwgdHRhZy50eXBlID09PSAnQkxPQ0tPUEVOJykge1xuICAgIHZhciBhcmdzID0gdHRhZy5hcmdzO1xuICAgIGlmICh0dGFnLnBhdGhbMF0gPT09ICdlYWNoJyAmJiBhcmdzWzFdICYmIGFyZ3NbMV1bMF0gPT09ICdQQVRIJyAmJlxuICAgICAgICBhcmdzWzFdWzFdWzBdID09PSAnaW4nKSB7XG4gICAgICAvLyBGb3Igc2xpZ2h0bHkgYmV0dGVyIGVycm9yIG1lc3NhZ2VzLCB3ZSBkZXRlY3QgdGhlIGVhY2gtaW4gY2FzZVxuICAgICAgLy8gaGVyZSBpbiBvcmRlciBub3QgdG8gY29tcGxhaW4gaWYgdGhlIHVzZXIgd3JpdGVzIGB7eyNlYWNoIDMgaW4geH19YFxuICAgICAgLy8gdGhhdCBcIjMgaXMgbm90IGEgZnVuY3Rpb25cIlxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoYXJncy5sZW5ndGggPiAxICYmIGFyZ3NbMF0ubGVuZ3RoID09PSAyICYmIGFyZ3NbMF1bMF0gIT09ICdQQVRIJykge1xuICAgICAgICAvLyB3ZSBoYXZlIGEgcG9zaXRpb25hbCBhcmd1bWVudCB0aGF0IGlzIG5vdCBhIFBBVEggZm9sbG93ZWQgYnlcbiAgICAgICAgLy8gb3RoZXIgYXJndW1lbnRzXG4gICAgICAgIHNjYW5uZXIuZmF0YWwoXCJGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24sIHRvIGJlIGNhbGxlZCBvbiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgXCJ0aGUgcmVzdCBvZiB0aGUgYXJndW1lbnRzOyBmb3VuZCBcIiArIGFyZ3NbMF1bMF0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZhciBwb3NpdGlvbiA9IHR0YWcucG9zaXRpb24gfHwgVEVNUExBVEVfVEFHX1BPU0lUSU9OLkVMRU1FTlQ7XG4gIGlmIChwb3NpdGlvbiA9PT0gVEVNUExBVEVfVEFHX1BPU0lUSU9OLklOX0FUVFJJQlVURSkge1xuICAgIGlmICh0dGFnLnR5cGUgPT09ICdET1VCTEUnIHx8IHR0YWcudHlwZSA9PT0gJ0VTQ0FQRScpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKHR0YWcudHlwZSA9PT0gJ0JMT0NLT1BFTicpIHtcbiAgICAgIHZhciBwYXRoID0gdHRhZy5wYXRoO1xuICAgICAgdmFyIHBhdGgwID0gcGF0aFswXTtcbiAgICAgIGlmICghIChwYXRoLmxlbmd0aCA9PT0gMSAmJiAocGF0aDAgPT09ICdpZicgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDAgPT09ICd1bmxlc3MnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGgwID09PSAnd2l0aCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDAgPT09ICdlYWNoJykpKSB7XG4gICAgICAgIHNjYW5uZXIuZmF0YWwoXCJDdXN0b20gYmxvY2sgaGVscGVycyBhcmUgbm90IGFsbG93ZWQgaW4gYW4gSFRNTCBhdHRyaWJ1dGUsIG9ubHkgYnVpbHQtaW4gb25lcyBsaWtlICNlYWNoIGFuZCAjaWZcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHNjYW5uZXIuZmF0YWwodHRhZy50eXBlICsgXCIgdGVtcGxhdGUgdGFnIGlzIG5vdCBhbGxvd2VkIGluIGFuIEhUTUwgYXR0cmlidXRlXCIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gVEVNUExBVEVfVEFHX1BPU0lUSU9OLklOX1NUQVJUX1RBRykge1xuICAgIGlmICghICh0dGFnLnR5cGUgPT09ICdET1VCTEUnKSkge1xuICAgICAgc2Nhbm5lci5mYXRhbChcIlJlYWN0aXZlIEhUTUwgYXR0cmlidXRlcyBtdXN0IGVpdGhlciBoYXZlIGEgY29uc3RhbnQgbmFtZSBvciBjb25zaXN0IG9mIGEgc2luZ2xlIHt7aGVscGVyfX0gcHJvdmlkaW5nIGEgZGljdGlvbmFyeSBvZiBuYW1lcyBhbmQgdmFsdWVzLiAgQSB0ZW1wbGF0ZSB0YWcgb2YgdHlwZSBcIiArIHR0YWcudHlwZSArIFwiIGlzIG5vdCBhbGxvd2VkIGhlcmUuXCIpO1xuICAgIH1cbiAgICBpZiAoc2Nhbm5lci5wZWVrKCkgPT09ICc9Jykge1xuICAgICAgc2Nhbm5lci5mYXRhbChcIlRlbXBsYXRlIHRhZ3MgYXJlIG5vdCBhbGxvd2VkIGluIGF0dHJpYnV0ZSBuYW1lcywgb25seSBpbiBhdHRyaWJ1dGUgdmFsdWVzIG9yIGluIHRoZSBmb3JtIG9mIGEgc2luZ2xlIHt7aGVscGVyfX0gdGhhdCBldmFsdWF0ZXMgdG8gYSBkaWN0aW9uYXJ5IG9mIG5hbWU9dmFsdWUgcGFpcnMuXCIpO1xuICAgIH1cbiAgfVxuXG59O1xuIiwiaW1wb3J0IHsgSFRNTCB9IGZyb20gJ21ldGVvci9odG1sanMnO1xuaW1wb3J0IHsgVHJlZVRyYW5zZm9ybWVyLCB0b1JhdyB9IGZyb20gJy4vb3B0aW1pemVyJztcblxuZnVuY3Rpb24gY29tcGFjdFJhdyhhcnJheSl7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gYXJyYXlbaV07XG4gICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBIVE1MLlJhdykge1xuICAgICAgaWYgKCFpdGVtLnZhbHVlKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHJlc3VsdC5sZW5ndGggJiZcbiAgICAgICAgICAocmVzdWx0W3Jlc3VsdC5sZW5ndGggLSAxXSBpbnN0YW5jZW9mIEhUTUwuUmF3KSl7XG4gICAgICAgIHJlc3VsdFtyZXN1bHQubGVuZ3RoIC0gMV0gPSBIVE1MLlJhdyhcbiAgICAgICAgICByZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdLnZhbHVlICsgaXRlbS52YWx1ZSk7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5wdXNoKGl0ZW0pO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VJZkNvbnRhaW5zTmV3bGluZShtYXRjaCkge1xuICBpZiAobWF0Y2guaW5kZXhPZignXFxuJykgPj0gMCkge1xuICAgIHJldHVybiAnJ1xuICB9XG4gIHJldHVybiBtYXRjaDtcbn1cblxuZnVuY3Rpb24gc3RyaXBXaGl0ZXNwYWNlKGFycmF5KXtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBhcnJheVtpXTtcbiAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIEhUTUwuUmF3KSB7XG4gICAgICAvLyByZW1vdmUgbm9kZXMgdGhhdCBjb250YWluIG9ubHkgd2hpdGVzcGFjZSAmIGEgbmV3bGluZVxuICAgICAgaWYgKGl0ZW0udmFsdWUuaW5kZXhPZignXFxuJykgIT09IC0xICYmICEvXFxTLy50ZXN0KGl0ZW0udmFsdWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgLy8gVHJpbSBhbnkgcHJlY2VkaW5nIHdoaXRlc3BhY2UsIGlmIGl0IGNvbnRhaW5zIGEgbmV3bGluZVxuICAgICAgdmFyIG5ld1N0ciA9IGl0ZW0udmFsdWU7XG4gICAgICBuZXdTdHIgPSBuZXdTdHIucmVwbGFjZSgvXlxccysvLCByZXBsYWNlSWZDb250YWluc05ld2xpbmUpO1xuICAgICAgbmV3U3RyID0gbmV3U3RyLnJlcGxhY2UoL1xccyskLywgcmVwbGFjZUlmQ29udGFpbnNOZXdsaW5lKTtcbiAgICAgIGl0ZW0udmFsdWUgPSBuZXdTdHI7XG4gICAgfVxuICAgIHJlc3VsdC5wdXNoKGl0ZW0pXG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxudmFyIFdoaXRlc3BhY2VSZW1vdmluZ1Zpc2l0b3IgPSBUcmVlVHJhbnNmb3JtZXIuZXh0ZW5kKCk7XG5XaGl0ZXNwYWNlUmVtb3ZpbmdWaXNpdG9yLmRlZih7XG4gIHZpc2l0TnVsbDogdG9SYXcsXG4gIHZpc2l0UHJpbWl0aXZlOiB0b1JhdyxcbiAgdmlzaXRDaGFyUmVmOiB0b1JhdyxcbiAgdmlzaXRBcnJheTogZnVuY3Rpb24oYXJyYXkpe1xuICAgIC8vIHRoaXMuc3VwZXIoYXJyYXkpXG4gICAgdmFyIHJlc3VsdCA9IFRyZWVUcmFuc2Zvcm1lci5wcm90b3R5cGUudmlzaXRBcnJheS5jYWxsKHRoaXMsIGFycmF5KTtcbiAgICByZXN1bHQgPSBjb21wYWN0UmF3KHJlc3VsdCk7XG4gICAgcmVzdWx0ID0gc3RyaXBXaGl0ZXNwYWNlKHJlc3VsdCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcbiAgdmlzaXRUYWc6IGZ1bmN0aW9uICh0YWcpIHtcbiAgICB2YXIgdGFnTmFtZSA9IHRhZy50YWdOYW1lO1xuICAgIC8vIFRPRE8gLSBMaXN0IHRhZ3MgdGhhdCB3ZSBkb24ndCB3YW50IHRvIHN0cmlwIHdoaXRlc3BhY2UgZm9yLlxuICAgIGlmICh0YWdOYW1lID09PSAndGV4dGFyZWEnIHx8IHRhZ05hbWUgPT09ICdzY3JpcHQnIHx8IHRhZ05hbWUgPT09ICdwcmUnXG4gICAgICB8fCAhSFRNTC5pc0tub3duRWxlbWVudCh0YWdOYW1lKSB8fCBIVE1MLmlzS25vd25TVkdFbGVtZW50KHRhZ05hbWUpKSB7XG4gICAgICByZXR1cm4gdGFnO1xuICAgIH1cbiAgICByZXR1cm4gVHJlZVRyYW5zZm9ybWVyLnByb3RvdHlwZS52aXNpdFRhZy5jYWxsKHRoaXMsIHRhZylcbiAgfSxcbiAgdmlzaXRBdHRyaWJ1dGVzOiBmdW5jdGlvbiAoYXR0cnMpIHtcbiAgICByZXR1cm4gYXR0cnM7XG4gIH1cbn0pO1xuXG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVXaGl0ZXNwYWNlKHRyZWUpIHtcbiAgdHJlZSA9IChuZXcgV2hpdGVzcGFjZVJlbW92aW5nVmlzaXRvcikudmlzaXQodHJlZSk7XG4gIHJldHVybiB0cmVlO1xufVxuIl19
