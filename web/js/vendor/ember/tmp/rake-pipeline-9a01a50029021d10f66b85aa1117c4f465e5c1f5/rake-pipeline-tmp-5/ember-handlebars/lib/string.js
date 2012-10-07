minispade.register('ember-handlebars/string', "(function() {\nEmber.String.htmlSafe = function(str) {\n  return new Handlebars.SafeString(str);\n};\n\nvar htmlSafe = Ember.String.htmlSafe;\n\nif (Ember.EXTEND_PROTOTYPES) {\n\n  /**\n    @see Ember.String.htmlSafe\n  */\n  String.prototype.htmlSafe = function() {\n    return htmlSafe(this);\n  };\n\n}\n\n})();\n//@ sourceURL=ember-handlebars/string");