minispade.register('ember-handlebars/loader', "(function() {// ==========================================================================\n// Project:   Ember Handlebars Views\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n/*globals Handlebars */\nminispade.require(\"ember-handlebars/ext\");\n\n// Find templates stored in the head tag as script tags and make them available\n// to Ember.CoreView in the global Ember.TEMPLATES object. This will be run as as\n// jQuery DOM-ready callback.\n//\n// Script tags with \"text/x-handlebars\" will be compiled\n// with Ember's Handlebars and are suitable for use as a view's template.\n// Those with type=\"text/x-raw-handlebars\" will be compiled with regular\n// Handlebars and are suitable for use in views' computed properties.\nEmber.Handlebars.bootstrap = function(ctx) {\n  var selectors = 'script[type=\"text/x-handlebars\"], script[type=\"text/x-raw-handlebars\"]';\n\n  Ember.$(selectors, ctx)\n    .each(function() {\n    // Get a reference to the script tag\n    var script = Ember.$(this),\n        type   = script.attr('type');\n\n    var compile = (script.attr('type') === 'text/x-raw-handlebars') ?\n                  Ember.$.proxy(Handlebars.compile, Handlebars) :\n                  Ember.$.proxy(Ember.Handlebars.compile, Ember.Handlebars),\n      // Get the name of the script, used by Ember.View's templateName property.\n      // First look for data-template-name attribute, then fall back to its\n      // id if no name is found.\n      templateName = script.attr('data-template-name') || script.attr('id'),\n      template = compile(script.html()),\n      view, viewPath, elementId, options;\n\n    if (templateName) {\n      // For templates which have a name, we save them and then remove them from the DOM\n      Ember.TEMPLATES[templateName] = template;\n\n      // Remove script tag from DOM\n      script.remove();\n    } else {\n      if (script.parents('head').length !== 0) {\n        // don't allow inline templates in the head\n        throw new Ember.Error(\"Template found in <head> without a name specified. \" +\n                         \"Please provide a data-template-name attribute.\\n\" +\n                         script.html());\n      }\n\n      // For templates which will be evaluated inline in the HTML document, instantiates a new\n      // view, and replaces the script tag holding the template with the new\n      // view's DOM representation.\n      //\n      // Users can optionally specify a custom view subclass to use by setting the\n      // data-view attribute of the script tag.\n      viewPath = script.attr('data-view');\n      view = viewPath ? Ember.get(viewPath) : Ember.View;\n\n      // Get the id of the script, used by Ember.View's elementId property,\n      // Look for data-element-id attribute.\n      elementId = script.attr('data-element-id');\n\n      options = { template: template };\n      if (elementId) { options.elementId = elementId; }\n\n      view = view.create(options);\n\n      view._insertElementLater(function() {\n        script.replaceWith(this.$());\n\n        // Avoid memory leak in IE\n        script = null;\n      });\n    }\n  });\n};\n\n/** @private */\nfunction bootstrap() {\n  Ember.Handlebars.bootstrap( Ember.$(document) );\n}\n\n/*\n  We tie this to application.load to ensure that we've at least\n  attempted to bootstrap at the point that the application is loaded.\n\n  We also tie this to document ready since we're guaranteed that all\n  the inline templates are present at this point.\n\n  There's no harm to running this twice, since we remove the templates\n  from the DOM after processing.\n*/\n\nEmber.$(document).ready(bootstrap);\nEmber.onLoad('application', bootstrap);\n\n})();\n//@ sourceURL=ember-handlebars/loader");