minispade.register('ember-runtime/core', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\n/*globals ENV */\nminispade.require('ember-metal');\n\nvar indexOf = Ember.EnumerableUtils.indexOf;\n\n// ........................................\n// TYPING & ARRAY MESSAGING\n//\n\nvar TYPE_MAP = {};\nvar t = \"Boolean Number String Function Array Date RegExp Object\".split(\" \");\nEmber.ArrayPolyfills.forEach.call(t, function(name) {\n  TYPE_MAP[ \"[object \" + name + \"]\" ] = name.toLowerCase();\n});\n\nvar toString = Object.prototype.toString;\n\n/**\n  Returns a consistent type for the passed item.\n\n  Use this instead of the built-in Ember.typeOf() to get the type of an item.\n  It will return the same result across all browsers and includes a bit\n  more detail.  Here is what will be returned:\n\n      | Return Value  | Meaning                                              |\n      |---------------|------------------------------------------------------|\n      | 'string'      | String primitive                                     |\n      | 'number'      | Number primitive                                     |\n      | 'boolean'     | Boolean primitive                                    |\n      | 'null'        | Null value                                           |\n      | 'undefined'   | Undefined value                                      |\n      | 'function'    | A function                                           |\n      | 'array'       | An instance of Array                                 |\n      | 'class'       | A Ember class (created using Ember.Object.extend())  |\n      | 'instance'    | A Ember object instance                              |\n      | 'error'       | An instance of the Error object                      |\n      | 'object'      | A JavaScript object not inheriting from Ember.Object |\n\n  Examples:\n\n      Ember.typeOf();                      => 'undefined'\n      Ember.typeOf(null);                  => 'null'\n      Ember.typeOf(undefined);             => 'undefined'\n      Ember.typeOf('michael');             => 'string'\n      Ember.typeOf(101);                   => 'number'\n      Ember.typeOf(true);                  => 'boolean'\n      Ember.typeOf(Ember.makeArray);       => 'function'\n      Ember.typeOf([1,2,90]);              => 'array'\n      Ember.typeOf(Ember.Object.extend()); => 'class'\n      Ember.typeOf(Ember.Object.create()); => 'instance'\n      Ember.typeOf(new Error('teamocil')); => 'error'\n\n      // \"normal\" JavaScript object\n      Ember.typeOf({a: 'b'});              => 'object'\n\n  @param item {Object} the item to check\n  @returns {String} the type\n*/\nEmber.typeOf = function(item) {\n  var ret;\n\n  ret = (item === null || item === undefined) ? String(item) : TYPE_MAP[toString.call(item)] || 'object';\n\n  if (ret === 'function') {\n    if (Ember.Object && Ember.Object.detect(item)) ret = 'class';\n  } else if (ret === 'object') {\n    if (item instanceof Error) ret = 'error';\n    else if (Ember.Object && item instanceof Ember.Object) ret = 'instance';\n    else ret = 'object';\n  }\n\n  return ret;\n};\n\n/**\n  Returns true if the passed value is null or undefined.  This avoids errors\n  from JSLint complaining about use of ==, which can be technically\n  confusing.\n\n      Ember.none();             => true\n      Ember.none(null);         => true\n      Ember.none(undefined);    => true\n      Ember.none('');           => false\n      Ember.none([]);           => false\n      Ember.none(function(){}); => false\n\n  @param {Object} obj Value to test\n  @returns {Boolean}\n*/\nEmber.none = function(obj) {\n  return obj === null || obj === undefined;\n};\n\n/**\n  Verifies that a value is null or an empty string | array | function.\n\n  Constrains the rules on `Ember.none` by returning false for empty\n  string and empty arrays.\n\n      Ember.empty();               => true\n      Ember.empty(null);           => true\n      Ember.empty(undefined);      => true\n      Ember.empty('');             => true\n      Ember.empty([]);             => true\n      Ember.empty('tobias fünke'); => false\n      Ember.empty([0,1,2]);        => false\n\n  @param {Object} obj Value to test\n  @returns {Boolean}\n*/\nEmber.empty = function(obj) {\n  return obj === null || obj === undefined || (obj.length === 0 && typeof obj !== 'function') || (typeof obj === 'object' && Ember.get(obj, 'length') === 0);\n};\n\n/**\n This will compare two javascript values of possibly different types.\n It will tell you which one is greater than the other by returning:\n\n  - -1 if the first is smaller than the second,\n  - 0 if both are equal,\n  - 1 if the first is greater than the second.\n\n The order is calculated based on Ember.ORDER_DEFINITION, if types are different.\n In case they have the same type an appropriate comparison for this type is made.\n\n    Ember.compare('hello', 'hello');  => 0\n    Ember.compare('abc', 'dfg');      => -1\n    Ember.compare(2, 1);              => 1\n\n @param {Object} v First value to compare\n @param {Object} w Second value to compare\n @returns {Number} -1 if v < w, 0 if v = w and 1 if v > w.\n*/\nEmber.compare = function compare(v, w) {\n  if (v === w) { return 0; }\n\n  var type1 = Ember.typeOf(v);\n  var type2 = Ember.typeOf(w);\n\n  var Comparable = Ember.Comparable;\n  if (Comparable) {\n    if (type1==='instance' && Comparable.detect(v.constructor)) {\n      return v.constructor.compare(v, w);\n    }\n\n    if (type2 === 'instance' && Comparable.detect(w.constructor)) {\n      return 1-w.constructor.compare(w, v);\n    }\n  }\n\n  // If we haven't yet generated a reverse-mapping of Ember.ORDER_DEFINITION,\n  // do so now.\n  var mapping = Ember.ORDER_DEFINITION_MAPPING;\n  if (!mapping) {\n    var order = Ember.ORDER_DEFINITION;\n    mapping = Ember.ORDER_DEFINITION_MAPPING = {};\n    var idx, len;\n    for (idx = 0, len = order.length; idx < len;  ++idx) {\n      mapping[order[idx]] = idx;\n    }\n\n    // We no longer need Ember.ORDER_DEFINITION.\n    delete Ember.ORDER_DEFINITION;\n  }\n\n  var type1Index = mapping[type1];\n  var type2Index = mapping[type2];\n\n  if (type1Index < type2Index) { return -1; }\n  if (type1Index > type2Index) { return 1; }\n\n  // types are equal - so we have to check values now\n  switch (type1) {\n    case 'boolean':\n    case 'number':\n      if (v < w) { return -1; }\n      if (v > w) { return 1; }\n      return 0;\n\n    case 'string':\n      var comp = v.localeCompare(w);\n      if (comp < 0) { return -1; }\n      if (comp > 0) { return 1; }\n      return 0;\n\n    case 'array':\n      var vLen = v.length;\n      var wLen = w.length;\n      var l = Math.min(vLen, wLen);\n      var r = 0;\n      var i = 0;\n      while (r === 0 && i < l) {\n        r = compare(v[i],w[i]);\n        i++;\n      }\n      if (r !== 0) { return r; }\n\n      // all elements are equal now\n      // shorter array should be ordered first\n      if (vLen < wLen) { return -1; }\n      if (vLen > wLen) { return 1; }\n      // arrays are equal now\n      return 0;\n\n    case 'instance':\n      if (Ember.Comparable && Ember.Comparable.detect(v)) {\n        return v.compare(v, w);\n      }\n      return 0;\n\n    case 'date':\n      var vNum = v.getTime();\n      var wNum = w.getTime();\n      if (vNum < wNum) { return -1; }\n      if (vNum > wNum) { return 1; }\n      return 0;\n\n    default:\n      return 0;\n  }\n};\n\n/** @private */\nfunction _copy(obj, deep, seen, copies) {\n  var ret, loc, key;\n\n  // primitive data types are immutable, just return them.\n  if ('object' !== typeof obj || obj===null) return obj;\n\n  // avoid cyclical loops\n  if (deep && (loc=indexOf(seen, obj))>=0) return copies[loc];\n\n  Ember.assert('Cannot clone an Ember.Object that does not implement Ember.Copyable', !(obj instanceof Ember.Object) || (Ember.Copyable && Ember.Copyable.detect(obj)));\n\n  // IMPORTANT: this specific test will detect a native array only.  Any other\n  // object will need to implement Copyable.\n  if (Ember.typeOf(obj) === 'array') {\n    ret = obj.slice();\n    if (deep) {\n      loc = ret.length;\n      while(--loc>=0) ret[loc] = _copy(ret[loc], deep, seen, copies);\n    }\n  } else if (Ember.Copyable && Ember.Copyable.detect(obj)) {\n    ret = obj.copy(deep, seen, copies);\n  } else {\n    ret = {};\n    for(key in obj) {\n      if (!obj.hasOwnProperty(key)) continue;\n      ret[key] = deep ? _copy(obj[key], deep, seen, copies) : obj[key];\n    }\n  }\n\n  if (deep) {\n    seen.push(obj);\n    copies.push(ret);\n  }\n\n  return ret;\n}\n\n/**\n  Creates a clone of the passed object. This function can take just about\n  any type of object and create a clone of it, including primitive values\n  (which are not actually cloned because they are immutable).\n\n  If the passed object implements the clone() method, then this function\n  will simply call that method and return the result.\n\n  @param {Object} object The object to clone\n  @param {Boolean} deep If true, a deep copy of the object is made\n  @returns {Object} The cloned object\n*/\nEmber.copy = function(obj, deep) {\n  // fast paths\n  if ('object' !== typeof obj || obj===null) return obj; // can't copy primitives\n  if (Ember.Copyable && Ember.Copyable.detect(obj)) return obj.copy(deep);\n  return _copy(obj, deep, deep ? [] : null, deep ? [] : null);\n};\n\n/**\n  Convenience method to inspect an object. This method will attempt to\n  convert the object into a useful string description.\n\n  @param {Object} obj The object you want to inspect.\n  @returns {String} A description of the object\n*/\nEmber.inspect = function(obj) {\n  var v, ret = [];\n  for(var key in obj) {\n    if (obj.hasOwnProperty(key)) {\n      v = obj[key];\n      if (v === 'toString') { continue; } // ignore useless items\n      if (Ember.typeOf(v) === 'function') { v = \"function() { ... }\"; }\n      ret.push(key + \": \" + v);\n    }\n  }\n  return \"{\" + ret.join(\" , \") + \"}\";\n};\n\n/**\n  Compares two objects, returning true if they are logically equal.  This is\n  a deeper comparison than a simple triple equal. For sets it will compare the\n  internal objects.  For any other object that implements `isEqual()` it will \n  respect that method.\n\n      Ember.isEqual('hello', 'hello');  => true\n      Ember.isEqual(1, 2);              => false\n      Ember.isEqual([4,2], [4,2]);      => false\n\n  @param {Object} a first object to compare\n  @param {Object} b second object to compare\n  @returns {Boolean}\n*/\nEmber.isEqual = function(a, b) {\n  if (a && 'function'===typeof a.isEqual) return a.isEqual(b);\n  return a === b;\n};\n\n/**\n  @private\n  Used by Ember.compare\n*/\nEmber.ORDER_DEFINITION = Ember.ENV.ORDER_DEFINITION || [\n  'undefined',\n  'null',\n  'boolean',\n  'number',\n  'string',\n  'array',\n  'object',\n  'instance',\n  'function',\n  'class',\n  'date'\n];\n\n/**\n  Returns all of the keys defined on an object or hash. This is useful\n  when inspecting objects for debugging.  On browsers that support it, this\n  uses the native Object.keys implementation.\n\n  @function\n  @param {Object} obj\n  @returns {Array} Array containing keys of obj\n*/\nEmber.keys = Object.keys;\n\nif (!Ember.keys) {\n  Ember.keys = function(obj) {\n    var ret = [];\n    for(var key in obj) {\n      if (obj.hasOwnProperty(key)) { ret.push(key); }\n    }\n    return ret;\n  };\n}\n\n// ..........................................................\n// ERROR\n//\n\n/**\n  @class\n\n  A subclass of the JavaScript Error object for use in Ember.\n*/\nEmber.Error = function() {\n  var tmp = Error.prototype.constructor.apply(this, arguments);\n\n  for (var p in tmp) {\n    if (tmp.hasOwnProperty(p)) { this[p] = tmp[p]; }\n  }\n  this.message = tmp.message;\n};\n\nEmber.Error.prototype = Ember.create(Error.prototype);\n\n})();\n//@ sourceURL=ember-runtime/core");