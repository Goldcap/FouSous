minispade.register('ember-runtime/~tests/system/native_array/copyable_suite_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n\n// ..........................................................\n// COPYABLE TESTS\n//\nEmber.CopyableTests.extend({\n  name: 'NativeArray Copyable',\n\n  newObject: function() {\n    return Ember.A([Ember.generateGuid()]);\n  },\n\n  isEqual: function(a,b) {\n    if (!(a instanceof Array)) return false;\n    if (!(b instanceof Array)) return false;\n    if (a.length !== b.length) return false;\n    return a[0]===b[0];\n  },\n\n  shouldBeFreezable: false\n}).run();\n\n\n\n})();\n//@ sourceURL=ember-runtime/~tests/system/native_array/copyable_suite_test");