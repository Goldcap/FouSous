minispade.register('ember-handlebars/helpers/view', "(function() {// ==========================================================================\n// Project:   Ember Handlebars Views\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n/*globals Handlebars */\n\n// TODO: Don't require the entire module\nminispade.require(\"ember-handlebars\");\n\nvar get = Ember.get, set = Ember.set;\nvar PARENT_VIEW_PATH = /^parentView\\./;\nvar EmberHandlebars = Ember.Handlebars;\nvar VIEW_PRESERVES_CONTEXT = Ember.VIEW_PRESERVES_CONTEXT;\n\n/** @private */\nEmberHandlebars.ViewHelper = Ember.Object.create({\n\n  propertiesFromHTMLOptions: function(options, thisContext) {\n    var hash = options.hash, data = options.data;\n    var extensions = {},\n        classes = hash['class'],\n        dup = false;\n\n    if (hash.id) {\n      extensions.elementId = hash.id;\n      dup = true;\n    }\n\n    if (classes) {\n      classes = classes.split(' ');\n      extensions.classNames = classes;\n      dup = true;\n    }\n\n    if (hash.classBinding) {\n      extensions.classNameBindings = hash.classBinding.split(' ');\n      dup = true;\n    }\n\n    if (hash.classNameBindings) {\n      if (extensions.classNameBindings === undefined) extensions.classNameBindings = [];\n      extensions.classNameBindings = extensions.classNameBindings.concat(hash.classNameBindings.split(' '));\n      dup = true;\n    }\n\n    if (hash.attributeBindings) {\n      Ember.assert(\"Setting 'attributeBindings' via Handlebars is not allowed. Please subclass Ember.View and set it there instead.\");\n      extensions.attributeBindings = null;\n      dup = true;\n    }\n\n    if (dup) {\n      hash = Ember.$.extend({}, hash);\n      delete hash.id;\n      delete hash['class'];\n      delete hash.classBinding;\n    }\n\n    // Set the proper context for all bindings passed to the helper. This applies to regular attribute bindings\n    // as well as class name bindings. If the bindings are local, make them relative to the current context\n    // instead of the view.\n    var path;\n\n    // Evaluate the context of regular attribute bindings:\n    for (var prop in hash) {\n      if (!hash.hasOwnProperty(prop)) { continue; }\n\n      // Test if the property ends in \"Binding\"\n      if (Ember.IS_BINDING.test(prop) && typeof hash[prop] === 'string') {\n        path = this.contextualizeBindingPath(hash[prop], data);\n        if (path) { hash[prop] = path; }\n      }\n    }\n\n    // Evaluate the context of class name bindings:\n    if (extensions.classNameBindings) {\n      for (var b in extensions.classNameBindings) {\n        var full = extensions.classNameBindings[b];\n        if (typeof full === 'string') {\n          // Contextualize the path of classNameBinding so this:\n          //\n          //     classNameBinding=\"isGreen:green\"\n          //\n          // is converted to this:\n          //\n          //     classNameBinding=\"bindingContext.isGreen:green\"\n          var parsedPath = Ember.View._parsePropertyPath(full);\n          path = this.contextualizeBindingPath(parsedPath.path, data);\n          if (path) { extensions.classNameBindings[b] = path + parsedPath.classNames; }\n        }\n      }\n    }\n\n    // Make the current template context available to the view\n    // for the bindings set up above.\n    extensions.bindingContext = thisContext;\n\n    return Ember.$.extend(hash, extensions);\n  },\n\n  // Transform bindings from the current context to a context that can be evaluated within the view.\n  // Returns null if the path shouldn't be changed.\n  //\n  // TODO: consider the addition of a prefix that would allow this method to return `path`.\n  contextualizeBindingPath: function(path, data) {\n    var normalized = Ember.Handlebars.normalizePath(null, path, data);\n    if (normalized.isKeyword) {\n      return 'templateData.keywords.' + path;\n    } else if (Ember.isGlobalPath(path)) {\n      return null;\n    } else if (path === 'this') {\n      return 'bindingContext';\n    } else {\n      return 'bindingContext.' + path;\n    }\n  },\n\n  helper: function(thisContext, path, options) {\n    var inverse = options.inverse,\n        data = options.data,\n        view = data.view,\n        fn = options.fn,\n        hash = options.hash,\n        newView;\n\n    if ('string' === typeof path) {\n      newView = EmberHandlebars.getPath(thisContext, path, options);\n      Ember.assert(\"Unable to find view at path '\" + path + \"'\", !!newView);\n    } else {\n      newView = path;\n    }\n\n    Ember.assert(Ember.String.fmt('You must pass a view class to the #view helper, not %@ (%@)', [path, newView]), Ember.View.detect(newView));\n\n    var viewOptions = this.propertiesFromHTMLOptions(options, thisContext);\n    var currentView = data.view;\n    viewOptions.templateData = options.data;\n\n    if (fn) {\n      Ember.assert(\"You cannot provide a template block if you also specified a templateName\", !get(viewOptions, 'templateName') && !get(newView.proto(), 'templateName'));\n      viewOptions.template = fn;\n    }\n\n    // We only want to override the `_context` computed property if there is\n    // no specified controller. See View#_context for more information.\n    if (VIEW_PRESERVES_CONTEXT && !newView.proto().controller && !newView.proto().controllerBinding && !viewOptions.controller && !viewOptions.controllerBinding) {\n      viewOptions._context = thisContext;\n    }\n\n    currentView.appendChild(newView, viewOptions);\n  }\n});\n\n/**\n  `{{view}}` inserts a new instance of `Ember.View` into a template passing its options\n  to the `Ember.View`'s `create` method and using the supplied block as the view's own template.\n\n  An empty `<body>` and the following template:\n\n      <script type=\"text/x-handlebars\">\n        A span:\n        {{#view tagName=\"span\"}}\n          hello.\n        {{/view}}\n      </script>\n\n  Will result in HTML structure:\n\n      <body>\n        <!-- Note: the handlebars template script \n             also results in a rendered Ember.View\n             which is the outer <div> here -->\n\n        <div class=\"ember-view\">\n          A span:\n          <span id=\"ember1\" class=\"ember-view\">\n            Hello.\n          </span>\n        </div>\n      </body>\n\n  ### parentView setting\n\n  The `parentView` property of the new `Ember.View` instance created through `{{view}}`\n  will be set to the `Ember.View` instance of the template where `{{view}}` was called.\n\n      aView = Ember.View.create({\n        template: Ember.Handlebars.compile(\"{{#view}} my parent: {{parentView.elementId}} {{/view}}\")\n      })\n\n      aView.appendTo('body')\n    \n  Will result in HTML structure:\n\n      <div id=\"ember1\" class=\"ember-view\">\n        <div id=\"ember2\" class=\"ember-view\">\n          my parent: ember1\n        </div>\n      </div>\n\n  ### Setting CSS id and class attributes\n\n  The HTML `id` attribute can be set on the `{{view}}`'s resulting element with the `id` option.\n  This option will _not_ be passed to `Ember.View.create`.\n\n      <script type=\"text/x-handlebars\">\n        {{#view tagName=\"span\" id=\"a-custom-id\"}}\n          hello.\n        {{/view}}\n      </script>\n\n  Results in the following HTML structure:\n\n      <div class=\"ember-view\">\n        <span id=\"a-custom-id\" class=\"ember-view\">\n          hello.\n        </span>\n      </div>\n\n  The HTML `class` attribute can be set on the `{{view}}`'s resulting element with\n  the `class` or `classNameBindings` options. The `class` option\n  will directly set the CSS `class` attribute and will not be passed to\n  `Ember.View.create`. `classNameBindings` will be passed to `create` and use\n  `Ember.View`'s class name binding functionality:\n\n      <script type=\"text/x-handlebars\">\n        {{#view tagName=\"span\" class=\"a-custom-class\"}}\n          hello.\n        {{/view}}\n      </script>\n\n  Results in the following HTML structure:\n\n      <div class=\"ember-view\">\n        <span id=\"ember2\" class=\"ember-view a-custom-class\">\n          hello.\n        </span>\n      </div>\n\n  ### Supplying a different view class\n  `{{view}}` can take an optional first argument before its supplied options to specify a\n  path to a custom view class.\n\n      <script type=\"text/x-handlebars\">\n        {{#view \"MyApp.CustomView\"}}\n          hello.\n        {{/view}}\n      </script>\n\n  The first argument can also be a relative path. Ember will search for the view class\n  starting at the `Ember.View` of the template where `{{view}}` was used as the root object:\n\n      MyApp = Ember.Application.create({})\n      MyApp.OuterView = Ember.View.extend({\n        innerViewClass: Ember.View.extend({\n          classNames: ['a-custom-view-class-as-property']\n        }),\n        template: Ember.Handlebars.compile('{{#view \"innerViewClass\"}} hi {{/view}}')\n      })\n\n      MyApp.OuterView.create().appendTo('body')\n\nWill result in the following HTML:\n\n      <div id=\"ember1\" class=\"ember-view\">\n        <div id=\"ember2\" class=\"ember-view a-custom-view-class-as-property\"> \n          hi\n        </div>\n      </div>\n\n  ### Blockless use\n\n  If you supply a custom `Ember.View` subclass that specifies its own template\n  or provide a `templateName` option to `{{view}}` it can be used without supplying a block.\n  Attempts to use both a `templateName` option and supply a block will throw an error.\n\n      <script type=\"text/x-handlebars\">\n        {{view \"MyApp.ViewWithATemplateDefined\"}}\n      </script>\n\n  ### viewName property\n\n  You can supply a `viewName` option to `{{view}}`. The `Ember.View` instance will\n  be referenced as a property of its parent view by this name.\n\n      aView = Ember.View.create({\n        template: Ember.Handlebars.compile('{{#view viewName=\"aChildByName\"}} hi {{/view}}')\n      })\n\n      aView.appendTo('body')\n      aView.get('aChildByName') // the instance of Ember.View created by {{view}} helper\n\n  @name Handlebars.helpers.view\n  @param {String} path\n  @param {Hash} options\n  @returns {String} HTML string\n*/\nEmberHandlebars.registerHelper('view', function(path, options) {\n  Ember.assert(\"The view helper only takes a single argument\", arguments.length <= 2);\n\n  // If no path is provided, treat path param as options.\n  if (path && path.data && path.data.isRenderData) {\n    options = path;\n    path = \"Ember.View\";\n  }\n\n  return EmberHandlebars.ViewHelper.helper(this, path, options);\n});\n\n\n})();\n//@ sourceURL=ember-handlebars/helpers/view");