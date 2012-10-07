minispade.register('ember-handlebars/helpers/action', "(function() {minispade.require('ember-handlebars/ext');\n\nvar EmberHandlebars = Ember.Handlebars,\n    getPath = EmberHandlebars.getPath,\n    get = Ember.get,\n    a_slice = Array.prototype.slice;\n\nvar ActionHelper = EmberHandlebars.ActionHelper = {\n  registeredActions: {}\n};\n\nActionHelper.registerAction = function(actionName, options) {\n  var actionId = (++Ember.$.uuid).toString();\n\n  ActionHelper.registeredActions[actionId] = {\n    eventName: options.eventName,\n    handler: function(event) {\n      var modifier = event.shiftKey || event.metaKey || event.altKey || event.ctrlKey,\n          secondaryClick = event.which > 1, // IE9 may return undefined\n          nonStandard = modifier || secondaryClick;\n\n      if (options.link && nonStandard) {\n        // Allow the browser to handle special link clicks normally\n        return;\n      }\n\n      event.preventDefault();\n\n      event.view = options.view;\n\n      if (options.hasOwnProperty('context')) {\n        event.context = options.context;\n      }\n\n      if (options.hasOwnProperty('contexts')) {\n        event.contexts = options.contexts;\n      }\n\n      var target = options.target;\n\n      // Check for StateManager (or compatible object)\n      if (target.isState && typeof target.send === 'function') {\n        return target.send(actionName, event);\n      } else {\n        Ember.assert(Ember.String.fmt('Target %@ does not have action %@', [target, actionName]), target[actionName]);\n        return target[actionName].call(target, event);\n      }\n    }\n  };\n\n  options.view.on('willRerender', function() {\n    delete ActionHelper.registeredActions[actionId];\n  });\n\n  return actionId;\n};\n\n/**\n  The `{{action}}` helper registers an HTML element within a template for\n  DOM event handling and forwards that interaction to the Application's router,\n  the template's `Ember.View` instance, or supplied `target` option (see 'Specifiying a Target').\n  \n  User interaction with that element will invoke the supplied action name on\n  the appropriate target.\n\n  Given the following Handlebars template on the page\n\n      <script type=\"text/x-handlebars\" data-template-name='a-template'>\n        <div {{action anActionName}}>\n          click me\n        </div>\n      </script>\n\n  And application code\n\n      AView = Ember.View.extend({\n        templateName; 'a-template',\n        anActionName: function(event){}\n      });\n\n      aView = AView.create();\n      aView.appendTo('body');\n\n  Will results in the following rendered HTML\n\n      <div class=\"ember-view\">\n        <div data-ember-action=\"1\">\n          click me\n        </div>\n      </div>\n\n  Clicking \"click me\" will trigger the `anActionName` method of the `aView`\n  object with a  `jQuery.Event` object as its argument. The `jQuery.Event`\n  object will be extended to include a `view` property that is set to the\n  original view interacted with (in this case the `aView` object).\n\n  ### Event Propagation\n\n  Events triggered through the action helper will automatically have\n  `.preventDefault()` called on them. You do not need to do so in your event\n  handlers. To stop propagation of the event, simply return `false` from your\n  handler.\n\n  If you need the default handler to trigger you should either register your\n  own event handler, or use event methods on your view class. See Ember.View\n  'Responding to Browser Events' for more information.\n  \n  ### Specifying DOM event type\n\n  By default the `{{action}}` helper registers for DOM `click` events. You can\n  supply an `on` option to the helper to specify a different DOM event name:\n\n      <script type=\"text/x-handlebars\" data-template-name='a-template'>\n        <div {{action anActionName on=\"doubleClick\"}}>\n          click me\n        </div>\n      </script>\n\n  See Ember.View 'Responding to Browser Events' for a list of\n  acceptable DOM event names.\n\n  Because `{{action}}` depends on Ember's event dispatch system it will only\n  function if an `Ember.EventDispatcher` instance is available. An\n  `Ember.EventDispatcher` instance will be created when a new\n  `Ember.Application` is created. Having an instance of `Ember.Application`\n  will satisfy this requirement.\n  \n  \n  ### Specifying a Target\n  There are several possible target objects for `{{action}}` helpers:\n  \n  In a typical `Ember.Router`-backed Application where views are managed\n  through use of the `{{outlet}}` helper, actions will be forwarded to the\n  current state of the Applications's Router. See Ember.Router 'Responding\n  to User-initiated Events' for more information.\n  \n  If you manaully set the `target` property on the controller of a template's\n  `Ember.View` instance, the specifed `controller.target` will become the target\n  for any actions. Likely custom values for a controller's `target` are the\n  controller itself or a StateManager other than the Application's Router.\n  \n  If the templates's view lacks a controller property the view itself is the target.\n  \n  Finally, a `target` option can be provided to the helper to change which object\n  will receive the method call. This option must be a string representing a\n  path to an object:\n\n      <script type=\"text/x-handlebars\" data-template-name='a-template'>\n        <div {{action anActionName target=\"MyApplication.someObject\"}}>\n          click me\n        </div>\n      </script>\n\n  Clicking \"click me\" in the rendered HTML of the above template will trigger\n  the  `anActionName` method of the object at `MyApplication.someObject`.\n  The first argument to this method will be a `jQuery.Event` extended to\n  include a `view` property that is set to the original view interacted with.\n\n  A path relative to the template's `Ember.View` instance can also be used as\n  a target:\n\n      <script type=\"text/x-handlebars\" data-template-name='a-template'>\n        <div {{action anActionName target=\"parentView\"}}>\n          click me\n        </div>\n      </script>\n\n  Clicking \"click me\" in the rendered HTML of the above template will trigger\n  the `anActionName` method of the view's parent view.\n\n  The `{{action}}` helper is `Ember.StateManager` aware. If the target of the\n  action is an `Ember.StateManager` instance `{{action}}` will use the `send`\n  functionality of StateManagers. The documentation for `Ember.StateManager`\n  has additional information about this use.\n\n  If an action's target does not implement a method that matches the supplied\n  action name an error will be thrown.\n\n      <script type=\"text/x-handlebars\" data-template-name='a-template'>\n        <div {{action aMethodNameThatIsMissing}}>\n          click me\n        </div>\n      </script>\n\n  With the following application code\n\n      AView = Ember.View.extend({\n        templateName; 'a-template',\n        // note: no method 'aMethodNameThatIsMissing'\n        anActionName: function(event){}\n      });\n\n      aView = AView.create();\n      aView.appendTo('body');\n\n  Will throw `Uncaught TypeError: Cannot call method 'call' of undefined` when\n  \"click me\" is clicked.\n  \n  ### Specifying a context\n\n  By default the `{{action}}` helper passes the current Handlebars context\n  along in the `jQuery.Event` object. You may specify an alternate object to\n  pass as the context by providing a property path:\n\n      <script type=\"text/x-handlebars\" data-template-name='a-template'>\n        {{#each person in people}}\n          <div {{action edit person}}>\n            click me\n          </div>\n        {{/each}}\n      </script>\n\n  @name Handlebars.helpers.action\n  @param {String} actionName\n  @param {Object...} contexts\n  @param {Hash} options\n*/\nEmberHandlebars.registerHelper('action', function(actionName) {\n  var options = arguments[arguments.length - 1],\n      contexts = a_slice.call(arguments, 1, -1);\n\n  var hash = options.hash,\n      view = options.data.view,\n      target, controller, link;\n\n  // create a hash to pass along to registerAction\n  var action = {\n    eventName: hash.on || \"click\"\n  };\n\n  action.view = view = get(view, 'concreteView');\n\n  if (hash.target) {\n    target = getPath(this, hash.target, options);\n  } else if (controller = options.data.keywords.controller) {\n    target = get(controller, 'target');\n  }\n\n  action.target = target = target || view;\n\n  if (contexts.length) {\n    action.contexts = contexts = Ember.EnumerableUtils.map(contexts, function(context) {\n      return getPath(this, context, options);\n    }, this);\n    action.context = contexts[0];\n  }\n\n  var output = [], url;\n\n  if (hash.href && target.urlForEvent) {\n    url = target.urlForEvent.apply(target, [actionName].concat(contexts));\n    output.push('href=\"' + url + '\"');\n    action.link = true;\n  }\n\n  var actionId = ActionHelper.registerAction(actionName, action);\n  output.push('data-ember-action=\"' + actionId + '\"');\n\n  return new EmberHandlebars.SafeString(output.join(\" \"));\n});\n\n})();\n//@ sourceURL=ember-handlebars/helpers/action");