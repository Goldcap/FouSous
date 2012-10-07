minispade.register('ember-handlebars/controls/text_area', "(function() {// ==========================================================================\n// Project:   Ember Handlebars Views\n// Copyright: ©2011 Strobe Inc. and contributors.\n// License:   Licensed under MIT license (see license.js)\n// ==========================================================================\nminispade.require(\"ember-handlebars/ext\");\nminispade.require(\"ember-views/views/view\");\nminispade.require(\"ember-handlebars/controls/text_support\");\n\nvar get = Ember.get, set = Ember.set;\n\n/**\n  @class\n\n  The `Ember.TextArea` view class renders a\n  [textarea](https://developer.mozilla.org/en/HTML/Element/textarea) element.\n  It allows for binding Ember properties to the text area contents (`value`),\n  live-updating as the user inputs text.\n\n  ## Layout and LayoutName properties\n\n  Because HTML `textarea` elements do not contain inner HTML the `layout` and `layoutName` \n  properties will not be applied. See `Ember.View`'s layout section for more information.\n\n  @extends Ember.View\n  @extends Ember.TextSupport\n*/\nEmber.TextArea = Ember.View.extend(Ember.TextSupport,\n/** @scope Ember.TextArea.prototype */ {\n\n  classNames: ['ember-text-area'],\n\n  tagName: \"textarea\",\n  attributeBindings: ['rows', 'cols'],\n  rows: null,\n  cols: null,\n\n  _updateElementValue: Ember.observer(function() {\n    // We do this check so cursor position doesn't get affected in IE\n    var value = get(this, 'value'),\n        $el = this.$();\n    if ($el && value !== $el.val()) {\n      $el.val(value);\n    }\n  }, 'value'),\n\n  /** @private */\n  init: function() {\n    this._super();\n    this.on(\"didInsertElement\", this, this._updateElementValue);\n  }\n\n});\n\n})();\n//@ sourceURL=ember-handlebars/controls/text_area");