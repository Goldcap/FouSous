minispade.register('ember-metal/~tests/mixin/apply_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n/*globals raises */\n\nmodule('Ember.Mixin.apply');\n\nfunction K() {}\n\ntest('using apply() should apply properties', function() {\n  var MixinA = Ember.Mixin.create({ foo: 'FOO', baz: K });\n  var obj = {};\n  Ember.mixin(obj, MixinA);\n\n  equal(Ember.get(obj, 'foo'), \"FOO\", 'should apply foo');\n  equal(Ember.get(obj, 'baz'), K, 'should apply foo');\n});\n\ntest('applying anonymous properties', function() {\n  var obj = {};\n  Ember.mixin(obj, {\n    foo: 'FOO',\n    baz: K\n  });\n\n  equal(Ember.get(obj, 'foo'), \"FOO\", 'should apply foo');\n  equal(Ember.get(obj, 'baz'), K, 'should apply foo');\n});\n\ntest('applying null values', function() {\n  raises(function() {\n    Ember.mixin({}, null);\n  }, Error);\n});\n\ntest('applying a property with an undefined value', function() {\n  var obj = { tagName: '' };\n  Ember.mixin(obj, { tagName: undefined });\n\n  strictEqual(Ember.get(obj, 'tagName'), '');\n});\n\n})();\n//@ sourceURL=ember-metal/~tests/mixin/apply_test");