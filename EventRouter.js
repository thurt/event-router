'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _copyObjectGraph = require('copy-object-graph');

var _copyObjectGraph2 = _interopRequireDefault(_copyObjectGraph);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Routers = new WeakMap();


/**
 * The EventRouter Class
 */
class EventRouter {

  /**
   * Creates a new EventRouter
   */
  constructor(options) {
    this.name = options && options.name || 'EventRouter';
    this.log = options && options.log || function () {};

    Routers.set(this, Object.create(null)); // prevent adding Object.prototype
  }

  /**
   * Adds callback to model/action
   */
  add(model, action, cb) {
    const models = Routers.get(this);

    if (models == null) {
      return false;
    }

    if (models[model] == null) {
      models[model] = Object.create(null);
    }
    const actions = models[model];

    if (actions[action] == null) {
      actions[action] = [];
    }
    const stack = actions[action];

    if (stack.includes(cb)) {
      this.log(this.name, 'this callback is already subscribed to action', action, 'on model', model);
      return false;
    }

    this.log(this.name, 'subscribing callback to action', action, 'on model', model);
    stack.push(cb);
    return true;
  }

  /**
   * Emits data to all callbacks on the model/action
   */
  emit(model, action, data) {
    const models = Routers.get(this);

    if (models == null) {
      return false;
    }

    if (models[model] == null) {
      this.log(this.name, 'received request to emit action', action, 'on an unknown model', model);
      return false;
    }
    const actions = models[model];

    if (actions[action] == null) {
      this.log(this.name, 'received request to emit action', action, 'on model', model, 'but there are no subscribers');
      return false;
    }
    const stack = actions[action];

    for (let cb of stack) cb(data);

    return true;
  }

  /**
   * Get all models
   */
  getModels() {
    const models = Routers.get(this);
    return (0, _copyObjectGraph2.default)(models);
  }

  /**
   * Remove model and all its actions and callbacks
   */
  purge(model) {
    const models = Routers.get(this);

    if (models == null) {
      return false;
    }

    if (models[model] == null) {
      return false;
    }

    delete models[model];
    return true;
  }

  /**
   * Remove callback from a model/action
   */
  remove(model, action, cb) {
    const models = Routers.get(this);

    if (models == null) {
      return false;
    }

    if (models[model] == null) {
      this.log(this.name, 'cannot remove unknown model', model);
      return false;
    }
    const actions = models[model];

    if (actions[action] == null) {
      this.log(this.name, 'cannot remove unknown action', action, 'on model', model);
      return false;
    }
    const stack = actions[action];

    if (!stack.includes(cb)) {
      this.log(this.name, 'cannot remove unknown callback for action', action, 'on model', model);
      return false;
    }

    stack.splice(stack.indexOf(cb), 1);

    if (!stack.length) {
      delete actions[action];
      if (!Object.keys(actions).length) delete models[model];
    }

    return true;
  }
}
exports.default = EventRouter;
