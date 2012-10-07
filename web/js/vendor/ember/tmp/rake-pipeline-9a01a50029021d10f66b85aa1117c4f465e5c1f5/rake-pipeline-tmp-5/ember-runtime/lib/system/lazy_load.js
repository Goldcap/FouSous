minispade.register('ember-runtime/system/lazy_load', "(function() {var loadHooks = {};\nvar loaded = {};\n\nEmber.onLoad = function(name, callback) {\n  var object;\n\n  loadHooks[name] = loadHooks[name] || Ember.A();\n  loadHooks[name].pushObject(callback);\n\n  if (object = loaded[name]) {\n    callback(object);\n  }\n};\n\nEmber.runLoadHooks = function(name, object) {\n  var hooks;\n\n  loaded[name] = object;\n\n  if (hooks = loadHooks[name]) {\n    loadHooks[name].forEach(function(callback) {\n      callback(object);\n    });\n  }\n};\n\n})();\n//@ sourceURL=ember-runtime/system/lazy_load");