minispade.register('ember-metal/~tests/mixin/observer_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n/*globals testBoth */\nminispade.require('ember-metal/~tests/props_helper');\n\nmodule('Ember.Mixin observer');\n\ntestBoth('global observer helper', function(get, set) {\n\n  var MyMixin = Ember.Mixin.create({\n\n    count: 0,\n\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar')\n\n  });\n\n  var obj = Ember.mixin({}, MyMixin);\n  equal(get(obj, 'count'), 0, 'should not invoke observer immediately');\n\n  set(obj, 'bar', \"BAZ\");\n  equal(get(obj, 'count'), 1, 'should invoke observer after change');\n});\n\ntestBoth('global observer helper takes multiple params', function(get, set) {\n\n  var MyMixin = Ember.Mixin.create({\n\n    count: 0,\n\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar', 'baz')\n\n  });\n\n  var obj = Ember.mixin({}, MyMixin);\n  equal(get(obj, 'count'), 0, 'should not invoke observer immediately');\n\n  set(obj, 'bar', \"BAZ\");\n  set(obj, 'baz', \"BAZ\");\n  equal(get(obj, 'count'), 2, 'should invoke observer after change');\n});\n\n\ntestBoth('replacing observer should remove old observer', function(get, set) {\n\n  var MyMixin = Ember.Mixin.create({\n\n    count: 0,\n\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar')\n\n  });\n\n  var Mixin2 = Ember.Mixin.create({\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+10);\n    }, 'baz')\n  });\n\n  var obj = Ember.mixin({}, MyMixin, Mixin2);\n  equal(get(obj, 'count'), 0, 'should not invoke observer immediately');\n\n  set(obj, 'bar', \"BAZ\");\n  equal(get(obj, 'count'), 0, 'should not invoke observer after change');\n\n  set(obj, 'baz', \"BAZ\");\n  equal(get(obj, 'count'), 10, 'should invoke observer after change');\n\n});\n\ntestBoth('observing chain with property before', function(get, set) {\n  var obj2 = {baz: 'baz'};\n\n  var MyMixin = Ember.Mixin.create({\n    count: 0,\n    bar: obj2,\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar.baz')\n  });\n\n  var obj = Ember.mixin({}, MyMixin);\n  equal(get(obj, 'count'), 0, 'should not invoke observer immediately');\n\n  set(obj2, 'baz', \"BAZ\");\n  equal(get(obj, 'count'), 1, 'should invoke observer after change');\n});\n\ntestBoth('observing chain with property after', function(get, set) {\n  var obj2 = {baz: 'baz'};\n\n  var MyMixin = Ember.Mixin.create({\n    count: 0,\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar.baz'),\n    bar: obj2\n  });\n\n  var obj = Ember.mixin({}, MyMixin);\n  equal(get(obj, 'count'), 0, 'should not invoke observer immediately');\n\n  set(obj2, 'baz', \"BAZ\");\n  equal(get(obj, 'count'), 1, 'should invoke observer after change');\n});\n\ntestBoth('observing chain with property in mixin applied later', function(get, set) {\n  var obj2 = {baz: 'baz'};\n\n  var MyMixin = Ember.Mixin.create({\n\n    count: 0,\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar.baz')\n  });\n\n  var MyMixin2 = Ember.Mixin.create({bar: obj2});\n\n  var obj = Ember.mixin({}, MyMixin);\n  equal(get(obj, 'count'), 0, 'should not invoke observer immediately');\n\n  MyMixin2.apply(obj);\n  equal(get(obj, 'count'), 0, 'should not invoke observer immediately');\n\n  set(obj2, 'baz', \"BAZ\");\n  equal(get(obj, 'count'), 1, 'should invoke observer after change');\n});\n\ntestBoth('observing chain with existing property', function(get, set) {\n  var obj2 = {baz: 'baz'};\n\n  var MyMixin = Ember.Mixin.create({\n    count: 0,\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar.baz')\n  });\n\n  var obj = Ember.mixin({bar: obj2}, MyMixin);\n  equal(get(obj, 'count'), 0, 'should not invoke observer immediately');\n\n  set(obj2, 'baz', \"BAZ\");\n  equal(get(obj, 'count'), 1, 'should invoke observer after change');\n});\n\ntestBoth('observing chain with property in mixin before', function(get, set) {\n  var obj2 = {baz: 'baz'};\n  var MyMixin2 = Ember.Mixin.create({bar: obj2});\n\n  var MyMixin = Ember.Mixin.create({\n    count: 0,\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar.baz')\n  });\n\n  var obj = Ember.mixin({}, MyMixin2, MyMixin);\n  equal(get(obj, 'count'), 0, 'should not invoke observer immediately');\n\n  set(obj2, 'baz', \"BAZ\");\n  equal(get(obj, 'count'), 1, 'should invoke observer after change');\n});\n\ntestBoth('observing chain with property in mixin after', function(get, set) {\n  var obj2 = {baz: 'baz'};\n  var MyMixin2 = Ember.Mixin.create({bar: obj2});\n\n  var MyMixin = Ember.Mixin.create({\n    count: 0,\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar.baz')\n  });\n\n  var obj = Ember.mixin({}, MyMixin, MyMixin2);\n  equal(get(obj, 'count'), 0, 'should not invoke observer immediately');\n\n  set(obj2, 'baz', \"BAZ\");\n  equal(get(obj, 'count'), 1, 'should invoke observer after change');\n});\n\ntestBoth('observing chain with overriden property', function(get, set) {\n  var obj2 = {baz: 'baz'};\n  var obj3 = {baz: 'foo'};\n\n  var MyMixin2 = Ember.Mixin.create({bar: obj3});\n\n  var MyMixin = Ember.Mixin.create({\n    count: 0,\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar.baz')\n  });\n\n  var obj = Ember.mixin({bar: obj2}, MyMixin, MyMixin2);\n  equal(get(obj, 'count'), 0, 'should not invoke observer immediately');\n\n  equal(Ember.isWatching(obj2, 'baz'), false, 'should not be watching baz');\n  equal(Ember.isWatching(obj3, 'baz'), true, 'should be watching baz');\n\n  set(obj2, 'baz', \"BAZ\");\n  equal(get(obj, 'count'), 0, 'should not invoke observer after change');\n\n  set(obj3, 'baz', \"BEAR\");\n  equal(get(obj, 'count'), 1, 'should invoke observer after change');\n});\n\n})();\n//@ sourceURL=ember-metal/~tests/mixin/observer_test");