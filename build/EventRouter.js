'use strict';

const copyObjectGraph = require('copy-object-graph');
const Events = new WeakMap();

class EventRouter {
  constructor(options) {
    const emptyFn = function () {};
    this.name = options && options.name || 'EventRouter';
    this.log = options && options.log || emptyFn;

    Events.set(this, Object.create(null)); // prevent adding Object.prototype
  }

  add(model, action, cb) {
    const o = Events.get(this);

    if (o == null) {
      return false;
    }

    if (o[model] == null) {
      o[model] = Object.create(null);
    }
    const om = o[model];

    if (om[action] == null) {
      om[action] = [];
    }
    const oma = om[action];

    if (oma.includes(cb)) {
      this.log(this.name, 'this callback is already subscribed to action', action, 'on model', model);
      return false;
    }

    this.log(this.name, 'subscribing callback to action', action, 'on model', model);
    oma.push(cb);
    return true;
  }

  emit(model, action, data) {
    const o = Events.get(this);

    if (o == null) {
      return false;
    }

    if (o[model] == null) {
      this.log(this.name, 'received request to emit action', action, 'on an unknown model', model);
      return false;
    }
    const om = o[model];

    if (om[action] == null) {
      this.log(this.name, 'received request to emit action', action, 'on model', model, 'but there are no subscribers');
      return false;
    }
    const oma = om[action];

    for (let cb of oma) cb(data);

    return true;
  }

  getEvents() {
    return copyObjectGraph(Events.get(this) || {});
  }

  purge(model) {
    const o = Events.get(this);

    if (o == null) {
      return false;
    }

    if (o[model] == null) {
      return false;
    }

    delete o[model];
    return true;
  }

  remove(model, action, cb) {
    const o = Events.get(this);

    if (o == null) {
      return false;
    }

    if (o[model] == null) {
      this.log(this.name, 'cannot remove unknown model', model);
      return false;
    }
    const om = o[model];

    if (om[action] == null) {
      this.log(this.name, 'cannot remove unknown action', action, 'on model', model);
      return false;
    }
    const oma = om[action];

    if (!oma.includes(cb)) {
      this.log(this.name, 'cannot remove unknown callback for action', action, 'on model', model);
      return false;
    }

    oma.splice(oma.indexOf(cb), 1);

    if (!oma.length) {
      delete om[action];
      if (!Object.keys(om).length) delete o[model];
    }

    return true;
  }
}

module.exports = EventRouter;