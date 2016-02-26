'use strict'
const copyObjectGraph = require('copy-object-graph')
const myName = 'EventRouter'

function EventRouter(shouldLogCalls) {
  const events = Object.create(null)

  var public_interface = {
    getEvents() {
      return copyObjectGraph(events)
    },

    add(type, key, callback) {
      return _add(type, key, callback, events)
    },

    remove(type, key, callback) {
      return _remove(type, key, callback, events)
    },

    emit(type, key, data) {
      return _emit(type, key, data, events)
    },

    purge(type) {
      return _purge(type, events)
    }
  }

  if (shouldLogCalls) { // add logging proxy
    for (let method_name in public_interface) {
      public_interface[method_name] = closure(method_name, public_interface[method_name])
    }
    console.info(myName, 'is logging calls')
  }
  function closure(method_name, method) {
    return function(...args) {
      log.call(null, method_name, args)
      return method.apply(null, args)
    }
  }
  function log(method_name, args) {
    args.length = 2 // truncate to 2 so callback is not included
    console.info(myName, method_name, args.join(' '))
  }

  return Object.freeze(public_interface)
}

module.exports = EventRouter
/////////////////////////////////////////////////////
/*
  t = type
  k = key
  d = data
  o = object
  cb = callback
*/
function _purge(t, o) {
  if (!o[t]) {
    console.warn(myName, 'event type', t, 'cannot be purged because it does not exist')
    return false
  }
  delete o[t]
  
  return true
}
function _emit(t, k, d, o) {
  var ot = o[t]
  if (ot === undefined) {
    console.warn(myName, 'event type', t, k, 'was just fired but there are no registered callbacks')
    return false
  }
  var otk = ot[k]
  if (otk === undefined) {
    console.warn(myName, 'event type', t, k, 'was just fired but there are no registered callbacks')
    return false
  }

  for (let cb of otk) cb(d)
  
  return true
}
function _add(t, k, cb, o) {
  var ot = o[t]
  if (ot === undefined) ot = o[t] = {}

  var otk = ot[k]
  if (otk === undefined) otk = ot[k] = []

  if (otk.includes(cb)) {
    console.warn(myName, 'event type', t, k, 'already has this callback function')
    return false
  }
  else otk.push(cb)
  
  return true
}
function _remove(t, k, cb, o) {
  var ot = o[t]
  if (ot === undefined) {
    console.warn(myName, 'cannot find type', t)
    return false
  }
  var otk = ot[k]
  if (otk === undefined) {
    console.warn(myName, 'cannot find key', k, 'in type', t)
    return false
  }
  if (!otk.includes(cb)) {
    console.warn(myName, 'cannot find this callback function under key', k, 'in type', t)
    return false
  }

  otk.splice(otk.indexOf(cb), 1)

  if (!otk.length) {
    delete ot[k]
    if (!Object.keys(ot).length) delete o[t]
  }
  
  return true
}