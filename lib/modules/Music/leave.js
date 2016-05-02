import BaseCommand from '../../base/BaseCommand'

class LeaveVoice extends BaseCommand {
  static get name () {
    return 'leave'
  }

  static get description () {
    return 'Leaves the current voice channel'
  }

  static get usage () {
    return [
      '- Leaves the current voice connection in the server'
    ]
  }

  handle () {

  }
}

module.exports = LeaveVoice
