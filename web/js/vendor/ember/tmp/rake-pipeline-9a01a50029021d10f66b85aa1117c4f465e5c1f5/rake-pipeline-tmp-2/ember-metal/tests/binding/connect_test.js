minispade.register('ember-metal/~tests/binding/connect_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n/*globals GlobalA:true GlobalB:true */\nminispade.require('ember-metal/~tests/props_helper');\n\nvar previousPreventRunloop;\n\nfunction performTest(binding, a, b, get, set, connect) {\n  if (connect === undefined) connect = function(){binding.connect(a);};\n\n  ok(!Ember.run.currentRunLoop, 'performTest should not have a currentRunLoop');\n\n  equal(get(a, 'foo'), 'FOO', 'a should not have changed');\n  equal(get(b, 'bar'), 'BAR', 'b should not have changed');\n\n  connect();\n\n  equal(get(a, 'foo'), 'BAR', 'a should have changed');\n  equal(get(b, 'bar'), 'BAR', 'b should have changed');\n  //\n  // make sure changes sync both ways\n  Ember.run(function () {\n    set(b, 'bar', 'BAZZ');\n  });\n  equal(get(a, 'foo'), 'BAZZ', 'a should have changed');\n\n  Ember.run(function () {\n    set(a, 'foo', 'BARF');\n  });\n  equal(get(b, 'bar'), 'BARF', 'a should have changed');\n}\n\nmodule(\"Ember.Binding\");\n\ntestBoth('Connecting a binding between two properties', function(get, set) {\n  var a = { foo: 'FOO', bar: 'BAR' };\n  \n  // a.bar -> a.foo\n  var binding = new Ember.Binding('foo', 'bar');\n\n  performTest(binding, a, a, get, set);\n});\n\ntestBoth('Connecting a binding between two objects', function(get, set) {\n  var b = { bar: 'BAR' };\n  var a = { foo: 'FOO', b: b };\n\n  // b.bar -> a.foo\n  var binding = new Ember.Binding('foo', 'b.bar');\n\n  performTest(binding, a, b, get, set);\n});\n\ntestBoth('Connecting a binding to path', function(get, set) {\n  var a = { foo: 'FOO' };\n  GlobalB = {\n    b: { bar: 'BAR' }\n  };\n\n  var b = get(GlobalB, 'b');\n\n  // globalB.b.bar -> a.foo\n  var binding = new Ember.Binding('foo', 'GlobalB.b.bar');\n\n  performTest(binding, a, b, get, set);\n\n  // make sure modifications update\n  b = { bar: 'BIFF' };\n  \n  Ember.run(function(){\n    set(GlobalB, 'b', b);\n  });\n  \n  equal(get(a, 'foo'), 'BIFF', 'a should have changed');\n\n});\n\ntestBoth('Calling connect more than once', function(get, set) {\n  var b = { bar: 'BAR' };\n  var a = { foo: 'FOO', b: b };\n\n  // b.bar -> a.foo\n  var binding = new Ember.Binding('foo', 'b.bar');\n\n  performTest(binding, a, b, get, set, function () {\n    binding.connect(a);\n\n    binding.connect(a);\n  });\n});\n\ntestBoth('Bindings should be inherited', function(get, set) {\n\n  var a = { foo: 'FOO', b: { bar: 'BAR' } };\n  var binding = new Ember.Binding('foo', 'b.bar');\n  var a2;\n\n  Ember.run(function () {\n    binding.connect(a);\n\n    a2 = Ember.create(a);\n    Ember.rewatch(a2);\n  });\n\n  equal(get(a2, 'foo'), \"BAR\", \"Should have synced binding on child\");\n  equal(get(a,  'foo'), \"BAR\", \"Should NOT have synced binding on parent\");\n\n  Ember.run(function () {\n    set(a2, 'b', { bar: 'BAZZ' });\n  });\n\n  equal(get(a2, 'foo'), \"BAZZ\", \"Should have synced binding on child\");\n  equal(get(a,  'foo'), \"BAR\", \"Should NOT have synced binding on parent\");\n\n});\n\ntest('inherited bindings should sync on create', function() {\n  var a;\n  Ember.run(function () {\n    var A = function() {\n      Ember.bind(this, 'foo', 'bar.baz');\n    };\n\n    a = new A();\n    Ember.set(a, 'bar', { baz: 'BAZ' });\n  });\n\n  equal(Ember.get(a, 'foo'), 'BAZ', 'should have synced binding on new obj');\n});\n\n\n})();\n//@ sourceURL=ember-metal/~tests/binding/connect_test");