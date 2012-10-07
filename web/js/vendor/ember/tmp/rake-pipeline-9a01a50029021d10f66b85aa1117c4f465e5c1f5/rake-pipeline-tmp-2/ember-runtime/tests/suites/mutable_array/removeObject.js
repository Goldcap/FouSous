minispade.register('ember-runtime/~tests/suites/mutable_array/removeObject', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\nminispade.require('ember-runtime/~tests/suites/mutable_array');\n\nvar suite = Ember.MutableArrayTests;\n\nsuite.module('removeObject');\n\nsuite.test(\"should return receiver\", function() {\n  var before, obj;\n  before = this.newFixture(3);\n  obj    = this.newObject(before);\n  equal(obj.removeObject(before[1]), obj, 'should return receiver');\n});\n\nsuite.test(\"[A,B,C].removeObject(B) => [A,C] + notify\", function() {\n  var obj, before, after, observer;\n\n  before = this.newFixture(3);\n  after  = [before[0], before[2]];\n  obj = this.newObject(before);\n  observer = this.newObserver(obj, '[]', '@each', 'length', 'firstObject', 'lastObject');\n  obj.getProperties('firstObject', 'lastObject'); /* Prime the cache */\n\n  obj.removeObject(before[1]);\n\n  deepEqual(this.toArray(obj), after, 'post item results');\n  equal(Ember.get(obj, 'length'), after.length, 'length');\n\n  if (observer.isEnabled) {\n    equal(observer.timesCalled('[]'), 1, 'should have notified [] once');\n    equal(observer.timesCalled('@each'), 1, 'should have notified @each once');\n    equal(observer.timesCalled('length'), 1, 'should have notified length once');\n\n    equal(observer.validate('firstObject'), false, 'should NOT have notified firstObject once');\n    equal(observer.validate('lastObject'), false, 'should NOT have notified lastObject once');\n  }\n});\n\nsuite.test(\"[A,B,C].removeObject(D) => [A,B,C]\", function() {\n  var obj, before, after, observer, item;\n\n  before = this.newFixture(3);\n  after  = before;\n  item   = this.newFixture(1)[0];\n  obj = this.newObject(before);\n  observer = this.newObserver(obj, '[]', '@each', 'length', 'firstObject', 'lastObject');\n  obj.getProperties('firstObject', 'lastObject'); /* Prime the cache */\n\n  obj.removeObject(item); // note: item not in set\n\n  deepEqual(this.toArray(obj), after, 'post item results');\n  equal(Ember.get(obj, 'length'), after.length, 'length');\n\n  if (observer.isEnabled) {\n    equal(observer.validate('[]'), false, 'should NOT have notified []');\n    equal(observer.validate('@each'), false, 'should NOT have notified @each');\n    equal(observer.validate('length'), false, 'should NOT have notified length');\n\n    equal(observer.validate('firstObject'), false, 'should NOT have notified firstObject once');\n    equal(observer.validate('lastObject'), false, 'should NOT have notified lastObject once');\n  }\n});\n\n})();\n//@ sourceURL=ember-runtime/~tests/suites/mutable_array/removeObject");