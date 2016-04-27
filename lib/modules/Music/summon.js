import BaseCommand from '../../base/BaseCommand'

class SummonVoice extends BaseCommand {
  static get name () {
    return 'summon'
  }

  static get description () {
    return 'Summons the bot to a voice channel'
  }

  static get usage () {
    return [
      '- Join a voice channel before running this command'
    ]
  }

  handle () {

  }
}

module.exports = SummonVoice
