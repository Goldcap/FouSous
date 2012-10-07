minispade.register('ember-metal/~tests/mixin/method_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n/*globals raises */\n\nmodule('Mixin Methods');\n\ntest('defining simple methods', function() {\n\n  var MixinA, obj, props;\n\n  props = {\n    publicMethod: function() { return 'publicMethod'; },\n    _privateMethod: function() { return 'privateMethod'; }\n  };\n\n  MixinA = Ember.Mixin.create(props);\n  obj = {};\n  MixinA.apply(obj);\n\n  // but should be defined\n  equal(props.publicMethod(), 'publicMethod', 'publicMethod is func');\n  equal(props._privateMethod(), 'privateMethod', 'privateMethod is func');\n});\n\ntest('overriding public methods', function() {\n  var MixinA, MixinB, MixinC, MixinD, MixinE, MixinF, obj;\n\n  MixinA = Ember.Mixin.create({\n    publicMethod: function() { return 'A'; }\n  });\n\n  MixinB = Ember.Mixin.create(MixinA, {\n    publicMethod: function() { return this._super()+'B'; }\n  });\n\n  MixinD = Ember.Mixin.create(MixinA, {\n    publicMethod: function() { return this._super()+'D'; }\n  });\n\n  MixinF = Ember.Mixin.create({\n    publicMethod: function() { return this._super()+'F'; }\n  });\n\n  obj = {};\n  MixinB.apply(obj);\n  equal(obj.publicMethod(), 'AB', 'should define super for A and B');\n\n  obj = {};\n  MixinD.apply(obj);\n  equal(obj.publicMethod(), 'AD', 'should define super for A and B');\n\n  obj = {};\n  MixinA.apply(obj);\n  MixinF.apply(obj);\n  equal(obj.publicMethod(), 'AF', 'should define super for A and F');\n\n  obj = { publicMethod: function() { return 'obj'; } };\n  MixinF.apply(obj);\n  equal(obj.publicMethod(), 'objF', 'should define super for F');\n});\n\n\ntest('overriding inherited objects', function() {\n\n  var cnt = 0;\n  var MixinA = Ember.Mixin.create({\n    foo: function() { cnt++; }\n  });\n\n  var MixinB = Ember.Mixin.create({\n    foo: function() { this._super(); cnt++; }\n  });\n\n  var objA = {};\n  MixinA.apply(objA);\n\n  var objB = Ember.create(objA);\n  MixinB.apply(objB);\n\n  cnt = 0;\n  objB.foo();\n  equal(cnt, 2, 'should invoke both methods');\n\n  cnt = 0;\n  objA.foo();\n  equal(cnt, 1, 'should not screw w/ parent obj');\n});\n\ntest('Including the same mixin more than once will only run once', function() {\n  var cnt = 0;\n  var MixinA = Ember.Mixin.create({\n    foo: function() { cnt++; }\n  });\n\n  var MixinB = Ember.Mixin.create(MixinA, {\n    foo: function() { this._super(); }\n  });\n\n  var MixinC = Ember.Mixin.create(MixinA, {\n    foo: function() { this._super(); }\n  });\n\n  var MixinD = Ember.Mixin.create(MixinB, MixinC, MixinA, {\n    foo: function() { this._super(); }\n  });\n\n  var obj = {};\n  MixinD.apply(obj);\n  MixinA.apply(obj); // try to apply again..\n\n  cnt = 0;\n  obj.foo();\n\n  equal(cnt, 1, 'should invoke MixinA.foo one time');\n});\n\n// ..........................................................\n// CONFLICTS\n//\n\nmodule('Method Conflicts');\n\n\ntest('overriding toString', function() {\n  var MixinA = Ember.Mixin.create({\n    toString: function() { return 'FOO'; }\n  });\n\n  var obj = {};\n  MixinA.apply(obj);\n  equal(obj.toString(), 'FOO', 'should override toString w/o error');\n\n  obj = {};\n  Ember.mixin(obj, { toString: function() { return 'FOO'; } });\n  equal(obj.toString(), 'FOO', 'should override toString w/o error');\n});\n\n// ..........................................................\n// BUGS\n//\n\nmodule('system/mixin/method_test BUGS');\n\ntest('applying several mixins at once with sup already defined causes infinite loop', function() {\n\n  var cnt = 0;\n  var MixinA = Ember.Mixin.create({\n    foo: function() { cnt++; }\n  });\n\n  var MixinB = Ember.Mixin.create({\n    foo: function() { this._super(); cnt++; }\n  });\n\n  var MixinC = Ember.Mixin.create({\n    foo: function() { this._super(); cnt++; }\n  });\n\n  var obj = {};\n  Ember.mixin(obj, MixinA); // sup already exists\n  Ember.mixin(obj, MixinB, MixinC); // must be more than one mixin\n\n  cnt = 0;\n  obj.foo();\n  equal(cnt, 3, 'should invoke all 3 methods');\n});\n\n})();\n//@ sourceURL=ember-metal/~tests/mixin/method_test");