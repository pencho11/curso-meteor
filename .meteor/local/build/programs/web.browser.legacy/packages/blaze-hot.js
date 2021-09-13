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
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package.modules.meteorBabelHelpers;
var Blaze = Package.blaze.Blaze;
var UI = Package.blaze.UI;
var Handlebars = Package.blaze.Handlebars;
var Template = Package['templating-runtime'].Template;
var Promise = Package.promise.Promise;
var HTML = Package.htmljs.HTML;
var Spacebars = Package.spacebars.Spacebars;
var Symbol = Package['ecmascript-runtime-client'].Symbol;
var Map = Package['ecmascript-runtime-client'].Map;
var Set = Package['ecmascript-runtime-client'].Set;

var require = meteorInstall({"node_modules":{"meteor":{"blaze-hot":{"hot.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/blaze-hot/hot.js                                                                                       //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
!function (module1) {
  var _typeof;

  module1.link("@babel/runtime/helpers/typeof", {
    default: function (v) {
      _typeof = v;
    }
  }, 0);
  var Blaze;
  module1.link("meteor/blaze", {
    Blaze: function (v) {
      Blaze = v;
    }
  }, 0);
  var Templates;
  module1.link("meteor/templating-runtime", {
    Template: function (v) {
      Templates = v;
    }
  }, 1);
  var UpdateAll;
  module1.link("./update-templates.js", {
    UpdateAll: function (v) {
      UpdateAll = v;
    }
  }, 2);
  var importedTemplating = new WeakMap();
  var currentModule = {
    id: null
  };
  var SourceModule = Symbol();

  function patchTemplate(Template) {
    var oldRegisterHelper = Template.registerHelper;

    Template.registerHelper = function (name, func) {
      func[SourceModule] = currentModule.id;
      oldRegisterHelper(name, func);
    };

    var oldOnCreated = Template.prototype.onCreated;

    Template.prototype.onCreated = function (cb) {
      if (cb) {
        cb[SourceModule] = currentModule.id;
      }

      return oldOnCreated.call(this, cb);
    };

    var oldOnRendered = Template.prototype.onRendered;

    Template.prototype.onRendered = function (cb) {
      if (cb) {
        cb[SourceModule] = currentModule.id;
      }

      return oldOnRendered.call(this, cb);
    };

    var oldOnDestroyed = Template.prototype.onDestroyed;

    Template.prototype.onDestroyed = function (cb) {
      if (cb) {
        cb[SourceModule] = currentModule.id;
      }

      return oldOnDestroyed.call(this, cb);
    };

    var oldHelpers = Template.prototype.helpers;

    Template.prototype.helpers = function (dict) {
      if (_typeof(dict) === 'object') {
        for (var k in meteorBabelHelpers.sanitizeForInObject(dict)) {
          if (dict[k]) {
            dict[k][SourceModule] = currentModule.id;
          }
        }
      }

      return oldHelpers.call(this, dict);
    };

    var oldEvents = Template.prototype.events;

    Template.prototype.events = function (eventMap) {
      var result = oldEvents.call(this, eventMap);
      this.__eventMaps[this.__eventMaps.length - 1][SourceModule] = currentModule.id;
      return result;
    };
  }

  function cleanTemplate(template, moduleId) {
    var usedModule = false;

    if (!template || !Blaze.isTemplate(template)) {
      return usedModule;
    }

    function cleanArray(array) {
      for (var i = array.length - 1; i >= 0; i--) {
        var item = array[i];

        if (item && item[SourceModule] === moduleId) {
          usedModule = true;
          array.splice(i, 1);
        }
      }
    }

    cleanArray(template._callbacks.created);
    cleanArray(template._callbacks.rendered);
    cleanArray(template._callbacks.destroyed);
    cleanArray(template.__eventMaps);
    Object.keys(template.__helpers).forEach(function (key) {
      if (template.__helpers[key] && template.__helpers[key][SourceModule] === moduleId) {
        usedModule = true;
        delete template.__helpers[key];
      }
    });
    return usedModule;
  }

  function shouldAccept(module) {
    if (!importedTemplating.get(module)) {
      return false;
    }

    if (!module.exports) {
      return true;
    }

    return Object.keys(module.exports).filter(function (key) {
      return key !== '__esModule';
    }).length === 0;
  }

  if (module.hot) {
    patchTemplate(Blaze.Template);
    module.hot.onRequire({
      before: function (module) {
        if (module.id === '/node_modules/meteor/blaze.js' || module.id === '/node_modules/meteor/templating.js') {
          importedTemplating.set(currentModule, true);
        }

        var previousModule = currentModule;
        currentModule = module;
        return previousModule;
      },
      after: function (module, previousModule) {
        if (shouldAccept(module)) {
          module.hot.accept();
          module.hot.dispose(function () {
            Object.keys(Templates).forEach(function (templateName) {
              var template = Templates[templateName];
              var usedByModule = cleanTemplate(template, module.id);

              if (usedByModule) {
                Template._applyHmrChanges(templateName);
              }
            });
            Object.values(Blaze._globalHelpers).forEach(function (helper) {
              if (helper && helper[SourceModule] === module.id) {
                Template._applyHmrChanges(UpdateAll);
              }
            });
          });
        }

        currentModule = previousModule;
      }
    });
  }
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"update-templates.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/blaze-hot/update-templates.js                                                                          //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var _typeof;

module.link("@babel/runtime/helpers/typeof", {
  default: function (v) {
    _typeof = v;
  }
}, 0);
module.export({
  UpdateAll: function () {
    return UpdateAll;
  }
});
var UpdateAll = Symbol('update all templates');
var renderedTemplates = {};
var overrideTemplateContentBlock = null;
var overrideTemplateElseBlock = null;
var oldConstructView = Template.prototype.constructView;

Template.prototype.constructView = function () {
  var view = oldConstructView.apply(this, arguments);
  var templateName = this.viewName;
  view.onViewCreated(function () {
    renderedTemplates[templateName] = renderedTemplates[templateName] || [];
    renderedTemplates[templateName].push(view);
  });
  view.onViewDestroyed(function () {
    var index = renderedTemplates[templateName].indexOf(view);

    if (index > -1) {
      renderedTemplates[templateName].splice(index, 1);
    }
  });

  if (overrideTemplateContentBlock) {
    view.templateContentBlock = overrideTemplateContentBlock;
    overrideTemplateContentBlock = null;
  }

  if (overrideTemplateElseBlock) {
    view.templateElseBlock = overrideTemplateElseBlock;
    overrideTemplateElseBlock = null;
  }

  return view;
};

var updateRootViews = Template._applyHmrChanges;
var timeout = null;
var lastUpdateFailed = false;
var modifiedTemplates = new Set();
var templateViewPrefix = 'Template.'; // Overrides the default _applyHmrChanges with one that updates the specific
// views for modified templates instead of updating everything.

Template._applyHmrChanges = function () {
  var templateName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : UpdateAll;

  if (templateName === UpdateAll || lastUpdateFailed) {
    lastUpdateFailed = false;
    clearTimeout(timeout);
    updateRootViews();
    return;
  } else {
    modifiedTemplates.add(templateName);
  }

  if (timeout) {
    return;
  }

  timeout = setTimeout(function () {
    for (var i = 0; i < Template.__pendingReplacement.length; i++) {
      delete Template[Template.__pendingReplacement[i]];
    }

    Template.__pendingReplacement = [];
    timeout = null;
    modifiedTemplates.forEach(function (templateName) {
      modifiedTemplates.delete(templateName);
      var viewName = templateName;

      if (!(viewName in renderedTemplates)) {
        viewName = templateViewPrefix + viewName;
      } else {
        console.error('[Blaze HMR] Error: view name does not start with Template');
        return;
      }

      if (!(viewName in renderedTemplates)) {
        return;
      }

      var views = renderedTemplates[viewName];
      renderedTemplates[viewName] = [];

      var _loop = function () {
        var view = views.pop(); // find first parent template that isn't a content block

        while (!view.template || view.templateContentBlock || view.templateElseBlock) {
          if (!view.parentView) {
            console.log('[Blaze HMR] Unable to update template', viewName);
            return {
              v: void 0
            };
          }

          view = view.parentView;
        }

        if (!view.isRendered) {
          return "continue";
        } // TODO: this can be removed if we don't update a view, and then update
        // one of its children (we only need to update the parent).


        Package.tracker.Tracker.flush();
        var parent = view.parentView;
        var parentElement = view._domrange.parentElement;

        var next = view._domrange.lastNode().nextSibling;

        var nextComment = null;

        if (!next) {
          // percolate:momentum requires a next node to show the new nodes
          next = nextComment = document.createComment('Blaze HMR Placeholder');
          parentElement.insertBefore(nextComment, null);
        }

        if (!parent) {
          // TODO: we only need to update a single root view
          return {
            v: updateRootViews()
          };
        }

        if (view.templateContentBlock) {
          overrideTemplateContentBlock = view.templateContentBlock;
        }

        if (view.templateElseBlock) {
          overrideTemplateElseBlock = view.templateElseBlock;
        } // Since there is a parent range, Blaze will not automatically
        // detach the dom range.


        view._domrange.detach();

        view._domrange.destroy();

        var newView = void 0;

        try {
          newView = Blaze.render(Template[view.template.viewName.slice('Template.'.length)], parentElement, next, parent);
        } catch (error) {
          console.log('[Blaze HMR] Error re-rending template:');
          console.error(error);
          lastUpdateFailed = true;
        }

        var index = parent._domrange.members.findIndex(function (member) {
          return member && member.view === view;
        });

        if (newView) {
          parent._domrange.members.splice(index, 1, newView._domrange);
        } else {
          parent._domrange.members.splice(index, 1);
        }

        if (nextComment) {
          parentElement.removeChild(nextComment);
        }
      };

      while (views.length > 0) {
        var _ret = _loop();

        if (_ret === "continue") continue;
        if (_typeof(_ret) === "object") return _ret.v;
      }
    });
  });
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

require("/node_modules/meteor/blaze-hot/hot.js");
require("/node_modules/meteor/blaze-hot/update-templates.js");

/* Exports */
Package._define("blaze-hot");

})();
