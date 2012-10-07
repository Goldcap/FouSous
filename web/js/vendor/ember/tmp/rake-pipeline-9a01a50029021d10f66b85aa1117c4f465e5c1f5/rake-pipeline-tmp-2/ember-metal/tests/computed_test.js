minispade.register('ember-metal/~tests/computed_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n/*globals Global:true */\nminispade.require('ember-metal/~tests/props_helper');\n\nvar obj, count;\n\nmodule('Ember.computed');\n\ntest('computed property should be an instance of descriptor', function() {\n  ok(Ember.computed(function() {}) instanceof Ember.Descriptor);\n});\n\ntest('defining computed property should invoke property on get', function() {\n\n  var obj = {};\n  var count = 0;\n  Ember.defineProperty(obj, 'foo', Ember.computed(function(key) {\n    count++;\n    return 'computed '+key;\n  }));\n\n  equal(Ember.get(obj, 'foo'), 'computed foo', 'should return value');\n  equal(count, 1, 'should have invoked computed property');\n});\n\ntest('defining computed property should invoke property on set', function() {\n\n  var obj = {};\n  var count = 0;\n  Ember.defineProperty(obj, 'foo', Ember.computed(function(key, value) {\n    if (value !== undefined) {\n      count++;\n      this['__'+key] = 'computed '+value;\n    }\n    return this['__'+key];\n  }));\n\n  equal(Ember.set(obj, 'foo', 'bar'), 'bar', 'should return set value');\n  equal(count, 1, 'should have invoked computed property');\n  equal(Ember.get(obj, 'foo'), 'computed bar', 'should return new value');\n});\n\nvar objA, objB;\nmodule('Ember.computed should inherit through prototype', {\n  setup: function() {\n    objA = { __foo: 'FOO' } ;\n    Ember.defineProperty(objA, 'foo', Ember.computed(function(key, value) {\n      if (value !== undefined) {\n        this['__'+key] = 'computed '+value;\n      }\n      return this['__'+key];\n    }));\n\n    objB = Ember.create(objA);\n    objB.__foo = 'FOO'; // make a copy;\n  },\n\n  teardown: function() {\n    objA = objB = null;\n  }\n});\n\ntestBoth('using get() and set()', function(get, set) {\n  equal(get(objA, 'foo'), 'FOO', 'should get FOO from A');\n  equal(get(objB, 'foo'), 'FOO', 'should get FOO from B');\n\n  set(objA, 'foo', 'BIFF');\n  equal(get(objA, 'foo'), 'computed BIFF', 'should change A');\n  equal(get(objB, 'foo'), 'FOO', 'should NOT change B');\n\n  set(objB, 'foo', 'bar');\n  equal(get(objB, 'foo'), 'computed bar', 'should change B');\n  equal(get(objA, 'foo'), 'computed BIFF', 'should NOT change A');\n\n  set(objA, 'foo', 'BAZ');\n  equal(get(objA, 'foo'), 'computed BAZ', 'should change A');\n  equal(get(objB, 'foo'), 'computed bar', 'should NOT change B');\n});\n\nmodule('redefining computed property to normal', {\n  setup: function() {\n    objA = { __foo: 'FOO' } ;\n    Ember.defineProperty(objA, 'foo', Ember.computed(function(key, value) {\n      if (value !== undefined) {\n        this['__'+key] = 'computed '+value;\n      }\n      return this['__'+key];\n    }));\n\n    objB = Ember.create(objA);\n    Ember.defineProperty(objB, 'foo'); // make this just a normal property.\n  },\n\n  teardown: function() {\n    objA = objB = null;\n  }\n});\n\ntestBoth('using get() and set()', function(get, set) {\n  equal(get(objA, 'foo'), 'FOO', 'should get FOO from A');\n  equal(get(objB, 'foo'), undefined, 'should get undefined from B');\n\n  set(objA, 'foo', 'BIFF');\n  equal(get(objA, 'foo'), 'computed BIFF', 'should change A');\n  equal(get(objB, 'foo'), undefined, 'should NOT change B');\n\n  set(objB, 'foo', 'bar');\n  equal(get(objB, 'foo'), 'bar', 'should change B');\n  equal(get(objA, 'foo'), 'computed BIFF', 'should NOT change A');\n\n  set(objA, 'foo', 'BAZ');\n  equal(get(objA, 'foo'), 'computed BAZ', 'should change A');\n  equal(get(objB, 'foo'), 'bar', 'should NOT change B');\n});\n\nmodule('redefining computed property to another property', {\n  setup: function() {\n    objA = { __foo: 'FOO' } ;\n    Ember.defineProperty(objA, 'foo', Ember.computed(function(key, value) {\n      if (value !== undefined) {\n        this['__'+key] = 'A '+value;\n      }\n      return this['__'+key];\n    }));\n\n    objB = Ember.create(objA);\n    objB.__foo = 'FOO';\n    Ember.defineProperty(objB, 'foo', Ember.computed(function(key, value) {\n      if (value !== undefined) {\n        this['__'+key] = 'B '+value;\n      }\n      return this['__'+key];\n    }));\n  },\n\n  teardown: function() {\n    objA = objB = null;\n  }\n});\n\ntestBoth('using get() and set()', function(get, set) {\n  equal(get(objA, 'foo'), 'FOO', 'should get FOO from A');\n  equal(get(objB, 'foo'), 'FOO', 'should get FOO from B');\n\n  set(objA, 'foo', 'BIFF');\n  equal(get(objA, 'foo'), 'A BIFF', 'should change A');\n  equal(get(objB, 'foo'), 'FOO', 'should NOT change B');\n\n  set(objB, 'foo', 'bar');\n  equal(get(objB, 'foo'), 'B bar', 'should change B');\n  equal(get(objA, 'foo'), 'A BIFF', 'should NOT change A');\n\n  set(objA, 'foo', 'BAZ');\n  equal(get(objA, 'foo'), 'A BAZ', 'should change A');\n  equal(get(objB, 'foo'), 'B bar', 'should NOT change B');\n});\n\nmodule('Ember.computed - metadata');\n\ntest(\"can set metadata on a computed property\", function() {\n  var computedProperty = Ember.computed(function() { });\n  computedProperty.property();\n  computedProperty.meta({ key: 'keyValue' });\n\n  equal(computedProperty.meta().key, 'keyValue', \"saves passed meta hash to the _meta property\");\n});\n\ntest(\"meta should return an empty hash if no meta is set\", function() {\n  var computedProperty = Ember.computed(function() { });\n  deepEqual(computedProperty.meta(), {}, \"returned value is an empty hash\");\n});\n\n// ..........................................................\n// CACHEABLE\n//\n\nmodule('Ember.computed - cacheable', {\n  setup: function() {\n    obj = {};\n    count = 0;\n    Ember.defineProperty(obj, 'foo', Ember.computed(function() {\n      count++;\n      return 'bar '+count;\n    }).cacheable());\n  },\n\n  teardown: function() {\n    obj = count = null;\n  }\n});\n\ntestBoth('cacheable should cache', function(get, set) {\n  equal(get(obj, 'foo'), 'bar 1', 'first get');\n  equal(get(obj, 'foo'), 'bar 1', 'second get');\n  equal(count, 1, 'should only invoke once');\n});\n\ntestBoth('modifying a cacheable property should update cache', function(get, set) {\n  equal(get(obj, 'foo'), 'bar 1', 'first get');\n  equal(get(obj, 'foo'), 'bar 1', 'second get');\n\n  equal(set(obj, 'foo', 'baz'), 'baz', 'setting');\n  equal(get(obj, 'foo'), 'bar 2', 'third get');\n  equal(count, 2, 'should not invoke again');\n});\n\ntestBoth('inherited property should not pick up cache', function(get, set) {\n  var objB = Ember.create(obj);\n\n  equal(get(obj, 'foo'), 'bar 1', 'obj first get');\n  equal(get(objB, 'foo'), 'bar 2', 'objB first get');\n\n  equal(get(obj, 'foo'), 'bar 1', 'obj second get');\n  equal(get(objB, 'foo'), 'bar 2', 'objB second get');\n\n  set(obj, 'foo', 'baz'); // modify A\n  equal(get(obj, 'foo'), 'bar 3', 'obj third get');\n  equal(get(objB, 'foo'), 'bar 2', 'objB third get');\n});\n\ntestBoth('cacheFor should return the cached value', function(get, set) {\n  equal(Ember.cacheFor(obj, 'foo'), undefined, \"should not yet be a cached value\");\n\n  get(obj, 'foo');\n\n  equal(Ember.cacheFor(obj, 'foo'), \"bar 1\", \"should retrieve cached value\");\n});\n\ntestBoth('cacheFor should return falsy cached values', function(get, set) {\n\n  Ember.defineProperty(obj, 'falsy', Ember.computed(function() {\n    return false;\n  }).cacheable());\n\n  equal(Ember.cacheFor(obj, 'falsy'), undefined, \"should not yet be a cached value\");\n\n  get(obj, 'falsy');\n\n  equal(Ember.cacheFor(obj, 'falsy'), false, \"should retrieve cached value\");\n});\n\n// ..........................................................\n// DEPENDENT KEYS\n//\n\nmodule('Ember.computed - dependentkey', {\n  setup: function() {\n    obj = { bar: 'baz' };\n    count = 0;\n    Ember.defineProperty(obj, 'foo', Ember.computed(function() {\n      count++;\n      return 'bar '+count;\n    }).property('bar').cacheable());\n  },\n\n  teardown: function() {\n    obj = count = null;\n  }\n});\n\ntest('should lazily watch dependent keys when watched itself', function () {\n  equal(Ember.isWatching(obj, 'bar'), false, 'precond not watching dependent key');\n  Ember.watch(obj, 'foo');\n  equal(Ember.isWatching(obj, 'bar'), true, 'lazily watching dependent key');\n});\n\ntestBoth('should lazily watch dependent keys on set', function (get, set) {\n  equal(Ember.isWatching(obj, 'bar'), false, 'precond not watching dependent key');\n  set(obj, 'foo', 'bar');\n  equal(Ember.isWatching(obj, 'bar'), true, 'lazily watching dependent key');\n});\n\ntestBoth('should lazily watch dependent keys on get', function (get, set) {\n  equal(Ember.isWatching(obj, 'bar'), false, 'precond not watching dependent key');\n  get(obj, 'foo');\n  equal(Ember.isWatching(obj, 'bar'), true, 'lazily watching dependent key');\n});\n\ntestBoth('local dependent key should invalidate cache', function(get, set) {\n  equal(Ember.isWatching(obj, 'bar'), false, 'precond not watching dependent key');\n  equal(get(obj, 'foo'), 'bar 1', 'get once');\n  equal(Ember.isWatching(obj, 'bar'), true, 'lazily setup watching dependent key');\n  equal(get(obj, 'foo'), 'bar 1', 'cached retrieve');\n\n  set(obj, 'bar', 'BIFF'); // should invalidate foo\n\n  equal(get(obj, 'foo'), 'bar 2', 'should recache');\n  equal(get(obj, 'foo'), 'bar 2', 'cached retrieve');\n});\n\ntestBoth('should invalidate multiple nested dependent keys', function(get, set) {\n\n  Ember.defineProperty(obj, 'bar', Ember.computed(function() {\n    count++;\n    return 'baz '+count;\n  }).property('baz').cacheable());\n\n  equal(Ember.isWatching(obj, 'bar'), false, 'precond not watching dependent key');\n  equal(Ember.isWatching(obj, 'baz'), false, 'precond not watching dependent key');\n  equal(get(obj, 'foo'), 'bar 1', 'get once');\n  equal(Ember.isWatching(obj, 'bar'), true, 'lazily setup watching dependent key');\n  equal(Ember.isWatching(obj, 'baz'), true, 'lazily setup watching dependent key');\n  equal(get(obj, 'foo'), 'bar 1', 'cached retrieve');\n\n  set(obj, 'baz', 'BIFF'); // should invalidate bar -> foo\n  equal(Ember.isWatching(obj, 'bar'), false, 'should not be watching dependent key after cache cleared');\n  equal(Ember.isWatching(obj, 'baz'), false, 'should not be watching dependent key after cache cleared');\n\n  equal(get(obj, 'foo'), 'bar 2', 'should recache');\n  equal(get(obj, 'foo'), 'bar 2', 'cached retrieve');\n  equal(Ember.isWatching(obj, 'bar'), true, 'lazily setup watching dependent key');\n  equal(Ember.isWatching(obj, 'baz'), true, 'lazily setup watching dependent key');\n});\n\ntestBoth('circular keys should not blow up', function(get, set) {\n\n  Ember.defineProperty(obj, 'bar', Ember.computed(function() {\n    count++;\n    return 'bar '+count;\n  }).property('foo').cacheable());\n\n  Ember.defineProperty(obj, 'foo', Ember.computed(function() {\n    count++;\n    return 'foo '+count;\n  }).property('bar').cacheable());\n\n  equal(get(obj, 'foo'), 'foo 1', 'get once');\n  equal(get(obj, 'foo'), 'foo 1', 'cached retrieve');\n\n  set(obj, 'bar', 'BIFF'); // should invalidate bar -> foo -> bar\n\n  equal(get(obj, 'foo'), 'foo 3', 'should recache');\n  equal(get(obj, 'foo'), 'foo 3', 'cached retrieve');\n});\n\ntestBoth('redefining a property should undo old depenent keys', function(get ,set) {\n\n  equal(Ember.isWatching(obj, 'bar'), false, 'precond not watching dependent key');\n  equal(get(obj, 'foo'), 'bar 1');\n  equal(Ember.isWatching(obj, 'bar'), true, 'lazily watching dependent key');\n\n  Ember.defineProperty(obj, 'foo', Ember.computed(function() {\n    count++;\n    return 'baz '+count;\n  }).property('baz').cacheable());\n\n  equal(Ember.isWatching(obj, 'bar'), false, 'after redefining should not be watching dependent key');\n\n  equal(get(obj, 'foo'), 'baz 2');\n\n  set(obj, 'bar', 'BIFF'); // should not kill cache\n  equal(get(obj, 'foo'), 'baz 2');\n\n  set(obj, 'baz', 'BOP');\n  equal(get(obj, 'foo'), 'baz 3');\n});\n\n// ..........................................................\n// CHAINED DEPENDENT KEYS\n//\n\nvar func, moduleOpts = {\n  setup: function() {\n    obj = {\n      foo: {\n        bar: {\n          baz: {\n            biff: \"BIFF\"\n          }\n        }\n      }\n    };\n\n    Global = {\n      foo: {\n        bar: {\n          baz: {\n            biff: \"BIFF\"\n          }\n        }\n      }\n    };\n\n    count = 0;\n    func = function() {\n      count++;\n      return Ember.get(obj, 'foo.bar.baz.biff')+' '+count;\n    };\n  },\n\n  teardown: function() {\n    obj = count = func = Global = null;\n  }\n};\n\nmodule('Ember.computed - dependentkey with chained properties', moduleOpts);\n\ntestBoth('depending on simple chain', function(get, set) {\n\n  // assign computed property\n  Ember.defineProperty(obj, 'prop',\n    Ember.computed(func).property('foo.bar.baz.biff').cacheable());\n\n  equal(get(obj, 'prop'), 'BIFF 1');\n\n  set(Ember.get(obj, 'foo.bar.baz'), 'biff', 'BUZZ');\n  equal(get(obj, 'prop'), 'BUZZ 2');\n  equal(get(obj, 'prop'), 'BUZZ 2');\n\n  set(Ember.get(obj, 'foo.bar'),  'baz', { biff: 'BLOB' });\n  equal(get(obj, 'prop'), 'BLOB 3');\n  equal(get(obj, 'prop'), 'BLOB 3');\n\n  set(Ember.get(obj, 'foo.bar.baz'), 'biff', 'BUZZ');\n  equal(get(obj, 'prop'), 'BUZZ 4');\n  equal(get(obj, 'prop'), 'BUZZ 4');\n\n  set(Ember.get(obj, 'foo'), 'bar', { baz: { biff: 'BOOM' } });\n  equal(get(obj, 'prop'), 'BOOM 5');\n  equal(get(obj, 'prop'), 'BOOM 5');\n\n  set(Ember.get(obj, 'foo.bar.baz'), 'biff', 'BUZZ');\n  equal(get(obj, 'prop'), 'BUZZ 6');\n  equal(get(obj, 'prop'), 'BUZZ 6');\n\n  set(obj, 'foo', { bar: { baz: { biff: 'BLARG' } } });\n  equal(get(obj, 'prop'), 'BLARG 7');\n  equal(get(obj, 'prop'), 'BLARG 7');\n\n  set(Ember.get(obj, 'foo.bar.baz'), 'biff', 'BUZZ');\n  equal(get(obj, 'prop'), 'BUZZ 8');\n  equal(get(obj, 'prop'), 'BUZZ 8');\n\n  Ember.defineProperty(obj, 'prop');\n  set(obj, 'prop', 'NONE');\n  equal(get(obj, 'prop'), 'NONE');\n\n  set(obj, 'foo', { bar: { baz: { biff: 'BLARG' } } });\n  equal(get(obj, 'prop'), 'NONE'); // should do nothing\n  equal(count, 8, 'should be not have invoked computed again');\n\n});\n\ntestBoth('depending on Global chain', function(get, set) {\n\n  // assign computed property\n  Ember.defineProperty(obj, 'prop', Ember.computed(function() {\n    count++;\n    return Ember.get('Global.foo.bar.baz.biff')+' '+count;\n  }).property('Global.foo.bar.baz.biff').cacheable());\n\n  equal(get(obj, 'prop'), 'BIFF 1');\n\n  set(Ember.get(Global, 'foo.bar.baz'), 'biff', 'BUZZ');\n  equal(get(obj, 'prop'), 'BUZZ 2');\n  equal(get(obj, 'prop'), 'BUZZ 2');\n\n  set(Ember.get(Global, 'foo.bar'), 'baz', { biff: 'BLOB' });\n  equal(get(obj, 'prop'), 'BLOB 3');\n  equal(get(obj, 'prop'), 'BLOB 3');\n\n  set(Ember.get(Global, 'foo.bar.baz'), 'biff', 'BUZZ');\n  equal(get(obj, 'prop'), 'BUZZ 4');\n  equal(get(obj, 'prop'), 'BUZZ 4');\n\n  set(Ember.get(Global, 'foo'), 'bar', { baz: { biff: 'BOOM' } });\n  equal(get(obj, 'prop'), 'BOOM 5');\n  equal(get(obj, 'prop'), 'BOOM 5');\n\n  set(Ember.get(Global, 'foo.bar.baz'), 'biff', 'BUZZ');\n  equal(get(obj, 'prop'), 'BUZZ 6');\n  equal(get(obj, 'prop'), 'BUZZ 6');\n\n  set(Global, 'foo', { bar: { baz: { biff: 'BLARG' } } });\n  equal(get(obj, 'prop'), 'BLARG 7');\n  equal(get(obj, 'prop'), 'BLARG 7');\n\n  set(Ember.get(Global, 'foo.bar.baz'), 'biff', 'BUZZ');\n  equal(get(obj, 'prop'), 'BUZZ 8');\n  equal(get(obj, 'prop'), 'BUZZ 8');\n\n  Ember.defineProperty(obj, 'prop');\n  set(obj, 'prop', 'NONE');\n  equal(get(obj, 'prop'), 'NONE');\n\n  set(Global, 'foo', { bar: { baz: { biff: 'BLARG' } } });\n  equal(get(obj, 'prop'), 'NONE'); // should do nothing\n  equal(count, 8, 'should be not have invoked computed again');\n\n});\n\ntestBoth('chained dependent keys should evaluate computed properties lazily', function(get,set){\n  Ember.defineProperty(obj.foo.bar, 'b', Ember.computed(func).property().cacheable());\n  Ember.defineProperty(obj.foo, 'c', Ember.computed(function(){}).property('bar.b').cacheable());\n  equal(count, 0, 'b should not run');\n});\n\n\n// ..........................................................\n// BUGS\n//\n\nmodule('computed edge cases');\n\ntest('adding a computed property should show up in key iteration',function() {\n\n  var obj = {};\n  Ember.defineProperty(obj, 'foo', Ember.computed(function() {}));\n\n  var found = [];\n  for(var key in obj) found.push(key);\n  ok(Ember.EnumerableUtils.indexOf(found, 'foo')>=0, 'should find computed property in iteration found='+found);\n  ok('foo' in obj, 'foo in obj should pass');\n});\n\nmodule('CP macros');\n\ntestBoth('Ember.computed.not', function(get, set) {\n  var obj = {foo: true};\n  Ember.defineProperty(obj, 'notFoo', Ember.computed.not('foo'));\n  equal(get(obj, 'notFoo'), false);\n\n  obj = {foo: {bar: true}};\n  Ember.defineProperty(obj, 'notFoo', Ember.computed.not('foo.bar'));\n  equal(get(obj, 'notFoo'), false);\n});\n\ntestBoth('Ember.computed.empty', function(get, set) {\n  var obj = {foo: [], bar: undefined, baz: null, quz: ''};\n  Ember.defineProperty(obj, 'fooEmpty', Ember.computed.empty('foo'));\n  Ember.defineProperty(obj, 'barEmpty', Ember.computed.empty('bar'));\n  Ember.defineProperty(obj, 'bazEmpty', Ember.computed.empty('baz'));\n  Ember.defineProperty(obj, 'quzEmpty', Ember.computed.empty('quz'));\n\n  equal(get(obj, 'fooEmpty'), true);\n  set(obj, 'foo', [1]);\n  equal(get(obj, 'fooEmpty'), false);\n  equal(get(obj, 'barEmpty'), true);\n  equal(get(obj, 'bazEmpty'), true);\n  equal(get(obj, 'quzEmpty'), true);\n  set(obj, 'quz', 'asdf');\n  equal(get(obj, 'quzEmpty'), false);\n});\n\ntestBoth('Ember.computed.bool', function(get, set) {\n  var obj = {foo: function(){}, bar: 'asdf', baz: null, quz: false};\n  Ember.defineProperty(obj, 'fooBool', Ember.computed.bool('foo'));\n  Ember.defineProperty(obj, 'barBool', Ember.computed.bool('bar'));\n  Ember.defineProperty(obj, 'bazBool', Ember.computed.bool('baz'));\n  Ember.defineProperty(obj, 'quzBool', Ember.computed.bool('quz'));\n  equal(get(obj, 'fooBool'), true);\n  equal(get(obj, 'barBool'), true);\n  equal(get(obj, 'bazBool'), false);\n  equal(get(obj, 'quzBool'), false);\n});\n\n})();\n//@ sourceURL=ember-metal/~tests/computed_test");