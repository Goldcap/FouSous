minispade.register('ember-runtime/~tests/system/lazy_load_test', "(function() {module(\"Lazy Loading\");\n\ntest(\"if a load hook is registered, it is executed when runLoadHooks are exected\", function() {\n  var count = 0;\n\n  Ember.run(function() {\n    Ember.onLoad(\"__test_hook__\", function(object) {\n      count += object;\n    });\n  });\n\n  Ember.run(function() {\n    Ember.runLoadHooks(\"__test_hook__\", 1);\n  });\n\n  equal(count, 1, \"the object was passed into the load hook\");\n});\n\ntest(\"if runLoadHooks was already run, it executes newly added hooks immediately\", function() {\n  var count = 0;\n  Ember.run(function() {\n    Ember.onLoad(\"__test_hook__\", function(object) {\n      count += object;\n    });\n  });\n\n  Ember.run(function() {\n    Ember.runLoadHooks(\"__test_hook__\", 1);\n  });\n\n  count = 0;\n  Ember.run(function() {\n    Ember.onLoad(\"__test_hook__\", function(object) {\n      count += object;\n    });\n  });\n\n  equal(count, 1, \"the original object was passed into the load hook\");\n});\n\n})();\n//@ sourceURL=ember-runtime/~tests/system/lazy_load_test");