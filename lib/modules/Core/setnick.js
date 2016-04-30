import BaseCommand from '../../base/BaseCommand'
import base64 from 'node-base64-image'

class SetNick extends BaseCommand {
  static get name () {
    return 'setnick'
  }

  static get description () {
    return 'Changes the bot nickname'
  }

  static get usage () {
    return [
      '<nickname> - Changes the bot\'s nickname to the specified nick'
    ]
  }

  handle () {
    this.responds(/^setnick$/, () => {
      this.wrongUsage('setnick')
    })

    this.responds(/^setnick (.+)$/, matches => {
      this.server.setNickname(matches[1])
    })
  }
}

module.exports = SetNick
