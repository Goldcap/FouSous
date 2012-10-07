minispade.register('ember-metal/~tests/mixin/concatenatedProperties_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n/*globals setup */\n\nmodule('Ember.Mixin concatenatedProperties');\n\ntest('defining concatenated properties should concat future version', function() {\n\n  var MixinA = Ember.Mixin.create({\n    concatenatedProperties: ['foo'],\n    foo: ['a', 'b', 'c']\n  });\n\n  var MixinB = Ember.Mixin.create({\n    foo: ['d', 'e', 'f']\n  });\n\n  var obj = Ember.mixin({}, MixinA, MixinB);\n  deepEqual(Ember.get(obj, 'foo'), ['a', 'b', 'c', 'd', 'e', 'f']);\n});\n\ntest('concatenatedProperties should be concatenated', function() {\n\n  var MixinA = Ember.Mixin.create({\n    concatenatedProperties: ['foo'],\n    foo: ['a', 'b', 'c']\n  });\n\n  var MixinB = Ember.Mixin.create({\n    concatenatedProperties: 'bar',\n    foo: ['d', 'e', 'f'],\n    bar: [1,2,3]\n  });\n\n  var MixinC = Ember.Mixin.create({\n    bar: [4,5,6]\n  });\n\n  var obj = Ember.mixin({}, MixinA, MixinB, MixinC);\n  deepEqual(Ember.get(obj, 'concatenatedProperties'), ['foo', 'bar'], 'get concatenatedProperties');\n  deepEqual(Ember.get(obj, 'foo'), ['a', 'b', 'c', 'd', 'e', 'f'], 'get foo');\n  deepEqual(Ember.get(obj, 'bar'), [1,2,3,4,5,6], 'get bar');\n});\n\ntest('adding a prop that is not an array should make array', function() {\n\n  var MixinA = Ember.Mixin.create({\n    concatenatedProperties: ['foo'],\n    foo: [1,2,3]\n  });\n\n  var MixinB = Ember.Mixin.create({\n    foo: 4\n  });\n\n  var obj = Ember.mixin({}, MixinA, MixinB);\n  deepEqual(Ember.get(obj, 'foo'), [1,2,3,4]);\n});\n\ntest('adding a prop that is not an array should make array', function() {\n\n  var MixinA = Ember.Mixin.create({\n    concatenatedProperties: ['foo'],\n    foo: 'bar'\n  });\n\n  var obj = Ember.mixin({}, MixinA);\n  deepEqual(Ember.get(obj, 'foo'), ['bar']);\n});\n\n})();\n//@ sourceURL=ember-metal/~tests/mixin/concatenatedProperties_test");