import BaseCommand from '../../base/BaseCommand'

class MusicPlayer extends BaseCommand {
  static get name () {
    return 'music'
  }

  static get description () {
    return 'Music control command'
  }

  static get usage () {
    return [
      '>> - Skips the current song',
      '|| - Pauses the current song'
    ]
  }

  handle () {

  }
}

module.exports = MusicPlayer
