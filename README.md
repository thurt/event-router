A simple javascript event router.
Add a callback to any custom event which is keyed by two strings.

Test Documentation
=======================

# TOC
   - [Instantiate Options](#instantiate-options)
     - [options.log](#instantiate-options-optionslog)
   - [Interface](#interface)
     - [.getEvents()](#interface-getevents)
     - [.add(model, action, callback)](#interface-addmodel-action-callback)
     - [.remove(model, action, callback)](#interface-removemodel-action-callback)
     - [.emit(model, action, data)](#interface-emitmodel-action-data)
     - [.purge(model)](#interface-purgemodel)
   - [Warning Cases](#warning-cases)
<a name=""></a>
 
<a name="instantiate-options"></a>
# Instantiate Options
<a name="instantiate-options-optionslog"></a>
## options.log
will be called whenever methods are invoked.

```js
const loggingFn = sinon.spy()
myRouter = new EventRouter({ log: loggingFn })
myRouter.add('test', 'action', emptyFn) // calling a router method
assert(loggingFn.calledOnce)
```

<a name="interface"></a>
# Interface
<a name="interface-getevents"></a>
## .getEvents()
returns a deep copy of the internal events object (callback functions are not copied!).

```js
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
```

<a name="interface-addmodel-action-callback"></a>
## .add(model, action, callback)
adds an event listener to the router and returns true.

```js
assert.strictEqual(myRouter.add('test', 'test', emptyFn), true, 'returns true')
assert.deepStrictEqual(myRouter.getEvents(), {
  test: {
    test: [emptyFn]
  }
}, 'event was added to events object')
```

<a name="interface-removemodel-action-callback"></a>
## .remove(model, action, callback)
removes an event listener from the router and returns true.

```js
myRouter.add('test', 'test', emptyFn)
assert.strictEqual(myRouter.remove('test', 'test', emptyFn), true, 'returns true')
assert.deepStrictEqual(myRouter.getEvents(), {}, 'the events object is empty after event is removed')
```

<a name="interface-emitmodel-action-data"></a>
## .emit(model, action, data)
invokes callbacks that are registered to this model action and passes data as first parameter, and returns true.

```js
let outer_scope
function simple_example(data) {
  outer_scope = data
}
//--------
myRouter.add('test', 'test', simple_example)
assert.strictEqual(myRouter.emit('test', 'test', 'hello world!'), true, 'returns true')
assert.strictEqual(outer_scope, 'hello world!', 'value received in callback is same value that was emitted through EventRouter')
```

<a name="interface-purgemodel"></a>
## .purge(model)
removes all actions stored for this model.

```js
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
}, 'events object was purged of everything under model named test')
```

<a name="warning-cases"></a>
# Warning Cases
returns false and logs a warning when attempting to #add the same callback function twice for the same model action.

```js
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
```

returns false and calls log when attempting to #remove a callback function from an unknown model.

```js
myRouter.add('model', 'action', emptyFn)
assert.strictEqual(loggingFn.callCount, 1)
assert.strictEqual(myRouter.remove('typo', 'action', emptyFn), false, 'returns false')
assert.strictEqual(loggingFn.callCount, 2)
```

returns false and calls log when attempting to #remove a callback function from an unknown action on a known model.

```js
myRouter.add('test', 'mess', emptyFn)
assert.strictEqual(loggingFn.callCount, 1)
assert.strictEqual(myRouter.remove('test', 'miss', emptyFn), false, 'returns false')
assert.strictEqual(loggingFn.callCount, 2)
```

returns false and calls log when attempting to #remove an unknown callback function for a known model action.

```js
function blankFn() {}
myRouter.add('test', 'me', emptyFn)
assert.strictEqual(loggingFn.callCount, 1)
assert.strictEqual(myRouter.remove('test', 'me', blankFn), false, 'returns false')
assert.strictEqual(loggingFn.callCount, 2)
```

returns false and calls log when attempting to #emit on an unknown model.

```js
myRouter.add('test', 'me', emptyFn)
assert.strictEqual(loggingFn.callCount, 1)
assert.strictEqual(myRouter.emit('toast', 'me', ['some', 'data']), false, 'returns false')
assert.strictEqual(loggingFn.callCount, 2)
```

returns false and calls log when attempting to #emit to an unknown action.

```js
myRouter.add('test', 'me', emptyFn)
assert.strictEqual(loggingFn.callCount, 1)
assert.strictEqual(myRouter.emit('test', 'you', ['some', 'data']), false, 'returns false')
assert.strictEqual(loggingFn.callCount, 2)
```

