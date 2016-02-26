// just to supress IDE ref warnings
/* global myRouter, cache, consoleVal */
'use strict'
var assert = require('assert')
var EventRouter = require('event-router')
var emptyFn = function() {}

describe('Instantiate', () => {
  before('hijack console.info', () => {
    global.cache = console.info
    global.consoleVal = null
    console.info = function(...args) {
      consoleVal = args.join(' ')
    }
  })
  afterEach('reset consoleVal', () => {
    consoleVal = null
  })
  after('restore console.info', () => {
    console.info = global.cache
  })

  it('will log calls to console.info when instantiated with truthy value', () => {
    var EventRouter = require('event-router')
    var myRouter = EventRouter(true)
    assert.strictEqual(consoleVal, 'EventRouter is logging calls')

    myRouter.add('test', 'key', emptyFn)
    assert.strictEqual(consoleVal, 'EventRouter add test key')
  })

  it('will NOT log calls to console.info when instantiated with falsey value', () => {
    var EventRouter = require('event-router')
    var myRouter = EventRouter(false)
    assert.strictEqual(consoleVal, null, 'consoleVal in null after instantiating')

    myRouter.add('test', 'key', emptyFn)
    assert.strictEqual(consoleVal, null, 'consoleVal is still null after a method call')
  })
})

describe('.getEvents()', () => {
  before(() => {
    global.myRouter = EventRouter()
  })

  it('returns a deep copy of the internal events object (callback functions are not copied!)', () => {
    var events = myRouter.getEvents()
    assert.strictEqual(typeof events, 'object', 'events() returns an object')
    assert.deepStrictEqual(events, {}, 'the events object is initially empty')

    // fill myRouter with some events
    for (let i = 0; i < 3; i++) {
      myRouter.add('test', i, emptyFn)
      myRouter.add(i, 'test', emptyFn)
    }

    var events2 = myRouter.getEvents()
    assert.notDeepStrictEqual(events, events2, 'the events object has changed after adding events')
    assert.deepStrictEqual(events2, {
      test: {
        0: [emptyFn],
        1: [emptyFn],
        2: [emptyFn]
      },
      0: {
        test: [emptyFn]
      },
      1: {
        test: [emptyFn]
      },
      2: {
        test: [emptyFn]
      }
    }, 'the events object tree matches what was expected')
  })
})

describe('.add(type, key, callback)', () => {
  before(() => {
    global.myRouter = EventRouter()
  })

  it('adds an event listener to the router and returns true', () => {
    assert.strictEqual(myRouter.add('test', 'test', emptyFn), true, 'returns true')

    assert.deepStrictEqual(myRouter.getEvents(), {
      test: {
        test: [emptyFn]
      }
    }, 'event was added to events object')
  })
})

describe('.remove(type, key, callback)', () => {
  before(() => {
    global.myRouter = EventRouter()
  })

  it('removes an event listener from the router and returns true', () => {
    myRouter.add('test', 'test', emptyFn)
    assert.strictEqual(myRouter.remove('test', 'test', emptyFn), true, 'returns true')

    assert.deepStrictEqual(myRouter.getEvents(), {}, 'the events object is empty after event is removed')
  })
})

describe('.emit(type, key, data)', () => {
  before(() => {
    global.myRouter = EventRouter()
  })

  it('invokes callbacks that are registered to this type and key and passes data as first parameter, and returns true', () => {
    var outer_scope
    function simple_example(data) {
      outer_scope = data
    }
    //--------
    myRouter.add('test', 'test', simple_example)
    assert.strictEqual(myRouter.emit('test', 'test', 'hello world!'), true, 'returns true')

    assert.strictEqual(outer_scope, 'hello world!', 'value received in callback is same value that was emitted through EventRouter')
  })
})

describe('.purge(type)', () => {
  before(() => {
    global.myRouter = require('../index')()
  })

  it('removes all event references stored for this type and returns true', () => {
    myRouter.add('test', 'a', emptyFn)
    myRouter.add('test', 'b', emptyFn)
    myRouter.add('test2', 'a', emptyFn)

    assert.deepStrictEqual(myRouter.getEvents(), {
      test: {
        a: [emptyFn],
        b: [emptyFn]
      },
      test2: {
        a: [emptyFn]
      }
    }, 'events object matches expected result after adding events')

    assert.strictEqual(myRouter.purge('test'), true, 'returns true')

    assert.deepStrictEqual(myRouter.getEvents(), {
      test2: {
        a: [emptyFn]
      }
    }, 'events object was purged of everything under type test')
  })
})

describe('Warning Cases', () => {
  before('hijack console.warn', () => {
    global.cache = console.warn
    global.consoleVal = null
    console.warn = function(...args) {
      consoleVal = args.join(' ')
    }
  })
  beforeEach('re-instantiate EventRouter', () => {
    global.myRouter = require('../index')()
  })
  after('restore console.warn', () => {
    console.warn = cache
    cache = null
    consoleVal = null
  })

  it('returns false and logs a warning when attempting to #add the same callback function twice for the same type and key', () => {
    myRouter.add('test', 'test', emptyFn)
    assert.deepStrictEqual(myRouter.getEvents(), {
      test: {
        test: [emptyFn]
      }
    }, 'the first add is successful')

    assert.strictEqual(myRouter.add('test', 'test', emptyFn), false, 'returns false')
    assert.notDeepStrictEqual(myRouter.getEvents(), {
      test: {
        test: [emptyFn, emptyFn]
      }
    }, 'the second add attempt did not change the events object')
    
    assert.strictEqual(consoleVal, 'EventRouter event type test test already has this callback function', 'a console warning is generated')
  })

  it('returns false and logs a warning when attempting to #remove a callback function from an unknown type', () => {
    myRouter.add('type', 'test', emptyFn)
    assert.strictEqual(myRouter.remove('typo', 'test', emptyFn), false, 'returns false')

    assert.strictEqual(consoleVal, 'EventRouter cannot find type typo', 'a console warning is generated')
  })

  it('returns false and logs a warning when attempting to #remove a callback function from an unknown key', () => {
    myRouter.add('test', 'mess', emptyFn)
    assert.strictEqual(myRouter.remove('test', 'miss', emptyFn), false, 'returns false')

    assert.strictEqual(consoleVal, 'EventRouter cannot find key miss in type test', 'a console warning is generated')
  })

  it('returns false and logs a warning when attempting to #remove a callback function that is not found under the type and key', () => {
    function blankFn() {}
    myRouter.add('test', 'me', emptyFn)
    assert.strictEqual(myRouter.remove('test', 'me', blankFn), false, 'returns false')

    assert.strictEqual(consoleVal, 'EventRouter cannot find this callback function under key me in type test', 'a console warning is generated')
  })

  it('returns false and logs a warning when attempting to #emit to an unknown type', () => {
    myRouter.add('test', 'me', emptyFn)
    assert.strictEqual(myRouter.emit('toast', 'me', ['some', 'data']), false, 'returns false')

    assert.strictEqual(consoleVal, 'EventRouter event type toast me was just fired but there are no registered callbacks', 'a console warning is generated')
  })

  it('returns false and logs a warning when attempting to #emit to an unknown key', () => {
    myRouter.add('test', 'me', emptyFn)
    assert.strictEqual(myRouter.emit('test', 'you', ['some', 'data']), false, 'returns false')

    assert.strictEqual(consoleVal, 'EventRouter event type test you was just fired but there are no registered callbacks', 'a console warning is generated')
  })

  it('returns false and logs a warning when attempting to #purge an unknown type', () => {
    myRouter.add('test', 'me', emptyFn)
    assert.strictEqual(myRouter.purge('toast'), false, 'returns false')

    assert.strictEqual(consoleVal, 'EventRouter event type toast cannot be purged because it does not exist', 'a console warning is generated')
  })
})