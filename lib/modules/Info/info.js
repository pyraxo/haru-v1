import BaseCommand from '../../base/BaseCommand'

class BotInfo extends BaseCommand {
  static get name () {
    return 'info'
  }

  static get description () {
    return 'Shows information of the bot'
  }

  fetchBot () {
    return [
      `Running on **haru** v${process.env.npm_package_version || '1.2.0'}`,
      'I\'m designed by Pyraxo.',
      'Find my source code at https://github.com/pyraxo/haru',
      'Invite me: https://discordapp.com/oauth2/authorize?access_type=online' +
      '&client_id=168356099001417729&scope=bot&permissions=-1',
    ].join('\n')
  }

  handle () {
    this.responds(/^info$/i, () => {
      this.send(this.channel, this.fetchBot())
    })
  }
}

module.exports = BotInfo
