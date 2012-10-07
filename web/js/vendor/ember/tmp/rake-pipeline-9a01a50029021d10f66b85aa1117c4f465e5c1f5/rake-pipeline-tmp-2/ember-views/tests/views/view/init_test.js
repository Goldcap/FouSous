minispade.register('ember-views/~tests/views/view/init_test', "(function() {/*global TestApp:true*/\nvar set = Ember.set, get = Ember.get;\n\nmodule(\"Ember.View.create\");\n\ntest(\"registers view in the global views hash using layerId for event targeted\", function() {\n  var v = Ember.View.create();\n  equal(Ember.View.views[get(v, 'elementId')], v, 'registers view');\n});\n\ntest(\"registers itself with a controller if the viewController property is set\", function() {\n  window.TestApp = {};\n  TestApp.fooController = Ember.Object.create();\n\n  var v = Ember.View.create({\n    viewController: 'TestApp.fooController'\n  });\n\n  equal(TestApp.fooController.get('view'), v, \"sets the view property of the controller\");\n});\n\ntest(\"should warn if a non-array is used for classNames\", function() {\n  raises(function() {\n    Ember.View.create({\n      classNames: Ember.computed(function() {\n        return ['className'];\n      }).property().volatile()\n    });\n  }, /Only arrays are allowed/i, 'should warn that an array was not used');\n});\n\ntest(\"should warn if a non-array is used for classNamesBindings\", function() {\n  raises(function() {\n    Ember.View.create({\n      classNameBindings: Ember.computed(function() {\n        return ['className'];\n      }).property().volatile()\n    });\n  }, /Only arrays are allowed/i, 'should warn that an array was not used');\n});\n\n})();\n//@ sourceURL=ember-views/~tests/views/view/init_test");