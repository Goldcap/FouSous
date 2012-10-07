minispade.register('ember-runtime/system/namespace', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\nminispade.require('ember-runtime/system/object');\n\nvar indexOf = Ember.ArrayPolyfills.indexOf;\n\n/**\n  @private\n  A Namespace is an object usually used to contain other objects or methods\n  such as an application or framework.  Create a namespace anytime you want\n  to define one of these new containers.\n\n  # Example Usage\n\n      MyFramework = Ember.Namespace.create({\n        VERSION: '1.0.0'\n      });\n\n*/\nEmber.Namespace = Ember.Object.extend({\n  isNamespace: true,\n\n  init: function() {\n    Ember.Namespace.NAMESPACES.push(this);\n    Ember.Namespace.PROCESSED = false;\n  },\n\n  toString: function() {\n    Ember.identifyNamespaces();\n    return this[Ember.GUID_KEY+'_name'];\n  },\n\n  destroy: function() {\n    var namespaces = Ember.Namespace.NAMESPACES;\n    window[this.toString()] = undefined;\n    namespaces.splice(indexOf.call(namespaces, this), 1);\n    this._super();\n  }\n});\n\nEmber.Namespace.NAMESPACES = [Ember];\nEmber.Namespace.PROCESSED = false;\n\n})();\n//@ sourceURL=ember-runtime/system/namespace");