minispade.register('ember-views/~tests/views/view/template_test', "(function() {// ==========================================================================\n// Project:   Ember - JavaScript Application Framework\n// Copyright: ©2006-2011 Strobe Inc. and contributors.\n//            ©2008-2011 Apple Inc. All rights reserved.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n\nvar set = Ember.set, get = Ember.get;\n\nvar VIEW_PRESERVES_CONTEXT = Ember.VIEW_PRESERVES_CONTEXT;\n\nmodule(\"Ember.View - Template Functionality\");\n\ntest(\"should call the function of the associated template\", function() {\n  var view;\n\n  view = Ember.View.create({\n    templateName: 'test_template',\n\n    templates: Ember.Object.create({\n      test_template: function(dataSource) {\n        return \"<h1 id='twas-called'>template was called</h1>\";\n      }\n    })\n  });\n\n  Ember.run(function(){\n    view.createElement();\n  });\n\n  ok(view.$('#twas-called').length, \"the named template was called\");\n});\n\ntest(\"should call the function of the associated template with itself as the context\", function() {\n  var view;\n\n  view = Ember.View.create({\n    templateName: 'test_template',\n\n    personName: \"Tom DAAAALE\",\n\n    templates: Ember.Object.create({\n      test_template: function(dataSource) {\n        return \"<h1 id='twas-called'>template was called for \" + get(dataSource, 'personName') + \"</h1>\";\n      }\n    })\n  });\n\n  Ember.run(function(){\n    view.createElement();\n  });\n\n  equal(\"template was called for Tom DAAAALE\", view.$('#twas-called').text(), \"the named template was called with the view as the data source\");\n});\n\ntest(\"should fall back to defaultTemplate if neither template nor templateName are provided\", function() {\n  var View, view;\n\n  View = Ember.View.extend({\n    defaultTemplate: function(dataSource) { return \"<h1 id='twas-called'>template was called for \" + get(dataSource, 'personName') + \"</h1>\"; }\n  });\n\n  view = View.create({\n    personName: \"Tom DAAAALE\"\n  });\n\n  Ember.run(function(){\n    view.createElement();\n  });\n\n  equal(\"template was called for Tom DAAAALE\", view.$('#twas-called').text(), \"the named template was called with the view as the data source\");\n});\n\ntest(\"should not use defaultTemplate if template is provided\", function() {\n  var View, view;\n\n  View = Ember.View.extend({\n    template:  function() { return \"foo\"; },\n    defaultTemplate: function(dataSource) { return \"<h1 id='twas-called'>template was called for \" + get(dataSource, 'personName') + \"</h1>\"; }\n  });\n\n  view = View.create();\n  Ember.run(function(){\n    view.createElement();\n  });\n\n  equal(\"foo\", view.$().text(), \"default template was not printed\");\n});\n\ntest(\"should not use defaultTemplate if template is provided\", function() {\n  var View, view;\n\n  View = Ember.View.extend({\n    templateName: 'foobar',\n    templates: Ember.Object.create({\n      foobar: function() { return \"foo\"; }\n    }),\n    defaultTemplate: function(dataSource) { return \"<h1 id='twas-called'>template was called for \" + get(dataSource, 'personName') + \"</h1>\"; }\n  });\n\n  view = View.create();\n  Ember.run(function(){\n    view.createElement();\n  });\n\n  equal(\"foo\", view.$().text(), \"default template was not printed\");\n});\n\ntest(\"should render an empty element if no template is specified\", function() {\n  var view;\n\n  view = Ember.View.create();\n  Ember.run(function(){\n    view.createElement();\n  });\n\n  equal(view.$().html(), '', \"view div should be empty\");\n});\n\ntest(\"should provide a controller to the template if a controller is specified on the view\", function() {\n  expect(VIEW_PRESERVES_CONTEXT ? 7 : 5);\n\n  var Controller1 = Ember.Object.extend({\n    toString: function() { return \"Controller1\"; }\n  });\n\n  var Controller2 = Ember.Object.extend({\n    toString: function() { return \"Controller2\"; }\n  });\n\n  var controller1 = Controller1.create(),\n      controller2 = Controller2.create(),\n      optionsDataKeywordsControllerForView,\n      optionsDataKeywordsControllerForChildView,\n      contextForView,\n      contextForControllerlessView;\n\n  var view = Ember.View.create({\n    controller: controller1,\n\n    template: function(buffer, options) {\n      optionsDataKeywordsControllerForView = options.data.keywords.controller;\n    }\n  });\n\n  Ember.run(function() {\n    view.appendTo('#qunit-fixture');\n  });\n\n  strictEqual(optionsDataKeywordsControllerForView, controller1, \"passes the controller in the data\");\n\n  Ember.run(function(){\n    view.destroy();\n  });\n\n  var parentView = Ember.View.create({\n    controller: controller1,\n\n    template: function(buffer, options) {\n      options.data.view.appendChild(Ember.View.create({\n        controller: controller2,\n        templateData: options.data,\n        template: function(context, options) {\n          contextForView = context;\n          optionsDataKeywordsControllerForChildView = options.data.keywords.controller;\n        }\n      }));\n      optionsDataKeywordsControllerForView = options.data.keywords.controller;\n    }\n  });\n\n  Ember.run(function() {\n    parentView.appendTo('#qunit-fixture');\n  });\n\n  strictEqual(optionsDataKeywordsControllerForView, controller1, \"passes the controller in the data\");\n  strictEqual(optionsDataKeywordsControllerForChildView, controller2, \"passes the child view's controller in the data\");\n\n  Ember.run(function(){\n    parentView.destroy();\n  });\n\n  var parentViewWithControllerlessChild = Ember.View.create({\n    controller: controller1,\n\n    template: function(buffer, options) {\n      options.data.view.appendChild(Ember.View.create({\n        templateData: options.data,\n        template: function(context, options) {\n          contextForControllerlessView = context;\n          optionsDataKeywordsControllerForChildView = options.data.keywords.controller;\n        }\n      }));\n      optionsDataKeywordsControllerForView = options.data.keywords.controller;\n    }\n  });\n\n  Ember.run(function() {\n    parentViewWithControllerlessChild.appendTo('#qunit-fixture');\n  });\n\n  strictEqual(optionsDataKeywordsControllerForView, controller1, \"passes the original controller in the data\");\n  strictEqual(optionsDataKeywordsControllerForChildView, controller1, \"passes the controller in the data to child views\");\n\n  if (VIEW_PRESERVES_CONTEXT) {\n    strictEqual(contextForView, controller2, \"passes the controller in as the main context of the parent view\");\n    strictEqual(contextForControllerlessView, controller1, \"passes the controller in as the main context of the child view\");\n  }\n});\n\n})();\n//@ sourceURL=ember-views/~tests/views/view/template_test");