import BaseCommand from '../../base/BaseCommand'

class Playlist extends BaseCommand {
  static get name () {
    return 'playlist'
  }

  static get description () {
    return 'Lists current songs in queue'
  }

  handle () {

  }
}

module.exports = Playlist
