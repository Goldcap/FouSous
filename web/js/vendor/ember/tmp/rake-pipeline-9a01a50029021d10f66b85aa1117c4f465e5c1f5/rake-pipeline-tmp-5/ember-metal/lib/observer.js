minispade.register('ember-metal/observer', "(function() {// ==========================================================================\n// Project:  Ember Metal\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\nminispade.require('ember-metal/core');\nminispade.require('ember-metal/platform');\nminispade.require('ember-metal/utils');\nminispade.require('ember-metal/accessors');\nminispade.require('ember-metal/array');\n\nvar AFTER_OBSERVERS = ':change';\nvar BEFORE_OBSERVERS = ':before';\nvar guidFor = Ember.guidFor;\n\nvar deferred = 0;\nvar array_Slice = [].slice;\n\n/** @private */\nvar ObserverSet = function () {\n  this.targetSet = {};\n};\nObserverSet.prototype.add = function (target, path) {\n  var targetSet = this.targetSet,\n    targetGuid = Ember.guidFor(target),\n    pathSet = targetSet[targetGuid];\n  if (!pathSet) {\n    targetSet[targetGuid] = pathSet = {};\n  }\n  if (pathSet[path]) {\n    return false;\n  } else {\n    return pathSet[path] = true;\n  }\n};\nObserverSet.prototype.clear = function () {\n  this.targetSet = {};\n};\n\n/** @private */\nvar DeferredEventQueue = function() {\n  this.targetSet = {};\n  this.queue = [];\n};\n\nDeferredEventQueue.prototype.push = function(target, eventName, keyName) {\n  var targetSet = this.targetSet,\n    queue = this.queue,\n    targetGuid = Ember.guidFor(target),\n    eventNameSet = targetSet[targetGuid],\n    index;\n\n  if (!eventNameSet) {\n    targetSet[targetGuid] = eventNameSet = {};\n  }\n  index = eventNameSet[eventName];\n  if (index === undefined) {\n    eventNameSet[eventName] = queue.push(Ember.deferEvent(target, eventName, [target, keyName])) - 1;\n  } else {\n    queue[index] = Ember.deferEvent(target, eventName, [target, keyName]);\n  }\n};\n\nDeferredEventQueue.prototype.flush = function() {\n  var queue = this.queue;\n  this.queue = [];\n  this.targetSet = {};\n  for (var i=0, len=queue.length; i < len; ++i) {\n    queue[i]();\n  }\n};\n\nvar queue = new DeferredEventQueue(), beforeObserverSet = new ObserverSet();\n\n/** @private */\nfunction notifyObservers(obj, eventName, keyName, forceNotification) {\n  if (deferred && !forceNotification) {\n    queue.push(obj, eventName, keyName);\n  } else {\n    Ember.sendEvent(obj, eventName, [obj, keyName]);\n  }\n}\n\n/** @private */\nfunction flushObserverQueue() {\n  beforeObserverSet.clear();\n\n  queue.flush();\n}\n\nEmber.beginPropertyChanges = function() {\n  deferred++;\n  return this;\n};\n\nEmber.endPropertyChanges = function() {\n  deferred--;\n  if (deferred<=0) flushObserverQueue();\n};\n\n/**\n  Make a series of property changes together in an\n  exception-safe way.\n\n      Ember.changeProperties(function() {\n        obj1.set('foo', mayBlowUpWhenSet);\n        obj2.set('bar', baz);\n      });\n*/\nEmber.changeProperties = function(cb, binding){\n  Ember.beginPropertyChanges();\n  try {\n    cb.call(binding);\n  } finally {\n    Ember.endPropertyChanges();\n  }\n};\n\n/**\n  Set a list of properties on an object. These properties are set inside\n  a single `beginPropertyChanges` and `endPropertyChanges` batch, so\n  observers will be buffered.\n*/\nEmber.setProperties = function(self, hash) {\n  Ember.changeProperties(function(){\n    for(var prop in hash) {\n      if (hash.hasOwnProperty(prop)) Ember.set(self, prop, hash[prop]);\n    }\n  });\n  return self;\n};\n\n\n/** @private */\nfunction changeEvent(keyName) {\n  return keyName+AFTER_OBSERVERS;\n}\n\n/** @private */\nfunction beforeEvent(keyName) {\n  return keyName+BEFORE_OBSERVERS;\n}\n\nEmber.addObserver = function(obj, path, target, method) {\n  Ember.addListener(obj, changeEvent(path), target, method);\n  Ember.watch(obj, path);\n  return this;\n};\n\n/** @private */\nEmber.observersFor = function(obj, path) {\n  return Ember.listenersFor(obj, changeEvent(path));\n};\n\nEmber.removeObserver = function(obj, path, target, method) {\n  Ember.unwatch(obj, path);\n  Ember.removeListener(obj, changeEvent(path), target, method);\n  return this;\n};\n\nEmber.addBeforeObserver = function(obj, path, target, method) {\n  Ember.addListener(obj, beforeEvent(path), target, method);\n  Ember.watch(obj, path);\n  return this;\n};\n\n// Suspend observer during callback.\n//\n// This should only be used by the target of the observer\n// while it is setting the observed path.\n/** @private */\nEmber._suspendBeforeObserver = function(obj, path, target, method, callback) {\n  return Ember._suspendListener(obj, beforeEvent(path), target, method, callback);\n};\n\nEmber._suspendObserver = function(obj, path, target, method, callback) {\n  return Ember._suspendListener(obj, changeEvent(path), target, method, callback);\n};\n\nvar map = Ember.ArrayPolyfills.map;\n\nEmber._suspendBeforeObservers = function(obj, paths, target, method, callback) {\n  var events = map.call(paths, beforeEvent);\n  return Ember._suspendListeners(obj, events, target, method, callback);\n};\n\nEmber._suspendObservers = function(obj, paths, target, method, callback) {\n  var events = map.call(paths, changeEvent);\n  return Ember._suspendListeners(obj, events, target, method, callback);\n};\n\n/** @private */\nEmber.beforeObserversFor = function(obj, path) {\n  return Ember.listenersFor(obj, beforeEvent(path));\n};\n\nEmber.removeBeforeObserver = function(obj, path, target, method) {\n  Ember.unwatch(obj, path);\n  Ember.removeListener(obj, beforeEvent(path), target, method);\n  return this;\n};\n\n/** @private */\nEmber.notifyObservers = function(obj, keyName) {\n  if (obj.isDestroying) { return; }\n\n  notifyObservers(obj, changeEvent(keyName), keyName);\n};\n\n/** @private */\nEmber.notifyBeforeObservers = function(obj, keyName) {\n  if (obj.isDestroying) { return; }\n\n  var guid, set, forceNotification = false;\n\n  if (deferred) {\n    if (beforeObserverSet.add(obj, keyName)) {\n      forceNotification = true;\n    } else {\n      return;\n    }\n  }\n\n  notifyObservers(obj, beforeEvent(keyName), keyName, forceNotification);\n};\n\n\n})();\n//@ sourceURL=ember-metal/observer");