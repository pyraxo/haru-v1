import BaseCommand from '../../base/BaseCommand'
import base64 from 'node-base64-image'

class SetAvatar extends BaseCommand {
  static get name () {
    return 'setavatar'
  }

  static get description () {
    return 'Changes the bot avatar'
  }

  static get usage () {
    return [
      '<link> - Changes the bot\'s avatar to the specified image link'
    ]
  }

  static get hidden () {
    return true
  }

  get adminOnly () {
    return true
  }

  changeAvatar (link) {
    base64.base64encoder(link, {
      string: true
    }, (err, image) => {
      if (err) {
        return this.logger.error(
          `Avatar change called by ${this.sender.username} failed`, err
        )
      }
      let buf = new Buffer(image, 'base64')
      this.client.updateDetails({
        'avatar': buf
      })
      this.logger.info(`Avatar changed by ${this.sender.username}`)
    })
  }

  handle () {
    this.responds(/^setavatar (http.+)$/, (matches) => {
      this.changeAvatar(matches[1])
    })
  }
}

module.exports = SetAvatar
