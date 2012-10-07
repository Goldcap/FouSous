minispade.register('ember-runtime/~tests/system/object/observer_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n/*globals testBoth */\nminispade.require('ember-runtime/~tests/props_helper');\n\nmodule('Ember.Object observer');\n\ntestBoth('observer on class', function(get, set) {\n\n  var MyClass = Ember.Object.extend({\n\n    count: 0,\n\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar')\n\n  });\n\n  var obj = new MyClass();\n  equal(get(obj, 'count'), 0, 'should not invoke observer immediately');\n\n  set(obj, 'bar', \"BAZ\");\n  equal(get(obj, 'count'), 1, 'should invoke observer after change');\n\n});\n\ntestBoth('observer on subclass', function(get, set) {\n\n  var MyClass = Ember.Object.extend({\n\n    count: 0,\n\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar')\n\n  });\n\n  var Subclass = MyClass.extend({\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'baz')\n  });\n\n  var obj = new Subclass();\n  equal(get(obj, 'count'), 0, 'should not invoke observer immediately');\n\n  set(obj, 'bar', \"BAZ\");\n  equal(get(obj, 'count'), 0, 'should not invoke observer after change');\n\n  set(obj, 'baz', \"BAZ\");\n  equal(get(obj, 'count'), 1, 'should not invoke observer after change');\n\n});\n\ntestBoth('observer on instance', function(get, set) {\n\n  var obj = Ember.Object.create({\n\n    count: 0,\n\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar')\n\n  });\n\n  equal(get(obj, 'count'), 0, 'should not invoke observer immediately');\n\n  set(obj, 'bar', \"BAZ\");\n  equal(get(obj, 'count'), 1, 'should invoke observer after change');\n\n});\n\ntestBoth('observer on instance overridding class', function(get, set) {\n\n  var MyClass = Ember.Object.extend({\n\n    count: 0,\n\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar')\n\n  });\n\n  var obj = MyClass.create({\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'baz') // <-- change property we observe\n  });\n\n  equal(get(obj, 'count'), 0, 'should not invoke observer immediately');\n\n  set(obj, 'bar', \"BAZ\");\n  equal(get(obj, 'count'), 0, 'should not invoke observer after change');\n\n  set(obj, 'baz', \"BAZ\");\n  equal(get(obj, 'count'), 1, 'should not invoke observer after change');\n\n});\n\ntestBoth('observer should not fire after being destroyed', function(get, set) {\n\n  var obj = Ember.Object.create({\n    count: 0,\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar')\n  });\n\n  equal(get(obj, 'count'), 0, 'precond - should not invoke observer immediately');\n\n  Ember.run(function() { obj.destroy(); });\n\n  if (Ember.assert) {\n    raises(function() {\n      set(obj, 'bar', \"BAZ\");\n    }, Error, \"raises error when setting a property\");\n  } else {\n    set(obj, 'bar', \"BAZ\");\n  }\n\n  equal(get(obj, 'count'), 0, 'should not invoke observer after change');\n});\n// ..........................................................\n// COMPLEX PROPERTIES\n//\n\n\ntestBoth('chain observer on class', function(get, set) {\n\n  var MyClass = Ember.Object.extend({\n    count: 0,\n\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar.baz')\n  });\n\n  var obj1 = MyClass.create({\n    bar: { baz: 'biff' }\n  });\n\n  var obj2 = MyClass.create({\n    bar: { baz: 'biff2' }\n  });\n\n  equal(get(obj1, 'count'), 0, 'should not invoke yet');\n  equal(get(obj2, 'count'), 0, 'should not invoke yet');\n\n  set(get(obj1, 'bar'), 'baz', 'BIFF1');\n  equal(get(obj1, 'count'), 1, 'should invoke observer on obj1');\n  equal(get(obj2, 'count'), 0, 'should not invoke yet');\n\n  set(get(obj2, 'bar'), 'baz', 'BIFF2');\n  equal(get(obj1, 'count'), 1, 'should not invoke again');\n  equal(get(obj2, 'count'), 1, 'should invoke observer on obj2');\n});\n\n\ntestBoth('chain observer on class', function(get, set) {\n\n  var MyClass = Ember.Object.extend({\n    count: 0,\n\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar.baz')\n  });\n\n  var obj1 = MyClass.create({\n    bar: { baz: 'biff' }\n  });\n\n  var obj2 = MyClass.create({\n    bar: { baz: 'biff2' },\n    bar2: { baz: 'biff3' },\n\n    foo: Ember.observer(function() {\n      set(this, 'count', get(this, 'count')+1);\n    }, 'bar2.baz')\n  });\n\n  equal(get(obj1, 'count'), 0, 'should not invoke yet');\n  equal(get(obj2, 'count'), 0, 'should not invoke yet');\n\n  set(get(obj1, 'bar'), 'baz', 'BIFF1');\n  equal(get(obj1, 'count'), 1, 'should invoke observer on obj1');\n  equal(get(obj2, 'count'), 0, 'should not invoke yet');\n\n  set(get(obj2, 'bar'), 'baz', 'BIFF2');\n  equal(get(obj1, 'count'), 1, 'should not invoke again');\n  equal(get(obj2, 'count'), 0, 'should not invoke yet');\n\n  set(get(obj2, 'bar2'), 'baz', 'BIFF3');\n  equal(get(obj1, 'count'), 1, 'should not invoke again');\n  equal(get(obj2, 'count'), 1, 'should invoke observer on obj2');\n});\n\n})();\n//@ sourceURL=ember-runtime/~tests/system/object/observer_test");