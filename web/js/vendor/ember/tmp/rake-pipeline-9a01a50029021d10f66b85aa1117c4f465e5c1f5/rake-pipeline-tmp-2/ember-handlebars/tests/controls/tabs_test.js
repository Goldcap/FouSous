minispade.register('ember-handlebars/~tests/controls/tabs_test', "(function() {var view, dispatcher;\nvar template =\n  '{{#view Ember.TabContainerView currentView=\"foo\"}}\\n' +\n  '  <ul>\\n' +\n  '    {{#view Ember.TabView id=\"tab1\" value=\"foo\"}}Foo{{/view}}\\n' +\n  '    {{#view Ember.TabView id=\"tab2\" value=\"bar\"}}Bar{{/view}}\\n' +\n  '  </ul>\\n\\n' +\n  '  {{#view Ember.TabPaneView id=\"pane1\" viewName=\"foo\"}}\\n\\n' +\n  '    foo\\n' +\n  '  {{/view}}\\n' +\n  '  {{#view Ember.TabPaneView id=\"pane2\" viewName=\"bar\"}}\\n' +\n  '    bar\\n'+\n  '  {{/view}}\\n' +\n  '{{/view}}';\n\nmodule(\"Ember.TabContainerView and components\", {\n  setup: function() {\n    Ember.TESTING_DEPRECATION = true;\n    dispatcher = Ember.EventDispatcher.create({ rootElement: '#qunit-fixture' });\n    dispatcher.setup();\n\n    view = Ember.View.create({\n      template: Ember.Handlebars.compile(template)\n    });\n\n    Ember.run(function() {\n      view.appendTo('#qunit-fixture');\n    });\n  },\n\n  teardown: function() {\n    Ember.run(function(){ dispatcher.destroy(); });\n    Ember.TESTING_DEPRECATION = false;\n  }\n});\n\ntest(\"tab container and its components are rendered\", function() {\n  equal(Ember.$.trim(Ember.$('#qunit-fixture #tab1').text()), \"Foo\", \"first tab was rendered\");\n  equal(Ember.$.trim(Ember.$('#qunit-fixture #tab2').text()), \"Bar\", \"second tab was rendered\");\n\n  equal(Ember.$.trim(Ember.$('#qunit-fixture #pane1').text()), \"foo\", \"first pane was rendered\");\n  equal(Ember.$.trim(Ember.$('#qunit-fixture #pane2').text()), \"bar\", \"second pane was rendered\");\n});\n\ntest(\"only the specified pane is visible\", function() {\n  Ember.$('#qunit-fixture').show();\n\n  equal(Ember.$('#qunit-fixture #pane1:visible').length, 1, \"pane 1 is visible\");\n  equal(Ember.$('#qunit-fixture #pane2:visible').length, 0, \"pane 2 is not visible\");\n\n  Ember.$('#qunit-fixture').hide();\n});\n\ntest(\"when a tab is clicked, its associated pane is shown\", function() {\n  Ember.$('#qunit-fixture').show();\n\n  Ember.$('#tab2').trigger('mousedown');\n  Ember.$('#tab2').trigger('mouseup');\n\n  equal(Ember.$('#qunit-fixture #pane1:visible').length, 0, \"pane 1 is visible\");\n  equal(Ember.$('#qunit-fixture #pane2:visible').length, 1, \"pane 2 is not visible\");\n\n  Ember.$('#qunit-fixture').hide();\n});\n\n\n})();\n//@ sourceURL=ember-handlebars/~tests/controls/tabs_test");