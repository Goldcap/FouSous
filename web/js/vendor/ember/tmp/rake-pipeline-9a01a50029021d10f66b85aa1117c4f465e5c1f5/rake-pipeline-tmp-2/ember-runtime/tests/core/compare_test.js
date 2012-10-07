minispade.register('ember-runtime/~tests/core/compare_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2006-2011 Apple Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n/*globals module ok equals same test MyApp */\n\n// test parsing of query string\nvar v = [];\nmodule(\"Ember.compare()\", {\n  setup: function() {\n    // setup dummy data\n    v[0]  = null;\n    v[1]  = false;\n    v[2]  = true;\n    v[3]  = -12;\n    v[4]  = 3.5;\n    v[5]  = 'a string';\n    v[6]  = 'another string';\n    v[7]  = 'last string';\n    v[8]  = [1,2];\n    v[9]  = [1,2,3];\n    v[10] = [1,3];\n    v[11] = {a: 'hash'};\n    v[12] = Ember.Object.create();\n    v[13] = function (a) {return a;};\n    v[14] = new Date('2012/01/01');\n    v[15] = new Date('2012/06/06');\n  }\n});\n\n\n// ..........................................................\n// TESTS\n//\n\ntest(\"ordering should work\", function() {\n  for (var j=0; j < v.length; j++) {\n    equal(Ember.compare(v[j],v[j]), 0, j +' should equal itself');\n    for (var i=j+1; i < v.length; i++) {\n      equal(Ember.compare(v[j],v[i]), -1, 'v[' + j + '] (' + Ember.typeOf(v[j]) + ') should be smaller than v[' + i + '] (' + Ember.typeOf(v[i]) + ')' );\n    }\n\n  }\n});\n\n\n})();\n//@ sourceURL=ember-runtime/~tests/core/compare_test");