import BaseCommand from '../../base/BaseCommand'
import gm from 'gm'
import fs from 'fs'
import path from 'path'
import _ from 'lodash'

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
    .write(path.join(__dirname, `.lewd/res-${this.message.id}.png`), (err) => {
      if (err) {
        this.error(err, input)
      }
      this.upload(
        path.join(__dirname, `.lewd/res-${this.message.id}.png`), 'lewd.png'
      )
      .then(() => {
        fs.unlink(path.join(__dirname, `.lewd/res-${this.message.id}.png`))
      })
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

module.exports = LewdGM
