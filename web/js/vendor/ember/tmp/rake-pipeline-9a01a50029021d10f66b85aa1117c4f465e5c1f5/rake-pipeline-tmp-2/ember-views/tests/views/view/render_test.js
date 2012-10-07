minispade.register('ember-views/~tests/views/view/render_test', "(function() {// ==========================================================================\n// Project:   Ember - JavaScript Application Framework\n// Copyright: ©2006-2011 Apple Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n/*global module test equals context ok same */\n\nvar set = Ember.set, get = Ember.get;\n\n// .......................................................\n//  render()\n//\nmodule(\"Ember.View#render\");\n\ntest(\"default implementation does not render child views\", function() {\n\n  var rendered = 0, updated = 0, parentRendered = 0, parentUpdated = 0 ;\n  var view = Ember.ContainerView.create({\n    childViews: [\"child\"],\n\n    render: function(buffer) {\n      parentRendered++;\n      this._super(buffer);\n    },\n\n    child: Ember.View.create({\n      render: function(buffer) {\n        rendered++;\n        this._super(buffer);\n      }\n    })\n  });\n\n  Ember.run(function(){\n    view.createElement();\n  });\n  equal(rendered, 1, 'rendered the child once');\n  equal(parentRendered, 1);\n  equal(view.$('div').length, 1);\n\n});\n\ntest(\"should invoke renderChildViews if layer is destroyed then re-rendered\", function() {\n\n  var rendered = 0, parentRendered = 0, parentUpdated = 0 ;\n  var view = Ember.ContainerView.create({\n    childViews: [\"child\"],\n\n    render: function(buffer) {\n      parentRendered++;\n      this._super(buffer);\n    },\n\n    child: Ember.View.create({\n      render: function(buffer) {\n        rendered++;\n        this._super(buffer);\n      }\n    })\n  });\n\n  Ember.run(function() {\n    view.append();\n  });\n\n  equal(rendered, 1, 'rendered the child once');\n  equal(parentRendered, 1);\n  equal(view.$('div').length, 1);\n\n  Ember.run(function() {\n    view.rerender();\n  });\n\n  equal(rendered, 2, 'rendered the child twice');\n  equal(parentRendered, 2);\n  equal(view.$('div').length, 1);\n\n  Ember.run(function(){\n    view.destroy();\n  });\n});\n\ntest(\"should render child views with a different tagName\", function() {\n  var rendered = 0, parentRendered = 0, parentUpdated = 0 ;\n\n  var view = Ember.ContainerView.create({\n    childViews: [\"child\"],\n\n    child: Ember.View.create({\n      tagName: 'aside'\n    })\n  });\n\n  Ember.run(function(){\n    view.createElement();\n  });\n  \n  equal(view.$('aside').length, 1);\n});\n\ntest(\"should add ember-view to views\", function() {\n  var view = Ember.View.create();\n\n  Ember.run(function(){\n    view.createElement();\n  });\n  \n  ok(view.$().hasClass('ember-view'), \"the view has ember-view\");\n});\n\ntest(\"should not add role attribute unless one is specified\", function() {\n  var view = Ember.View.create();\n\n  Ember.run(function(){\n    view.createElement();\n  });\n  \n  ok(view.$().attr('role') === undefined, \"does not have a role attribute\");\n});\n\ntest(\"should re-render if the context is changed\", function() {\n  var view = Ember.View.create({\n    elementId: 'template-context-test',\n    context: { foo: \"bar\" },\n    render: function(buffer) {\n      var value = get(get(this, 'context'), 'foo');\n      buffer.push(value);\n    }\n  });\n\n  Ember.run(function() {\n    view.appendTo('#qunit-fixture');\n  });\n\n  equal(Ember.$('#qunit-fixture #template-context-test').text(), \"bar\", \"precond - renders the view with the initial value\");\n\n  Ember.run(function() {\n    view.set('context', {\n      foo: \"bang baz\"\n    });\n  });\n\n  equal(Ember.$('#qunit-fixture #template-context-test').text(), \"bang baz\", \"re-renders the view with the updated context\");\n});\n\n})();\n//@ sourceURL=ember-views/~tests/views/view/render_test");