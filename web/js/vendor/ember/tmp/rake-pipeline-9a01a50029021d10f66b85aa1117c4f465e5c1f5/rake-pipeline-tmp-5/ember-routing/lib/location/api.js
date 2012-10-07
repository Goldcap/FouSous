minispade.register('ember-routing/location/api', "(function() {var get = Ember.get, set = Ember.set;\n\n/**\n  This file implements the `location` API used by Ember's router.\n\n  That API is:\n\n  getURL: returns the current URL\n  setURL(path): sets the current URL\n  onUpdateURL(callback): triggers the callback when the URL changes\n  formatURL(url): formats `url` to be placed into `href` attribute\n\n  Calling setURL will not trigger onUpdateURL callbacks.\n\n  TODO: This, as well as the Ember.Location documentation below, should\n  perhaps be moved so that it's visible in the JsDoc output.\n*/\n/**\n  @class\n\n  Ember.Location returns an instance of the correct implementation of\n  the `location` API.\n\n  You can pass it a `implementation` ('hash', 'history', 'none') to force a\n  particular implementation.\n*/\nEmber.Location = {\n  create: function(options) {\n    var implementation = options && options.implementation;\n    Ember.assert(\"Ember.Location.create: you must specify a 'implementation' option\", !!implementation);\n\n    var implementationClass = this.implementations[implementation];\n    Ember.assert(\"Ember.Location.create: \" + implementation + \" is not a valid implementation\", !!implementationClass);\n\n    return implementationClass.create.apply(implementationClass, arguments);\n  },\n\n  registerImplementation: function(name, implementation) {\n    this.implementations[name] = implementation;\n  },\n\n  implementations: {}\n};\n\n})();\n//@ sourceURL=ember-routing/location/api");