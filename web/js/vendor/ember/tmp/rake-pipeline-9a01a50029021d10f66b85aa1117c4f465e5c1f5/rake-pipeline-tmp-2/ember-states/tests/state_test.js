minispade.register('ember-states/~tests/state_test', "(function() {var get = Ember.get, set = Ember.set;\n\nmodule(\"Ember.State\");\n\ntest(\"exists\", function() {\n  ok(Ember.Object.detect(Ember.State), \"Ember.State is an Ember.Object\");\n});\n\ntest(\"creating a state with substates sets the parentState property\", function() {\n  var state = Ember.State.create({\n    child: Ember.State.create()\n  });\n\n  equal(state.get('child.parentState'), state, \"A child state gets its parent state\");\n  deepEqual(state.get('childStates'), [ state.get('child') ], \"The childStates method returns a state's child states\");\n});\n\ntest(\"a state is passed its state manager when receiving an enter event\", function() {\n  expect(2);\n\n  var count = 0;\n\n  var states = {\n    load: Ember.State.create({\n      enter: function(passedStateManager) {\n        if (count === 0) {\n          ok(passedStateManager.get('isFirst'), \"passes first state manager when created\");\n        } else {\n          ok(passedStateManager.get('isSecond'), \"passes second state manager when created\");\n        }\n\n        count++;\n      }\n    })\n  };\n\n  var stateManager = Ember.StateManager.create({\n    initialState: 'load',\n    isFirst: true,\n\n    states: states\n  });\n\n  var anotherStateManager = Ember.StateManager.create({\n    initialState: 'load',\n    isSecond: true,\n\n    states: states\n  });\n});\n\ntest(\"a state can have listeners that are fired when the state is entered\", function() {\n  expect(2);\n\n  var count = 0;\n\n  var states = {\n    load: Ember.State.create()\n  };\n\n  states.load.on('enter', function(passedStateManager) {\n    if (count === 0) {\n      ok(passedStateManager.get('isFirst'), \"passes first state manager when created\");\n    } else {\n      ok(passedStateManager.get('isSecond'), \"passes second state manager when created\");\n    }\n\n    count++;\n  });\n\n  var stateManager = Ember.StateManager.create({\n    initialState: 'load',\n    isFirst: true,\n\n    states: states\n  });\n\n  var anotherStateManager = Ember.StateManager.create({\n    initialState: 'load',\n    isSecond: true,\n\n    states: states\n  });\n});\n\ntest(\"a state finds properties that are states and copies them to the states hash\", function() {\n  var state1 = Ember.State.create();\n  var state2 = Ember.State.create();\n\n  var superClass = Ember.State.extend({\n    state1: state1\n  });\n\n  var stateInstance = superClass.create({\n    state2: state2\n  });\n\n  var states = get(stateInstance, 'states');\n\n  deepEqual(states, { state1: state1, state2: state2 }, \"states should be retrieved from both the instance and its class\");\n});\n\ntest(\"a state finds properties that are state classes and instantiates them\", function() {\n  var state1 = Ember.State.extend({\n    isState1: true\n  });\n  var state2 = Ember.State.extend({\n    isState2: true\n  });\n\n  var superClass = Ember.State.extend({\n    state1: state1\n  });\n\n  var stateInstance = superClass.create({\n    state2: state2\n  });\n\n  var states = get(stateInstance, 'states');\n\n  equal(get(states.state1, 'isState1'), true, \"instantiated first state\");\n  equal(get(states.state2, 'isState2'), true, \"instantiated second state\");\n});\n\ntest(\"states set up proper names on their children\", function() {\n  var manager = Ember.StateManager.create({\n    states: {\n      first: Ember.State.extend({\n        insideFirst: Ember.State.extend({\n\n        })\n      })\n    }\n  });\n\n  manager.transitionTo('first');\n  equal(get(manager, 'currentState.path'), 'first');\n\n  manager.transitionTo('first.insideFirst');\n  equal(get(manager, 'currentState.path'), 'first.insideFirst');\n});\n\ntest(\"states with child instances set up proper names on their children\", function() {\n  var manager = Ember.StateManager.create({\n    states: {\n      first: Ember.State.create({\n        insideFirst: Ember.State.create({\n\n        })\n      })\n    }\n  });\n\n  manager.transitionTo('first');\n  equal(get(manager, 'currentState.path'), 'first');\n\n  manager.transitionTo('first.insideFirst');\n  equal(get(manager, 'currentState.path'), 'first.insideFirst');\n});\n\ntest(\"the isLeaf property is false when a state has child states\", function() {\n  var manager = Ember.StateManager.create({\n    states: {\n      first: Ember.State.create({\n        insideFirst: Ember.State.create(),\n        otherInsideFirst: Ember.State.create({\n          definitelyInside: Ember.State.create()\n        })\n      })\n    }\n  });\n\n  var first = manager.get('states.first');\n  var insideFirst = first.get('states.insideFirst');\n  var otherInsideFirst = first.get('states.otherInsideFirst');\n  var definitelyInside = otherInsideFirst.get('states.definitelyInside');\n\n  equal(first.get('isLeaf'), false);\n  equal(insideFirst.get('isLeaf'), true);\n  equal(otherInsideFirst.get('isLeaf'), false);\n  equal(definitelyInside.get('isLeaf'), true);\n});\n\n})();\n//@ sourceURL=ember-states/~tests/state_test");