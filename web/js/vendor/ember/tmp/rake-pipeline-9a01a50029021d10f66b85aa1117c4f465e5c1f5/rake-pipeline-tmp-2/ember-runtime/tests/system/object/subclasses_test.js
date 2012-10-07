minispade.register('ember-runtime/~tests/system/object/subclasses_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n\nmodule('system/object/subclasses');\n\ntest('chains should copy forward to subclasses when prototype created', function () {\n  var ObjectWithChains, objWithChains, SubWithChains, SubSub, subSub;\n  Ember.run(function () {\n    ObjectWithChains = Ember.Object.extend({\n      obj: {\n        a: 'a',\n        hi: 'hi'\n      },\n      aBinding: 'obj.a' // add chain\n    });\n    // realize prototype\n    objWithChains = ObjectWithChains.create();\n    // should not copy chains from parent yet\n    SubWithChains = ObjectWithChains.extend({\n      hiBinding: 'obj.hi', // add chain\n      hello: Ember.computed(function() {\n        return this.get('obj.hi') + ' world';\n      }).property('hi').volatile(), // observe chain\n      greetingBinding: 'hello'\n    });\n    SubSub = SubWithChains.extend();\n    // should realize prototypes and copy forward chains\n    subSub = SubSub.create();\n  });\n  equal(subSub.get('greeting'), 'hi world');\n  Ember.run(function () {\n    objWithChains.set('obj.hi', 'hello');\n  });\n  equal(subSub.get('greeting'), 'hello world');\n});\n\n})();\n//@ sourceURL=ember-runtime/~tests/system/object/subclasses_test");