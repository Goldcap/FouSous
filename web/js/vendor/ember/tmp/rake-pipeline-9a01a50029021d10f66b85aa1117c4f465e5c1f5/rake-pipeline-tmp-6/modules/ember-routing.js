(function() {
var get = Ember.get;

Ember._ResolvedState = Ember.Object.extend({
  manager: null,
  state: null,
  match: null,

  object: Ember.computed(function(key, value) {
    if (arguments.length === 2) {
      this._object = value;
      return value;
    } else {
      if (this._object) {
        return this._object;
      } else {
        var state = get(this, 'state'),
            match = get(this, 'match'),
            manager = get(this, 'manager');
        return state.deserialize(manager, match.hash);
      }
    }
  }).property(),

  hasPromise: Ember.computed(function() {
    return Ember.canInvoke(get(this, 'object'), 'then');
  }).property('object'),

  promise: Ember.computed(function() {
    var object = get(this, 'object');
    if (Ember.canInvoke(object, 'then')) {
      return object;
    } else {
      return {
        then: function(success) { success(object); }
      };
    }
  }).property('object'),

  transition: function() {
    var manager = get(this, 'manager'),
        path = get(this, 'state.path'),
        object = get(this, 'object');
    manager.transitionTo(path, object);
  }
});

})();



(function() {
var get = Ember.get;

// The Ember Routable mixin assumes the existance of a simple
// routing shim that supports the following three behaviors:
//
// * .getURL() - this is called when the page loads
// * .setURL(newURL) - this is called from within the state
//   manager when the state changes to a routable state
// * .onURLChange(callback) - this happens when the user presses
//   the back or forward button

var paramForClass = function(classObject) {
  var className = classObject.toString(),
      parts = className.split("."),
      last = parts[parts.length - 1];

  return Ember.String.underscore(last) + "_id";
};

var merge = function(original, hash) {
  for (var prop in hash) {
    if (!hash.hasOwnProperty(prop)) { continue; }
    if (original.hasOwnProperty(prop)) { continue; }

    original[prop] = hash[prop];
  }
};

/**
  @class
  @extends Ember.Mixin
*/
Ember.Routable = Ember.Mixin.create({
  init: function() {
    var redirection;
    this.on('connectOutlets', this, this.stashContext);

    if (redirection = get(this, 'redirectsTo')) {
      Ember.assert("You cannot use `redirectsTo` if you already have a `connectOutlets` method", this.connectOutlets === Ember.K);

      this.connectOutlets = function(router) {
        router.transitionTo(redirection);
      };
    }

    // normalize empty route to '/'
    var route = get(this, 'route');
    if (route === '') {
      route = '/';
    }

    this._super();

    Ember.assert("You cannot use `redirectsTo` on a state that has child states", !redirection || (!!redirection && !!get(this, 'isLeaf')));
  },

  /**
    @private

    Whenever a routable state is entered, the context it was entered with
    is stashed so that we can regenerate the state's `absoluteURL` on
    demand.
  */
  stashContext: function(manager, context) {
    var serialized = this.serialize(manager, context);
    Ember.assert('serialize must return a hash', !serialized || typeof serialized === 'object');

    manager.setStateMeta(this, 'context', context);
    manager.setStateMeta(this, 'serialized', serialized);

    if (get(this, 'isRoutable') && !get(manager, 'isRouting')) {
      this.updateRoute(manager, get(manager, 'location'));
    }
  },

  /**
    @private

    Whenever a routable state is entered, the router's location object
    is notified to set the URL to the current absolute path.

    In general, this will update the browser's URL.
  */
  updateRoute: function(manager, location) {
    if (get(this, 'isLeafRoute')) {
      var path = this.absoluteRoute(manager);
      location.setURL(path);
    }
  },

  /**
    @private

    Get the absolute route for the current state and a given
    hash.

    This method is private, as it expects a serialized hash,
    not the original context object.
  */
  absoluteRoute: function(manager, hash) {
    var parentState = get(this, 'parentState');
    var path = '', generated;

    // If the parent state is routable, use its current path
    // as this route's prefix.
    if (get(parentState, 'isRoutable')) {
      path = parentState.absoluteRoute(manager, hash);
    }

    var matcher = get(this, 'routeMatcher'),
        serialized = manager.getStateMeta(this, 'serialized');

    // merge the existing serialized object in with the passed
    // in hash.
    hash = hash || {};
    merge(hash, serialized);

    generated = matcher && matcher.generate(hash);

    if (generated) {
      path = path + '/' + generated;
    }

    return path;
  },

  /**
    @private

    At the moment, a state is routable if it has a string `route`
    property. This heuristic may change.
  */
  isRoutable: Ember.computed(function() {
    return typeof get(this, 'route') === 'string';
  }).cacheable(),

  /**
    @private

    Determine if this is the last routeable state
  */
  isLeafRoute: Ember.computed(function() {
    if (get(this, 'isLeaf')) { return true; }
    return !get(this, 'childStates').findProperty('isRoutable');
  }).cacheable(),

  /**
    @private

    A _RouteMatcher object generated from the current route's `route`
    string property.
  */
  routeMatcher: Ember.computed(function() {
    var route = get(this, 'route');
    if (route) {
      return Ember._RouteMatcher.create({ route: route });
    }
  }).cacheable(),

  /**
    @private

    Check whether the route has dynamic segments and therefore takes
    a context.
  */
  hasContext: Ember.computed(function() {
    var routeMatcher = get(this, 'routeMatcher');
    if (routeMatcher) {
      return routeMatcher.identifiers.length > 0;
    }
  }).cacheable(),

  /**
    @private

    The model class associated with the current state. This property
    uses the `modelType` property, in order to allow it to be
    specified as a String.
  */
  modelClass: Ember.computed(function() {
    var modelType = get(this, 'modelType');

    if (typeof modelType === 'string') {
      return Ember.get(window, modelType);
    } else {
      return modelType;
    }
  }).cacheable(),

  /**
    @private

    Get the model class for the state. The heuristic is:

    * The state must have a single dynamic segment
    * The dynamic segment must end in `_id`
    * A dynamic segment like `blog_post_id` is converted into `BlogPost`
    * The name is then looked up on the passed in namespace

    The process of initializing an application with a router will
    pass the application's namespace into the router, which will be
    used here.
  */
  modelClassFor: function(namespace) {
    var modelClass, routeMatcher, identifiers, match, className;

    // if an explicit modelType was specified, use that
    if (modelClass = get(this, 'modelClass')) { return modelClass; }

    // if the router has no lookup namespace, we won't be able to guess
    // the modelType
    if (!namespace) { return; }

    // make sure this state is actually a routable state
    routeMatcher = get(this, 'routeMatcher');
    if (!routeMatcher) { return; }

    // only guess modelType for states with a single dynamic segment
    // (no more, no fewer)
    identifiers = routeMatcher.identifiers;
    if (identifiers.length !== 2) { return; }

    // extract the `_id` from the end of the dynamic segment; if the
    // dynamic segment does not end in `_id`, we can't guess the
    // modelType
    match = identifiers[1].match(/^(.*)_id$/);
    if (!match) { return; }

    // convert the underscored type into a class form and look it up
    // on the router's namespace
    className = Ember.String.classify(match[1]);
    return get(namespace, className);
  },

  /**
    The default method that takes a `params` object and converts
    it into an object.

    By default, a params hash that looks like `{ post_id: 1 }`
    will be looked up as `namespace.Post.find(1)`. This is
    designed to work seamlessly with Ember Data, but will work
    fine with any class that has a `find` method.
  */
  deserialize: function(manager, params) {
    var modelClass, routeMatcher, param;

    if (modelClass = this.modelClassFor(get(manager, 'namespace'))) {
      Ember.assert("Expected "+modelClass.toString()+" to implement `find` for use in '"+this.get('path')+"' `deserialize`. Please implement the `find` method or overwrite `deserialize`.", modelClass.find);
      return modelClass.find(params[paramForClass(modelClass)]);
    }

    return params;
  },

  /**
    The default method that takes an object and converts it into
    a params hash.

    By default, if there is a single dynamic segment named
    `blog_post_id` and the object is a `BlogPost` with an
    `id` of `12`, the serialize method will produce:

        { blog_post_id: 12 }
  */
  serialize: function(manager, context) {
    var modelClass, routeMatcher, namespace, param, id;

    if (Ember.empty(context)) { return ''; }

    if (modelClass = this.modelClassFor(get(manager, 'namespace'))) {
      param = paramForClass(modelClass);
      id = get(context, 'id');
      context = {};
      context[param] = id;
    }

    return context;
  },

  /**
    @private
  */
  resolvePath: function(manager, path) {
    if (get(this, 'isLeafRoute')) { return Ember.A(); }

    var childStates = get(this, 'childStates'), match;

    childStates = Ember.A(childStates.filterProperty('isRoutable'));

    childStates = childStates.sort(function(a, b) {
      var aDynamicSegments = get(a, 'routeMatcher.identifiers.length'),
          bDynamicSegments = get(b, 'routeMatcher.identifiers.length'),
          aRoute = get(a, 'route'),
          bRoute = get(b, 'route');

      if (aRoute.indexOf(bRoute) === 0) {
        return -1;
      } else if (bRoute.indexOf(aRoute) === 0) {
        return 1;
      }

      if (aDynamicSegments !== bDynamicSegments) {
        return aDynamicSegments - bDynamicSegments;
      }

      return get(b, 'route.length') - get(a, 'route.length');
    });

    var state = childStates.find(function(state) {
      var matcher = get(state, 'routeMatcher');
      if (match = matcher.match(path)) { return true; }
    });

    Ember.assert("Could not find state for path " + path, !!state);

    var resolvedState = Ember._ResolvedState.create({
      manager: manager,
      state: state,
      match: match
    });

    var states = state.resolvePath(manager, match.remaining);

    return Ember.A([resolvedState]).pushObjects(states);
  },

  /**
    @private

    Once `unroute` has finished unwinding, `routePath` will be called
    with the remainder of the route.

    For example, if you were in the /posts/1/comments state, and you
    moved into the /posts/2/comments state, `routePath` will be called
    on the state whose path is `/posts` with the path `/2/comments`.
  */
  routePath: function(manager, path) {
    if (get(this, 'isLeafRoute')) { return; }

    var resolvedStates = this.resolvePath(manager, path),
        hasPromises = resolvedStates.some(function(s) { return get(s, 'hasPromise'); });

    function runTransition() {
      resolvedStates.forEach(function(rs) { rs.transition(); });
    }

    if (hasPromises) {
      manager.transitionTo('loading');

      Ember.assert('Loading state should be the child of a route', Ember.Routable.detect(get(manager, 'currentState.parentState')));
      Ember.assert('Loading state should not be a route', !Ember.Routable.detect(get(manager, 'currentState')));

      manager.handleStatePromises(resolvedStates, runTransition);
    } else {
      runTransition();
    }
  },

  /**
    @private

    When you move to a new route by pressing the back
    or forward button, this method is called first.

    Its job is to move the state manager into a parent
    state of the state it will eventually move into.
  */
  unroutePath: function(router, path) {
    var parentState = get(this, 'parentState');

    // If we're at the root state, we're done
    if (parentState === router) {
      return;
    }

    path = path.replace(/^(?=[^\/])/, "/");
    var absolutePath = this.absoluteRoute(router);

    var route = get(this, 'route');

    // If the current path is empty, move up one state,
    // because the index ('/') state must be a leaf node.
    if (route !== '/') {
      // If the current path is a prefix of the path we're trying
      // to go to, we're done.
      var index = path.indexOf(absolutePath),
          next = path.charAt(absolutePath.length);

      if (index === 0 && (next === "/" || next === "")) {
        return;
      }
    }

    // Transition to the parent and call unroute again.
    router.enterState({
      exitStates: [this],
      enterStates: [],
      finalState: parentState
    });

    router.send('unroutePath', path);
  },

  /**
    The `connectOutlets` event will be triggered once a
    state has been entered. It will be called with the
    route's context.
  */
  connectOutlets: Ember.K,

  /**
   The `navigateAway` event will be triggered when the
   URL changes due to the back/forward button
  */
  navigateAway: Ember.K
});

})();



(function() {
/**
  @class
  @extends Ember.State
  @extends Ember.Routable
*/
Ember.Route = Ember.State.extend(Ember.Routable);

})();



(function() {
var escapeForRegex = function(text) {
  return text.replace(/[\-\[\]{}()*+?.,\\\^\$|#\s]/g, "\\$&");
};

Ember._RouteMatcher = Ember.Object.extend({
  state: null,

  init: function() {
    var route = this.route,
        identifiers = [],
        count = 1,
        escaped;

    // Strip off leading slash if present
    if (route.charAt(0) === '/') {
      route = this.route = route.substr(1);
    }

    escaped = escapeForRegex(route);

    var regex = escaped.replace(/:([a-z_]+)(?=$|\/)/gi, function(match, id) {
      identifiers[count++] = id;
      return "([^/]+)";
    });

    this.identifiers = identifiers;
    this.regex = new RegExp("^/?" + regex);
  },

  match: function(path) {
    var match = path.match(this.regex);

    if (match) {
      var identifiers = this.identifiers,
          hash = {};

      for (var i=1, l=identifiers.length; i<l; i++) {
        hash[identifiers[i]] = match[i];
      }

      return {
        remaining: path.substr(match[0].length),
        hash: identifiers.length > 0 ? hash : null
      };
    }
  },

  generate: function(hash) {
    var identifiers = this.identifiers, route = this.route, id;
    for (var i=1, l=identifiers.length; i<l; i++) {
      id = identifiers[i];
      route = route.replace(new RegExp(":" + id), hash[id]);
    }
    return route;
  }
});

})();



(function() {
var get = Ember.get, set = Ember.set;

/**
  This file implements the `location` API used by Ember's router.

  That API is:

  getURL: returns the current URL
  setURL(path): sets the current URL
  onUpdateURL(callback): triggers the callback when the URL changes
  formatURL(url): formats `url` to be placed into `href` attribute

  Calling setURL will not trigger onUpdateURL callbacks.

  TODO: This, as well as the Ember.Location documentation below, should
  perhaps be moved so that it's visible in the JsDoc output.
*/
/**
  @class

  Ember.Location returns an instance of the correct implementation of
  the `location` API.

  You can pass it a `implementation` ('hash', 'history', 'none') to force a
  particular implementation.
*/
Ember.Location = {
  create: function(options) {
    var implementation = options && options.implementation;
    Ember.assert("Ember.Location.create: you must specify a 'implementation' option", !!implementation);

    var implementationClass = this.implementations[implementation];
    Ember.assert("Ember.Location.create: " + implementation + " is not a valid implementation", !!implementationClass);

    return implementationClass.create.apply(implementationClass, arguments);
  },

  registerImplementation: function(name, implementation) {
    this.implementations[name] = implementation;
  },

  implementations: {}
};

})();



(function() {
var get = Ember.get, set = Ember.set;

/**
  @class

  Ember.NoneLocation does not interact with the browser. It is useful for
  testing, or when you need to manage state with your Router, but temporarily
  don't want it to muck with the URL (for example when you embed your
  application in a larger page).

  @extends Ember.Object
*/
Ember.NoneLocation = Ember.Object.extend(
/** @scope Ember.NoneLocation.prototype */ {
  path: '',

  getURL: function() {
    return get(this, 'path');
  },

  setURL: function(path) {
    set(this, 'path', path);
  },

  onUpdateURL: function(callback) {
    // We are not wired up to the browser, so we'll never trigger the callback.
  },

  formatURL: function(url) {
    // The return value is not overly meaningful, but we do not want to throw
    // errors when test code renders templates containing {{action href=true}}
    // helpers.
    return url;
  }
});

Ember.Location.registerImplementation('none', Ember.NoneLocation);

})();



(function() {
var get = Ember.get, set = Ember.set;

/**
  @class

  Ember.HashLocation implements the location API using the browser's
  hash. At present, it relies on a hashchange event existing in the
  browser.

  @extends Ember.Object
*/
Ember.HashLocation = Ember.Object.extend(
/** @scope Ember.HashLocation.prototype */ {

  /** @private */
  init: function() {
    set(this, 'location', get(this, 'location') || window.location);
  },

  /**
    @private

    Returns the current `location.hash`, minus the '#' at the front.
  */
  getURL: function() {
    return get(this, 'location').hash.substr(1);
  },

  /**
    @private

    Set the `location.hash` and remembers what was set. This prevents
    `onUpdateURL` callbacks from triggering when the hash was set by
    `HashLocation`.
  */
  setURL: function(path) {
    get(this, 'location').hash = path;
    set(this, 'lastSetURL', path);
  },

  /**
    @private

    Register a callback to be invoked when the hash changes. These
    callbacks will execute when the user presses the back or forward
    button, but not after `setURL` is invoked.
  */
  onUpdateURL: function(callback) {
    var self = this;
    var guid = Ember.guidFor(this);

    Ember.$(window).bind('hashchange.ember-location-'+guid, function() {
      var path = location.hash.substr(1);
      if (get(self, 'lastSetURL') === path) { return; }

      set(self, 'lastSetURL', null);

      callback(location.hash.substr(1));
    });
  },

  /**
    @private

    Given a URL, formats it to be placed into the page as part
    of an element's `href` attribute.

    This is used, for example, when using the {{action}} helper
    to generate a URL based on an event.
  */
  formatURL: function(url) {
    return '#'+url;
  },

  /** @private */
  willDestroy: function() {
    var guid = Ember.guidFor(this);

    Ember.$(window).unbind('hashchange.ember-location-'+guid);
  }
});

Ember.Location.registerImplementation('hash', Ember.HashLocation);

})();



(function() {
var get = Ember.get, set = Ember.set;

/**
  @class

  Ember.HistoryLocation implements the location API using the browser's
  history.pushState API.

  @extends Ember.Object
*/
Ember.HistoryLocation = Ember.Object.extend(
/** @scope Ember.HistoryLocation.prototype */ {

  /** @private */
  init: function() {
    set(this, 'location', get(this, 'location') || window.location);
    set(this, '_initialURL', get(this, 'location').pathname);
  },

  /**
    Will be pre-pended to path upon state change
   */
  rootURL: '/',

  /**
    @private

    Used to give history a starting reference
   */
  _initialURL: null,

  /**
    @private

    Returns the current `location.pathname`.
  */
  getURL: function() {
    return get(this, 'location').pathname;
  },

  /**
    @private

    Uses `history.pushState` to update the url without a page reload.
  */
  setURL: function(path) {
    var state = window.history.state,
        initialURL = get(this, '_initialURL');

    path = this.formatPath(path);

    if ((initialURL !== path && !state) || (state && state.path !== path)) {
      window.history.pushState({ path: path }, null, path);
    }
  },

  /**
    @private

    Register a callback to be invoked whenever the browser
    history changes, including using forward and back buttons.
  */
  onUpdateURL: function(callback) {
    var guid = Ember.guidFor(this);

    Ember.$(window).bind('popstate.ember-location-'+guid, function(e) {
      callback(location.pathname);
    });
  },

  /**
    @private

    returns the given path appended to rootURL
   */
  formatPath: function(path) {
    var rootURL = get(this, 'rootURL');

    if (path !== '') {
      rootURL = rootURL.replace(/\/$/, '');
    }

    return rootURL + path;
  },

  /**
    @private

    Used when using {{action}} helper.  Since no formatting
    is required we just return the url given.
  */
  formatURL: function(url) {
    return url;
  },

  /** @private */
  willDestroy: function() {
    var guid = Ember.guidFor(this);

    Ember.$(window).unbind('popstate.ember-location-'+guid);
  }
});

Ember.Location.registerImplementation('history', Ember.HistoryLocation);

})();



(function() {

})();



(function() {
var get = Ember.get, set = Ember.set;

var merge = function(original, hash) {
  for (var prop in hash) {
    if (!hash.hasOwnProperty(prop)) { continue; }
    if (original.hasOwnProperty(prop)) { continue; }

    original[prop] = hash[prop];
  }
};

/**
  @class

  `Ember.Router` is the subclass of `Ember.StateManager` responsible for providing URL-based
  application state detection. The `Ember.Router` instance of an application detects the browser URL
  at application load time and attempts to match it to a specific application state. Additionally
  the router will update the URL to reflect an application's state changes over time.

  ## Adding a Router Instance to Your Application
  An instance of Ember.Router can be associated with an instance of Ember.Application in one of two ways:

  You can provide a subclass of Ember.Router as the `Router` property of your application. An instance
  of this Router class will be instantiated and route detection will be enabled when the application's
  `initialize` method is called. The Router instance will be available as the `router` property
  of the application:

      App = Ember.Application.create({
        Router: Ember.Router.extend({ ... })
      });

      App.initialize();
      App.get('router') // an instance of App.Router

  If you want to define a Router instance elsewhere, you can pass the instance to the application's
  `initialize` method:

      App = Ember.Application.create();
      aRouter = Ember.Router.create({ ... });

      App.initialize(aRouter);
      App.get('router') // aRouter

  ## Adding Routes to a Router
  The `initialState` property of Ember.Router instances is named `root`. The state stored in this
  property must be a subclass of Ember.Route. The `root` route acts as the container for the
  set of routable states but is not routable itself. It should have states that are also subclasses
  of Ember.Route which each have a `route` property describing the URL pattern you would like to detect.

      App = Ember.Application.create({
        Router: Ember.Router.extend({
          root: Ember.Route.extend({
            index: Ember.Route.extend({
              route: '/'
            }),
            ... additional Ember.Routes ...
          })
        })
      });
      App.initialize();


  When an application loads, Ember will parse the URL and attempt to find an Ember.Route within
  the application's states that matches. (The example URL-matching below will use the default
  'hash syntax' provided by `Ember.HashLocation`.)

  In the following route structure:

      App = Ember.Application.create({
        Router: Ember.Router.extend({
          root: Ember.Route.extend({
            aRoute: Ember.Route.extend({
              route: '/'
            }),
            bRoute: Ember.Route.extend({
              route: '/alphabeta'
            })
          })
        })
      });
      App.initialize();

  Loading the page at the URL '#/' will detect the route property of 'root.aRoute' ('/') and
  transition the router first to the state named 'root' and then to the substate 'aRoute'.

  Respectively, loading the page at the URL '#/alphabeta' would detect the route property of
  'root.bRoute' ('/alphabeta') and transition the router first to the state named 'root' and
  then to the substate 'bRoute'.

  ## Adding Nested Routes to a Router
  Routes can contain nested subroutes each with their own `route` property describing the nested
  portion of the URL they would like to detect and handle. Router, like all instances of StateManager,
  cannot call `transitonTo` with an intermediary state. To avoid transitioning the Router into an
  intermediary state when detecting URLs, a Route with nested routes must define both a base `route`
  property for itself and a child Route with a `route` property of `'/'` which will be transitioned
  to when the base route is detected in the URL:

  Given the following application code:

      App = Ember.Application.create({
        Router: Ember.Router.extend({
          root: Ember.Route.extend({
            aRoute: Ember.Route.extend({
              route: '/theBaseRouteForThisSet',

              indexSubRoute: Ember.Route.extend({
                route: '/'
              }),

              subRouteOne: Ember.Route.extend({
                route: '/subroute1'
              }),

              subRouteTwo: Ember.Route.extend({
                route: '/subRoute2'
              })

            })
          })
        })
      });
      App.initialize();

  When the application is loaded at '/theBaseRouteForThisSet' the Router will transition to the route
  at path 'root.aRoute' and then transition to state 'indexSubRoute'.

  When the application is loaded at '/theBaseRouteForThisSet/subRoute1' the Router will transition to
  the route at path 'root.aRoute' and then transition to state 'subRouteOne'.

  ## Route Transition Events
  Transitioning between Ember.Route instances (including the transition into the detected
  route when loading the application)  triggers the same transition events as state transitions for
  base `Ember.State`s. However, the default `setup` transition event is named `connectOutlets` on
  Ember.Router instances (see 'Changing View Hierarchy in Response To State Change').

  The following route structure when loaded with the URL "#/"

      App = Ember.Application.create({
        Router: Ember.Router.extend({
          root: Ember.Route.extend({
            aRoute: Ember.Route.extend({
              route: '/',
              enter: function(router) {
                console.log("entering root.aRoute from", router.get('currentState.name'));
              },
              connectOutlets: function(router) {
                console.log("entered root.aRoute, fully transitioned to", router.get('currentState.path'));
              }
            })
          })
        })
      });
      App.initialize();

  Will result in console output of:

      'entering root.aRoute from root'
      'entered root.aRoute, fully transitioned to root.aRoute '

  Ember.Route has two additional callbacks for handling URL serialization and deserialization. See
  'Serializing/Deserializing URLs'

  ## Routes With Dynamic Segments
  An Ember.Route's `route` property can reference dynamic sections of the URL by prefacing a URL segment
  with the ':' character.  The values of these dynamic segments will be passed as a hash to the
  `deserialize` method of the matching Route (see 'Serializing/Deserializing URLs').

  ## Serializing/Deserializing URLs
  Ember.Route has two callbacks for associating a particular object context with a URL: `serialize`
  for converting an object into a parameters hash to fill dynamic segments of a URL and `deserialize`
  for converting a hash of dynamic segments from the URL into the appropriate object.

  ### Deserializing A URL's Dynamic Segments
  When an application is first loaded or the URL is changed manually (e.g. through the browser's
  back button) the `deserialize` method of the URL's matching Ember.Route will be called with
  the application's router as its first argument and a hash of the URLs dynamic segments and values
  as its second argument.

  The following route structure when loaded with the URL "#/fixed/thefirstvalue/anotherFixed/thesecondvalue":

      App = Ember.Application.create({
        Router: Ember.Router.extend({
          root: Ember.Route.extend({
            aRoute: Ember.Route.extend({
              route: '/fixed/:dynamicSectionA/anotherFixed/:dynamicSectionB',
              deserialize: function(router, params) {}
            })
          })
        })
      });
      App.initialize();

  Will call the 'deserialize' method of the Route instance at the path 'root.aRoute' with the
  following hash as its second argument:

      {
        dynamicSectionA: 'thefirstvalue',
        dynamicSectionB: 'thesecondvalue'
      }

  Within `deserialize` you should use this information to retrieve or create an appropriate context
  object for the given URL (e.g. by loading from a remote API or accessing the browser's
  `localStorage`). This object must be the `return` value of `deserialize` and will be
  passed to the Route's `connectOutlets` and `serialize` methods.

  When an application's state is changed from within the application itself, the context provided for
  the transition will be passed and `deserialize` is not called (see 'Transitions Between States').

  ### Serializing An Object For URLs with Dynamic Segments
  When transitioning into a Route whose `route` property contains dynamic segments the Route's
  `serialize` method is called with the Route's router as the first argument and the Route's
  context as the second argument.  The return value of `serialize` will be use to populate the
  dynamic segments and should be a object with keys that match the names of the dynamic sections.

  Given the following route structure:

      App = Ember.Application.create({
        Router: Ember.Router.extend({
          root: Ember.Route.extend({
            aRoute: Ember.Route.extend({
              route: '/'
            }),
            bRoute: Ember.Route.extend({
              route: '/staticSection/:someDynamicSegment',
              serialize: function(router, context) {
                return {
                  someDynamicSegment: context.get('name')
                }
              }
            })
          })
        })
      });
      App.initialize();


  Transitioning to "root.bRoute" with a context of `Object.create({name: 'Yehuda'})` will call
  the Route's `serialize` method with the context as its second argument and update the URL to
  '#/staticSection/Yehuda'.

  ## Transitions Between States
  Once a routed application has initialized its state based on the entry URL, subsequent transitions to other
  states will update the URL if the entered Route has a `route` property. Given the following route structure
  loaded at the URL '#/':

      App = Ember.Application.create({
        Router: Ember.Router.extend({
          root: Ember.Route.extend({
            aRoute: Ember.Route.extend({
              route: '/',
              moveElsewhere: Ember.Route.transitionTo('bRoute')
            }),
            bRoute: Ember.Route.extend({
              route: '/someOtherLocation'
            })
          })
        })
      });
      App.initialize();

  And application code:

      App.get('router').send('moveElsewhere');

  Will transition the application's state to 'root.bRoute' and trigger an update of the URL to
  '#/someOtherLocation'.

  For URL patterns with dynamic segments a context can be supplied as the second argument to `send`.
  The router will match dynamic segments names to keys on this object and fill in the URL with the
  supplied values. Given the following state structure loaded at the URL '#/':

      App = Ember.Application.create({
        Router: Ember.Router.extend({
          root: Ember.Route.extend({
            aRoute: Ember.Route.extend({
              route: '/',
              moveElsewhere: Ember.Route.transitionTo('bRoute')
            }),
            bRoute: Ember.Route.extend({
              route: '/a/route/:dynamicSection/:anotherDynamicSection',
              connectOutlets: function(router, context) {},
            })
          })
        })
      });
      App.initialize();

  And application code:

      App.get('router').send('moveElsewhere', {
        dynamicSection: '42',
        anotherDynamicSection: 'Life'
      });

  Will transition the application's state to 'root.bRoute' and trigger an update of the URL to
  '#/a/route/42/Life'.

  The context argument will also be passed as the second argument to the `serialize` method call.

  ## Injection of Controller Singletons
  During application initialization Ember will detect properties of the application ending in 'Controller',
  create singleton instances of each class, and assign them as a properties on the router.  The property name
  will be the UpperCamel name converted to lowerCamel format. These controller classes should be subclasses
  of Ember.ObjectController, Ember.ArrayController, Ember.Controller, or a custom Ember.Object that includes the
  Ember.ControllerMixin mixin.

      App = Ember.Application.create({
        FooController: Ember.Object.create(Ember.ControllerMixin),
        Router: Ember.Router.extend({ ... })
      });

      App.get('router.fooController'); // instance of App.FooController

  The controller singletons will have their `namespace` property set to the application and their `target`
  property set to the application's router singleton for easy integration with Ember's user event system.
  See 'Changing View Hierarchy in Response To State Change' and 'Responding to User-initiated Events'

  ## Responding to User-initiated Events
  Controller instances injected into the router at application initialization have their `target` property
  set to the application's router instance. These controllers will also be the default `context` for their
  associated views.  Uses of the `{{action}}` helper will automatically target the application's router.

  Given the following application entered at the URL '#/':

      App = Ember.Application.create({
        Router: Ember.Router.extend({
          root: Ember.Route.extend({
            aRoute: Ember.Route.extend({
              route: '/',
              anActionOnTheRouter: function(router, context) {
                router.transitionTo('anotherState', context);
              }
            })
            anotherState: Ember.Route.extend({
              route: '/differentUrl',
              connectOutlets: function(router, context) {

              }
            })
          })
        })
      });
      App.initialize();

  The following template:

      <script type="text/x-handlebars" data-template-name="aView">
          <h1><a {{action anActionOnTheRouter}}>{{title}}</a></h1>
      </script>

  Will delegate `click` events on the rendered `h1` to the application's router instance. In this case the
  `anActionOnTheRouter` method of the state at 'root.aRoute' will be called with the view's controller
  as the context argument. This context will be passed to the `connectOutlets` as its second argument.

  Different `context` can be supplied from within the `{{action}}` helper, allowing specific context passing
  between application states:

      <script type="text/x-handlebars" data-template-name="photos">
        {{#each photo in controller}}
          <h1><a {{action showPhoto photo}}>{{title}}</a></h1>
        {{/each}}
      </script>

  See Handlebars.helpers.action for additional usage examples.


  ## Changing View Hierarchy in Response To State Change
  Changes in application state that change the URL should be accompanied by associated changes in view
  hierarchy.  This can be accomplished by calling 'connectOutlet' on the injected controller singletons from
  within the 'connectOutlets' event of an Ember.Route:

      App = Ember.Application.create({
        OneController: Ember.ObjectController.extend(),
        OneView: Ember.View.extend(),

        AnotherController: Ember.ObjectController.extend(),
        AnotherView: Ember.View.extend(),

        Router: Ember.Router.extend({
          root: Ember.Route.extend({
            aRoute: Ember.Route.extend({
              route: '/',
              connectOutlets: function(router, context) {
                router.get('oneController').connectOutlet('another');
              },
            })
          })
        })
      });
      App.initialize();


  This will detect the '{{outlet}}' portion of `oneController`'s view (an instance of `App.OneView`) and
  fill it with a rendered instance of `App.AnotherView` whose `context` will be the single instance of
  `App.AnotherController` stored on the router in the `anotherController` property.

  For more information about Outlets, see `Ember.Handlebars.helpers.outlet`. For additional information on
  the `connectOutlet` method, see `Ember.Controller.connectOutlet`. For more information on
  controller injections, see `Ember.Application#initialize()`. For additional information about view context,
  see `Ember.View`.

  @extends Ember.StateManager
*/
Ember.Router = Ember.StateManager.extend(
/** @scope Ember.Router.prototype */ {

  /**
    @property {String}
    @default 'root'
  */
  initialState: 'root',

  /**
    The `Ember.Location` implementation to be used to manage the application
    URL state. The following values are supported:

    * 'hash': Uses URL fragment identifiers (like #/blog/1) for routing.
    * 'none': Does not read or set the browser URL, but still allows for
      routing to happen. Useful for testing.

    @type String
    @default 'hash'
  */
  location: 'hash',

  /**
    This is only used when a history location is used so that applications that
    don't live at the root of the domain can append paths to their root.

    @type String
    @default '/'
  */

  rootURL: '/',

  /**
    On router, transitionEvent should be called connectOutlets

    @property {String}
    @default 'connectOutlets'
  */
  transitionEvent: 'connectOutlets',

  transitionTo: function() {
    this.abortRoutingPromises();
    this._super.apply(this, arguments);
  },

  route: function(path) {
    this.abortRoutingPromises();

    set(this, 'isRouting', true);

    var routableState;

    try {
      path = path.replace(/^(?=[^\/])/, "/");

      this.send('navigateAway');
      this.send('unroutePath', path);

      routableState = get(this, 'currentState');
      while (routableState && !routableState.get('isRoutable')) {
        routableState = get(routableState, 'parentState');
      }
      var currentURL = routableState ? routableState.absoluteRoute(this) : '';
      var rest = path.substr(currentURL.length);

      this.send('routePath', rest);
    } finally {
      set(this, 'isRouting', false);
    }

    routableState = get(this, 'currentState');
    while (routableState && !routableState.get('isRoutable')) {
      routableState = get(routableState, 'parentState');
    }

    if (routableState) {
      routableState.updateRoute(this, get(this, 'location'));
    }
  },

  urlFor: function(path, hash) {
    var currentState = get(this, 'currentState') || this,
        state = this.findStateByPath(currentState, path);

    Ember.assert(Ember.String.fmt("Could not find route with path '%@'", [path]), !!state);
    Ember.assert("To get a URL for a state, it must have a `route` property.", !!get(state, 'routeMatcher'));

    var location = get(this, 'location'),
        absoluteRoute = state.absoluteRoute(this, hash);

    return location.formatURL(absoluteRoute);
  },

  urlForEvent: function(eventName) {
    var contexts = Array.prototype.slice.call(arguments, 1);
    var currentState = get(this, 'currentState');
    var targetStateName = currentState.lookupEventTransition(eventName);

    Ember.assert(Ember.String.fmt("You must specify a target state for event '%@' in order to link to it in the current state '%@'.", [eventName, get(currentState, 'path')]), !!targetStateName);

    var targetState = this.findStateByPath(currentState, targetStateName);

    Ember.assert("Your target state name " + targetStateName + " for event " + eventName + " did not resolve to a state", !!targetState);

    var hash = this.serializeRecursively(targetState, contexts, {});

    return this.urlFor(targetStateName, hash);
  },

  /** @private */
  serializeRecursively: function(state, contexts, hash) {
    var parentState,
        context = get(state, 'hasContext') ? contexts.pop() : null;
    merge(hash, state.serialize(this, context));
    parentState = state.get("parentState");
    if (parentState && parentState instanceof Ember.Route) {
      return this.serializeRecursively(parentState, contexts, hash);
    } else {
      return hash;
    }
  },

  abortRoutingPromises: function() {
    if (this._routingPromises) {
      this._routingPromises.abort();
      this._routingPromises = null;
    }
  },

  /**
    @private
  */
  handleStatePromises: function(states, complete) {
    this.abortRoutingPromises();

    this.set('isLocked', true);

    var manager = this;

    this._routingPromises = Ember._PromiseChain.create({
      promises: states.slice(),

      successCallback: function() {
        manager.set('isLocked', false);
        complete();
      },

      failureCallback: function() {
        throw "Unable to load object";
      },

      promiseSuccessCallback: function(item, args) {
        set(item, 'object', args[0]);
      },

      abortCallback: function() {
        manager.set('isLocked', false);
      }
    }).start();
  },

  /** @private */
  init: function() {
    this._super();

    var location = get(this, 'location'),
        rootURL = get(this, 'rootURL');

    if ('string' === typeof location) {
      set(this, 'location', Ember.Location.create({
        implementation: location,
        rootURL: rootURL
      }));
    }
  },

  /** @private */
  willDestroy: function() {
    get(this, 'location').destroy();
  }
});

})();



(function() {
// ==========================================================================
// Project:  Ember Routing
// Copyright: ©2012 Tilde Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

})();

