minispade.register('ember-runtime/~tests/system/object/reopen_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n\nmodule('system/core_object/reopenClass');\n\ntest('adds new properties to subclass instance', function() {\n\n  var Subclass = Ember.Object.extend();\n  Subclass.reopen({\n    foo: function() { return 'FOO'; },\n    bar: 'BAR'\n  });\n\n  equal( new Subclass().foo(), 'FOO', 'Adds method');\n  equal(Ember.get(new Subclass(), 'bar'), 'BAR', 'Adds property');\n});\n\ntest('reopened properties inherited by subclasses', function() {\n\n  var Subclass = Ember.Object.extend();\n  var SubSub = Subclass.extend();\n\n  Subclass.reopen({\n    foo: function() { return 'FOO'; },\n    bar: 'BAR'\n  });\n\n\n  equal( new SubSub().foo(), 'FOO', 'Adds method');\n  equal(Ember.get(new SubSub(), 'bar'), 'BAR', 'Adds property');\n});\n\n// We plan to allow this in the future\ntest('does not allow reopening already instantiated classes', function() {\n  var Subclass = Ember.Object.extend();\n\n  Subclass.create();\n\n  Subclass.reopen({\n    trololol: true\n  });\n\n  equal(Subclass.create().get('trololol'), true, \"reopen works\");\n});\n\n})();\n//@ sourceURL=ember-runtime/~tests/system/object/reopen_test");