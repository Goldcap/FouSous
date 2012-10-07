minispade.register('ember-views/~tests/views/view/virtual_views_test', "(function() {module(\"virtual views\");\n\nvar get = Ember.get, set = Ember.set;\n\ntest(\"a virtual view does not appear as a view's parentView\", function() {\n  var rootView = Ember.View.create({\n    elementId: 'root-view',\n\n    render: function(buffer) {\n      buffer.push(\"<h1>Hi</h1>\");\n      this.appendChild(virtualView);\n    }\n  });\n\n  var virtualView = Ember.View.create({\n    isVirtual: true,\n    tagName: '',\n\n    render: function(buffer) {\n      buffer.push(\"<h2>Virtual</h2>\");\n      this.appendChild(childView);\n    }\n  });\n\n  var childView = Ember.View.create({\n    render: function(buffer) {\n      buffer.push(\"<p>Bye!</p>\");\n    }\n  });\n\n  Ember.run(function() {\n    Ember.$(\"#qunit-fixture\").empty();\n    rootView.appendTo(\"#qunit-fixture\");\n  });\n\n  equal(Ember.$(\"#root-view > h2\").length, 1, \"nodes with '' tagName do not create wrappers\");\n  equal(get(childView, 'parentView'), rootView);\n\n  var children = get(rootView, 'childViews');\n\n  equal(get(children, 'length'), 1, \"there is one child element\");\n  equal(children.objectAt(0), childView, \"the child element skips through the virtual view\");\n});\n\ntest(\"when a virtual view's child views change, the parent's childViews should reflect\", function() {\n  var rootView = Ember.View.create({\n    elementId: 'root-view',\n\n    render: function(buffer) {\n      buffer.push(\"<h1>Hi</h1>\");\n      this.appendChild(virtualView);\n    }\n  });\n\n  var virtualView = Ember.View.create({\n    isVirtual: true,\n    tagName: '',\n\n    render: function(buffer) {\n      buffer.push(\"<h2>Virtual</h2>\");\n      this.appendChild(childView);\n    }\n  });\n\n  var childView = Ember.View.create({\n    render: function(buffer) {\n      buffer.push(\"<p>Bye!</p>\");\n    }\n  });\n\n  Ember.run(function() {\n    Ember.$(\"#qunit-fixture\").empty();\n    rootView.appendTo(\"#qunit-fixture\");\n  });\n\n  equal(virtualView.get('childViews.length'), 1, \"has childView - precond\");\n  equal(rootView.get('childViews.length'), 1, \"has childView - precond\");\n\n  Ember.run(function() {\n    childView.removeFromParent();\n  });\n\n  equal(virtualView.get('childViews.length'), 0, \"has no childView\");\n  equal(rootView.get('childViews.length'), 0, \"has no childView\");\n});\n\n})();\n//@ sourceURL=ember-views/~tests/views/view/virtual_views_test");