import BaseCommand from '../../base/BaseCommand'
import gm from 'gm'
import fs from 'fs'
import path from 'path'
import Canvas, {Image as Image} from 'canvas'
import base64 from 'node-base64-image'

class RipGM extends BaseCommand {
  static get name () {
    return 'rip'
  }

  static get description () {
    return 'R.I.P'
  }

  static get usage () {
    return [
      '[text] [year]'
    ]
  }

  error (err, text) {
    this.logger.error(
      `Error occurred while uploading file from GM command 'rip' ` +
      `with text ${text}`,
      err
    )
    return this.reply(
      `Error: Unable to upload image with text ${text}`
    )
  }

  createImage (input, year) {
    input = input.match(/.+/g).join('-\n')
    year = year || '2016'
    year += ' - 2016'
    gm(path.join(__dirname, '.rip/rip.png'))
    .font(path.join(__dirname, '.rip/comicsans.ttf'), 23.5)
    .gravity('Center')
    .drawText(-10, 70, input)
    .fontSize(11)
    .drawText(-7, 94, year)
    .write(path.join(__dirname, `.rip/res-${this.message.id}.png`), err => {
      if (err) {
        this.error(err, input)
      }
      this.upload(
        path.join(__dirname, `.rip/res-${this.message.id}.png`), 'rip.png'
      )
      .then(() => {
        fs.unlink(path.join(__dirname, `.rip/res-${this.message.id}.png`))
      })
      .catch(err => {
        this.error(err, input)
      })
    })
  }

  altImage (user) {
    let canvas = new Canvas(1920, 2160)
    let ctx = canvas.getContext('2d')
    base64.base64encoder(user.avatarURL, { string: true }, (err, image) => {
      if (err) {
        return this.logger.error(
          `Image fetch from ${user.avatarURL} failed`, err
        )
      }
      let base = new Image()
      base.src = new Buffer(image, 'base64')
      ctx.drawImage(base, 440, 0, 1000, 1000)
      fs.readFile(path.join(__dirname, '.rip/rip2.png'), (err, src) => {
        if (err) {
          this.logger.error('Error reading alt rip base image', err)
          return
        }
        let c = new Image()
        c.src = src
        ctx.drawImage(c, 0, 0, 1920, 2160)
        let out = fs.createWriteStream(
          path.join(__dirname, `.rip/res-${this.message.id}.png`)
        )
        let stream = canvas.pngStream()

        stream.on('data', chunk => {
          out.write(chunk)
        })

        stream.on('end', () => {
          setTimeout(() => {
            this.upload(
              path.join(__dirname, `.rip/res-${this.message.id}.png`), 'rip.png'
            ).then(() => {
              fs.unlink(path.join(__dirname, `.rip/res-${this.message.id}.png`))
            })
          }, 500)
        })
      })
    })
  }

  handle () {
    this.responds(/^rip$/i, () => {
      this.createImage(this.sender.name)
    })

    this.responds(/^rip <@!*(\d+)>$/i, matches => {
      let user = this.client.users.get('id', matches[1])
      let name = user.name || `<@${matches[1]}>`
      this.createImage(name)
    })

    this.responds(/^rip (\w+)$/i, matches => {
      this.createImage(matches[1])
    })

    this.responds(/^rip (\w+) (\d+)$/i, matches => {
      this.createImage(matches[1], matches[2])
    })

    this.responds(/^rip "(.+)"$/i, matches => {
      this.createImage(matches[1])
    })

    this.responds(/^rip "(.+)" (\d+)$/i, matches => {
      this.createImage(matches[1], matches[2])
    })

    this.responds(/^rip <@!*(\d+)> (\d+)$/i, matches => {
      let user = this.client.users.get('id', matches[1])
      let name = user.name || `<@${matches[1]}>`
      this.createImage(name, matches[2])
    })

    this.responds(/^rip <@!*(\d+)>$/i, matches => {
      let user = this.client.users.get('id', matches[1])
      let name = user.name || `<@${matches[1]}>`
      this.createImage(name)
    })

    this.responds(/^dead$/gi, () => {
      this.altImage(this.sender)
    })

    this.responds(/^dead <@!*(\d+)>$/i, matches => {
      let user = this.client.users.get('id', matches[1])
      this.altImage(user)
    })
  }
}

module.exports = RipGM
