minispade.register('ember-views/~tests/views/view/view_lifecycle_test', "(function() {/*global ViewTest:true*/\n\nvar view;\n\nmodule(\"views/view/view_lifecycle_test - pre-render\", {\n  setup: function() {\n\n  },\n\n  teardown: function() {\n    if (view) { \n      Ember.run(function(){\n        view.destroy();\n      });\n    }\n  }\n});\n\nfunction tmpl(str) {\n  return function(context, options) {\n    options.data.buffer.push(str);\n  };\n}\n\ntest(\"should create and append a DOM element after bindings have synced\", function() {\n  window.ViewTest = {};\n\n  Ember.run(function() {\n    ViewTest.fakeController = Ember.Object.create({\n      fakeThing: 'controllerPropertyValue'\n    });\n\n    view = Ember.View.create({\n      fooBinding: 'ViewTest.fakeController.fakeThing',\n\n      render: function(buffer) {\n        buffer.push(this.get('foo'));\n      }\n    });\n\n    ok(!view.get('element'), \"precond - does not have an element before appending\");\n\n    view.append();\n  });\n\n  equal(view.$().text(), 'controllerPropertyValue', \"renders and appends after bindings have synced\");\n  window.ViewTest = undefined;\n});\n\ntest(\"should throw an exception if trying to append a child before rendering has begun\", function() {\n  Ember.run(function() {\n    view = Ember.View.create();\n  });\n\n  raises(function() {\n    view.appendChild(Ember.View, {});\n  }, null, \"throws an error when calling appendChild()\");\n});\n\ntest(\"should not affect rendering if rerender is called before initial render happens\", function() {\n  Ember.run(function() {\n    view = Ember.View.create({\n      template: tmpl(\"Rerender me!\")\n    });\n\n    view.rerender();\n    view.append();\n  });\n\n  equal(view.$().text(), \"Rerender me!\", \"renders correctly if rerender is called first\");\n});\n\ntest(\"should not affect rendering if destroyElement is called before initial render happens\", function() {\n  Ember.run(function() {\n    view = Ember.View.create({\n      template: tmpl(\"Don't destroy me!\")\n    });\n\n    view.destroyElement();\n    view.append();\n  });\n\n  equal(view.$().text(), \"Don't destroy me!\", \"renders correctly if destroyElement is called first\");\n});\n\nmodule(\"views/view/view_lifecycle_test - in render\", {\n  setup: function() {\n\n  },\n\n  teardown: function() {\n    if (view) { \n      Ember.run(function(){\n        view.destroy();\n      }); \n    }\n  }\n});\n\ntest(\"appendChild should work inside a template\", function() {\n  Ember.run(function() {\n    view = Ember.View.create({\n      template: function(context, options) {\n        var buffer = options.data.buffer;\n\n        buffer.push(\"<h1>Hi!</h1>\");\n\n        options.data.view.appendChild(Ember.View, {\n          template: tmpl(\"Inception reached\")\n        });\n\n        buffer.push(\"<div class='footer'>Wait for the kick</div>\");\n      }\n    });\n\n    view.appendTo(\"#qunit-fixture\");\n  });\n\n  ok(view.$('h1').length === 1 && view.$('div').length === 2,\n     \"The appended child is visible\");\n});\n\ntest(\"rerender should work inside a template\", function() {\n  try {\n    Ember.TESTING_DEPRECATION = true;\n\n    Ember.run(function() {\n      var renderCount = 0;\n      view = Ember.View.create({\n        template: function(context, options) {\n          var view = options.data.view;\n\n          var child1 = view.appendChild(Ember.View, {\n            template: function(context, options) {\n              renderCount++;\n              options.data.buffer.push(String(renderCount));\n            }\n          });\n\n          var child2 = view.appendChild(Ember.View, {\n            template: function(context, options) {\n              options.data.buffer.push(\"Inside child2\");\n              child1.rerender();\n            }\n          });\n        }\n      });\n\n      view.appendTo(\"#qunit-fixture\");\n    });\n  } finally {\n    Ember.TESTING_DEPRECATION = false;\n  }\n\n  equal(view.$('div:nth-child(1)').length, 1);\n  equal(view.$('div:nth-child(1)').text(), '2');\n  equal(view.$('div:nth-child(2)').length, 1);\n  equal(view.$('div:nth-child(2)').text(), 'Inside child2');\n});\n\nmodule(\"views/view/view_lifecycle_test - in DOM\", {\n  teardown: function() {\n    if (view) { \n      Ember.run(function(){\n        view.destroy();\n      });\n    }\n  }\n});\n\ntest(\"should throw an exception when calling appendChild when DOM element exists\", function() {\n  Ember.run(function() {\n    view = Ember.View.create({\n      template: tmpl(\"Wait for the kick\")\n    });\n\n    view.append();\n  });\n\n  raises(function() {\n    view.appendChild(Ember.View, {\n      template: tmpl(\"Ah ah ah! You didn't say the magic word!\")\n    });\n  }, null, \"throws an exception when calling appendChild after element is created\");\n});\n\ntest(\"should replace DOM representation if rerender() is called after element is created\", function() {\n  Ember.run(function() {\n    view = Ember.View.create({\n      template: function(context, options) {\n        var buffer = options.data.buffer;\n        var value = context.get('shape');\n\n        buffer.push(\"Do not taunt happy fun \"+value);\n      },\n\n      shape: 'sphere'\n    });\n\n    view.append();\n  });\n\n  equal(view.$().text(), \"Do not taunt happy fun sphere\", \"precond - creates DOM element\");\n  \n  view.set('shape', 'ball');\n  Ember.run(function() {\n    view.rerender();\n  });\n  \n  equal(view.$().text(), \"Do not taunt happy fun ball\", \"rerenders DOM element when rerender() is called\");\n});\n\ntest(\"should destroy DOM representation when destroyElement is called\", function() {\n  Ember.run(function() {\n    view = Ember.View.create({\n      template: tmpl(\"Don't fear the reaper\")\n    });\n\n    view.append();\n  });\n\n  ok(view.get('element'), \"precond - generates a DOM element\");\n\n  Ember.run(function() {\n    view.destroyElement();\n  });\n\n  ok(!view.get('element'), \"destroys view when destroyElement() is called\");\n});\n\ntest(\"should destroy DOM representation when destroy is called\", function() {\n  Ember.run(function() {\n    view = Ember.View.create({\n      template: tmpl(\"<div id='warning'>Don't fear the reaper</div>\")\n    });\n\n    view.append();\n  });\n\n  ok(view.get('element'), \"precond - generates a DOM element\");\n\n  Ember.run(function() {\n    view.destroy();\n  });\n\n  ok(Ember.$('#warning').length === 0, \"destroys element when destroy() is called\");\n});\n\ntest(\"should throw an exception if trying to append an element that is already in DOM\", function() {\n  Ember.run(function() {\n    view = Ember.View.create({\n      template: tmpl('Broseidon, King of the Brocean')\n    });\n\n    view.append();\n  });\n\n  ok(view.get('element'), \"precond - creates DOM element\");\n\n  raises(function() {\n    Ember.run(function() {\n      view.append();\n    });\n  }, null, \"raises an exception on second append\");\n});\n\nmodule(\"views/view/view_lifecycle_test - destroyed\");\n\ntest(\"should throw an exception when calling appendChild after view is destroyed\", function() {\n  Ember.run(function() {\n    view = Ember.View.create({\n      template: tmpl(\"Wait for the kick\")\n    });\n\n    view.append();\n  });\n\n  Ember.run(function() {\n    view.destroy();\n  });\n\n  raises(function() {\n    view.appendChild(Ember.View, {\n      template: tmpl(\"Ah ah ah! You didn't say the magic word!\")\n    });\n  }, null, \"throws an exception when calling appendChild\");\n});\n\ntest(\"should throw an exception when rerender is called after view is destroyed\", function() {\n  Ember.run(function() {\n    view = Ember.View.create({\n      template: tmpl('foo')\n    });\n\n    view.append();\n  });\n\n  Ember.run(function() {\n    view.destroy();\n  });\n\n  raises(function() {\n    view.rerender();\n  }, null, \"throws an exception when calling appendChild\");\n});\n\ntest(\"should throw an exception when rerender is called after view is destroyed\", function() {\n  Ember.run(function() {\n    view = Ember.View.create({\n      template: tmpl('foo')\n    });\n\n    view.append();\n  });\n\n  Ember.run(function() {\n    view.destroy();\n  });\n\n  raises(function() {\n    view.destroyElement();\n  }, null, \"throws an exception when calling appendChild\");\n});\n\n\n})();\n//@ sourceURL=ember-views/~tests/views/view/view_lifecycle_test");