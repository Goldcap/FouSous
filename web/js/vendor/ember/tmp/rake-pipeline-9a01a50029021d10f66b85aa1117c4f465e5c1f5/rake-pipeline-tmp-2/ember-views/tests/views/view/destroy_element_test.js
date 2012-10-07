minispade.register('ember-views/~tests/views/view/destroy_element_test', "(function() {// ==========================================================================\n// Project:   Ember - JavaScript Application Framework\n// Copyright: ©2006-2011 Apple Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n\nvar set = Ember.set, get = Ember.get;\n\nmodule(\"Ember.View#destroyElement\");\n\ntest(\"it if has no element, does nothing\", function() {\n  var callCount = 0;\n  var view = Ember.View.create({\n    willDestroyElement: function() { callCount++; }\n  });\n\n  ok(!get(view, 'element'), 'precond - does NOT have element');\n\n  Ember.run(function() {\n    view.destroyElement();\n  });\n\n  equal(callCount, 0, 'did not invoke callback');\n});\n\ntest(\"if it has a element, calls willDestroyElement on receiver and child views then deletes the element\", function() {\n  var parentCount = 0, childCount = 0;\n\n  var view = Ember.ContainerView.create({\n    willDestroyElement: function() { parentCount++; },\n    childViews: [Ember.ContainerView.extend({\n      // no willDestroyElement here... make sure no errors are thrown\n      childViews: [Ember.View.extend({\n        willDestroyElement: function() { childCount++; }\n      })]\n    })]\n  });\n\n  Ember.run(function(){\n    view.createElement();\n  });\n\n  ok(get(view, 'element'), 'precond - view has element');\n\n  Ember.run(function() {\n    view.destroyElement();\n  });\n\n  equal(parentCount, 1, 'invoked destroy element on the parent');\n  equal(childCount, 1, 'invoked destroy element on the child');\n  ok(!get(view, 'element'), 'view no longer has element');\n  ok(!get(get(view, 'childViews').objectAt(0), 'element'), 'child no longer has an element');\n});\n\ntest(\"returns receiver\", function() {\n  var view = Ember.View.create(), ret;\n\n  Ember.run(function(){\n    view.createElement();\n    ret = view.destroyElement();\n  });\n\n  equal(ret, view, 'returns receiver');\n});\n\ntest(\"removes element from parentNode if in DOM\", function() {\n  var view = Ember.View.create();\n\n  Ember.run(function() {\n    view.append();\n  });\n\n  var parent = view.$().parent();\n\n  ok(get(view, 'element'), 'precond - has element');\n\n  Ember.run(function() {\n    view.destroyElement();\n  });\n\n  equal(view.$(), undefined, 'view has no selector');\n  ok(!parent.find('#'+view.get('elementId')).length, 'element no longer in parent node');\n});\n\n})();\n//@ sourceURL=ember-views/~tests/views/view/destroy_element_test");