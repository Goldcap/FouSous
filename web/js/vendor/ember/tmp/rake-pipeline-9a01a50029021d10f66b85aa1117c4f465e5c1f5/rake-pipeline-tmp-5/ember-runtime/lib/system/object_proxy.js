minispade.register('ember-runtime/system/object_proxy', "(function() {minispade.require('ember-runtime/system/object');\n\nvar get = Ember.get,\n    set = Ember.set,\n    fmt = Ember.String.fmt,\n    addBeforeObserver = Ember.addBeforeObserver,\n    addObserver = Ember.addObserver,\n    removeBeforeObserver = Ember.removeBeforeObserver,\n    removeObserver = Ember.removeObserver,\n    propertyWillChange = Ember.propertyWillChange,\n    propertyDidChange = Ember.propertyDidChange;\n\nfunction contentPropertyWillChange(content, contentKey) {\n  var key = contentKey.slice(8); // remove \"content.\"\n  if (key in this) { return; }  // if shadowed in proxy\n  propertyWillChange(this, key);\n}\n\nfunction contentPropertyDidChange(content, contentKey) {\n  var key = contentKey.slice(8); // remove \"content.\"\n  if (key in this) { return; } // if shadowed in proxy\n  propertyDidChange(this, key);\n}\n\n/**\n  @class\n\n  `Ember.ObjectProxy` forwards all properties not defined by the proxy itself\n  to a proxied `content` object.\n\n      object = Ember.Object.create({\n        name: 'Foo'\n      });\n      proxy = Ember.ObjectProxy.create({\n        content: object\n      });\n\n      // Access and change existing properties\n      proxy.get('name') // => 'Foo'\n      proxy.set('name', 'Bar');\n      object.get('name') // => 'Bar'\n\n      // Create new 'description' property on `object`\n      proxy.set('description', 'Foo is a whizboo baz');\n      object.get('description') // => 'Foo is a whizboo baz'\n\n  While `content` is unset, setting a property to be delegated will throw an Error.\n\n      proxy = Ember.ObjectProxy.create({\n        content: null,\n        flag: null\n      });\n      proxy.set('flag', true);\n      proxy.get('flag'); // => true\n      proxy.get('foo'); // => undefined\n      proxy.set('foo', 'data'); // throws Error\n\n  Delegated properties can be bound to and will change when content is updated.\n\n  Computed properties on the proxy itself can depend on delegated properties.\n\n      ProxyWithComputedProperty = Ember.ObjectProxy.extend({\n        fullName: function () {\n          var firstName = this.get('firstName'),\n              lastName = this.get('lastName');\n          if (firstName && lastName) {\n            return firstName + ' ' + lastName;\n          }\n          return firstName || lastName;\n        }.property('firstName', 'lastName')\n      });\n      proxy = ProxyWithComputedProperty.create();\n      proxy.get('fullName'); => undefined\n      proxy.set('content', {\n        firstName: 'Tom', lastName: 'Dale'\n      }); // triggers property change for fullName on proxy\n      proxy.get('fullName'); => 'Tom Dale'\n*/\nEmber.ObjectProxy = Ember.Object.extend(\n/** @scope Ember.ObjectProxy.prototype */ {\n  /**\n    The object whose properties will be forwarded.\n\n    @type Ember.Object\n    @default null\n  */\n  content: null,\n  _contentDidChange: Ember.observer(function() {\n    Ember.assert(\"Can't set ObjectProxy's content to itself\", this.get('content') !== this);\n  }, 'content'),\n  /** @private */\n  willWatchProperty: function (key) {\n    var contentKey = 'content.' + key;\n    addBeforeObserver(this, contentKey, null, contentPropertyWillChange);\n    addObserver(this, contentKey, null, contentPropertyDidChange);\n  },\n  /** @private */\n  didUnwatchProperty: function (key) {\n    var contentKey = 'content.' + key;\n    removeBeforeObserver(this, contentKey, null, contentPropertyWillChange);\n    removeObserver(this, contentKey, null, contentPropertyDidChange);\n  },\n  /** @private */\n  unknownProperty: function (key) {\n    var content = get(this, 'content');\n    if (content) {\n      return get(content, key);\n    }\n  },\n  /** @private */\n  setUnknownProperty: function (key, value) {\n    var content = get(this, 'content');\n    Ember.assert(fmt(\"Cannot delegate set('%@', %@) to the 'content' property of object proxy %@: its 'content' is undefined.\", [key, value, this]), content);\n    return set(content, key, value);\n  }\n});\n\n})();\n//@ sourceURL=ember-runtime/system/object_proxy");