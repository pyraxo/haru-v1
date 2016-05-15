import BaseCommand from '../../base/BaseCommand'
import gm from 'gm'
import fs from 'fs'
import path from 'path'
import _ from 'lodash'

class HateGM extends BaseCommand {
  static get name () {
    return 'hate'
  }

  static get description () {
    return 'I-I hate you!'
  }

  static get usage () {
    return [
      '[text] - I-I hate you, <text>!'
    ]
  }

  error (err, text) {
    this.logger.error(
      `Error occurred while uploading file from GM command 'hate' ` +
      `with text ${text}`,
      err
    )
    return this.reply(
      `Error: Unable to upload image with text ${text}`
    )
  }

  createImage (input) {
    let text = [
      'I hate',
      'you,',
      input.match(/.{1,8}/g).join('-\n'),
      '-chan!'
    ].join('\n')
    gm(path.join(__dirname, '.hate/hate.png'))
    .font(path.join(__dirname, '.hate/animeace.ttf'), 13.5)
    .gravity('Center')
    .drawText(-67, 32, text)
    .write(path.join(__dirname, `.hate/res-${this.message.id}.png`), err => {
      if (err) {
        this.error(err, text)
      }
      this.upload(
        path.join(__dirname, `.hate/res-${this.message.id}.png`), 'hate.png'
      )
      .then(() => {
        fs.unlink(path.join(__dirname, `.hate/res-${this.message.id}.png`))
      })
      .catch(err => {
        this.error(err, text)
      })
    })
  }

  handle () {
    this.responds(/^hate$/i, () => {
      this.createImage(this.sender.name)
    })

    this.responds(/^hate (.+)$/i, matches => {
      let content = _.trim(matches[1].replace(/<@(\d+)>/gi, (match, p1) => {
        let user = this.client.users.get('id', p1)
        if (user) {
          return user.name
        }
        return match
      }))
      this.createImage(content)
    })
  }
}

module.exports = HateGM
