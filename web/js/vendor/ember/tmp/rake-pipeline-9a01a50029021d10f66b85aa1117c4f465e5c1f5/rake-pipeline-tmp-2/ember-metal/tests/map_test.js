minispade.register('ember-metal/~tests/map_test', "(function() {var object, number, string, map;\n\nvar varieties = ['Map', 'MapWithDefault'], variety;\n\nfunction testMap(variety) {\n  module(\"Ember.\" + variety + \" (forEach and get are implicitly tested)\", {\n    setup: function() {\n      object = {};\n      number = 42;\n      string = \"foo\";\n\n      map = Ember[variety].create();\n    }\n  });\n\n  var mapHasLength = function(expected, theMap) {\n    theMap = theMap || map;\n\n    var length = 0;\n    theMap.forEach(function() {\n      length++;\n    });\n\n    equal(length, expected, \"map should contain \" + expected + \" items\");\n  };\n\n  var mapHasEntries = function(entries, theMap) {\n    theMap = theMap || map;\n\n    for (var i = 0, l = entries.length; i < l; i++) {\n      equal(theMap.get(entries[i][0]), entries[i][1]);\n      equal(theMap.has(entries[i][0]), true);\n    }\n\n    mapHasLength(entries.length, theMap);\n  };\n\n  test(\"add\", function() {\n    map.set(object, \"winning\");\n    map.set(number, \"winning\");\n    map.set(string, \"winning\");\n\n    mapHasEntries([\n      [ object, \"winning\" ],\n      [ number, \"winning\" ],\n      [ string, \"winning\" ]\n    ]);\n\n    map.set(object, \"losing\");\n    map.set(number, \"losing\");\n    map.set(string, \"losing\");\n\n    mapHasEntries([\n      [ object, \"losing\" ],\n      [ number, \"losing\" ],\n      [ string, \"losing\" ]\n    ]);\n\n    equal(map.has(\"nope\"), false);\n    equal(map.has({}), false);\n  });\n\n  test(\"remove\", function() {\n    map.set(object, \"winning\");\n    map.set(number, \"winning\");\n    map.set(string, \"winning\");\n\n    map.remove(object);\n    map.remove(number);\n    map.remove(string);\n\n    // doesn't explode\n    map.remove({});\n\n    mapHasEntries([]);\n  });\n\n  test(\"copy and then update\", function() {\n    map.set(object, \"winning\");\n    map.set(number, \"winning\");\n    map.set(string, \"winning\");\n\n    var map2 = map.copy();\n\n    map2.set(object, \"losing\");\n    map2.set(number, \"losing\");\n    map2.set(string, \"losing\");\n\n    mapHasEntries([\n      [ object, \"winning\" ],\n      [ number, \"winning\" ],\n      [ string, \"winning\" ]\n    ]);\n\n    mapHasEntries([\n      [ object, \"losing\" ],\n      [ number, \"losing\" ],\n      [ string, \"losing\" ]\n    ], map2);\n  });\n\n  test(\"copy and then remove\", function() {\n    map.set(object, \"winning\");\n    map.set(number, \"winning\");\n    map.set(string, \"winning\");\n\n    var map2 = map.copy();\n\n    map2.remove(object);\n    map2.remove(number);\n    map2.remove(string);\n\n    mapHasEntries([\n      [ object, \"winning\" ],\n      [ number, \"winning\" ],\n      [ string, \"winning\" ]\n    ]);\n\n    mapHasEntries([ ], map2);\n  });\n}\n\nfor (var i = 0;  i < varieties.length;  i++) {\n  testMap(varieties[i]);\n}\n\nmodule(\"MapWithDefault - default values\");\n\ntest(\"Retrieving a value that has not been set returns and sets a default value\", function() {\n  var map = Ember.MapWithDefault.create({\n    defaultValue: function(key) {\n      return [key];\n    }\n  });\n\n  var value = map.get('ohai');\n  deepEqual(value, [ 'ohai' ]);\n\n  strictEqual(value, map.get('ohai'));\n});\n\ntest(\"Copying a MapWithDefault copies the default value\", function() {\n  var map = Ember.MapWithDefault.create({\n    defaultValue: function(key) {\n      return [key];\n    }\n  });\n\n  map.set('ohai', 1);\n  map.get('bai');\n\n  var map2 = map.copy();\n\n  equal(map2.get('ohai'), 1);\n  deepEqual(map2.get('bai'), ['bai']);\n\n  map2.set('kthx', 3);\n\n  deepEqual(map.get('kthx'), ['kthx']);\n  equal(map2.get('kthx'), 3);\n\n  deepEqual(map2.get('default'), ['default']);\n\n  map2.defaultValue = function(key) {\n    return ['tom is on', key];\n  };\n\n  deepEqual(map2.get('drugs'), ['tom is on', 'drugs']);\n});\n\n})();\n//@ sourceURL=ember-metal/~tests/map_test");