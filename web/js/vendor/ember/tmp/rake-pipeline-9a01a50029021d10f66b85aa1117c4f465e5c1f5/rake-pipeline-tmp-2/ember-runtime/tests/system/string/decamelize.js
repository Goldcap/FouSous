minispade.register('ember-runtime/~tests/system/string/decamelize', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2006-2011 Strobe Inc. and contributors.\n//            ©2008-2011 Apple Inc. All rights reserved.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n\nmodule('Ember.String.decamelize');\n\ntest(\"does nothing with normal string\", function() {\n  deepEqual(Ember.String.decamelize('my favorite items'), 'my favorite items');\n  if (Ember.EXTEND_PROTOTYPES) {\n    deepEqual('my favorite items'.decamelize(), 'my favorite items');\n  }\n});\n\ntest(\"does nothing with dasherized string\", function() {\n  deepEqual(Ember.String.decamelize('css-class-name'), 'css-class-name');\n  if (Ember.EXTEND_PROTOTYPES) {\n    deepEqual('css-class-name'.decamelize(), 'css-class-name');\n  }\n});\n\ntest(\"does nothing with underscored string\", function() {\n  deepEqual(Ember.String.decamelize('action_name'), 'action_name');\n  if (Ember.EXTEND_PROTOTYPES) {\n    deepEqual('action_name'.decamelize(), 'action_name');\n  }\n});\n\ntest(\"converts a camelized string into all lower case separated by underscores.\", function() {\n  deepEqual(Ember.String.decamelize('innerHTML'), 'inner_html');\n  if (Ember.EXTEND_PROTOTYPES) {\n    deepEqual('innerHTML'.decamelize(), 'inner_html');\n  }\n});\n})();\n//@ sourceURL=ember-runtime/~tests/system/string/decamelize");