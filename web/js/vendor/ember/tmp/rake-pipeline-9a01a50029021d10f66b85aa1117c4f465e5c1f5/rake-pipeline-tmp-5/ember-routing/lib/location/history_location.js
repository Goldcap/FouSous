minispade.register('ember-routing/location/history_location', "(function() {var get = Ember.get, set = Ember.set;\n\n/**\n  @class\n\n  Ember.HistoryLocation implements the location API using the browser's\n  history.pushState API.\n\n  @extends Ember.Object\n*/\nEmber.HistoryLocation = Ember.Object.extend(\n/** @scope Ember.HistoryLocation.prototype */ {\n\n  /** @private */\n  init: function() {\n    set(this, 'location', get(this, 'location') || window.location);\n    set(this, '_initialURL', get(this, 'location').pathname);\n  },\n\n  /**\n    Will be pre-pended to path upon state change\n   */\n  rootURL: '/',\n\n  /**\n    @private\n\n    Used to give history a starting reference\n   */\n  _initialURL: null,\n\n  /**\n    @private\n\n    Returns the current `location.pathname`.\n  */\n  getURL: function() {\n    return get(this, 'location').pathname;\n  },\n\n  /**\n    @private\n\n    Uses `history.pushState` to update the url without a page reload.\n  */\n  setURL: function(path) {\n    var state = window.history.state,\n        initialURL = get(this, '_initialURL');\n\n    path = this.formatPath(path);\n\n    if ((initialURL !== path && !state) || (state && state.path !== path)) {\n      window.history.pushState({ path: path }, null, path);\n    }\n  },\n\n  /**\n    @private\n\n    Register a callback to be invoked whenever the browser\n    history changes, including using forward and back buttons.\n  */\n  onUpdateURL: function(callback) {\n    var guid = Ember.guidFor(this);\n\n    Ember.$(window).bind('popstate.ember-location-'+guid, function(e) {\n      callback(location.pathname);\n    });\n  },\n\n  /**\n    @private\n\n    returns the given path appended to rootURL\n   */\n  formatPath: function(path) {\n    var rootURL = get(this, 'rootURL');\n\n    if (path !== '') {\n      rootURL = rootURL.replace(/\\/$/, '');\n    }\n\n    return rootURL + path;\n  },\n\n  /**\n    @private\n\n    Used when using {{action}} helper.  Since no formatting\n    is required we just return the url given.\n  */\n  formatURL: function(url) {\n    return url;\n  },\n\n  /** @private */\n  willDestroy: function() {\n    var guid = Ember.guidFor(this);\n\n    Ember.$(window).unbind('popstate.ember-location-'+guid);\n  }\n});\n\nEmber.Location.registerImplementation('history', Ember.HistoryLocation);\n\n})();\n//@ sourceURL=ember-routing/location/history_location");