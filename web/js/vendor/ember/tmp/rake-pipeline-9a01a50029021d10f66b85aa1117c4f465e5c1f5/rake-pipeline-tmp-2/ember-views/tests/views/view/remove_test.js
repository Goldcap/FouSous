minispade.register('ember-views/~tests/views/view/remove_test', "(function() {// ==========================================================================\n// Project:   Ember - JavaScript Application Framework\n// Copyright: ©2006-2011 Apple Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n\nvar set = Ember.set, get = Ember.get;\nvar indexOf = Ember.EnumerableUtils.indexOf;\n\n// .......................................................\n// removeChild()\n//\n\nvar parentView, child;\nmodule(\"Ember.View#removeChild\", {\n  setup: function() {\n    parentView = Ember.ContainerView.create({ childViews: [Ember.View] });\n    child = get(parentView, 'childViews').objectAt(0);\n  }\n});\n\ntest(\"returns receiver\", function() {\n  equal(parentView.removeChild(child), parentView, 'receiver');\n});\n\ntest(\"removes child from parent.childViews array\", function() {\n  ok(indexOf(get(parentView, 'childViews'), child)>=0, 'precond - has child in childViews array before remove');\n  parentView.removeChild(child);\n  ok(indexOf(get(parentView, 'childViews'), child)<0, 'removed child');\n});\n\ntest(\"sets parentView property to null\", function() {\n  ok(get(child, 'parentView'), 'precond - has parentView');\n  parentView.removeChild(child);\n  ok(!get(child, 'parentView'), 'parentView is now null');\n});\n\n// .......................................................\n// removeAllChildren()\n//\nvar view;\nmodule(\"Ember.View#removeAllChildren\", {\n setup: function() {\n  view = Ember.ContainerView.create({\n    childViews: [Ember.View, Ember.View, Ember.View]\n  });\n }\n});\n\ntest(\"removes all child views\", function() {\n  equal(get(view, 'childViews.length'), 3, 'precond - has child views');\n\n  view.removeAllChildren();\n  equal(get(view, 'childViews.length'), 0, 'removed all children');\n});\n\ntest(\"returns receiver\", function() {\n  equal(view.removeAllChildren(), view, 'receiver');\n});\n\n// .......................................................\n// removeFromParent()\n//\nmodule(\"Ember.View#removeFromParent\");\n\ntest(\"removes view from parent view\", function() {\n  var parentView = Ember.ContainerView.create({ childViews: [Ember.View] });\n  var child = get(parentView, 'childViews').objectAt(0);\n  ok(get(child, 'parentView'), 'precond - has parentView');\n\n  Ember.run(function(){\n    parentView.createElement();\n  });\n\n  ok(parentView.$('div').length, \"precond - has a child DOM element\");\n\n  child.removeFromParent();\n  ok(!get(child, 'parentView'), 'no longer has parentView');\n  ok(indexOf(get(parentView, 'childViews'), child)<0, 'no longer in parent childViews');\n  equal(parentView.$('div').length, 0, \"removes DOM element from parent\");\n});\n\ntest(\"returns receiver\", function() {\n  var parentView = Ember.ContainerView.create({ childViews: [Ember.View] });\n  var child = get(parentView, 'childViews').objectAt(0);\n  equal(child.removeFromParent(), child, 'receiver');\n});\n\ntest(\"does nothing if not in parentView\", function() {\n  var callCount = 0;\n  var child = Ember.View.create();\n\n  // monkey patch for testing...\n  ok(!get(child, 'parentView'), 'precond - has no parent');\n\n  child.removeFromParent();\n});\n\n\ntest(\"the DOM element is gone after doing append and remove in two separate runloops\", function() {\n  var view = Ember.View.create();\n  Ember.run(function() {\n    view.append();\n  });\n  Ember.run(function() {\n    view.remove();\n  });\n\n  var viewElem = Ember.$('#'+get(view, 'elementId'));\n  ok(viewElem.length === 0, \"view's element doesn't exist in DOM\");\n});\n\ntest(\"the DOM element is gone after doing append and remove in a single runloop\", function() {\n  var view = Ember.View.create();\n  Ember.run(function() {\n    view.append();\n    view.remove();\n  });\n\n  var viewElem = Ember.$('#'+get(view, 'elementId'));\n  ok(viewElem.length === 0, \"view's element doesn't exist in DOM\");\n});\n\n\n})();\n//@ sourceURL=ember-views/~tests/views/view/remove_test");