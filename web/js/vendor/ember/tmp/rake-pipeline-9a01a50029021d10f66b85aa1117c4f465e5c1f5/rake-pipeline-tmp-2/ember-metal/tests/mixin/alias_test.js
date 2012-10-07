minispade.register('ember-metal/~tests/mixin/alias_test', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n\nmodule('Ember.alias');\n\nfunction validateAlias(obj) {\n  var get = Ember.get;\n  equal(get(obj, 'foo'), 'foo', 'obj.foo');\n  equal(get(obj, 'bar'), 'foo', 'obj.bar should be a copy of foo');\n\n  equal(get(obj, 'computedFoo'), 'cfoo', 'obj.computedFoo');\n  equal(get(obj, 'computedBar'), 'cfoo', 'obj.computedBar should be a copy of computedFoo');\n\n  equal(obj.fooMethod(), 'FOO', 'obj.fooMethod()');\n  equal(obj.barMethod(), 'FOO', 'obj.barMethod should be a copy of foo');\n}\n\ntest('copies the property values from another key when the mixin is applied', function() {\n\n  var MyMixin = Ember.Mixin.create({\n    foo: 'foo',\n    bar: Ember.alias('foo'),\n\n    computedFoo: Ember.computed(function() {\n      return 'cfoo';\n    }),\n\n    computedBar: Ember.alias('computedFoo'),\n\n    fooMethod: function() { return 'FOO'; },\n    barMethod: Ember.alias('fooMethod')\n  });\n\n  var obj = MyMixin.apply({});\n  validateAlias(obj);\n});\n\ntest('should follow aliases all the way down', function() {\n  var MyMixin = Ember.Mixin.create({\n    bar: Ember.alias('foo'), // put first to break ordered iteration\n    baz: 'baz',\n    foo: Ember.alias('baz')\n  });\n\n  var obj = MyMixin.apply({});\n  equal(Ember.get(obj, 'bar'), 'baz', 'should have followed aliases');\n});\n\ntest('should copy from other dependent mixins', function() {\n\n  var BaseMixin = Ember.Mixin.create({\n    foo: 'foo',\n\n    computedFoo: Ember.computed(function() {\n      return 'cfoo';\n    }),\n\n    fooMethod: function() { return 'FOO'; }\n  });\n\n  var MyMixin = Ember.Mixin.create(BaseMixin, {\n    bar: Ember.alias('foo'),\n    computedBar: Ember.alias('computedFoo'),\n    barMethod: Ember.alias('fooMethod')\n  });\n\n  var obj = MyMixin.apply({});\n  validateAlias(obj);\n});\n\ntest('should copy from other mixins applied at same time', function() {\n\n  var BaseMixin = Ember.Mixin.create({\n    foo: 'foo',\n\n    computedFoo: Ember.computed(function() {\n      return 'cfoo';\n    }),\n\n    fooMethod: function() { return 'FOO'; }\n  });\n\n  var MyMixin = Ember.Mixin.create({\n    bar: Ember.alias('foo'),\n    computedBar: Ember.alias('computedFoo'),\n    barMethod: Ember.alias('fooMethod')\n  });\n\n  var obj = Ember.mixin({}, BaseMixin, MyMixin);\n  validateAlias(obj);\n});\n\ntest('should copy from properties already applied on object', function() {\n\n  var BaseMixin = Ember.Mixin.create({\n    foo: 'foo',\n\n    computedFoo: Ember.computed(function() {\n      return 'cfoo';\n    })\n\n  });\n\n  var MyMixin = Ember.Mixin.create({\n    bar: Ember.alias('foo'),\n    computedBar: Ember.alias('computedFoo'),\n    barMethod: Ember.alias('fooMethod')\n  });\n\n  var obj = {\n    fooMethod: function() { return 'FOO'; }\n  };\n\n  BaseMixin.apply(obj);\n  MyMixin.apply(obj);\n\n  validateAlias(obj);\n});\n\n})();\n//@ sourceURL=ember-metal/~tests/mixin/alias_test");