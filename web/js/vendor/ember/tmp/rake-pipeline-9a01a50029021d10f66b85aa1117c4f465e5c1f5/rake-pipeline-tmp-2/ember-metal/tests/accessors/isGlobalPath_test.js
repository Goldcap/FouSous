minispade.register('ember-metal/~tests/accessors/isGlobalPath_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n\nmodule('Ember.isGlobalPath');\n\ntest(\"global path's are recognized\", function(){\n  ok( Ember.isGlobalPath('App.myProperty') );\n  ok( Ember.isGlobalPath('App.myProperty.subProperty') );\n});\n\ntest(\"if there is a 'this' in the path, it's not a global path\", function(){\n  ok( !Ember.isGlobalPath('this.myProperty') );\n  ok( !Ember.isGlobalPath('this') );\n});\n\ntest(\"if the path starts with a lowercase character, it is not a global path\", function(){\n  ok( !Ember.isGlobalPath('myObj') );\n  ok( !Ember.isGlobalPath('myObj.SecondProperty') );\n});\n})();\n//@ sourceURL=ember-metal/~tests/accessors/isGlobalPath_test");