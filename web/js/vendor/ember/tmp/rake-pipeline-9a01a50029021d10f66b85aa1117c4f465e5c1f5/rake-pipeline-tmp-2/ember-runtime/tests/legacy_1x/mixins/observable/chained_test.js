minispade.register('ember-runtime/~tests/legacy_1x/mixins/observable/chained_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2006-2011 Strobe Inc. and contributors.\n//            ©2008-2011 Apple Inc. All rights reserved.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n\n/*\n  NOTE: This test is adapted from the 1.x series of unit tests.  The tests\n  are the same except for places where we intend to break the API we instead\n  validate that we warn the developer appropriately.\n\n  CHANGES FROM 1.6:\n\n  * changed obj.set() and obj.get() to Ember.set() and Ember.get()\n  * changed obj.addObserver() to Ember.addObserver()\n*/\n\nvar get = Ember.get, set = Ember.set;\n\nmodule(\"Ember.Observable - Observing with @each\");\n\ntest(\"chained observers on enumerable properties are triggered when the observed property of any item changes\", function() {\n  var family = Ember.Object.create({ momma: null });\n  var momma = Ember.Object.create({ children: [] });\n\n  var child1 = Ember.Object.create({ name: \"Bartholomew\" });\n  var child2 = Ember.Object.create({ name: \"Agnes\" });\n  var child3 = Ember.Object.create({ name: \"Dan\" });\n  var child4 = Ember.Object.create({ name: \"Nancy\" });\n\n  set(family, 'momma', momma);\n  set(momma, 'children', Ember.A([child1, child2, child3]));\n\n  var observerFiredCount = 0;\n  Ember.addObserver(family, 'momma.children.@each.name', this, function() {\n    observerFiredCount++;\n  });\n\n  observerFiredCount = 0;\n  Ember.run(function() { get(momma, 'children').setEach('name', 'Juan'); });\n  equal(observerFiredCount, 3, \"observer fired after changing child names\");\n\n  observerFiredCount = 0;\n  Ember.run(function() { get(momma, 'children').pushObject(child4); });\n  equal(observerFiredCount, 1, \"observer fired after adding a new item\");\n\n  observerFiredCount = 0;\n  Ember.run(function() { set(child4, 'name', \"Herbert\"); });\n  equal(observerFiredCount, 1, \"observer fired after changing property on new object\");\n\n  set(momma, 'children', []);\n\n  observerFiredCount = 0;\n  Ember.run(function() { set(child1, 'name', \"Hanna\"); });\n  equal(observerFiredCount, 0, \"observer did not fire after removing changing property on a removed object\");\n});\n\n\n})();\n//@ sourceURL=ember-runtime/~tests/legacy_1x/mixins/observable/chained_test");