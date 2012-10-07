minispade.register('ember-runtime/controllers/object_controller', "(function() {minispade.require('ember-runtime/system/object_proxy');\nminispade.require('ember-runtime/controllers/controller');\n\n/**\n  @class\n  \n  Ember.ObjectController is part of Ember's Controller layer. A single\n  shared instance of each Ember.ObjectController subclass in your application's\n  namespace will be created at application initialization and be stored on your\n  application's Ember.Router instance.\n  \n  Ember.ObjectController derives its functionality from its superclass\n  Ember.ObjectProxy and the Ember.ControllerMixin mixin.\n  \n  @extends Ember.ObjectProxy\n  @extends Ember.ControllerMixin\n**/\nEmber.ObjectController = Ember.ObjectProxy.extend(Ember.ControllerMixin);\n\n})();\n//@ sourceURL=ember-runtime/controllers/object_controller");