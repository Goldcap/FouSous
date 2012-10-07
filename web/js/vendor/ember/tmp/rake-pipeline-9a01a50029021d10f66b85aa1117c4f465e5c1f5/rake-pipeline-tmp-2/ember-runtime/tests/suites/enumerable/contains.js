minispade.register('ember-runtime/~tests/suites/enumerable/contains', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\nminispade.require('ember-runtime/~tests/suites/enumerable');\n\nvar suite = Ember.EnumerableTests;\n\nsuite.module('contains');\n\nsuite.test('contains returns true if items is in enumerable', function() {\n  var data = this.newFixture(3);\n  var obj  = this.newObject(data);\n  equal(obj.contains(data[1]), true, 'should return true if contained');\n});\n\nsuite.test('contains returns false if item is not in enumerable', function() {\n  var data = this.newFixture(1);\n  var obj  = this.newObject(this.newFixture(3));\n  equal(obj.contains(data[0]), false, 'should return false if not contained');\n});\n\n\n})();\n//@ sourceURL=ember-runtime/~tests/suites/enumerable/contains");