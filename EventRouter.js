// @flow
'use strict'
const copyObjectGraph = require('copy-object-graph')
const Events: WeakMap<EventRouter, Object> = new WeakMap()

class EventRouter {
  name: string
  log: Function
  constructor(options: { name?: string, log?: Function }) {
    const emptyFn = function() {}
    this.name = (options && options.name) || 'EventRouter'
    this.log = (options && options.log) || emptyFn

    Events.set(this, Object.create(null)) // prevent adding Object.prototype
  }

  add(t: string, k: string, cb: Function) {
    const o = Events.get(this)

    if (o == null) {
      return false
    }

    if (o[t] == null) {
      o[t] = Object.create(null)
    }
    const ot = o[t]

    if (ot[k]== null) {
      ot[k] = []
    }
    const otk = ot[k]

    if (otk.includes(cb)) {
      this.log(this.name, 'event type', t, k, 'already has this callback function')
      return false
    }

    this.log(this.name, 'add', t, k)
    otk.push(cb)
    return true
  }

  emit(t: string, k: string, data: any) {
    const o = Events.get(this)

    if (o == null) {
      return false
    }

    if (o[t] == null) {
      this.log(this.name, 'event type', t, k, 'was just fired but there are no registered callbacks')
      return false
    }
    const ot = o[t]

    if (ot[k] == null) {
      this.log(this.name, 'event type', t, k, 'was just fired but there are no registered callbacks')
      return false
    }
    const otk = ot[k]

    for (let cb of otk) cb(data)

    return true
  }

  getEvents() {
    return copyObjectGraph(Events.get(this))
  }

  purge(t: string) {
    const o = Events.get(this)

    if (o == null) {
      return false
    }

    if (o[t] == null) {
      return false
    }

    delete o[t]
    return true
  }

  remove(t: string, k: string, cb: Function) {
    const o = Events.get(this)

    if (o == null) {
      return false
    }

    if (o[t] == null) {
      this.log(this.name, 'cannot find type', t)
      return false
    }
    const ot = o[t]

    if (ot[k] == null) {
      this.log(this.name, 'cannot find key', k, 'in type', t)
      return false
    }
    const otk = ot[k]

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