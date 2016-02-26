A simple javascript event router.
Add a callback to any custom event which is keyed by two strings.

Here is an example showing some of the functionality:
```javascript
var myRouter = require('event-router')(true)
/* interface:
  myRouter.getSubscribers()
  myRouter.add(string, string, callbackFunction)
  myRouter.remove(string, string, callbackFunction)
  myRouter.send(string, string, anyData)
*/

var myGreatDane = Dog('Woof! Woof!')
var myPoodle = Dog('Arf! Arf!')
var myBarkCounter = EventCounter('Dog', 'bark')

myBarkCounter.startListening()
////
  myGreatDane.bark()
  myPoodle.bark()
  myGreatDane.bark()
////
myBarkCounter.stopListening()

myPoodle.bark() // not counted
myBarkCounter.getCounts()

/* console output:
  EventRouter: add Dog bark
  EventRouter: send Dog bark
  EventRouter: send Dog bark
  EventRouter: send Dog bark
  EventRouter: send Dog bark
  EventRouter: event type Dog bark was just fired, but there are no registered callbacks.
  EventCounter: {"Woof! Woof!":2,"Arf! Arf!":1}
*/

myRouter = myGreatDane = myPoodle = myBarkCounter = null
////////////////////////////////////////////////////////////////

function Dog(bark_str) {
  return {
    bark() {
      myRouter.send('Dog', 'bark', bark_str) // SEND
    }
  }
}

function EventCounter(type, event) {
  var counts = {}

  function countType(data) {
    counts[data] = counts[data] + 1 || 1
  }

  return {
    getCounts() {
      console.info('EventCounter:', JSON.stringify(counts))
    },
    startListening() {
      myRouter.add(type, event, countType) // ADD
    },
    stopListening() {
      myRouter.remove(type, event, countType) // REMOVE
    }
  }
}
```

Test Documentation
=======================

# TOC
   - [Instantiate](#instantiate)
   - [.getEvents()](#getevents)
   - [.add(type, key, callback)](#addtype-key-callback)
   - [.remove(type, key, callback)](#removetype-key-callback)
   - [.emit(type, key, data)](#emittype-key-data)
   - [.purge(type)](#purgetype)
   - [Warning Cases](#warning-cases)
<a name=""></a>
 
<a name="instantiate"></a>
# Instantiate
will log calls to console.info when instantiated with truthy value.

```js
var EventRouter = require('event-router')
var myRouter = EventRouter(true)
assert.strictEqual(consoleVal, 'EventRouter is logging calls')
myRouter.add('test', 'key', emptyFn)
assert.strictEqual(consoleVal, 'EventRouter add test key')
```

will NOT log calls to console.info when instantiated with falsey value.

```js
var EventRouter = require('event-router')
var myRouter = EventRouter(false)
assert.strictEqual(consoleVal, null, 'consoleVal in null after instantiating')
myRouter.add('test', 'key', emptyFn)
assert.strictEqual(consoleVal, null, 'consoleVal is still null after a method call')
```

<a name="getevents"></a>
# .getEvents()
returns a deep copy of the internal events object (callback functions are not copied!).

```js
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
```

<a name="addtype-key-callback"></a>
# .add(type, key, callback)
adds an event listener to the router and returns true.

```js
assert.strictEqual(myRouter.add('test', 'test', emptyFn), true, 'returns true')
assert.deepStrictEqual(myRouter.getEvents(), {
  test: {
    test: [emptyFn]
  }
}, 'event was added to events object')
```

<a name="removetype-key-callback"></a>
# .remove(type, key, callback)
removes an event listener from the router and returns true.

```js
myRouter.add('test', 'test', emptyFn)
assert.strictEqual(myRouter.remove('test', 'test', emptyFn), true, 'returns true')
assert.deepStrictEqual(myRouter.getEvents(), {}, 'the events object is empty after event is removed')
```

<a name="emittype-key-data"></a>
# .emit(type, key, data)
invokes callbacks that are registered to this type and key and passes data as first parameter, and returns true.

```js
var outer_scope
function simple_example(data) {
  outer_scope = data
}
//--------
myRouter.add('test', 'test', simple_example)
assert.strictEqual(myRouter.emit('test', 'test', 'hello world!'), true, 'returns true')
assert.strictEqual(outer_scope, 'hello world!', 'value received in callback is same value that was emitted through EventRouter')
```

<a name="purgetype"></a>
# .purge(type)
removes all event references stored for this type and returns true.

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
assert.strictEqual(myRouter.purge('test'), true, 'returns true')
assert.deepStrictEqual(myRouter.getEvents(), {
  test2: {
    a: [emptyFn]
  }
}, 'events object was purged of everything under type test')
```

<a name="warning-cases"></a>
# Warning Cases
returns false and logs a warning when attempting to #add the same callback function twice for the same type and key.

```js
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
```

returns false and logs a warning when attempting to #remove a callback function from an unknown type.

```js
myRouter.add('type', 'test', emptyFn)
assert.strictEqual(myRouter.remove('typo', 'test', emptyFn), false, 'returns false')
assert.strictEqual(consoleVal, 'EventRouter cannot find type typo', 'a console warning is generated')
```

returns false and logs a warning when attempting to #remove a callback function from an unknown key.

```js
myRouter.add('test', 'mess', emptyFn)
assert.strictEqual(myRouter.remove('test', 'miss', emptyFn), false, 'returns false')
assert.strictEqual(consoleVal, 'EventRouter cannot find key miss in type test', 'a console warning is generated')
```

returns false and logs a warning when attempting to #remove a callback function that is not found under the type and key.

```js
function blankFn() {}
myRouter.add('test', 'me', emptyFn)
assert.strictEqual(myRouter.remove('test', 'me', blankFn), false, 'returns false')
assert.strictEqual(consoleVal, 'EventRouter cannot find this callback function under key me in type test', 'a console warning is generated')
```

returns false and logs a warning when attempting to #emit to an unknown type.

```js
myRouter.add('test', 'me', emptyFn)
assert.strictEqual(myRouter.emit('toast', 'me', ['some', 'data']), false, 'returns false')
assert.strictEqual(consoleVal, 'EventRouter event type toast me was just fired but there are no registered callbacks', 'a console warning is generated')
```

returns false and logs a warning when attempting to #emit to an unknown key.

```js
myRouter.add('test', 'me', emptyFn)
assert.strictEqual(myRouter.emit('test', 'you', ['some', 'data']), false, 'returns false')
assert.strictEqual(consoleVal, 'EventRouter event type test you was just fired but there are no registered callbacks', 'a console warning is generated')
```

returns false and logs a warning when attempting to #purge an unknown type.

```js
myRouter.add('test', 'me', emptyFn)
assert.strictEqual(myRouter.purge('toast'), false, 'returns false')
assert.strictEqual(consoleVal, 'EventRouter event type toast cannot be purged because it does not exist', 'a console warning is generated')
```

