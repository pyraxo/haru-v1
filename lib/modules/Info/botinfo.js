import BaseCommand from '../../base/BaseCommand'

class BotInfo extends BaseCommand {
  static get name () {
    return 'botinfo'
  }

  static get description () {
    return 'Shows information of the bot'
  }

  fetchBot () {
    return [
      `Running on **haru** v${process.env.npm_package_version || '1.1.0'}`,
      'I\'m designed by <@84679007789936640>.',
      'Find my source code at https://github.com/ruspar/haru'
    ].join('\n')
  }

  handle () {
    this.responds(/^botinfo$/i, () => {
      this.send(this.channel, this.fetchBot())
    })
  }
}

module.exports = BotInfo
