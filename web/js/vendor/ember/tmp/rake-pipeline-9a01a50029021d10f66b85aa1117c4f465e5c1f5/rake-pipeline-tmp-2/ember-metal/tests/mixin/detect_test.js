minispade.register('ember-metal/~tests/mixin/detect_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n\nmodule('Mixin.detect');\n\ntest('detect() finds a directly applied mixin', function() {\n\n  var MixinA = Ember.Mixin.create();\n  var obj = {};\n\n  equal(MixinA.detect(obj), false, 'MixinA.detect(obj) before apply()');\n\n  MixinA.apply(obj);\n  equal(MixinA.detect(obj), true, 'MixinA.detect(obj) after apply()');\n});\n\ntest('detect() finds nested mixins', function() {\n  var MixinA = Ember.Mixin.create({});\n  var MixinB = Ember.Mixin.create(MixinA);\n  var obj = {};\n\n  equal(MixinA.detect(obj), false, 'MixinA.detect(obj) before apply()');\n\n  MixinB.apply(obj);\n  equal(MixinA.detect(obj), true, 'MixinA.detect(obj) after apply()');\n});\n\ntest('detect() finds mixins on other mixins', function() {\n  var MixinA = Ember.Mixin.create({});\n  var MixinB = Ember.Mixin.create(MixinA);\n  equal(MixinA.detect(MixinB), true, 'MixinA is part of MixinB');\n  equal(MixinB.detect(MixinA), false, 'MixinB is not part of MixinA');\n});\n\ntest('detect handles null values', function() {\n  var MixinA = Ember.Mixin.create();\n  equal(MixinA.detect(null), false);\n});\n\n})();\n//@ sourceURL=ember-metal/~tests/mixin/detect_test");