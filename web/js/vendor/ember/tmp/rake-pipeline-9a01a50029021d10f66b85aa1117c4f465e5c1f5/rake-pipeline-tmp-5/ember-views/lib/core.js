minispade.register('ember-views/core', "(function() {// ==========================================================================\n// Project:   Ember - JavaScript Application Framework\n// Copyright: ©2006-2011 Strobe Inc. and contributors.\n//            Portions ©2008-2011 Apple Inc. All rights reserved.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n\nEmber.assert(\"Ember Views require jQuery 1.7 or 1.8\", window.jQuery && (window.jQuery().jquery.match(/^1\\.[78](\\.\\d+)?(pre|rc\\d?)?/) || Ember.ENV.FORCE_JQUERY));\nEmber.$ = window.jQuery;\n\n})();\n//@ sourceURL=ember-views/core");