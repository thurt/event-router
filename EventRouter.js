'use strict'
const copyObjectGraph = require('copy-object-graph')

const Events = new WeakMap()

class EventRouter {
  constructor(options) {
    this.name = (options && options.name) || 'EventRouter'
    this.log = (options && options.log) || () => {}

    Events.set(this, Object.create(null)) // prevent adding Object.prototype
  }

  add(t, k, cb) {
    const o = Events.get(this)

    let ot = o[t]
    if (ot === undefined) ot = o[t] = Object.create(null)

    let otk = ot[k]
    if (otk === undefined) otk = ot[k] = []

    if (otk.includes(cb)) {
      this.log(this.name, 'event type', t, k, 'already has this callback function')
      return false
    } else {
      this.log(this.name, 'add', t, k)
      otk.push(cb)
      return true
    }
  }

  emit(t, k, d) {
    const ot = Events.get(this)[t]

    if (ot === undefined) {
      this.log(this.name, 'event type', t, k, 'was just fired but there are no registered callbacks')
      return false
    }

    const otk = ot[k]
    if (otk === undefined) {
      this.log(this.name, 'event type', t, k, 'was just fired but there are no registered callbacks')
      return false
    }

    for (let cb of otk) cb(d)

    return true
  }

  getEvents() {
    return copyObjectGraph(Events.get(this))
  }

  purge(t) {
    delete Events.get(this)[t]
  }

  remove(t, k, cb) {
    const o = Events.get(this)

    const ot = o[t]
    if (ot === undefined) {
      this.log(this.name, 'cannot find type', t)
      return false
    }

    const otk = ot[k]
    if (otk === undefined) {
      this.log(this.name, 'cannot find key', k, 'in type', t)
      return false
    }

    if (!otk.includes(cb)) {
      this.log(this.name, 'cannot find this callback function under key', k, 'in type', t)
      return false
    }

    otk.splice(otk.indexOf(cb), 1)

    if (!otk.length) {
      delete ot[k]
      if (!Object.keys(ot).length) delete o[t]
    }

    return true
  }
}

module.exports = EventRouter