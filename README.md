A simple javascript event router.
Add a callback to any custom event which is keyed by two strings.

Test Documentation
=======================

# TOC
   - [Instantiate Options](#instantiate-options)
     - [options.log](#instantiate-options-optionslog)
   - [Interface](#interface)
     - [.getModels()](#interface-getmodels)
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
const loggingFn = _sinon2.default.spy();
myRouter = new _2.default({ log: loggingFn });
myRouter.add('test', 'action', emptyFn); // calling a router method
(0, _assert2.default)(loggingFn.calledOnce);
```

<a name="interface"></a>
# Interface
<a name="interface-getmodels"></a>
## .getModels()
returns a deep copy of the internal events object (callback functions are not copied!).

```js
const events = myRouter.getModels();
_assert2.default.strictEqual(typeof events, 'object', 'events() returns an object');
_assert2.default.deepStrictEqual(events, {}, 'the events object is initially empty');
// fill myRouter with some events
for (let i = 0; i < 3; i++) {
  myRouter.add('test', i, emptyFn);
  myRouter.add(i, 'test', emptyFn);
}
const events2 = myRouter.getModels();
_assert2.default.notDeepStrictEqual(events, events2, 'the events object has changed after adding events');
_assert2.default.deepStrictEqual(events2, {
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
}, 'the events object tree matches what was expected');
```

<a name="interface-addmodel-action-callback"></a>
## .add(model, action, callback)
adds an event listener to the router and returns true.

```js
_assert2.default.strictEqual(myRouter.add('test', 'test', emptyFn), true, 'returns true');
_assert2.default.deepStrictEqual(myRouter.getModels(), {
  test: {
    test: [emptyFn]
  }
}, 'event was added to events object');
```

<a name="interface-removemodel-action-callback"></a>
## .remove(model, action, callback)
removes an event listener from the router and returns true.

```js
myRouter.add('test', 'test', emptyFn);
_assert2.default.strictEqual(myRouter.remove('test', 'test', emptyFn), true, 'returns true');
_assert2.default.deepStrictEqual(myRouter.getModels(), {}, 'the events object is empty after event is removed');
```

<a name="interface-emitmodel-action-data"></a>
## .emit(model, action, data)
invokes callbacks that are registered to this model action and passes data as first parameter, and returns true.

```js
let outer_scope;
function simple_example(data) {
  outer_scope = data;
}
//--------
myRouter.add('test', 'test', simple_example);
_assert2.default.strictEqual(myRouter.emit('test', 'test', 'hello world!'), true, 'returns true');
_assert2.default.strictEqual(outer_scope, 'hello world!', 'value received in callback is same value that was emitted through EventRouter');
```

<a name="interface-purgemodel"></a>
## .purge(model)
removes all actions stored for this model.

```js
myRouter.add('test', 'a', emptyFn);
myRouter.add('test', 'b', emptyFn);
myRouter.add('test2', 'a', emptyFn);
_assert2.default.deepStrictEqual(myRouter.getModels(), {
  test: {
    a: [emptyFn],
    b: [emptyFn]
  },
  test2: {
    a: [emptyFn]
  }
}, 'events object matches expected result after adding events');
myRouter.purge('test');
_assert2.default.deepStrictEqual(myRouter.getModels(), {
  test2: {
    a: [emptyFn]
  }
}, 'events object was purged of everything under model named test');
```

<a name="warning-cases"></a>
# Warning Cases
returns false and logs a warning when attempting to #add the same callback function twice for the same model action.

```js
myRouter.add('test', 'test', emptyFn);
_assert2.default.strictEqual(loggingFn.callCount, 1);
_assert2.default.deepStrictEqual(myRouter.getModels(), {
  test: {
    test: [emptyFn]
  }
}, 'the first add is successful');
_assert2.default.strictEqual(myRouter.add('test', 'test', emptyFn), false, 'returns false');
_assert2.default.strictEqual(loggingFn.callCount, 2);
_assert2.default.notDeepStrictEqual(myRouter.getModels(), {
  test: {
    test: [emptyFn, emptyFn]
  }
}, 'the second add attempt did not change the events object');
```

returns false and calls log when attempting to #remove a callback function from an unknown model.

```js
myRouter.add('model', 'action', emptyFn);
_assert2.default.strictEqual(loggingFn.callCount, 1);
_assert2.default.strictEqual(myRouter.remove('typo', 'action', emptyFn), false, 'returns false');
_assert2.default.strictEqual(loggingFn.callCount, 2);
```

returns false and calls log when attempting to #remove a callback function from an unknown action on a known model.

```js
myRouter.add('test', 'mess', emptyFn);
_assert2.default.strictEqual(loggingFn.callCount, 1);
_assert2.default.strictEqual(myRouter.remove('test', 'miss', emptyFn), false, 'returns false');
_assert2.default.strictEqual(loggingFn.callCount, 2);
```

returns false and calls log when attempting to #remove an unknown callback function for a known model action.

```js
function blankFn() {}
myRouter.add('test', 'me', emptyFn);
_assert2.default.strictEqual(loggingFn.callCount, 1);
_assert2.default.strictEqual(myRouter.remove('test', 'me', blankFn), false, 'returns false');
_assert2.default.strictEqual(loggingFn.callCount, 2);
```

returns false and calls log when attempting to #emit on an unknown model.

```js
myRouter.add('test', 'me', emptyFn);
_assert2.default.strictEqual(loggingFn.callCount, 1);
_assert2.default.strictEqual(myRouter.emit('toast', 'me', ['some', 'data']), false, 'returns false');
_assert2.default.strictEqual(loggingFn.callCount, 2);
```

returns false and calls log when attempting to #emit to an unknown action.

```js
myRouter.add('test', 'me', emptyFn);
_assert2.default.strictEqual(loggingFn.callCount, 1);
_assert2.default.strictEqual(myRouter.emit('test', 'you', ['some', 'data']), false, 'returns false');
_assert2.default.strictEqual(loggingFn.callCount, 2);
```

