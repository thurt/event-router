// @flow
'use strict'
const copyObjectGraph: Function = require('copy-object-graph')

type Stack = Array<Function>
type Actions = {[action:string]: Stack}
type Models = {[model:string]: Actions}
const Routers: WeakMap<EventRouter, Models> = new WeakMap()
type MaybeModels = void | Models

type logFunction = (...strings: Array<string>) => void
type callbackFunction = (data: any) => void

class EventRouter {
  name: string
  log: logFunction
  constructor(options: { name?: string, log?: logFunction }): void {
    this.name = (options && options.name) || 'EventRouter'
    this.log = (options && options.log) || function(): void {}

    Routers.set(this, Object.create(null)) // prevent adding Object.prototype
  }

  add(model: string, action: string, cb: callbackFunction): boolean {
    const models: MaybeModels = Routers.get(this)

    if (models == null) {
      return false
    }

    if (models[model] == null) {
      models[model] = Object.create(null)
    }
    const actions: Actions = models[model]

    if (actions[action] == null) {
      actions[action] = []
    }
    const stack: Stack = actions[action]

    if (stack.includes(cb)) {
      this.log(this.name, 'this callback is already subscribed to action', action, 'on model', model)
      return false
    }

    this.log(this.name, 'subscribing callback to action', action, 'on model', model)
    stack.push(cb)
    return true
  }

  emit(model: string, action: string, data: mixed): boolean {
    const models: MaybeModels = Routers.get(this)

    if (models == null) {
      return false
    }

    if (models[model] == null) {
      this.log(this.name, 'received request to emit action', action, 'on an unknown model', model)
      return false
    }
    const actions: Actions = models[model]

    if (actions[action] == null) {
      this.log(this.name, 'received request to emit action', action, 'on model', model, 'but there are no subscribers')
      return false
    }
    const stack: Stack = actions[action]

    for (let cb: Function of stack) cb(data)

    return true
  }

  getModels(): MaybeModels {
    const models: MaybeModels = Routers.get(this)
    return copyObjectGraph(models)
  }

  purge(model: string): boolean {
    const models: MaybeModels = Routers.get(this)

    if (models == null) {
      return false
    }

    if (models[model] == null) {
      return false
    }

    delete models[model]
    return true
  }

  remove(model: string, action: string, cb: callbackFunction): boolean {
    const models: MaybeModels = Routers.get(this)

    if (models == null) {
      return false
    }

    if (models[model] == null) {
      this.log(this.name, 'cannot remove unknown model', model)
      return false
    }
    const actions: Actions = models[model]

    if (actions[action] == null) {
      this.log(this.name, 'cannot remove unknown action', action, 'on model', model)
      return false
    }
    const stack: Stack = actions[action]

    if (!stack.includes(cb)) {
      this.log(this.name, 'cannot remove unknown callback for action', action, 'on model', model)
      return false
    }

    stack.splice(stack.indexOf(cb), 1)

    if (!stack.length) {
      delete actions[action]
      if (!Object.keys(actions).length) delete models[model]
    }

    return true
  }
}

module.exports = EventRouter