minispade.register('ember-runtime/system/native_array', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\nminispade.require('ember-runtime/mixins/observable');\nminispade.require('ember-runtime/mixins/mutable_array');\nminispade.require('ember-runtime/mixins/copyable');\n\n\n\nvar get = Ember.get, set = Ember.set;\n\n// Add Ember.Array to Array.prototype.  Remove methods with native\n// implementations and supply some more optimized versions of generic methods\n// because they are so common.\nvar NativeArray = Ember.Mixin.create(Ember.MutableArray, Ember.Observable, Ember.Copyable, {\n\n  // because length is a built-in property we need to know to just get the\n  // original property.\n  get: function(key) {\n    if (key==='length') return this.length;\n    else if ('number' === typeof key) return this[key];\n    else return this._super(key);\n  },\n\n  objectAt: function(idx) {\n    return this[idx];\n  },\n\n  // primitive for array support.\n  replace: function(idx, amt, objects) {\n\n    if (this.isFrozen) throw Ember.FROZEN_ERROR ;\n\n    // if we replaced exactly the same number of items, then pass only the\n    // replaced range.  Otherwise, pass the full remaining array length\n    // since everything has shifted\n    var len = objects ? get(objects, 'length') : 0;\n    this.arrayContentWillChange(idx, amt, len);\n\n    if (!objects || objects.length === 0) {\n      this.splice(idx, amt) ;\n    } else {\n      var args = [idx, amt].concat(objects) ;\n      this.splice.apply(this,args) ;\n    }\n\n    this.arrayContentDidChange(idx, amt, len);\n    return this ;\n  },\n\n  // If you ask for an unknown property, then try to collect the value\n  // from member items.\n  unknownProperty: function(key, value) {\n    var ret;// = this.reducedProperty(key, value) ;\n    if ((value !== undefined) && ret === undefined) {\n      ret = this[key] = value;\n    }\n    return ret ;\n  },\n\n  // If browser did not implement indexOf natively, then override with\n  // specialized version\n  indexOf: function(object, startAt) {\n    var idx, len = this.length;\n\n    if (startAt === undefined) startAt = 0;\n    else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);\n    if (startAt < 0) startAt += len;\n\n    for(idx=startAt;idx<len;idx++) {\n      if (this[idx] === object) return idx ;\n    }\n    return -1;\n  },\n\n  lastIndexOf: function(object, startAt) {\n    var idx, len = this.length;\n\n    if (startAt === undefined) startAt = len-1;\n    else startAt = (startAt < 0) ? Math.ceil(startAt) : Math.floor(startAt);\n    if (startAt < 0) startAt += len;\n\n    for(idx=startAt;idx>=0;idx--) {\n      if (this[idx] === object) return idx ;\n    }\n    return -1;\n  },\n\n  copy: function() {\n    return this.slice();\n  }\n});\n\n// Remove any methods implemented natively so we don't override them\nvar ignore = ['length'];\nEmber.EnumerableUtils.forEach(NativeArray.keys(), function(methodName) {\n  if (Array.prototype[methodName]) ignore.push(methodName);\n});\n\nif (ignore.length>0) {\n  NativeArray = NativeArray.without.apply(NativeArray, ignore);\n}\n\n/**\n  The NativeArray mixin contains the properties needed to to make the native\n  Array support Ember.MutableArray and all of its dependent APIs.  Unless you\n  have Ember.EXTEND_PROTOTYPES set to false, this will be applied automatically.\n  Otherwise you can apply the mixin at anytime by calling\n  `Ember.NativeArray.activate`.\n\n  @namespace\n  @extends Ember.MutableArray\n  @extends Ember.Array\n  @extends Ember.Enumerable\n  @extends Ember.MutableEnumerable\n  @extends Ember.Copyable\n  @extends Ember.Freezable\n*/\nEmber.NativeArray = NativeArray;\n\n/**\n  Creates an Ember.NativeArray from an Array like object.\n  Does not modify the original object.\n\n  @returns {Ember.NativeArray}\n*/\nEmber.A = function(arr){\n  if (arr === undefined) { arr = []; }\n  return Ember.NativeArray.apply(arr);\n};\n\n/**\n  Activates the mixin on the Array.prototype if not already applied.  Calling\n  this method more than once is safe.\n\n  @returns {void}\n*/\nEmber.NativeArray.activate = function() {\n  NativeArray.apply(Array.prototype);\n\n  Ember.A = function(arr) { return arr || []; };\n};\n\nif (Ember.EXTEND_PROTOTYPES) Ember.NativeArray.activate();\n\n\n\n})();\n//@ sourceURL=ember-runtime/system/native_array");