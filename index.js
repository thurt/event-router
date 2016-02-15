'use strict'
function EventRouter() {
  const subscribers = {}

  // public interface
  return {
    getSubscribers() {
      return Object.assign({}, subscribers)
    },

    add(type, key, callback) {
      console.info('EventRouter:', 'add', type, key)
      _add(type, key, callback, subscribers)
    },

    remove(type, key, callback) {
      console.info('EventRouter:', 'remove', type, key)
      _remove(type, key, callback, subscribers)
    },

    send(type, key, data) {
      console.info('EventRouter:', 'send', type, key)
      _send(type, key, data, subscribers)
    }
  }
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
function _send(t, k, d, o) {
  var ot = o[t]
  if (!ot) return console.warn(`EventRouter: event type ${t} ${k} was just fired, but there are no registered callbacks.` )
  var otk = ot[k]
  if (!otk) return console.warn(`EventRouter: event type ${t} ${k} was just fired, but there are no registered callbacks.`)

  for (let cb of otk) cb(d)
}
function _add(t, k, cb, o) {
  var ot = o[t]
  if (!ot) ot = o[t] = {}

  var otk = ot[k]
  if (!otk) otk = ot[k] = []

  if (!otk.includes(cb)) otk.push(cb)
}
function _remove(t, k, cb, o) {
  var ot = o[t]
  if (!ot) return console.warn(`EventRouter: cannot find type ${t}`)
  var otk = ot[k]
  if (!otk) return console.warn(`EventRouter: cannot find key ${k} in type ${t}`)
  if (!otk.includes(cb)) return console.warn(`EventRouter: cannot find callback ${cb} in key ${k} in type ${t}`)

  otk.splice(otk.indexOf(cb), 1)

  if (!otk.length) {
    delete ot[k]
    if (!Object.keys(ot).length) delete o[t]
  }
}