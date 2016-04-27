import BaseCommand from '../../base/BaseCommand'
import gm from 'gm'
import path from 'path'

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
    .write(path.join(__dirname, '.hate/res.png'), err => {
      if (err) {
        this.error(err, text)
      }
      this.upload(path.join(__dirname, '.hate/res.png'), 'hate.png')
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
      this.createImage(matches[1])
    })
  }
}

module.exports = HateGM
