import BaseCommand from '../../base/BaseCommand'

class Soundcloud extends BaseCommand {
  static get name () {
    return 'soundcloud'
  }

  static get description () {
    return 'Fetches a song from Soundcloud'
  }

  static get usage () {
    return [
      '<song name> - Finds the first song with the name'
    ]
  }

  handle () {

  }
}

module.exports = Soundcloud
