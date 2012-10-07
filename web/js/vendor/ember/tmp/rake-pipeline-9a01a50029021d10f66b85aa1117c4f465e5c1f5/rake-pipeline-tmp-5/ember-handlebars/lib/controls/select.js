minispade.register('ember-handlebars/controls/select', "(function() {/*jshint eqeqeq:false */\n\nvar set = Ember.set, get = Ember.get;\nvar indexOf = Ember.EnumerableUtils.indexOf, indexesOf = Ember.EnumerableUtils.indexesOf;\n\n/**\n  @class\n\n  The Ember.Select view class renders a\n  [select](https://developer.mozilla.org/en/HTML/Element/select) HTML element,\n  allowing the user to choose from a list of options. The selected option(s)\n  are updated live in the `selection` property, while the corresponding value\n  is updated in the `value` property.\n\n  ### Using Strings\n  The simplest version of an Ember.Select takes an array of strings for the options\n  of a select box and a valueBinding to set the value.\n\n  Example:\n\n      App.controller = Ember.Object.create({\n        selected: null,\n        content: [\n          \"Yehuda\",\n          \"Tom\"\n        ]\n      })\n\n      {{view Ember.Select\n             contentBinding=\"App.controller.content\"\n             valueBinding=\"App.controller.selected\"\n      }}\n\n  Would result in the following HTML:\n\n      <select class=\"ember-select\">\n        <option value=\"Yehuda\">Yehuda</option>\n        <option value=\"Tom\">Tom</option>\n      </select>\n\n  Selecting Yehuda from the select box will set `App.controller.selected` to \"Yehuda\"\n\n  ### Using Objects\n  An Ember.Select can also take an array of JS or Ember objects.\n\n  When using objects you need to supply optionLabelPath and optionValuePath parameters\n  which will be used to get the label and value for each of the options.\n\n  Usually you will bind to either the selection or the value attribute of the select.\n\n  Use selectionBinding if you would like to set the whole object as a property on the target.\n  Use valueBinding if you would like to set just the value.\n\n  Example using selectionBinding:\n\n      App.controller = Ember.Object.create({\n        selectedPerson: null,\n        selectedPersonId: null,\n        content: [\n          Ember.Object.create({firstName: \"Yehuda\", id: 1}),\n          Ember.Object.create({firstName: \"Tom\",    id: 2})\n        ]\n      })\n\n      {{view Ember.Select\n             contentBinding=\"App.controller.content\"\n             optionLabelPath=\"content.firstName\"\n             optionValuePath=\"content.id\"\n             selectionBinding=\"App.controller.selectedPerson\"\n             prompt=\"Please Select\"}}\n\n      <select class=\"ember-select\">\n        <option value>Please Select</option>\n        <option value=\"1\">Yehuda</option>\n        <option value=\"2\">Tom</option>\n      </select>\n\n  Selecting Yehuda here will set `App.controller.selectedPerson` to\n  the Yehuda object.\n\n  Example using valueBinding:\n\n      {{view Ember.Select\n             contentBinding=\"App.controller.content\"\n             optionLabelPath=\"content.firstName\"\n             optionValuePath=\"content.id\"\n             valueBinding=\"App.controller.selectedPersonId\"\n             prompt=\"Please Select\"}}\n\n  Selecting Yehuda in this case will set `App.controller.selectedPersonId` to 1.\n\n  @extends Ember.View\n*/\nEmber.Select = Ember.View.extend(\n  /** @scope Ember.Select.prototype */ {\n\n  tagName: 'select',\n  classNames: ['ember-select'],\n  defaultTemplate: Ember.Handlebars.compile('{{#if view.prompt}}<option value>{{view.prompt}}</option>{{/if}}{{#each view.content}}{{view Ember.SelectOption contentBinding=\"this\"}}{{/each}}'),\n  attributeBindings: ['multiple', 'tabindex'],\n\n  /**\n    The `multiple` attribute of the select element. Indicates whether multiple\n    options can be selected.\n\n    @type Boolean\n    @default false\n  */\n  multiple: false,\n\n  /**\n    The list of options.\n\n    If `optionLabelPath` and `optionValuePath` are not overridden, this should\n    be a list of strings, which will serve simultaneously as labels and values.\n\n    Otherwise, this should be a list of objects. For instance:\n\n        content: Ember.A([\n            { id: 1, firstName: 'Yehuda' },\n            { id: 2, firstName: 'Tom' }\n          ]),\n        optionLabelPath: 'content.firstName',\n        optionValuePath: 'content.id'\n\n    @type Array\n    @default null\n  */\n  content: null,\n\n  /**\n    When `multiple` is false, the element of `content` that is currently\n    selected, if any.\n\n    When `multiple` is true, an array of such elements.\n\n    @type Object or Array\n    @default null\n  */\n  selection: null,\n\n  /**\n    In single selection mode (when `multiple` is false), value can be used to get\n    the current selection's value or set the selection by it's value.\n\n    It is not currently supported in multiple selection mode.\n\n    @type String\n    @default null\n  */\n  value: Ember.computed(function(key, value) {\n    if (arguments.length === 2) { return value; }\n\n    var valuePath = get(this, 'optionValuePath').replace(/^content\\.?/, '');\n    return valuePath ? get(this, 'selection.' + valuePath) : get(this, 'selection');\n  }).property('selection').cacheable(),\n\n  /**\n    If given, a top-most dummy option will be rendered to serve as a user\n    prompt.\n\n    @type String\n    @default null\n  */\n  prompt: null,\n\n  /**\n    The path of the option labels. See `content`.\n\n    @type String\n    @default 'content'\n  */\n  optionLabelPath: 'content',\n\n  /**\n    The path of the option values. See `content`.\n\n    @type String\n    @default 'content'\n  */\n  optionValuePath: 'content',\n\n  _change: function() {\n    if (get(this, 'multiple')) {\n      this._changeMultiple();\n    } else {\n      this._changeSingle();\n    }\n  },\n\n  selectionDidChange: Ember.observer(function() {\n    var selection = get(this, 'selection'),\n        isArray = Ember.isArray(selection);\n    if (get(this, 'multiple')) {\n      if (!isArray) {\n        set(this, 'selection', Ember.A([selection]));\n        return;\n      }\n      this._selectionDidChangeMultiple();\n    } else {\n      this._selectionDidChangeSingle();\n    }\n  }, 'selection'),\n\n  valueDidChange: Ember.observer(function() {\n    var content = get(this, 'content'),\n        value = get(this, 'value'),\n        valuePath = get(this, 'optionValuePath').replace(/^content\\.?/, ''),\n        selectedValue = (valuePath ? get(this, 'selection.' + valuePath) : get(this, 'selection')),\n        selection;\n\n    if (value !== selectedValue) {\n      selection = content.find(function(obj) {\n        return value === (valuePath ? get(obj, valuePath) : obj);\n      });\n\n      this.set('selection', selection);\n    }\n  }, 'value'),\n\n\n  _triggerChange: function() {\n    var selection = get(this, 'selection');\n    var value = get(this, 'value');\n\n    if (selection) { this.selectionDidChange(); }\n    if (value) { this.valueDidChange(); }\n\n    this._change();\n  },\n\n  _changeSingle: function() {\n    var selectedIndex = this.$()[0].selectedIndex,\n        content = get(this, 'content'),\n        prompt = get(this, 'prompt');\n\n    if (!content) { return; }\n    if (prompt && selectedIndex === 0) { set(this, 'selection', null); return; }\n\n    if (prompt) { selectedIndex -= 1; }\n    set(this, 'selection', content.objectAt(selectedIndex));\n  },\n\n  _changeMultiple: function() {\n    var options = this.$('option:selected'),\n        prompt = get(this, 'prompt'),\n        offset = prompt ? 1 : 0,\n        content = get(this, 'content');\n\n    if (!content){ return; }\n    if (options) {\n      var selectedIndexes = options.map(function(){\n        return this.index - offset;\n      }).toArray();\n      set(this, 'selection', content.objectsAt(selectedIndexes));\n    }\n  },\n\n  _selectionDidChangeSingle: function() {\n    var el = this.get('element');\n    if (!el) { return; }\n\n    var content = get(this, 'content'),\n        selection = get(this, 'selection'),\n        selectionIndex = content ? indexOf(content, selection) : -1,\n        prompt = get(this, 'prompt');\n\n    if (prompt) { selectionIndex += 1; }\n    if (el) { el.selectedIndex = selectionIndex; }\n  },\n\n  _selectionDidChangeMultiple: function() {\n    var content = get(this, 'content'),\n        selection = get(this, 'selection'),\n        selectedIndexes = content ? indexesOf(content, selection) : [-1],\n        prompt = get(this, 'prompt'),\n        offset = prompt ? 1 : 0,\n        options = this.$('option'),\n        adjusted;\n\n    if (options) {\n      options.each(function() {\n        adjusted = this.index > -1 ? this.index + offset : -1;\n        this.selected = indexOf(selectedIndexes, adjusted) > -1;\n      });\n    }\n  },\n\n  init: function() {\n    this._super();\n    this.on(\"didInsertElement\", this, this._triggerChange);\n    this.on(\"change\", this, this._change);\n  }\n});\n\nEmber.SelectOption = Ember.View.extend({\n  tagName: 'option',\n  attributeBindings: ['value', 'selected'],\n\n  defaultTemplate: function(context, options) {\n    options = { data: options.data, hash: {} };\n    Ember.Handlebars.helpers.bind.call(context, \"view.label\", options);\n  },\n\n  init: function() {\n    this.labelPathDidChange();\n    this.valuePathDidChange();\n\n    this._super();\n  },\n\n  selected: Ember.computed(function() {\n    var content = get(this, 'content'),\n        selection = get(this, 'parentView.selection');\n    if (get(this, 'parentView.multiple')) {\n      return selection && indexOf(selection, content) > -1;\n    } else {\n      // Primitives get passed through bindings as objects... since\n      // `new Number(4) !== 4`, we use `==` below\n      return content == selection;\n    }\n  }).property('content', 'parentView.selection').volatile(),\n\n  labelPathDidChange: Ember.observer(function() {\n    var labelPath = get(this, 'parentView.optionLabelPath');\n\n    if (!labelPath) { return; }\n\n    Ember.defineProperty(this, 'label', Ember.computed(function() {\n      return get(this, labelPath);\n    }).property(labelPath).cacheable());\n  }, 'parentView.optionLabelPath'),\n\n  valuePathDidChange: Ember.observer(function() {\n    var valuePath = get(this, 'parentView.optionValuePath');\n\n    if (!valuePath) { return; }\n\n    Ember.defineProperty(this, 'value', Ember.computed(function() {\n      return get(this, valuePath);\n    }).property(valuePath).cacheable());\n  }, 'parentView.optionValuePath')\n});\n\n\n})();\n//@ sourceURL=ember-handlebars/controls/select");