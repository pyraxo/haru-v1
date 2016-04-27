import BaseCommand from '../../base/BaseCommand'
import gm from 'gm'
import path from 'path'

class LewdGM extends BaseCommand {
  static get name () {
    return 'lewd'
  }

  static get description () {
    return 'LEWD'
  }

  static get usage () {
    return [
      '[text] - Displays this text'
    ]
  }

  error (err, text) {
    text = text || ''
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
    let size = 240 - (input.length * 4.5)
    let res = []
    if (input.length > 6) {
      res = input.match(/\w+/g)
      res.forEach((elem, idx) => {
        if (elem.length > 6) {
          res[idx] = elem.match(/\w{1,6}/g).join('-\n')
        } else {
          res[idx] = elem
        }
      })
    } else {
      res.push(input)
    }
    gm(path.join(__dirname, '.lewd/lewd.png'))
    .font(path.join(__dirname, '.lewd/mangati.ttf'), size)
    .gravity('Center')
    .drawText(-140, 440, res.join('\n'))
    .write(path.join(__dirname, '.lewd/res.png'), (err) => {
      if (err) {
        this.error(err, input)
      }
      this.upload(path.join(__dirname, '.lewd/res.png'), 'lewd.png')
      .catch(err => {
        this.error(err, input)
      })
    })
  }

  handle () {
    this.responds(/^lewd$/i, () => {
      this.createImage('LEWD')
    })

    this.responds(/^lewd (.+)$/i, matches => {
      this.createImage(matches[1])
    })
  }
}

module.exports = LewdGM
