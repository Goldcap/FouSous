minispade.register('ember-runtime/~tests/mixins/array_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n/*globals testBoth */\nminispade.require('ember-runtime/~tests/props_helper');\nminispade.require('ember-runtime/~tests/suites/array');\n\n/*\n  Implement a basic fake mutable array.  This validates that any non-native\n  enumerable can impl this API.\n*/\nvar TestArray = Ember.Object.extend(Ember.Array, {\n\n  _content: null,\n\n  init: function(ary) {\n    this._content = ary || [];\n  },\n\n  // some methods to modify the array so we can test changes.  Note that\n  // arrays can be modified even if they don't implement MutableArray.  The\n  // MutableArray is just a standard API for mutation but not required.\n  addObject: function(obj) {\n    var idx = this._content.length;\n    this.arrayContentWillChange(idx, 0, 1);\n    this._content.push(obj);\n    this.arrayContentDidChange(idx, 0, 1);\n  },\n\n  removeFirst: function(idx) {\n    this.arrayContentWillChange(0, 1, 0);\n    this._content.shift();\n    this.arrayContentDidChange(0, 1, 0);\n  },\n\n  objectAt: function(idx) {\n    return this._content[idx];\n  },\n\n  length: Ember.computed(function() {\n    return this._content.length;\n  }).property().cacheable(),\n\n  slice: function() {\n    return this._content.slice();\n  }\n\n});\n\n\nEmber.ArrayTests.extend({\n\n  name: 'Basic Mutable Array',\n\n  newObject: function(ary) {\n    ary = ary ? ary.slice() : this.newFixture(3);\n    return new TestArray(ary);\n  },\n\n  // allows for testing of the basic enumerable after an internal mutation\n  mutate: function(obj) {\n    obj.addObject(this.getFixture(1)[0]);\n  },\n\n  toArray: function(obj) {\n    return obj.slice();\n  }\n\n}).run();\n\n// ..........................................................\n// CONTENT DID CHANGE\n//\n\nvar DummyArray = Ember.Object.extend(Ember.Array, {\n  nextObject: function() {},\n  length: 0,\n  objectAt: function(idx) { return 'ITEM-'+idx; }\n});\n\nvar obj, observer;\n\n\n// ..........................................................\n// NOTIFY ARRAY OBSERVERS\n//\n\nmodule('mixins/array/arrayContent[Will|Did]Change');\n\ntest('should notify observers of []', function() {\n\n  obj = DummyArray.create({\n    _count: 0,\n    enumerablePropertyDidChange: Ember.observer(function() {\n      this._count++;\n    }, '[]')\n  });\n\n  equal(obj._count, 0, 'should not have invoked yet');\n\n  obj.arrayContentWillChange(0, 1, 1);\n  obj.arrayContentDidChange(0, 1, 1);\n\n  equal(obj._count, 1, 'should have invoked');\n\n});\n\n// ..........................................................\n// NOTIFY CHANGES TO LENGTH\n//\n\nmodule('notify observers of length', {\n  setup: function() {\n    obj = DummyArray.create({\n      _after: 0,\n      lengthDidChange: Ember.observer(function() {\n        this._after++;\n      }, 'length')\n\n    });\n\n    equal(obj._after, 0, 'should not have fired yet');\n  },\n\n  teardown: function() {\n    obj = null;\n  }\n});\n\ntest('should notify observers when call with no params', function() {\n  obj.arrayContentWillChange();\n  equal(obj._after, 0);\n\n  obj.arrayContentDidChange();\n  equal(obj._after, 1);\n});\n\n// API variation that included items only\ntest('should not notify when passed lengths are same', function() {\n  obj.arrayContentWillChange(0, 1, 1);\n  equal(obj._after, 0);\n\n  obj.arrayContentDidChange(0, 1, 1);\n  equal(obj._after, 0);\n});\n\ntest('should notify when passed lengths are different', function() {\n  obj.arrayContentWillChange(0, 1, 2);\n  equal(obj._after, 0);\n\n  obj.arrayContentDidChange(0, 1, 2);\n  equal(obj._after, 1);\n});\n\n\n// ..........................................................\n// NOTIFY ARRAY OBSERVER\n//\n\nmodule('notify array observers', {\n  setup: function() {\n    obj = DummyArray.create();\n\n    observer = Ember.Object.create({\n      _before: null,\n      _after: null,\n\n      arrayWillChange: function() {\n        equal(this._before, null); // should only call once\n        this._before = Array.prototype.slice.call(arguments);\n      },\n\n      arrayDidChange: function() {\n        equal(this._after, null); // should only call once\n        this._after = Array.prototype.slice.call(arguments);\n      }\n    });\n\n    obj.addArrayObserver(observer);\n  },\n\n  teardown: function() {\n    obj = observer = null;\n  }\n});\n\ntest('should notify enumerable observers when called with no params', function() {\n  obj.arrayContentWillChange();\n  deepEqual(observer._before, [obj, 0, -1, -1]);\n\n  obj.arrayContentDidChange();\n  deepEqual(observer._after, [obj, 0, -1, -1]);\n});\n\n// API variation that included items only\ntest('should notify when called with same length items', function() {\n  obj.arrayContentWillChange(0, 1, 1);\n  deepEqual(observer._before, [obj, 0, 1, 1]);\n\n  obj.arrayContentDidChange(0, 1, 1);\n  deepEqual(observer._after, [obj, 0, 1, 1]);\n});\n\ntest('should notify when called with diff length items', function() {\n  obj.arrayContentWillChange(0, 2, 1);\n  deepEqual(observer._before, [obj, 0, 2, 1]);\n\n  obj.arrayContentDidChange(0, 2, 1);\n  deepEqual(observer._after, [obj, 0, 2, 1]);\n});\n\ntest('removing enumerable observer should disable', function() {\n  obj.removeArrayObserver(observer);\n  obj.arrayContentWillChange();\n  deepEqual(observer._before, null);\n\n  obj.arrayContentDidChange();\n  deepEqual(observer._after, null);\n});\n\n// ..........................................................\n// NOTIFY ENUMERABLE OBSERVER\n//\n\nmodule('notify enumerable observers as well', {\n  setup: function() {\n    obj = DummyArray.create();\n\n    observer = Ember.Object.create({\n      _before: null,\n      _after: null,\n\n      enumerableWillChange: function() {\n        equal(this._before, null); // should only call once\n        this._before = Array.prototype.slice.call(arguments);\n      },\n\n      enumerableDidChange: function() {\n        equal(this._after, null); // should only call once\n        this._after = Array.prototype.slice.call(arguments);\n      }\n    });\n\n    obj.addEnumerableObserver(observer);\n  },\n\n  teardown: function() {\n    obj = observer = null;\n  }\n});\n\ntest('should notify enumerable observers when called with no params', function() {\n  obj.arrayContentWillChange();\n  deepEqual(observer._before, [obj, null, null], 'before');\n\n  obj.arrayContentDidChange();\n  deepEqual(observer._after, [obj, null, null], 'after');\n});\n\n// API variation that included items only\ntest('should notify when called with same length items', function() {\n  obj.arrayContentWillChange(0, 1, 1);\n  deepEqual(observer._before, [obj, ['ITEM-0'], 1], 'before');\n\n  obj.arrayContentDidChange(0, 1, 1);\n  deepEqual(observer._after, [obj, 1, ['ITEM-0']], 'after');\n});\n\ntest('should notify when called with diff length items', function() {\n  obj.arrayContentWillChange(0, 2, 1);\n  deepEqual(observer._before, [obj, ['ITEM-0', 'ITEM-1'], 1], 'before');\n\n  obj.arrayContentDidChange(0, 2, 1);\n  deepEqual(observer._after, [obj, 2, ['ITEM-0']], 'after');\n});\n\ntest('removing enumerable observer should disable', function() {\n  obj.removeEnumerableObserver(observer);\n  obj.arrayContentWillChange();\n  deepEqual(observer._before, null, 'before');\n\n  obj.arrayContentDidChange();\n  deepEqual(observer._after, null, 'after');\n});\n\n// ..........................................................\n// @each\n//\n\nvar ary;\n\nmodule('Ember.Array.@each support', {\n  setup: function() {\n    ary = new TestArray([\n      { isDone: true,  desc: 'Todo 1' },\n      { isDone: false, desc: 'Todo 2' },\n      { isDone: true,  desc: 'Todo 3' },\n      { isDone: false, desc: 'Todo 4' }\n    ]);\n  },\n\n  teardown: function() {\n    ary = null;\n  }\n});\n\ntest('adding an object should notify (@each)', function() {\n\n  var get = Ember.get, set = Ember.set;\n  var called = 0;\n\n  var observerObject = Ember.Object.create({\n    wasCalled: function() {\n      called++;\n    }\n  });\n\n  // Ember.get(ary, '@each');\n  Ember.addObserver(ary, '@each', observerObject, 'wasCalled');\n\n  ary.addObject(Ember.Object.create({\n    desc: \"foo\",\n    isDone: false\n  }));\n\n  equal(called, 1, \"calls observer when object is pushed\");\n\n});\n\ntest('adding an object should notify (@each.isDone)', function() {\n\n  var get = Ember.get, set = Ember.set;\n  var called = 0;\n\n  var observerObject = Ember.Object.create({\n    wasCalled: function() {\n      called++;\n    }\n  });\n\n  Ember.addObserver(ary, '@each.isDone', observerObject, 'wasCalled');\n\n  ary.addObject(Ember.Object.create({\n    desc: \"foo\",\n    isDone: false\n  }));\n\n  equal(called, 1, \"calls observer when object is pushed\");\n\n});\n\ntest('modifying the array should also indicate the isDone prop itself has changed', function() {\n  // NOTE: we never actually get the '@each.isDone' property here.  This is\n  // important because it tests the case where we don't have an isDone\n  // EachArray materialized but just want to know when the property has\n  // changed.\n\n  var get = Ember.get, set = Ember.set;\n  var each = get(ary, '@each');\n  var count = 0;\n\n  Ember.addObserver(each, 'isDone', function() { count++; });\n\n  count = 0;\n  var item = ary.objectAt(2);\n  set(item, 'isDone', !get(item, 'isDone'));\n  equal(count, 1, '@each.isDone should have notified');\n});\n\n\ntestBoth(\"should be clear caches for computed properties that have dependent keys on arrays that are changed after object initialization\", function(get, set) {\n  var obj = Ember.Object.create({\n    init: function() {\n      set(this, 'resources', Ember.A());\n    },\n\n    common: Ember.computed(function() {\n      return get(get(this, 'resources').objectAt(0), 'common');\n    }).property('resources.@each.common').cacheable()\n  });\n\n  get(obj, 'resources').pushObject(Ember.Object.create({ common: \"HI!\" }));\n  equal(\"HI!\", get(obj, 'common'));\n\n  set(get(obj, 'resources').objectAt(0), 'common', \"BYE!\");\n  equal(\"BYE!\", get(obj, 'common'));\n});\n\ntestBoth(\"observers that contain @each in the path should fire only once the first time they are accessed\", function(get, set) {\n  var count = 0;\n\n  var obj = Ember.Object.create({\n    init: function() {\n      // Observer fires once when resources changes\n      set(this, 'resources', Ember.A());\n    },\n\n    commonDidChange: Ember.observer(function() {\n      count++;\n    }, 'resources.@each.common')\n  });\n\n  // Observer fires second time when new object is added\n  get(obj, 'resources').pushObject(Ember.Object.create({ common: \"HI!\" }));\n  // Observer fires third time when property on an object is changed\n  set(get(obj, 'resources').objectAt(0), 'common', \"BYE!\");\n\n  equal(count, 3, \"observers should only be called once\");\n});\n\n})();\n//@ sourceURL=ember-runtime/~tests/mixins/array_test");