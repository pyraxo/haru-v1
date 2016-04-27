import BaseCommand from '../../base/BaseCommand'

class Echo extends BaseCommand {
  static get name () {
    return 'echo'
  }

  static get description () {
    return 'Echoes any given input'
  }

  static get usage () {
    return [
      '<text> - Echoes this text'
    ]
  }

  handle () {
    this.responds(/^echo$/i, matches => {
      this.wrongUsage('echo')
    })

    this.responds(/^echo (.+)$/i, matches => {
      this.send(this.channel, matches[1])
    })
  }
}

module.exports = Echo
