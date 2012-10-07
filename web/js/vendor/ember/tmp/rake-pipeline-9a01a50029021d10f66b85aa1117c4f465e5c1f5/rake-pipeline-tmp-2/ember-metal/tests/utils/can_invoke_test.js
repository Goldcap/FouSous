minispade.register('ember-metal/~tests/utils/can_invoke_test', "(function() {// ==========================================================================\n// Project:   Ember Runtime\n// Copyright: ©2012 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n\nvar obj;\n\nmodule(\"Ember.canInvoke\", {\n  setup: function() {\n    obj = {\n      foobar: \"foobar\",\n      aMethodThatExists: function() {}\n    };\n  },\n\n  teardown: function() {\n    obj = undefined;\n  }\n});\n\ntest(\"should return false if the object doesn't exist\", function() {\n  equal(Ember.canInvoke(undefined, 'aMethodThatDoesNotExist'), false);\n});\n\ntest(\"should return true if the method exists on the object\", function() {\n  equal(Ember.canInvoke(obj, 'aMethodThatExists'), true);\n});\n\ntest(\"should return false if the method doesn't exist on the object\", function() {\n  equal(Ember.canInvoke(obj, 'aMethodThatDoesNotExist'), false);\n});\n\ntest(\"should return false if the property exists on the object but is a non-function\", function() {\n  equal(Ember.canInvoke(obj, 'foobar'), false);\n});\n\n})();\n//@ sourceURL=ember-metal/~tests/utils/can_invoke_test");