minispade.register('ember-runtime/~tests/system/object/reopenClass_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n\nmodule('system/object/reopenClass');\n\ntest('adds new properties to subclass', function() {\n\n  var Subclass = Ember.Object.extend();\n  Subclass.reopenClass({\n    foo: function() { return 'FOO'; },\n    bar: 'BAR'\n  });\n\n  equal(Subclass.foo(), 'FOO', 'Adds method');\n  equal(Ember.get(Subclass, 'bar'), 'BAR', 'Adds property');\n});\n\ntest('class properties inherited by subclasses', function() {\n\n  var Subclass = Ember.Object.extend();\n  Subclass.reopenClass({\n    foo: function() { return 'FOO'; },\n    bar: 'BAR'\n  });\n\n  var SubSub = Subclass.extend();\n\n  equal(SubSub.foo(), 'FOO', 'Adds method');\n  equal(Ember.get(SubSub, 'bar'), 'BAR', 'Adds property');\n});\n\n\n})();\n//@ sourceURL=ember-runtime/~tests/system/object/reopenClass_test");