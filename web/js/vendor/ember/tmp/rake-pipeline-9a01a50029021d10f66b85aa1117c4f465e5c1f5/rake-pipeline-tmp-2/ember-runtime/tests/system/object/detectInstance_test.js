minispade.register('ember-runtime/~tests/system/object/detectInstance_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n\nmodule('system/object/detectInstance');\n\ntest('detectInstance detects instances correctly', function() {\n\n  var A = Ember.Object.extend();\n  var B = A.extend();\n  var C = A.extend();\n\n  var o = Ember.Object.create(),\n      a = A.create(),\n      b = B.create(),\n      c = C.create();\n\n  ok( Ember.Object.detectInstance(o), 'o is an instance of Ember.Object' );\n  ok( Ember.Object.detectInstance(a), 'a is an instance of Ember.Object' );\n  ok( Ember.Object.detectInstance(b), 'b is an instance of Ember.Object' );\n  ok( Ember.Object.detectInstance(c), 'c is an instance of Ember.Object' );\n\n  ok( !A.detectInstance(o), 'o is not an instance of A');\n  ok( A.detectInstance(a), 'a is an instance of A' );\n  ok( A.detectInstance(b), 'b is an instance of A' );\n  ok( A.detectInstance(c), 'c is an instance of A' );\n\n  ok( !B.detectInstance(o), 'o is not an instance of B' );\n  ok( !B.detectInstance(a), 'a is not an instance of B' );\n  ok( B.detectInstance(b), 'b is an instance of B' );\n  ok( !B.detectInstance(c), 'c is not an instance of B' );\n\n  ok( !C.detectInstance(o), 'o is not an instance of C' );\n  ok( !C.detectInstance(a), 'a is not an instance of C' );\n  ok( !C.detectInstance(b), 'b is not an instance of C' );\n  ok( C.detectInstance(c), 'c is an instance of C' );\n\n});\n})();\n//@ sourceURL=ember-runtime/~tests/system/object/detectInstance_test");