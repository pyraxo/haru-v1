import BaseCommand from '../../base/BaseCommand'

class Youtube extends BaseCommand {
  static get name () {
    return 'youtube'
  }

  static get description () {
    return 'Fetches a song from Youtube'
  }

  static get usage () {
    return [
      'find <video name> - Finds the first video with the name',
      'add <video link> - Adds the video from the link'
    ]
  }

  handle () {

  }
}

module.exports = Youtube
