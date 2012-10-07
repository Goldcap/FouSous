minispade.register('ember-runtime/~tests/controllers/array_controller_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\nminispade.require('ember-runtime/~tests/suites/mutable_array');\n\nmodule(\"ember-runtime/controllers/array_controller_test\");\n\nEmber.MutableArrayTests.extend({\n\n  name: 'Ember.ArrayController',\n\n  newObject: function(ary) {\n    var ret = ary ? ary.slice() : this.newFixture(3);\n    return Ember.ArrayController.create({\n      content: Ember.A(ret)\n    });\n  },\n\n  mutate: function(obj) {\n    obj.pushObject(Ember.get(obj, 'length')+1);\n  },\n\n  toArray: function(obj) {\n    return obj.toArray ? obj.toArray() : obj.slice();\n  }\n}).run();\n\n})();\n//@ sourceURL=ember-runtime/~tests/controllers/array_controller_test");