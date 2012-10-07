minispade.register('ember-runtime/~tests/suites/array', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\nminispade.require('ember-runtime/~tests/suites/enumerable');\n\n\n\nvar ObserverClass =   Ember.EnumerableTests.ObserverClass.extend({\n\n   observeArray: function(obj) {\n    obj.addArrayObserver(this);\n    return this;\n  },\n\n  stopObserveArray: function(obj) {\n    obj.removeArrayObserver(this);\n    return this;\n  },\n\n  arrayWillChange: function() {\n    equal(this._before, null, 'should only call once');\n    this._before = Array.prototype.slice.call(arguments);\n  },\n\n  arrayDidChange: function() {\n    equal(this._after, null, 'should only call once');\n    this._after = Array.prototype.slice.call(arguments);\n  }\n\n});\n\nEmber.ArrayTests = Ember.EnumerableTests.extend({\n\n  observerClass: ObserverClass\n\n});\n\nEmber.ArrayTests.ObserverClass = ObserverClass;\nminispade.require('ember-runtime/~tests/suites/array/indexOf');\nminispade.require('ember-runtime/~tests/suites/array/lastIndexOf');\nminispade.require('ember-runtime/~tests/suites/array/objectAt');\n\n})();\n//@ sourceURL=ember-runtime/~tests/suites/array");