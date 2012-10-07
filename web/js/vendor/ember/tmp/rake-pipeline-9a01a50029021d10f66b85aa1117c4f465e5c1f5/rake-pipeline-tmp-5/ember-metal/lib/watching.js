minispade.register('ember-metal/watching', "(function() {// ==========================================================================\n// Project:  Ember Metal\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\nminispade.require('ember-metal/core');\nminispade.require('ember-metal/platform');\nminispade.require('ember-metal/utils');\nminispade.require('ember-metal/accessors');\nminispade.require('ember-metal/properties');\nminispade.require('ember-metal/observer');\nminispade.require('ember-metal/array');\n\nvar guidFor = Ember.guidFor, // utils.js\n    metaFor = Ember.meta, // utils.js\n    get = Ember.get, // accessors.js\n    set = Ember.set, // accessors.js\n    normalizeTuple = Ember.normalizeTuple, // accessors.js\n    GUID_KEY = Ember.GUID_KEY, // utils.js\n    META_KEY = Ember.META_KEY, // utils.js\n    // circular reference observer depends on Ember.watch\n    // we should move change events to this file or its own property_events.js\n    notifyObservers = Ember.notifyObservers, // observer.js\n    forEach = Ember.ArrayPolyfills.forEach, // array.js\n    FIRST_KEY = /^([^\\.\\*]+)/,\n    IS_PATH = /[\\.\\*]/;\n\nvar MANDATORY_SETTER = Ember.ENV.MANDATORY_SETTER,\no_defineProperty = Ember.platform.defineProperty;\n\n/** @private */\nfunction firstKey(path) {\n  return path.match(FIRST_KEY)[0];\n}\n\n// returns true if the passed path is just a keyName\n/** @private */\nfunction isKeyName(path) {\n  return path==='*' || !IS_PATH.test(path);\n}\n\n// ..........................................................\n// DEPENDENT KEYS\n//\n\nvar DEP_SKIP = { __emberproto__: true }; // skip some keys and toString\n\n/** @private */\nfunction iterDeps(method, obj, depKey, seen, meta) {\n\n  var guid = guidFor(obj);\n  if (!seen[guid]) seen[guid] = {};\n  if (seen[guid][depKey]) return;\n  seen[guid][depKey] = true;\n\n  var deps = meta.deps;\n  deps = deps && deps[depKey];\n  if (deps) {\n    for(var key in deps) {\n      if (DEP_SKIP[key]) continue;\n      method(obj, key);\n    }\n  }\n}\n\n\nvar WILL_SEEN, DID_SEEN;\n\n// called whenever a property is about to change to clear the cache of any dependent keys (and notify those properties of changes, etc...)\n/** @private */\nfunction dependentKeysWillChange(obj, depKey, meta) {\n  if (obj.isDestroying) { return; }\n\n  var seen = WILL_SEEN, top = !seen;\n  if (top) { seen = WILL_SEEN = {}; }\n  iterDeps(propertyWillChange, obj, depKey, seen, meta);\n  if (top) { WILL_SEEN = null; }\n}\n\n// called whenever a property has just changed to update dependent keys\n/** @private */\nfunction dependentKeysDidChange(obj, depKey, meta) {\n  if (obj.isDestroying) { return; }\n\n  var seen = DID_SEEN, top = !seen;\n  if (top) { seen = DID_SEEN = {}; }\n  iterDeps(propertyDidChange, obj, depKey, seen, meta);\n  if (top) { DID_SEEN = null; }\n}\n\n// ..........................................................\n// CHAIN\n//\n\n/** @private */\nfunction addChainWatcher(obj, keyName, node) {\n  if (!obj || ('object' !== typeof obj)) return; // nothing to do\n  var m = metaFor(obj);\n  var nodes = m.chainWatchers;\n  if (!nodes || nodes.__emberproto__ !== obj) {\n    nodes = m.chainWatchers = { __emberproto__: obj };\n  }\n\n  if (!nodes[keyName]) { nodes[keyName] = {}; }\n  nodes[keyName][guidFor(node)] = node;\n  Ember.watch(obj, keyName);\n}\n\n/** @private */\nfunction removeChainWatcher(obj, keyName, node) {\n  if (!obj || 'object' !== typeof obj) { return; } // nothing to do\n  var m = metaFor(obj, false),\n      nodes = m.chainWatchers;\n  if (!nodes || nodes.__emberproto__ !== obj) { return; } //nothing to do\n  if (nodes[keyName]) { delete nodes[keyName][guidFor(node)]; }\n  Ember.unwatch(obj, keyName);\n}\n\nvar pendingQueue = [];\n\n// attempts to add the pendingQueue chains again.  If some of them end up\n// back in the queue and reschedule is true, schedules a timeout to try\n// again.\n/** @private */\nfunction flushPendingChains() {\n  if (pendingQueue.length === 0) { return; } // nothing to do\n\n  var queue = pendingQueue;\n  pendingQueue = [];\n\n  forEach.call(queue, function(q) { q[0].add(q[1]); });\n\n  Ember.warn('Watching an undefined global, Ember expects watched globals to be setup by the time the run loop is flushed, check for typos', pendingQueue.length === 0);\n}\n\n/** @private */\nfunction isProto(pvalue) {\n  return metaFor(pvalue, false).proto === pvalue;\n}\n\n// A ChainNode watches a single key on an object.  If you provide a starting\n// value for the key then the node won't actually watch it.  For a root node\n// pass null for parent and key and object for value.\n/** @private */\nvar ChainNode = function(parent, key, value, separator) {\n  var obj;\n  this._parent = parent;\n  this._key    = key;\n\n  // _watching is true when calling get(this._parent, this._key) will\n  // return the value of this node.\n  //\n  // It is false for the root of a chain (because we have no parent)\n  // and for global paths (because the parent node is the object with\n  // the observer on it)\n  this._watching = value===undefined;\n\n  this._value  = value;\n  this._separator = separator || '.';\n  this._paths = {};\n  if (this._watching) {\n    this._object = parent.value();\n    if (this._object) { addChainWatcher(this._object, this._key, this); }\n  }\n\n  // Special-case: the EachProxy relies on immediate evaluation to\n  // establish its observers.\n  //\n  // TODO: Replace this with an efficient callback that the EachProxy\n  // can implement.\n  if (this._parent && this._parent._key === '@each') {\n    this.value();\n  }\n};\n\nvar ChainNodePrototype = ChainNode.prototype;\n\nChainNodePrototype.value = function() {\n  if (this._value === undefined && this._watching) {\n    var obj = this._parent.value();\n    this._value = (obj && !isProto(obj)) ? get(obj, this._key) : undefined;\n  }\n  return this._value;\n};\n\nChainNodePrototype.destroy = function() {\n  if (this._watching) {\n    var obj = this._object;\n    if (obj) { removeChainWatcher(obj, this._key, this); }\n    this._watching = false; // so future calls do nothing\n  }\n};\n\n// copies a top level object only\nChainNodePrototype.copy = function(obj) {\n  var ret = new ChainNode(null, null, obj, this._separator),\n      paths = this._paths, path;\n  for (path in paths) {\n    if (paths[path] <= 0) { continue; } // this check will also catch non-number vals.\n    ret.add(path);\n  }\n  return ret;\n};\n\n// called on the root node of a chain to setup watchers on the specified\n// path.\nChainNodePrototype.add = function(path) {\n  var obj, tuple, key, src, separator, paths;\n\n  paths = this._paths;\n  paths[path] = (paths[path] || 0) + 1;\n\n  obj = this.value();\n  tuple = normalizeTuple(obj, path);\n\n  // the path was a local path\n  if (tuple[0] && tuple[0] === obj) {\n    path = tuple[1];\n    key  = firstKey(path);\n    path = path.slice(key.length+1);\n\n  // global path, but object does not exist yet.\n  // put into a queue and try to connect later.\n  } else if (!tuple[0]) {\n    pendingQueue.push([this, path]);\n    tuple.length = 0;\n    return;\n\n  // global path, and object already exists\n  } else {\n    src  = tuple[0];\n    key  = path.slice(0, 0-(tuple[1].length+1));\n    separator = path.slice(key.length, key.length+1);\n    path = tuple[1];\n  }\n\n  tuple.length = 0;\n  this.chain(key, path, src, separator);\n};\n\n// called on the root node of a chain to teardown watcher on the specified\n// path\nChainNodePrototype.remove = function(path) {\n  var obj, tuple, key, src, paths;\n\n  paths = this._paths;\n  if (paths[path] > 0) { paths[path]--; }\n\n  obj = this.value();\n  tuple = normalizeTuple(obj, path);\n  if (tuple[0] === obj) {\n    path = tuple[1];\n    key  = firstKey(path);\n    path = path.slice(key.length+1);\n  } else {\n    src  = tuple[0];\n    key  = path.slice(0, 0-(tuple[1].length+1));\n    path = tuple[1];\n  }\n\n  tuple.length = 0;\n  this.unchain(key, path);\n};\n\nChainNodePrototype.count = 0;\n\nChainNodePrototype.chain = function(key, path, src, separator) {\n  var chains = this._chains, node;\n  if (!chains) { chains = this._chains = {}; }\n\n  node = chains[key];\n  if (!node) { node = chains[key] = new ChainNode(this, key, src, separator); }\n  node.count++; // count chains...\n\n  // chain rest of path if there is one\n  if (path && path.length>0) {\n    key = firstKey(path);\n    path = path.slice(key.length+1);\n    node.chain(key, path); // NOTE: no src means it will observe changes...\n  }\n};\n\nChainNodePrototype.unchain = function(key, path) {\n  var chains = this._chains, node = chains[key];\n\n  // unchain rest of path first...\n  if (path && path.length>1) {\n    key  = firstKey(path);\n    path = path.slice(key.length+1);\n    node.unchain(key, path);\n  }\n\n  // delete node if needed.\n  node.count--;\n  if (node.count<=0) {\n    delete chains[node._key];\n    node.destroy();\n  }\n\n};\n\nChainNodePrototype.willChange = function() {\n  var chains = this._chains;\n  if (chains) {\n    for(var key in chains) {\n      if (!chains.hasOwnProperty(key)) { continue; }\n      chains[key].willChange();\n    }\n  }\n\n  if (this._parent) { this._parent.chainWillChange(this, this._key, 1); }\n};\n\nChainNodePrototype.chainWillChange = function(chain, path, depth) {\n  if (this._key) { path = this._key + this._separator + path; }\n\n  if (this._parent) {\n    this._parent.chainWillChange(this, path, depth+1);\n  } else {\n    if (depth > 1) { Ember.propertyWillChange(this.value(), path); }\n    path = 'this.' + path;\n    if (this._paths[path] > 0) { Ember.propertyWillChange(this.value(), path); }\n  }\n};\n\nChainNodePrototype.chainDidChange = function(chain, path, depth) {\n  if (this._key) { path = this._key + this._separator + path; }\n  if (this._parent) {\n    this._parent.chainDidChange(this, path, depth+1);\n  } else {\n    if (depth > 1) { Ember.propertyDidChange(this.value(), path); }\n    path = 'this.' + path;\n    if (this._paths[path] > 0) { Ember.propertyDidChange(this.value(), path); }\n  }\n};\n\nChainNodePrototype.didChange = function(suppressEvent) {\n  // invalidate my own value first.\n  if (this._watching) {\n    var obj = this._parent.value();\n    if (obj !== this._object) {\n      removeChainWatcher(this._object, this._key, this);\n      this._object = obj;\n      addChainWatcher(obj, this._key, this);\n    }\n    this._value  = undefined;\n\n    // Special-case: the EachProxy relies on immediate evaluation to\n    // establish its observers.\n    if (this._parent && this._parent._key === '@each')\n      this.value();\n  }\n\n  // then notify chains...\n  var chains = this._chains;\n  if (chains) {\n    for(var key in chains) {\n      if (!chains.hasOwnProperty(key)) { continue; }\n      chains[key].didChange(suppressEvent);\n    }\n  }\n\n  if (suppressEvent) { return; }\n\n  // and finally tell parent about my path changing...\n  if (this._parent) { this._parent.chainDidChange(this, this._key, 1); }\n};\n\n// get the chains for the current object.  If the current object has\n// chains inherited from the proto they will be cloned and reconfigured for\n// the current object.\n/** @private */\nfunction chainsFor(obj) {\n  var m = metaFor(obj), ret = m.chains;\n  if (!ret) {\n    ret = m.chains = new ChainNode(null, null, obj);\n  } else if (ret.value() !== obj) {\n    ret = m.chains = ret.copy(obj);\n  }\n  return ret;\n}\n\n/** @private */\nfunction notifyChains(obj, m, keyName, methodName, arg) {\n  var nodes = m.chainWatchers;\n\n  if (!nodes || nodes.__emberproto__ !== obj) { return; } // nothing to do\n\n  nodes = nodes[keyName];\n  if (!nodes) { return; }\n\n  for(var key in nodes) {\n    if (!nodes.hasOwnProperty(key)) { continue; }\n    nodes[key][methodName](arg);\n  }\n}\n\nEmber.overrideChains = function(obj, keyName, m) {\n  notifyChains(obj, m, keyName, 'didChange', true);\n};\n\n/** @private */\nfunction chainsWillChange(obj, keyName, m) {\n  notifyChains(obj, m, keyName, 'willChange');\n}\n\n/** @private */\nfunction chainsDidChange(obj, keyName, m) {\n  notifyChains(obj, m, keyName, 'didChange');\n}\n\n// ..........................................................\n// WATCH\n//\n\n/**\n  @private\n\n  Starts watching a property on an object.  Whenever the property changes,\n  invokes Ember.propertyWillChange and Ember.propertyDidChange.  This is the\n  primitive used by observers and dependent keys; usually you will never call\n  this method directly but instead use higher level methods like\n  Ember.addObserver().\n*/\nEmber.watch = function(obj, keyName) {\n  // can't watch length on Array - it is special...\n  if (keyName === 'length' && Ember.typeOf(obj) === 'array') { return this; }\n\n  var m = metaFor(obj), watching = m.watching, desc;\n\n  // activate watching first time\n  if (!watching[keyName]) {\n    watching[keyName] = 1;\n    if (isKeyName(keyName)) {\n      desc = m.descs[keyName];\n      if (desc && desc.willWatch) { desc.willWatch(obj, keyName); }\n\n      if ('function' === typeof obj.willWatchProperty) {\n        obj.willWatchProperty(keyName);\n      }\n\n      if (MANDATORY_SETTER && keyName in obj) {\n        m.values[keyName] = obj[keyName];\n        o_defineProperty(obj, keyName, {\n          configurable: true,\n          enumerable: true,\n          set: function() {\n            Ember.assert('Must use Ember.set() to access this property', false);\n          },\n          get: function() {\n            var meta = this[META_KEY];\n            return meta && meta.values[keyName];\n          }\n        });\n      }\n    } else {\n      chainsFor(obj).add(keyName);\n    }\n\n  }  else {\n    watching[keyName] = (watching[keyName] || 0) + 1;\n  }\n  return this;\n};\n\nEmber.isWatching = function isWatching(obj, key) {\n  var meta = obj[META_KEY];\n  return (meta && meta.watching[key]) > 0;\n};\n\nEmber.watch.flushPending = flushPendingChains;\n\n/** @private */\nEmber.unwatch = function(obj, keyName) {\n  // can't watch length on Array - it is special...\n  if (keyName === 'length' && Ember.typeOf(obj) === 'array') { return this; }\n\n  var m = metaFor(obj), watching = m.watching, desc;\n\n  if (watching[keyName] === 1) {\n    watching[keyName] = 0;\n\n    if (isKeyName(keyName)) {\n      desc = m.descs[keyName];\n      if (desc && desc.didUnwatch) { desc.didUnwatch(obj, keyName); }\n\n      if ('function' === typeof obj.didUnwatchProperty) {\n        obj.didUnwatchProperty(keyName);\n      }\n\n      if (MANDATORY_SETTER && keyName in obj) {\n        o_defineProperty(obj, keyName, {\n          configurable: true,\n          enumerable: true,\n          writable: true,\n          value: m.values[keyName]\n        });\n        delete m.values[keyName];\n      }\n    } else {\n      chainsFor(obj).remove(keyName);\n    }\n\n  } else if (watching[keyName]>1) {\n    watching[keyName]--;\n  }\n\n  return this;\n};\n\n/**\n  @private\n\n  Call on an object when you first beget it from another object.  This will\n  setup any chained watchers on the object instance as needed.  This method is\n  safe to call multiple times.\n*/\nEmber.rewatch = function(obj) {\n  var m = metaFor(obj, false), chains = m.chains;\n\n  // make sure the object has its own guid.\n  if (GUID_KEY in obj && !obj.hasOwnProperty(GUID_KEY)) {\n    Ember.generateGuid(obj, 'ember');\n  }\n\n  // make sure any chained watchers update.\n  if (chains && chains.value() !== obj) {\n    m.chains = chains.copy(obj);\n  }\n\n  return this;\n};\n\nEmber.finishChains = function(obj) {\n  var m = metaFor(obj, false), chains = m.chains;\n  if (chains) {\n    if (chains.value() !== obj) {\n      m.chains = chains = chains.copy(obj);\n    }\n    chains.didChange(true);\n  }\n};\n\n// ..........................................................\n// PROPERTY CHANGES\n//\n\n/**\n  This function is called just before an object property is about to change.\n  It will notify any before observers and prepare caches among other things.\n\n  Normally you will not need to call this method directly but if for some\n  reason you can't directly watch a property you can invoke this method\n  manually along with `Ember.propertyDidChange()` which you should call just\n  after the property value changes.\n\n  @memberOf Ember\n\n  @param {Object} obj\n    The object with the property that will change\n\n  @param {String} keyName\n    The property key (or path) that will change.\n\n  @returns {void}\n*/\nfunction propertyWillChange(obj, keyName, value) {\n  var m = metaFor(obj, false),\n      watching = m.watching[keyName] > 0 || keyName === 'length',\n      proto = m.proto,\n      desc = m.descs[keyName];\n\n  if (!watching) { return; }\n  if (proto === obj) { return; }\n  if (desc && desc.willChange) { desc.willChange(obj, keyName); }\n  dependentKeysWillChange(obj, keyName, m);\n  chainsWillChange(obj, keyName, m);\n  Ember.notifyBeforeObservers(obj, keyName);\n}\n\nEmber.propertyWillChange = propertyWillChange;\n\n/**\n  This function is called just after an object property has changed.\n  It will notify any observers and clear caches among other things.\n\n  Normally you will not need to call this method directly but if for some\n  reason you can't directly watch a property you can invoke this method\n  manually along with `Ember.propertyWilLChange()` which you should call just\n  before the property value changes.\n\n  @memberOf Ember\n\n  @param {Object} obj\n    The object with the property that will change\n\n  @param {String} keyName\n    The property key (or path) that will change.\n\n  @returns {void}\n*/\nfunction propertyDidChange(obj, keyName) {\n  var m = metaFor(obj, false),\n      watching = m.watching[keyName] > 0 || keyName === 'length',\n      proto = m.proto,\n      desc = m.descs[keyName];\n\n  if (proto === obj) { return; }\n\n  // shouldn't this mean that we're watching this key?\n  if (desc && desc.didChange) { desc.didChange(obj, keyName); }\n  if (!watching && keyName !== 'length') { return; }\n\n  dependentKeysDidChange(obj, keyName, m);\n  chainsDidChange(obj, keyName, m);\n  Ember.notifyObservers(obj, keyName);\n}\n\nEmber.propertyDidChange = propertyDidChange;\n\nvar NODE_STACK = [];\n\n/**\n  Tears down the meta on an object so that it can be garbage collected.\n  Multiple calls will have no effect.\n\n  @param {Object} obj  the object to destroy\n  @returns {void}\n*/\nEmber.destroy = function (obj) {\n  var meta = obj[META_KEY], node, nodes, key, nodeObject;\n  if (meta) {\n    obj[META_KEY] = null;\n    // remove chainWatchers to remove circular references that would prevent GC\n    node = meta.chains;\n    if (node) {\n      NODE_STACK.push(node);\n      // process tree\n      while (NODE_STACK.length > 0) {\n        node = NODE_STACK.pop();\n        // push children\n        nodes = node._chains;\n        if (nodes) {\n          for (key in nodes) {\n            if (nodes.hasOwnProperty(key)) {\n              NODE_STACK.push(nodes[key]);\n            }\n          }\n        }\n        // remove chainWatcher in node object\n        if (node._watching) {\n          nodeObject = node._object;\n          if (nodeObject) {\n            removeChainWatcher(nodeObject, node._key, node);\n          }\n        }\n      }\n    }\n  }\n};\n\n})();\n//@ sourceURL=ember-metal/watching");