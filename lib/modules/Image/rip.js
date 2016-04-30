import BaseCommand from '../../base/BaseCommand'
import gm from 'gm'
import fs from 'fs'
import path from 'path'

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

  handle () {
    this.responds(/^rip$/i, () => {
      this.createImage(this.sender.name)
    })

    this.responds(/^rip <@(\d+)>$/i, matches => {
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

    this.responds(/^rip <@(\d+)> (\d+)$/i, matches => {
      let user = this.client.users.get('id', matches[1])
      let name = user.name || `<@${matches[1]}>`
      this.createImage(name, matches[2])
    })
  }
}

module.exports = RipGM
