minispade.register('ember-views/views/container_view', "(function() {// ==========================================================================\n// Project:   Ember - JavaScript Application Framework\n// Copyright: ©2006-2011 Strobe Inc. and contributors.\n//            Portions ©2008-2011 Apple Inc. All rights reserved.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\nminispade.require('ember-views/views/view');\nvar get = Ember.get, set = Ember.set, meta = Ember.meta;\nvar forEach = Ember.EnumerableUtils.forEach;\n\nvar childViewsProperty = Ember.computed(function() {\n  return get(this, '_childViews');\n}).property('_childViews').cacheable();\n\n/**\n  @class\n\n  A `ContainerView` is an `Ember.View` subclass that allows for manual or programatic\n  management of a view's `childViews` array that will correctly update the `ContainerView`\n  instance's rendered DOM representation.\n\n  ## Setting Initial Child Views\n  The initial array of child views can be set in one of two ways. You can provide\n  a `childViews` property at creation time that contains instance of `Ember.View`:\n\n\n        aContainer = Ember.ContainerView.create({\n          childViews: [Ember.View.create(), Ember.View.create()]\n        })\n\n  You can also provide a list of property names whose values are instances of `Ember.View`:\n\n        aContainer = Ember.ContainerView.create({\n          childViews: ['aView', 'bView', 'cView'],\n          aView: Ember.View.create(),\n          bView: Ember.View.create()\n          cView: Ember.View.create()\n        })\n\n  The two strategies can be combined:\n\n        aContainer = Ember.ContainerView.create({\n          childViews: ['aView', Ember.View.create()],\n          aView: Ember.View.create()\n        })\n\n  Each child view's rendering will be inserted into the container's rendered HTML in the same\n  order as its position in the `childViews` property.\n\n  ## Adding and Removing Child Views\n  The views in a container's `childViews` array should be added and removed by manipulating\n  the `childViews` property directly.\n\n  To remove a view pass that view into a `removeObject` call on the container's `childViews` property.\n\n  Given an empty `<body>` the following code\n\n        aContainer = Ember.ContainerView.create({\n          classNames: ['the-container'],\n          childViews: ['aView', 'bView'],\n          aView: Ember.View.create({\n            template: Ember.Handlebars.compile(\"A\")\n          }),\n          bView: Ember.View.create({\n            template: Ember.Handlebars.compile(\"B\")\n          })\n        })\n\n        aContainer.appendTo('body')\n\n  Results in the HTML\n\n        <div class=\"ember-view the-container\">\n          <div class=\"ember-view\">A</div>\n          <div class=\"ember-view\">B</div>\n        </div>\n\n  Removing a view\n\n        aContainer.get('childViews') // [aContainer.aView, aContainer.bView]\n        aContainer.get('childViews').removeObject(aContainer.get('bView'))\n        aContainer.get('childViews') // [aContainer.aView]\n\n  Will result in the following HTML\n\n        <div class=\"ember-view the-container\">\n          <div class=\"ember-view\">A</div>\n        </div>\n\n\n  Similarly, adding a child view is accomplished by adding `Ember.View` instances to the\n  container's `childViews` property.\n\n  Given an empty `<body>` the following code\n\n        aContainer = Ember.ContainerView.create({\n          classNames: ['the-container'],\n          childViews: ['aView', 'bView'],\n          aView: Ember.View.create({\n            template: Ember.Handlebars.compile(\"A\")\n          }),\n          bView: Ember.View.create({\n            template: Ember.Handlebars.compile(\"B\")\n          })\n        })\n\n        aContainer.appendTo('body')\n\n  Results in the HTML\n\n        <div class=\"ember-view the-container\">\n          <div class=\"ember-view\">A</div>\n          <div class=\"ember-view\">B</div>\n        </div>\n\n  Adding a view\n\n        AnotherViewClass = Ember.View.extend({\n          template: Ember.Handlebars.compile(\"Another view\")\n        })\n\n        aContainer.get('childViews') // [aContainer.aView, aContainer.bView]\n        aContainer.get('childViews').pushObject(AnotherViewClass.create())\n        aContainer.get('childViews') // [aContainer.aView, aContainer.bView, <AnotherViewClass instance>]\n\n  Will result in the following HTML\n\n        <div class=\"ember-view the-container\">\n          <div class=\"ember-view\">A</div>\n          <div class=\"ember-view\">B</div>\n          <div class=\"ember-view\">Another view</div>\n        </div>\n\n\n  Direct manipulation of childViews presence or absence in the DOM via calls to\n  `remove` or `removeFromParent` or calls to a container's `removeChild` may not behave\n  correctly.\n\n  Calling `remove()` on a child view will remove the view's HTML, but it will remain as part of its\n  container's `childView`s property.\n\n  Calling `removeChild()` on the container will remove the passed view instance from the container's\n  `childView`s but keep its HTML within the container's rendered view.\n\n  Calling `removeFromParent()` behaves as expected but should be avoided in favor of direct\n  manipulation of a container's `childViews` property.\n\n        aContainer = Ember.ContainerView.create({\n          classNames: ['the-container'],\n          childViews: ['aView', 'bView'],\n          aView: Ember.View.create({\n            template: Ember.Handlebars.compile(\"A\")\n          }),\n          bView: Ember.View.create({\n            template: Ember.Handlebars.compile(\"B\")\n          })\n        })\n\n        aContainer.appendTo('body')\n\n  Results in the HTML\n\n        <div class=\"ember-view the-container\">\n          <div class=\"ember-view\">A</div>\n          <div class=\"ember-view\">B</div>\n        </div>\n\n  Calling `aContainer.get('aView').removeFromParent()` will result in the following HTML\n\n        <div class=\"ember-view the-container\">\n          <div class=\"ember-view\">B</div>\n        </div>\n\n  And the `Ember.View` instance stored in `aContainer.aView` will be removed from `aContainer`'s\n  `childViews` array.\n\n  ## Templates and Layout\n  A `template`, `templateName`, `defaultTemplate`, `layout`, `layoutName` or `defaultLayout`\n  property on a container view will not result in the template or layout being rendered.\n  The HTML contents of a `Ember.ContainerView`'s DOM representation will only be the rendered HTML\n  of its child views.\n\n  ## Binding a View to Display\n\n  If you would like to display a single view in your ContainerView, you can set its `currentView`\n  property. When the `currentView` property is set to a view instance, it will be added to the\n  ContainerView's `childViews` array. If the `currentView` property is later changed to a\n  different view, the new view will replace the old view. If `currentView` is set to `null`, the\n  last `currentView` will be removed.\n\n  This functionality is useful for cases where you want to bind the display of a ContainerView to\n  a controller or state manager. For example, you can bind the `currentView` of a container to\n  a controller like this:\n\n      // Controller\n      App.appController = Ember.Object.create({\n        view: Ember.View.create({\n          templateName: 'person_template'\n        })\n      });\n\n      // Handlebars template\n      {{view Ember.ContainerView currentViewBinding=\"App.appController.view\"}}\n\n  @extends Ember.View\n*/\n\nEmber.ContainerView = Ember.View.extend({\n\n  init: function() {\n    this._super();\n\n    var childViews = get(this, 'childViews');\n    Ember.defineProperty(this, 'childViews', childViewsProperty);\n\n    var _childViews = this._childViews;\n\n    forEach(childViews, function(viewName, idx) {\n      var view;\n\n      if ('string' === typeof viewName) {\n        view = get(this, viewName);\n        view = this.createChildView(view);\n        set(this, viewName, view);\n      } else {\n        view = this.createChildView(viewName);\n      }\n\n      _childViews[idx] = view;\n    }, this);\n\n    var currentView = get(this, 'currentView');\n    if (currentView) _childViews.push(this.createChildView(currentView));\n\n    // Make the _childViews array observable\n    Ember.A(_childViews);\n\n    // Sets up an array observer on the child views array. This\n    // observer will detect when child views are added or removed\n    // and update the DOM to reflect the mutation.\n    get(this, 'childViews').addArrayObserver(this, {\n      willChange: 'childViewsWillChange',\n      didChange: 'childViewsDidChange'\n    });\n  },\n\n  /**\n    Instructs each child view to render to the passed render buffer.\n\n    @param {Ember.RenderBuffer} buffer the buffer to render to\n    @private\n  */\n  render: function(buffer) {\n    this.forEachChildView(function(view) {\n      view.renderToBuffer(buffer);\n    });\n  },\n\n  /**\n    When the container view is destroyed, tear down the child views\n    array observer.\n\n    @private\n  */\n  willDestroy: function() {\n    get(this, 'childViews').removeArrayObserver(this, {\n      willChange: 'childViewsWillChange',\n      didChange: 'childViewsDidChange'\n    });\n\n    this._super();\n  },\n\n  /**\n    When a child view is removed, destroy its element so that\n    it is removed from the DOM.\n\n    The array observer that triggers this action is set up in the\n    `renderToBuffer` method.\n\n    @private\n    @param {Ember.Array} views the child views array before mutation\n    @param {Number} start the start position of the mutation\n    @param {Number} removed the number of child views removed\n  **/\n  childViewsWillChange: function(views, start, removed) {\n    if (removed === 0) { return; }\n\n    var changedViews = views.slice(start, start+removed);\n    this.initializeViews(changedViews, null, null);\n\n    this.invokeForState('childViewsWillChange', views, start, removed);\n  },\n\n  /**\n    When a child view is added, make sure the DOM gets updated appropriately.\n\n    If the view has already rendered an element, we tell the child view to\n    create an element and insert it into the DOM. If the enclosing container view\n    has already written to a buffer, but not yet converted that buffer into an\n    element, we insert the string representation of the child into the appropriate\n    place in the buffer.\n\n    @private\n    @param {Ember.Array} views the array of child views afte the mutation has occurred\n    @param {Number} start the start position of the mutation\n    @param {Number} removed the number of child views removed\n    @param {Number} the number of child views added\n  */\n  childViewsDidChange: function(views, start, removed, added) {\n    var len = get(views, 'length');\n\n    // No new child views were added; bail out.\n    if (added === 0) return;\n\n    var changedViews = views.slice(start, start+added);\n    this.initializeViews(changedViews, this, get(this, 'templateData'));\n\n    // Let the current state handle the changes\n    this.invokeForState('childViewsDidChange', views, start, added);\n  },\n\n  initializeViews: function(views, parentView, templateData) {\n    forEach(views, function(view) {\n      set(view, '_parentView', parentView);\n\n      if (!get(view, 'templateData')) {\n        set(view, 'templateData', templateData);\n      }\n    });\n  },\n\n  currentView: null,\n\n  _currentViewWillChange: Ember.beforeObserver(function() {\n    var childViews = get(this, 'childViews'),\n        currentView = get(this, 'currentView');\n\n    if (currentView) {\n      childViews.removeObject(currentView);\n      currentView.destroy();\n    }\n  }, 'currentView'),\n\n  _currentViewDidChange: Ember.observer(function() {\n    var childViews = get(this, 'childViews'),\n        currentView = get(this, 'currentView');\n\n    if (currentView) {\n      childViews.pushObject(currentView);\n    }\n  }, 'currentView'),\n\n  _ensureChildrenAreInDOM: function () {\n    this.invokeForState('ensureChildrenAreInDOM', this);\n  }\n});\n\n// Ember.ContainerView extends the default view states to provide different\n// behavior for childViewsWillChange and childViewsDidChange.\nEmber.ContainerView.states = {\n  parent: Ember.View.states,\n\n  inBuffer: {\n    childViewsDidChange: function(parentView, views, start, added) {\n      var buffer = parentView.buffer,\n          startWith, prev, prevBuffer, view;\n\n      // Determine where to begin inserting the child view(s) in the\n      // render buffer.\n      if (start === 0) {\n        // If views were inserted at the beginning, prepend the first\n        // view to the render buffer, then begin inserting any\n        // additional views at the beginning.\n        view = views[start];\n        startWith = start + 1;\n        view.renderToBuffer(buffer, 'prepend');\n      } else {\n        // Otherwise, just insert them at the same place as the child\n        // views mutation.\n        view = views[start - 1];\n        startWith = start;\n      }\n\n      for (var i=startWith; i<start+added; i++) {\n        prev = view;\n        view = views[i];\n        prevBuffer = prev.buffer;\n        view.renderToBuffer(prevBuffer, 'insertAfter');\n      }\n    }\n  },\n\n  hasElement: {\n    childViewsWillChange: function(view, views, start, removed) {\n      for (var i=start; i<start+removed; i++) {\n        views[i].remove();\n      }\n    },\n\n    childViewsDidChange: function(view, views, start, added) {\n      Ember.run.scheduleOnce('render', this, '_ensureChildrenAreInDOM');\n    },\n\n    ensureChildrenAreInDOM: function(view) {\n      var childViews = view.get('childViews'), i, len, childView, previous, buffer;\n      for (i = 0, len = childViews.length; i < len; i++) {\n        childView = childViews[i];\n        buffer = childView.renderToBufferIfNeeded();\n        if (buffer) {\n          childView._notifyWillInsertElement();\n          if (previous) {\n            previous.domManager.after(previous, buffer.string());\n          } else {\n            view.domManager.prepend(view, buffer.string());\n          }\n          childView.transitionTo('inDOM');\n          childView._notifyDidInsertElement();\n        }\n        previous = childView;\n      }\n    }\n  }\n};\n\nEmber.ContainerView.states.inDOM = {\n  parentState: Ember.ContainerView.states.hasElement\n};\n\nEmber.ContainerView.reopen({\n  states: Ember.ContainerView.states\n});\n\n})();\n//@ sourceURL=ember-views/views/container_view");