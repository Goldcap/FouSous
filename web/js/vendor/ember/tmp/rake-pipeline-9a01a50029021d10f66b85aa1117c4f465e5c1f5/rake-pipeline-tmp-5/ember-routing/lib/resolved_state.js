minispade.register('ember-routing/resolved_state', "(function() {var get = Ember.get;\n\nEmber._ResolvedState = Ember.Object.extend({\n  manager: null,\n  state: null,\n  match: null,\n\n  object: Ember.computed(function(key, value) {\n    if (arguments.length === 2) {\n      this._object = value;\n      return value;\n    } else {\n      if (this._object) {\n        return this._object;\n      } else {\n        var state = get(this, 'state'),\n            match = get(this, 'match'),\n            manager = get(this, 'manager');\n        return state.deserialize(manager, match.hash);\n      }\n    }\n  }).property(),\n\n  hasPromise: Ember.computed(function() {\n    return Ember.canInvoke(get(this, 'object'), 'then');\n  }).property('object'),\n\n  promise: Ember.computed(function() {\n    var object = get(this, 'object');\n    if (Ember.canInvoke(object, 'then')) {\n      return object;\n    } else {\n      return {\n        then: function(success) { success(object); }\n      };\n    }\n  }).property('object'),\n\n  transition: function() {\n    var manager = get(this, 'manager'),\n        path = get(this, 'state.path'),\n        object = get(this, 'object');\n    manager.transitionTo(path, object);\n  }\n});\n\n})();\n//@ sourceURL=ember-routing/resolved_state");