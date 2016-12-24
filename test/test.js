'use strict'
const assert = require('assert')
const sinon = require('sinon')
const EventRouter = require('../EventRouter')
const emptyFn = function() {}
let myRouter

context('Instantiate Options', () => {
  describe('options.log', () => {
    it('will be called whenever methods are invoked', () => {
      const loggingFn = sinon.spy()
      myRouter = new EventRouter({ log: loggingFn })

      myRouter.add('test', 'key', emptyFn) // calling a router method
      assert(loggingFn.calledOnce)
      assert(loggingFn.calledWith('EventRouter', 'add', 'test', 'key'))
    })
  })
})

context('Interface', () => {
  describe('.getEvents()', () => {
    let myRouter

    before(() => {
      myRouter = new EventRouter()
    })

    it('returns a deep copy of the internal events object (callback functions are not copied!)', () => {
      const events = myRouter.getEvents()
      assert.strictEqual(typeof events, 'object', 'events() returns an object')
      assert.deepStrictEqual(events, {}, 'the events object is initially empty')

      // fill myRouter with some events
      for (let i = 0; i < 3; i++) {
        myRouter.add('test', i, emptyFn)
        myRouter.add(i, 'test', emptyFn)
      }

      const events2 = myRouter.getEvents()
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
      myRouter = new EventRouter()
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
      myRouter = new EventRouter()
    })

    it('removes an event listener from the router and returns true', () => {
      myRouter.add('test', 'test', emptyFn)
      assert.strictEqual(myRouter.remove('test', 'test', emptyFn), true, 'returns true')

      assert.deepStrictEqual(myRouter.getEvents(), {}, 'the events object is empty after event is removed')
    })
  })

  describe('.emit(type, key, data)', () => {
    before(() => {
      myRouter = new EventRouter()
    })

    it('invokes callbacks that are registered to this type and key and passes data as first parameter, and returns true', () => {
      let outer_scope
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
      myRouter = new EventRouter()
    })

    it('removes all event references stored for this type', () => {
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

      myRouter.purge('test')

      assert.deepStrictEqual(myRouter.getEvents(), {
        test2: {
          a: [emptyFn]
        }
      }, 'events object was purged of everything under type test')
    })
  })
})

context('Warning Cases', () => {
  let loggingFn

  beforeEach('re-instantiate EventRouter', () => {
    loggingFn = sinon.spy()
    myRouter = new EventRouter({ log: loggingFn })
  })

  it('returns false and logs a warning when attempting to #add the same callback function twice for the same type and key', () => {
    myRouter.add('test', 'test', emptyFn)
    assert.strictEqual(loggingFn.callCount, 1)
    assert.deepStrictEqual(myRouter.getEvents(), {
      test: {
        test: [emptyFn]
      }
    }, 'the first add is successful')

    assert.strictEqual(myRouter.add('test', 'test', emptyFn), false, 'returns false')
    assert.strictEqual(loggingFn.callCount, 2)
    assert.notDeepStrictEqual(myRouter.getEvents(), {
      test: {
        test: [emptyFn, emptyFn]
      }
    }, 'the second add attempt did not change the events object')
  })

  it('returns false and calls log when attempting to #remove a callback function from an unknown type', () => {
    myRouter.add('type', 'test', emptyFn)
    assert.strictEqual(loggingFn.callCount, 1)
    assert.strictEqual(myRouter.remove('typo', 'test', emptyFn), false, 'returns false')
    assert.strictEqual(loggingFn.callCount, 2)
  })

  it('returns false and calls log when attempting to #remove a callback function from an unknown key', () => {
    myRouter.add('test', 'mess', emptyFn)
    assert.strictEqual(loggingFn.callCount, 1)
    assert.strictEqual(myRouter.remove('test', 'miss', emptyFn), false, 'returns false')
    assert.strictEqual(loggingFn.callCount, 2)
  })

  it('returns false and calls log when attempting to #remove a callback function that is not found under the type and key', () => {
    function blankFn() {}
    myRouter.add('test', 'me', emptyFn)
    assert.strictEqual(loggingFn.callCount, 1)
    assert.strictEqual(myRouter.remove('test', 'me', blankFn), false, 'returns false')
    assert.strictEqual(loggingFn.callCount, 2)
  })

  it('returns false and calls log when attempting to #emit to an unknown type', () => {
    myRouter.add('test', 'me', emptyFn)
    assert.strictEqual(loggingFn.callCount, 1)
    assert.strictEqual(myRouter.emit('toast', 'me', ['some', 'data']), false, 'returns false')
    assert.strictEqual(loggingFn.callCount, 2)
  })

  it('returns false and calls log when attempting to #emit to an unknown key', () => {
    myRouter.add('test', 'me', emptyFn)
    assert.strictEqual(loggingFn.callCount, 1)
    assert.strictEqual(myRouter.emit('test', 'you', ['some', 'data']), false, 'returns false')
    assert.strictEqual(loggingFn.callCount, 2)
  })

})