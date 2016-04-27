import BaseCommand from '../../base/BaseCommand'
import gm from 'gm'
import path from 'path'

class LoveGM extends BaseCommand {
  static get name () {
    return 'love'
  }

  static get description () {
    return 'I\'ll always love you!'
  }

  static get usage () {
    return [
      '[text] - Displays this text'
    ]
  }

  error (err, text) {
    text = text || ''
    this.logger.error(
      `Error occurred while uploading file from GM command 'love' ` +
      `with text ${text}`,
      err
    )
    return this.reply(
      `Error: Unable to upload image with text ${text}`
    )
  }

  createImage (input) {
    let text = [
      'I\'ll always',
      'love you,',
      input.match(/.{1,10}/g).join('-\n')
    ].join('\n')
    gm(path.join(__dirname, '.love/love.png'))
    .font(path.join(__dirname, '.love/animeace.ttf'), 12)
    .gravity('Center')
    .drawText(-188, -20, text)
    .write(path.join(__dirname, '.love/res.png'), err => {
      if (err) {
        this.error(err, text)
      }
      this.upload(path.join(__dirname, '.love/res.png'), 'love.png')
      .catch(err => {
        this.error(err, text)
      })
    })
  }

  handle () {
    this.responds(/^love$/i, () => {
      this.createImage(this.sender.name)
    })

    this.responds(/^love (.+)$/i, matches => {
      this.createImage(matches[1])
    })
  }
}

module.exports = LoveGM
