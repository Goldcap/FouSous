minispade.register('ember-metal/array', "(function() {/*jshint newcap:false*/\n\n// NOTE: There is a bug in jshint that doesn't recognize `Object()` without `new`\n// as being ok unless both `newcap:false` and not `use strict`.\n// https://github.com/jshint/jshint/issues/392\n\n// Testing this is not ideal, but we want to use native functions\n// if available, but not to use versions created by libraries like Prototype\n/** @private */\nvar isNativeFunc = function(func) {\n  // This should probably work in all browsers likely to have ES5 array methods\n  return func && Function.prototype.toString.call(func).indexOf('[native code]') > -1;\n};\n\n// From: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/map\n/** @private */\nvar arrayMap = isNativeFunc(Array.prototype.map) ? Array.prototype.map : function(fun /*, thisp */) {\n  //\"use strict\";\n\n  if (this === void 0 || this === null) {\n    throw new TypeError();\n  }\n\n  var t = Object(this);\n  var len = t.length >>> 0;\n  if (typeof fun !== \"function\") {\n    throw new TypeError();\n  }\n\n  var res = new Array(len);\n  var thisp = arguments[1];\n  for (var i = 0; i < len; i++) {\n    if (i in t) {\n      res[i] = fun.call(thisp, t[i], i, t);\n    }\n  }\n\n  return res;\n};\n\n// From: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/foreach\n/** @private */\nvar arrayForEach = isNativeFunc(Array.prototype.forEach) ? Array.prototype.forEach : function(fun /*, thisp */) {\n  //\"use strict\";\n\n  if (this === void 0 || this === null) {\n    throw new TypeError();\n  }\n\n  var t = Object(this);\n  var len = t.length >>> 0;\n  if (typeof fun !== \"function\") {\n    throw new TypeError();\n  }\n\n  var thisp = arguments[1];\n  for (var i = 0; i < len; i++) {\n    if (i in t) {\n      fun.call(thisp, t[i], i, t);\n    }\n  }\n};\n\n/** @private */\nvar arrayIndexOf = isNativeFunc(Array.prototype.indexOf) ? Array.prototype.indexOf : function (obj, fromIndex) {\n  if (fromIndex === null || fromIndex === undefined) { fromIndex = 0; }\n  else if (fromIndex < 0) { fromIndex = Math.max(0, this.length + fromIndex); }\n  for (var i = fromIndex, j = this.length; i < j; i++) {\n    if (this[i] === obj) { return i; }\n  }\n  return -1;\n};\n\nEmber.ArrayPolyfills = {\n  map: arrayMap,\n  forEach: arrayForEach,\n  indexOf: arrayIndexOf\n};\n\nvar utils = Ember.EnumerableUtils = {\n  map: function(obj, callback, thisArg) {\n    return obj.map ? obj.map.call(obj, callback, thisArg) : arrayMap.call(obj, callback, thisArg);\n  },\n\n  forEach: function(obj, callback, thisArg) {\n    return obj.forEach ? obj.forEach.call(obj, callback, thisArg) : arrayForEach.call(obj, callback, thisArg);\n  },\n\n  indexOf: function(obj, element, index) {\n    return obj.indexOf ? obj.indexOf.call(obj, element, index) : arrayIndexOf.call(obj, element, index);\n  },\n\n  indexesOf: function(obj, elements) {\n    return elements === undefined ? [] : utils.map(elements, function(item) {\n      return utils.indexOf(obj, item);\n    });\n  },\n\n  removeObject: function(array, item) {\n    var index = utils.indexOf(array, item);\n    if (index !== -1) { array.splice(index, 1); }\n  }\n};\n\n\nif (Ember.SHIM_ES5) {\n  if (!Array.prototype.map) {\n    /** @private */\n    Array.prototype.map = arrayMap;\n  }\n\n  if (!Array.prototype.forEach) {\n    /** @private */\n    Array.prototype.forEach = arrayForEach;\n  }\n\n  if (!Array.prototype.indexOf) {\n    /** @private */\n    Array.prototype.indexOf = arrayIndexOf;\n  }\n}\n\n})();\n//@ sourceURL=ember-metal/array");