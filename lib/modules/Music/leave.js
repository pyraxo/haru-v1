import BaseCommand from '../../base/BaseCommand'

class LeaveVoice extends BaseCommand {
  static get name () {
    return 'leave'
  }

  static get description () {
    return 'Leaves the current voice channel'
  }

  handle () {

  }
}

module.exports = LeaveVoice
