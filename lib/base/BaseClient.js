class BaseClient {
  constructor (container) {
    if (this.constructor === BaseClient) {
      throw new Error('Can\'t instantiate abstract class!')
    }
    this.container = container
  }

  get name () {
    throw new Error('Clients must have names')
  }

  run () {
    throw new Error('Clients must override run function')
  }
}

module.exports = BaseClient
