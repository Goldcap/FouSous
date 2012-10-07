minispade.register('ember-runtime/~tests/mixins/target_action_support_test', "(function() {/*global Test:true*/\n\nmodule(\"Ember.TargetActionSupport\");\n\ntest(\"it should return false if no target or action are specified\", function() {\n  expect(1);\n\n  var obj = Ember.Object.create(Ember.TargetActionSupport);\n\n  ok(false === obj.triggerAction(), \"no target or action was specified\");\n});\n\ntest(\"it should support actions specified as strings\", function() {\n  expect(2);\n\n  var obj = Ember.Object.create(Ember.TargetActionSupport, {\n    target: Ember.Object.create({\n      anEvent: function() {\n        ok(true, \"anEvent method was called\");\n      }\n    }),\n\n    action: 'anEvent'\n  });\n\n  ok(true === obj.triggerAction(), \"a valid target and action were specified\");\n});\n\ntest(\"it should invoke the send() method on objects that implement it\", function() {\n  expect(2);\n\n  var obj = Ember.Object.create(Ember.TargetActionSupport, {\n    target: Ember.Object.create({\n      send: function(evt) {\n        equal(evt, 'anEvent', \"send() method was invoked with correct event name\");\n      }\n    }),\n\n    action: 'anEvent'\n  });\n\n  ok(true === obj.triggerAction(), \"a valid target and action were specified\");\n});\n\ntest(\"it should find targets specified using a property path\", function() {\n  expect(2);\n\n  window.Test = {};\n\n  Test.targetObj = Ember.Object.create({\n    anEvent: function() {\n      ok(true, \"anEvent method was called on global object\");\n    }\n  });\n\n  var myObj = Ember.Object.create(Ember.TargetActionSupport, {\n    target: 'Test.targetObj',\n    action: 'anEvent'\n  });\n\n  ok(true === myObj.triggerAction(), \"a valid target and action were specified\");\n\n  window.Test = undefined;\n});\n\n})();\n//@ sourceURL=ember-runtime/~tests/mixins/target_action_support_test");