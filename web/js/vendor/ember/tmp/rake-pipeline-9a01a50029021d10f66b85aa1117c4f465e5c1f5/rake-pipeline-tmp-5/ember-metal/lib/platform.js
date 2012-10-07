minispade.register('ember-metal/platform', "(function() {// ==========================================================================\n// Project:  Ember Metal\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n/*globals Node */\nminispade.require('ember-metal/core');\n\n/**\n  @class\n\n  Platform specific methods and feature detectors needed by the framework.\n\n  @name Ember.platform\n*/\nvar platform = Ember.platform = {};\n\n/**\n  Identical to Object.create().  Implements if not available natively.\n  @memberOf Ember.platform\n  @name create\n*/\nEmber.create = Object.create;\n\nif (!Ember.create) {\n  /** @private */\n  var K = function() {};\n\n  Ember.create = function(obj, props) {\n    K.prototype = obj;\n    obj = new K();\n    if (props) {\n      K.prototype = obj;\n      for (var prop in props) {\n        K.prototype[prop] = props[prop].value;\n      }\n      obj = new K();\n    }\n    K.prototype = null;\n\n    return obj;\n  };\n\n  Ember.create.isSimulated = true;\n}\n\n/** @private */\nvar defineProperty = Object.defineProperty;\nvar canRedefineProperties, canDefinePropertyOnDOM;\n\n// Catch IE8 where Object.defineProperty exists but only works on DOM elements\nif (defineProperty) {\n  try {\n    defineProperty({}, 'a',{get:function(){}});\n  } catch (e) {\n    /** @private */\n    defineProperty = null;\n  }\n}\n\nif (defineProperty) {\n  // Detects a bug in Android <3.2 where you cannot redefine a property using\n  // Object.defineProperty once accessors have already been set.\n  /** @private */\n  canRedefineProperties = (function() {\n    var obj = {};\n\n    defineProperty(obj, 'a', {\n      configurable: true,\n      enumerable: true,\n      get: function() { },\n      set: function() { }\n    });\n\n    defineProperty(obj, 'a', {\n      configurable: true,\n      enumerable: true,\n      writable: true,\n      value: true\n    });\n\n    return obj.a === true;\n  })();\n\n  // This is for Safari 5.0, which supports Object.defineProperty, but not\n  // on DOM nodes.\n  /** @private */\n  canDefinePropertyOnDOM = (function(){\n    try {\n      defineProperty(document.createElement('div'), 'definePropertyOnDOM', {});\n      return true;\n    } catch(e) { }\n\n    return false;\n  })();\n\n  if (!canRedefineProperties) {\n    /** @private */\n    defineProperty = null;\n  } else if (!canDefinePropertyOnDOM) {\n    /** @private */\n    defineProperty = function(obj, keyName, desc){\n      var isNode;\n\n      if (typeof Node === \"object\") {\n        isNode = obj instanceof Node;\n      } else {\n        isNode = typeof obj === \"object\" && typeof obj.nodeType === \"number\" && typeof obj.nodeName === \"string\";\n      }\n\n      if (isNode) {\n        // TODO: Should we have a warning here?\n        return (obj[keyName] = desc.value);\n      } else {\n        return Object.defineProperty(obj, keyName, desc);\n      }\n    };\n  }\n}\n\n/**\n  Identical to Object.defineProperty().  Implements as much functionality\n  as possible if not available natively.\n\n  @memberOf Ember.platform\n  @name defineProperty\n  @param {Object} obj The object to modify\n  @param {String} keyName property name to modify\n  @param {Object} desc descriptor hash\n  @returns {void}\n*/\nplatform.defineProperty = defineProperty;\n\n/**\n  Set to true if the platform supports native getters and setters.\n\n  @memberOf Ember.platform\n  @name hasPropertyAccessors\n*/\nplatform.hasPropertyAccessors = true;\n\nif (!platform.defineProperty) {\n  platform.hasPropertyAccessors = false;\n\n  platform.defineProperty = function(obj, keyName, desc) {\n    if (!desc.get) { obj[keyName] = desc.value; }\n  };\n\n  platform.defineProperty.isSimulated = true;\n}\n\nif (Ember.ENV.MANDATORY_SETTER && !platform.hasPropertyAccessors) {\n  Ember.ENV.MANDATORY_SETTER = false;\n}\n\n})();\n//@ sourceURL=ember-metal/platform");