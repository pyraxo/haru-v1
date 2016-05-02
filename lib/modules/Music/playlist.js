import BaseCommand from '../../base/BaseCommand'

class Playlist extends BaseCommand {
  static get name () {
    return 'playlist'
  }

  static get description () {
    return 'Lists current songs in queue'
  }

  static get usage () {
    return [
      '- Gets the current playlist'
    ]
  }

  handle () {

  }
}

module.exports = Playlist
