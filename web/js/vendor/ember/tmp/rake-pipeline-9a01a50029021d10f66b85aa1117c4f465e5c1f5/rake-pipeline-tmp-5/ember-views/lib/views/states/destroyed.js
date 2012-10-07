minispade.register('ember-views/views/states/destroyed', "(function() {// ==========================================================================\n// Project:   Ember - JavaScript Application Framework\n// Copyright: ©2006-2011 Strobe Inc. and contributors.\n//            Portions ©2008-2011 Apple Inc. All rights reserved.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\nminispade.require('ember-views/views/states/default');\n\nvar destroyedError = \"You can't call %@ on a destroyed view\", fmt = Ember.String.fmt;\n\nEmber.View.states.destroyed = {\n  parentState: Ember.View.states._default,\n\n  appendChild: function() {\n    throw fmt(destroyedError, ['appendChild']);\n  },\n  rerender: function() {\n    throw fmt(destroyedError, ['rerender']);\n  },\n  destroyElement: function() {\n    throw fmt(destroyedError, ['destroyElement']);\n  },\n  empty: function() {\n    throw fmt(destroyedError, ['empty']);\n  },\n\n  setElement: function() {\n    throw fmt(destroyedError, [\"set('element', ...)\"]);\n  },\n\n  renderToBufferIfNeeded: function() {\n    throw fmt(destroyedError, [\"renderToBufferIfNeeded\"]);\n  },\n\n  // Since element insertion is scheduled, don't do anything if\n  // the view has been destroyed between scheduling and execution\n  insertElement: Ember.K\n};\n\n\n})();\n//@ sourceURL=ember-views/views/states/destroyed");