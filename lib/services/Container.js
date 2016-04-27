class Container {
  constructor (options, debug) {
    this.logger = options.logger
    this.params = options.params
    this.debug = debug
    this.clients = {}
  }

  has (key) {
    return !!this.get(key)
  }

  get (key) {
    return this[key]
  }

  set (key, val) {
    this[key] = val
    return this[key]
  }

  hasParam (key) {
    return !!this.getParam(key)
  }

  getParam (key) {
    return this.params[key]
  }

  setParam (key, val) {
    this.params[key] = val
    return this.params[key]
  }
}

module.exports = Container
