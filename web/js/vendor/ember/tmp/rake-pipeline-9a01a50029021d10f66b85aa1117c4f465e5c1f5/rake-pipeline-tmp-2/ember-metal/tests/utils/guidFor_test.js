minispade.register('ember-metal/~tests/utils/guidFor_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2006-2011 Strobe Inc. and contributors.\n//            ©2008-2011 Apple Inc. All rights reserved.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n\nmodule(\"Ember.guidFor\");\n\nvar sameGuid = function(a, b, message) {\n  equal( Ember.guidFor(a), Ember.guidFor(b), message );\n};\n\nvar diffGuid = function(a, b, message) {\n  ok( Ember.guidFor(a) !== Ember.guidFor(b), message);\n};\n\nvar nanGuid = function(obj) {\n  var type = typeof obj;\n  ok( isNaN(parseInt(Ember.guidFor(obj), 0)), \"guids for \" + type + \"don't parse to numbers\");\n};\n\ntest(\"Object\", function() {\n  var a = {}, b = {};\n\n  sameGuid( a, a, \"same object always yields same guid\" );\n  diffGuid( a, b, \"different objects yield different guids\" );\n  nanGuid( a );\n});\n\ntest(\"Object with prototype\", function() {\n  var Class = function() { };\n\n  Ember.guidFor(Class.prototype);\n\n  var a = new Class();\n  var b = new Class();\n\n  sameGuid( a, b , \"without calling rewatch, objects copy the guid from their prototype\");\n\n  Ember.rewatch(a);\n  Ember.rewatch(b);\n\n  diffGuid( a, b, \"after calling rewatch, objects don't share guids\" );\n});\n\ntest(\"strings\", function() {\n  var a = \"string A\", aprime = \"string A\", b = \"String B\";\n\n  sameGuid( a, a,      \"same string always yields same guid\" );\n  sameGuid( a, aprime, \"identical strings always yield the same guid\" );\n  diffGuid( a, b,      \"different strings yield different guids\" );\n  nanGuid( a );\n});\n\ntest(\"numbers\", function() {\n  var a = 23, aprime = 23, b = 34;\n\n  sameGuid( a, a,      \"same numbers always yields same guid\" );\n  sameGuid( a, aprime, \"identical numbers always yield the same guid\" );\n  diffGuid( a, b,      \"different numbers yield different guids\" );\n  nanGuid( a );\n});\n\ntest(\"numbers\", function() {\n  var a = true, aprime = true, b = false;\n\n  sameGuid( a, a,      \"same booleans always yields same guid\" );\n  sameGuid( a, aprime, \"identical booleans always yield the same guid\" );\n  diffGuid( a, b,      \"different boolean yield different guids\" );\n  nanGuid( a );\n  nanGuid( b );\n});\n\ntest(\"null and undefined\", function() {\n  var a = null, aprime = null, b;\n\n  sameGuid( a, a,      \"null always returns the same guid\" );\n  sameGuid( b, b,      \"undefined always returns the same guid\" );\n  sameGuid( a, aprime, \"different nulls return the same guid\" );\n  diffGuid( a, b,      \"null and undefined return different guids\" );\n  nanGuid( a );\n  nanGuid( b );\n});\n\ntest(\"arrays\", function() {\n  var a = [\"a\", \"b\", \"c\"], aprime = [\"a\", \"b\", \"c\"], b = [\"1\", \"2\", \"3\"];\n\n  sameGuid( a, a,      \"same instance always yields same guid\" );\n  diffGuid( a, aprime, \"identical arrays always yield the same guid\" );\n  diffGuid( a, b,      \"different arrays yield different guids\" );\n  nanGuid( a );\n});\n\n\n})();\n//@ sourceURL=ember-metal/~tests/utils/guidFor_test");