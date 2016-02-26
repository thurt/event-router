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

