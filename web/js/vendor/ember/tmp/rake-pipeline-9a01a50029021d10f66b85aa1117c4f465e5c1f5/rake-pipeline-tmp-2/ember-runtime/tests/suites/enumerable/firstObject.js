minispade.register('ember-runtime/~tests/suites/enumerable/firstObject', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\nminispade.require('ember-runtime/~tests/suites/enumerable');\n\nvar suite = Ember.EnumerableTests;\n\nsuite.module('firstObject');\n\nsuite.test('returns first item in enumerable', function() {\n  var obj = this.newObject();\n  equal(Ember.get(obj, 'firstObject'), this.toArray(obj)[0]);\n});\n\nsuite.test('returns undefined if enumerable is empty', function() {\n  var obj = this.newObject([]);\n  equal(Ember.get(obj, 'firstObject'), undefined);\n});\n})();\n//@ sourceURL=ember-runtime/~tests/suites/enumerable/firstObject");