minispade.register('ember-runtime/mixins/array', "(function() {// ==========================================================================\n// Project:  Ember Runtime\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\nminispade.require('ember-runtime/mixins/enumerable');\n\n// ..........................................................\n// HELPERS\n//\n\nvar get = Ember.get, set = Ember.set, meta = Ember.meta, map = Ember.EnumerableUtils.map, cacheFor = Ember.cacheFor;\n\n/** @private */\nfunction none(obj) { return obj===null || obj===undefined; }\n\n// ..........................................................\n// ARRAY\n//\n/**\n  @namespace\n\n  This module implements Observer-friendly Array-like behavior.  This mixin is\n  picked up by the Array class as well as other controllers, etc. that want to\n  appear to be arrays.\n\n  Unlike Ember.Enumerable, this mixin defines methods specifically for\n  collections that provide index-ordered access to their contents.  When you\n  are designing code that needs to accept any kind of Array-like object, you\n  should use these methods instead of Array primitives because these will\n  properly notify observers of changes to the array.\n\n  Although these methods are efficient, they do add a layer of indirection to\n  your application so it is a good idea to use them only when you need the\n  flexibility of using both true JavaScript arrays and \"virtual\" arrays such\n  as controllers and collections.\n\n  You can use the methods defined in this module to access and modify array\n  contents in a KVO-friendly way.  You can also be notified whenever the\n  membership if an array changes by changing the syntax of the property to\n  .observes('*myProperty.[]') .\n\n  To support Ember.Array in your own class, you must override two\n  primitives to use it: replace() and objectAt().\n\n  Note that the Ember.Array mixin also incorporates the Ember.Enumerable mixin.  All\n  Ember.Array-like objects are also enumerable.\n\n  @extends Ember.Enumerable\n  @since Ember 0.9.0\n*/\nEmber.Array = Ember.Mixin.create(Ember.Enumerable, /** @scope Ember.Array.prototype */ {\n\n  /** @private - compatibility */\n  isSCArray: true,\n\n  /**\n    @field {Number} length\n\n    Your array must support the length property. Your replace methods should\n    set this property whenever it changes.\n  */\n  length: Ember.required(),\n\n  /**\n    Returns the object at the given index. If the given index is negative or\n    is greater or equal than the array length, returns `undefined`.\n\n    This is one of the primitives you must implement to support `Ember.Array`.\n    If your object supports retrieving the value of an array item using `get()`\n    (i.e. `myArray.get(0)`), then you do not need to implement this method\n    yourself.\n\n        var arr = ['a', 'b', 'c', 'd'];\n        arr.objectAt(0);  => \"a\"\n        arr.objectAt(3);  => \"d\"\n        arr.objectAt(-1); => undefined\n        arr.objectAt(4);  => undefined\n        arr.objectAt(5);  => undefined\n\n    @param {Number} idx\n      The index of the item to return.\n  */\n  objectAt: function(idx) {\n    if ((idx < 0) || (idx>=get(this, 'length'))) return undefined ;\n    return get(this, idx);\n  },\n\n  /**\n    This returns the objects at the specified indexes, using `objectAt`.\n\n        var arr = ['a', 'b', 'c', 'd'];\n        arr.objectsAt([0, 1, 2]) => [\"a\", \"b\", \"c\"]\n        arr.objectsAt([2, 3, 4]) => [\"c\", \"d\", undefined]\n\n    @param {Array} indexes\n      An array of indexes of items to return.\n   */\n  objectsAt: function(indexes) {\n    var self = this;\n    return map(indexes, function(idx){ return self.objectAt(idx); });\n  },\n\n  /** @private (nodoc) - overrides Ember.Enumerable version */\n  nextObject: function(idx) {\n    return this.objectAt(idx);\n  },\n\n  /**\n    @field []\n\n    This is the handler for the special array content property.  If you get\n    this property, it will return this.  If you set this property it a new\n    array, it will replace the current content.\n\n    This property overrides the default property defined in Ember.Enumerable.\n  */\n  '[]': Ember.computed(function(key, value) {\n    if (value !== undefined) this.replace(0, get(this, 'length'), value) ;\n    return this ;\n  }).property().cacheable(),\n\n  firstObject: Ember.computed(function() {\n    return this.objectAt(0);\n  }).property().cacheable(),\n\n  lastObject: Ember.computed(function() {\n    return this.objectAt(get(this, 'length')-1);\n  }).property().cacheable(),\n\n  /** @private (nodoc) - optimized version from Enumerable */\n  contains: function(obj){\n    return this.indexOf(obj) >= 0;\n  },\n\n  // Add any extra methods to Ember.Array that are native to the built-in Array.\n  /**\n    Returns a new array that is a slice of the receiver. This implementation\n    uses the observable array methods to retrieve the objects for the new\n    slice.\n\n        var arr = ['red', 'green', 'blue'];\n        arr.slice(0);      => ['red', 'green', 'blue']\n        arr.slice(0, 2);   => ['red', 'green']\n        arr.slice(1, 100); => ['green', 'blue']\n\n    @param beginIndex {Integer} (Optional) index to begin slicing from.\n    @param endIndex {Integer} (Optional) index to end the slice at.\n    @returns {Array} New array with specified slice\n  */\n  slice: function(beginIndex, endIndex) {\n    var ret = [];\n    var length = get(this, 'length') ;\n    if (none(beginIndex)) beginIndex = 0 ;\n    if (none(endIndex) || (endIndex > length)) endIndex = length ;\n    while(beginIndex < endIndex) {\n      ret[ret.length] = this.objectAt(beginIndex++) ;\n    }\n    return ret ;\n  },\n\n  /**\n    Returns the index of the given object's first occurrence.\n    If no startAt argument is given, the starting location to\n    search is 0. If it's negative, will count backward from\n    the end of the array. Returns -1 if no match is found.\n\n        var arr = [\"a\", \"b\", \"c\", \"d\", \"a\"];\n        arr.indexOf(\"a\");      =>  0\n        arr.indexOf(\"z\");      => -1\n        arr.indexOf(\"a\", 2);   =>  4\n        arr.indexOf(\"a\", -1);  =>  4\n        arr.indexOf(\"b\", 3);   => -1\n        arr.indexOf(\"a\", 100); => -1\n\n    @param {Object} object the item to search for\n    @param {Number} startAt optional starting location to search, default 0\n    @returns {Number} index or -1 if not found\n  */\n  indexOf: function(object, startAt) {\n    var idx, len = get(this, 'length');\n\n    if (startAt === undefined) startAt = 0;\n    if (startAt < 0) startAt += len;\n\n    for(idx=startAt;idx<len;idx++) {\n      if (this.objectAt(idx, true) === object) return idx ;\n    }\n    return -1;\n  },\n\n  /**\n    Returns the index of the given object's last occurrence.\n    If no startAt argument is given, the search starts from\n    the last position. If it's negative, will count backward\n    from the end of the array. Returns -1 if no match is found.\n\n        var arr = [\"a\", \"b\", \"c\", \"d\", \"a\"];\n        arr.lastIndexOf(\"a\");      =>  4\n        arr.lastIndexOf(\"z\");      => -1\n        arr.lastIndexOf(\"a\", 2);   =>  0\n        arr.lastIndexOf(\"a\", -1);  =>  4\n        arr.lastIndexOf(\"b\", 3);   =>  1\n        arr.lastIndexOf(\"a\", 100); =>  4\n\n    @param {Object} object the item to search for\n    @param {Number} startAt optional starting location to search, default 0\n    @returns {Number} index or -1 if not found\n  */\n  lastIndexOf: function(object, startAt) {\n    var idx, len = get(this, 'length');\n\n    if (startAt === undefined || startAt >= len) startAt = len-1;\n    if (startAt < 0) startAt += len;\n\n    for(idx=startAt;idx>=0;idx--) {\n      if (this.objectAt(idx) === object) return idx ;\n    }\n    return -1;\n  },\n\n  // ..........................................................\n  // ARRAY OBSERVERS\n  //\n\n  /**\n    Adds an array observer to the receiving array.  The array observer object\n    normally must implement two methods:\n\n    * `arrayWillChange(start, removeCount, addCount)` - This method will be\n      called just before the array is modified.\n    * `arrayDidChange(start, removeCount, addCount)` - This method will be\n      called just after the array is modified.\n\n    Both callbacks will be passed the starting index of the change as well a\n    a count of the items to be removed and added.  You can use these callbacks\n    to optionally inspect the array during the change, clear caches, or do\n    any other bookkeeping necessary.\n\n    In addition to passing a target, you can also include an options hash\n    which you can use to override the method names that will be invoked on the\n    target.\n\n    @param {Object} target\n      The observer object.\n\n    @param {Hash} opts\n      Optional hash of configuration options including willChange, didChange,\n      and a context option.\n\n    @returns {Ember.Array} receiver\n  */\n  addArrayObserver: function(target, opts) {\n    var willChange = (opts && opts.willChange) || 'arrayWillChange',\n        didChange  = (opts && opts.didChange) || 'arrayDidChange';\n\n    var hasObservers = get(this, 'hasArrayObservers');\n    if (!hasObservers) Ember.propertyWillChange(this, 'hasArrayObservers');\n    Ember.addListener(this, '@array:before', target, willChange);\n    Ember.addListener(this, '@array:change', target, didChange);\n    if (!hasObservers) Ember.propertyDidChange(this, 'hasArrayObservers');\n    return this;\n  },\n\n  /**\n    Removes an array observer from the object if the observer is current\n    registered.  Calling this method multiple times with the same object will\n    have no effect.\n\n    @param {Object} target\n      The object observing the array.\n\n    @returns {Ember.Array} receiver\n  */\n  removeArrayObserver: function(target, opts) {\n    var willChange = (opts && opts.willChange) || 'arrayWillChange',\n        didChange  = (opts && opts.didChange) || 'arrayDidChange';\n\n    var hasObservers = get(this, 'hasArrayObservers');\n    if (hasObservers) Ember.propertyWillChange(this, 'hasArrayObservers');\n    Ember.removeListener(this, '@array:before', target, willChange);\n    Ember.removeListener(this, '@array:change', target, didChange);\n    if (hasObservers) Ember.propertyDidChange(this, 'hasArrayObservers');\n    return this;\n  },\n\n  /**\n    Becomes true whenever the array currently has observers watching changes\n    on the array.\n\n    @type Boolean\n  */\n  hasArrayObservers: Ember.computed(function() {\n    return Ember.hasListeners(this, '@array:change') || Ember.hasListeners(this, '@array:before');\n  }).property().cacheable(),\n\n  /**\n    If you are implementing an object that supports Ember.Array, call this\n    method just before the array content changes to notify any observers and\n    invalidate any related properties.  Pass the starting index of the change\n    as well as a delta of the amounts to change.\n\n    @param {Number} startIdx\n      The starting index in the array that will change.\n\n    @param {Number} removeAmt\n      The number of items that will be removed.  If you pass null assumes 0\n\n    @param {Number} addAmt\n      The number of items that will be added.  If you pass null assumes 0.\n\n    @returns {Ember.Array} receiver\n  */\n  arrayContentWillChange: function(startIdx, removeAmt, addAmt) {\n\n    // if no args are passed assume everything changes\n    if (startIdx===undefined) {\n      startIdx = 0;\n      removeAmt = addAmt = -1;\n    } else {\n      if (removeAmt === undefined) removeAmt=-1;\n      if (addAmt    === undefined) addAmt=-1;\n    }\n\n    // Make sure the @each proxy is set up if anyone is observing @each\n    if (Ember.isWatching(this, '@each')) { get(this, '@each'); }\n\n    Ember.sendEvent(this, '@array:before', [this, startIdx, removeAmt, addAmt]);\n\n    var removing, lim;\n    if (startIdx>=0 && removeAmt>=0 && get(this, 'hasEnumerableObservers')) {\n      removing = [];\n      lim = startIdx+removeAmt;\n      for(var idx=startIdx;idx<lim;idx++) removing.push(this.objectAt(idx));\n    } else {\n      removing = removeAmt;\n    }\n\n    this.enumerableContentWillChange(removing, addAmt);\n\n    return this;\n  },\n\n  arrayContentDidChange: function(startIdx, removeAmt, addAmt) {\n\n    // if no args are passed assume everything changes\n    if (startIdx===undefined) {\n      startIdx = 0;\n      removeAmt = addAmt = -1;\n    } else {\n      if (removeAmt === undefined) removeAmt=-1;\n      if (addAmt    === undefined) addAmt=-1;\n    }\n\n    var adding, lim;\n    if (startIdx>=0 && addAmt>=0 && get(this, 'hasEnumerableObservers')) {\n      adding = [];\n      lim = startIdx+addAmt;\n      for(var idx=startIdx;idx<lim;idx++) adding.push(this.objectAt(idx));\n    } else {\n      adding = addAmt;\n    }\n\n    this.enumerableContentDidChange(removeAmt, adding);\n    Ember.sendEvent(this, '@array:change', [this, startIdx, removeAmt, addAmt]);\n\n    var length      = get(this, 'length'),\n        cachedFirst = cacheFor(this, 'firstObject'),\n        cachedLast  = cacheFor(this, 'lastObject');\n    if (this.objectAt(0) !== cachedFirst) {\n      Ember.propertyWillChange(this, 'firstObject');\n      Ember.propertyDidChange(this, 'firstObject');\n    }\n    if (this.objectAt(length-1) !== cachedLast) {\n      Ember.propertyWillChange(this, 'lastObject');\n      Ember.propertyDidChange(this, 'lastObject');\n    }\n\n    return this;\n  },\n\n  // ..........................................................\n  // ENUMERATED PROPERTIES\n  //\n\n  /**\n    Returns a special object that can be used to observe individual properties\n    on the array.  Just get an equivalent property on this object and it will\n    return an enumerable that maps automatically to the named key on the\n    member objects.\n  */\n  '@each': Ember.computed(function() {\n    if (!this.__each) this.__each = new Ember.EachProxy(this);\n    return this.__each;\n  }).property().cacheable()\n\n}) ;\n\n})();\n//@ sourceURL=ember-runtime/mixins/array");