minispade.register('ember-metal/~tests/accessors/setPath_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n/*globals Foo:true $foo:true */\n\nvar obj, moduleOpts = {\n  setup: function() {\n    obj = {\n      foo: {\n        bar: {\n          baz: { biff: 'BIFF' }\n        }\n      }\n\n    };\n\n    Foo = {\n      bar: {\n        baz: { biff: 'FooBiff' }\n      }\n    };\n\n    $foo = {\n      bar: {\n        baz: { biff: '$FOOBIFF' }\n      }\n    };\n  },\n\n  teardown: function() {\n    obj = null;\n    Foo = null;\n    $foo = null;\n  }\n};\n\nmodule('Ember.set with path', moduleOpts);\n\ntest('[Foo, bar] -> Foo.bar', function() {\n  window.Foo = {toString: function() { return 'Foo'; }}; // Behave like an Ember.Namespace\n  Ember.set(Foo, 'bar', 'baz');\n  equal(Ember.get(Foo, 'bar'), 'baz');\n  window.Foo = null;\n});\n\n// ..........................................................\n// LOCAL PATHS\n//\n\ntest('[obj, foo] -> obj.foo', function() {\n  Ember.set(obj, 'foo', \"BAM\");\n  equal(Ember.get(obj, 'foo'), \"BAM\");\n});\n\ntest('[obj, foo.bar] -> obj.foo.bar', function() {\n  Ember.set(obj, 'foo.bar', \"BAM\");\n  equal(Ember.get(obj, 'foo.bar'), \"BAM\");\n});\n\ntest('[obj, this.foo] -> obj.foo', function() {\n  Ember.set(obj, 'this.foo', \"BAM\");\n  equal(Ember.get(obj, 'foo'), \"BAM\");\n});\n\ntest('[obj, this.foo.bar] -> obj.foo.bar', function() {\n  Ember.set(obj, 'this.foo.bar', \"BAM\");\n  equal(Ember.get(obj, 'foo.bar'), \"BAM\");\n});\n\n// ..........................................................\n// NO TARGET\n//\n\ntest('[null, Foo.bar] -> Foo.bar', function() {\n  Ember.set(null, 'Foo.bar', \"BAM\");\n  equal(Ember.get(Foo, 'bar'), \"BAM\");\n});\n\n// ..........................................................\n// DEPRECATED\n//\n\nmodule(\"Ember.set with path - deprecated\", {\n  setup: function() {\n    Ember.TESTING_DEPRECATION = true;\n    moduleOpts.setup();\n  },\n  teardown: function() {\n    Ember.TESTING_DEPRECATION = false;\n    moduleOpts.teardown();\n  }\n});\n\ntest('[obj, foo.baz.bat] -> EXCEPTION', function() {\n  raises(function() {\n    Ember.set(obj, 'foo.baz.bat', \"BAM\");\n  }, Error);\n});\n\ntest('[obj, foo.baz.bat] -> EXCEPTION', function() {\n  Ember.trySet(obj, 'foo.baz.bat', \"BAM\");\n  ok(true, \"does not raise\");\n});\n\n})();\n//@ sourceURL=ember-metal/~tests/accessors/setPath_test");