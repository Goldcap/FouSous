minispade.register('ember-views/~tests/views/view/class_string_for_value_test', "(function() {module(\"Ember.View - _classStringForValue\");\n\nvar cSFV = Ember.View._classStringForValue;\n\ntest(\"returns dasherized version of last path part if value is true\", function() {\n  equal(cSFV(\"propertyName\", true), \"property-name\", \"class is dasherized\");\n  equal(cSFV(\"content.propertyName\", true), \"property-name\", \"class is dasherized\");\n});\n\ntest(\"returns className if value is true and className is specified\", function() {\n  equal(cSFV(\"propertyName\", true, \"truthyClass\"), \"truthyClass\", \"returns className if given\");\n  equal(cSFV(\"content.propertyName\", true, \"truthyClass\"), \"truthyClass\", \"returns className if given\");\n});\n\ntest(\"returns falsyClassName if value is false and falsyClassName is specified\", function() {\n  equal(cSFV(\"propertyName\", false, \"truthyClass\", \"falsyClass\"), \"falsyClass\", \"returns falsyClassName if given\");\n  equal(cSFV(\"content.propertyName\", false, \"truthyClass\", \"falsyClass\"), \"falsyClass\", \"returns falsyClassName if given\");\n});\n\ntest(\"returns null if value is false and falsyClassName is not specified\", function() {\n  equal(cSFV(\"propertyName\", false, \"truthyClass\"), null, \"returns null if falsyClassName is not specified\");\n  equal(cSFV(\"content.propertyName\", false, \"truthyClass\"), null, \"returns null if falsyClassName is not specified\");\n});\n\ntest(\"returns null if value is false\", function() {\n  equal(cSFV(\"propertyName\", false), null, \"returns null if value is false\");\n  equal(cSFV(\"content.propertyName\", false), null, \"returns null if value is false\");\n});\n\ntest(\"returns null if value is true and className is not specified and falsyClassName is specified\", function() {\n  equal(cSFV(\"propertyName\", true, undefined, \"falsyClassName\"), null, \"returns null if value is true\");\n  equal(cSFV(\"content.propertyName\", true, undefined, \"falsyClassName\"), null, \"returns null if value is true\");\n});\n\ntest(\"returns the value if the value is truthy\", function() {\n  equal(cSFV(\"propertyName\", \"myString\"), \"myString\", \"returns value if the value is truthy\");\n  equal(cSFV(\"content.propertyName\", \"myString\"), \"myString\", \"returns value if the value is truthy\");\n\n  equal(cSFV(\"propertyName\", \"123\"), 123, \"returns value if the value is truthy\");\n  equal(cSFV(\"content.propertyName\", 123), 123, \"returns value if the value is truthy\");\n});\n})();\n//@ sourceURL=ember-views/~tests/views/view/class_string_for_value_test");