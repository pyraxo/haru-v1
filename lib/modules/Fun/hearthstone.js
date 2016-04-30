import BaseCommand from '../../base/BaseCommand'
import request from 'superagent'
import path from 'path'
import _ from 'lodash'
import jsonfile from 'jsonfile'
import fs from 'fs'
import base64 from 'node-base64-image'
import Canvas, {Image as Image} from 'canvas'

class Hearthstone extends BaseCommand {
  static get name () {
    return 'hearthstone'
  }

  static get description () {
    return 'Hearthstone commands'
  }

  static get usage () {
    return [
      'newpack'
    ]
  }

  getCardSet (set) {
    set = set || 'Classic'
    let cards = {}
    try {
      cards = require(`./.hs/${set}.json`)
      this.openCards(cards)
    } catch (err) {
      request
      .get(
        `https://omgvamp-hearthstone-v1.p.mashape.com/` +
        `cards/sets/${set}?collectible=1`
      )
      .set(
        'X-Mashape-Key', 'Io1U1l6uwPmshZbiD6YTcC8BbgQ4p1HrOw0jsnnJ0CwWw8wDWV'
      )
      .end((err, res) => {
        if (err) {
          this.logger.error('Error fetching HS cards', err)
          return
        }
        let filepath = path.join(__dirname, set + '.json')
        jsonfile.writeFileSync(filepath, res.body, {spaces: 2})
        this.logger.info(`Saved HS card set ${set} to ${filepath}`)
        cards = res.body
        this.openCards(cards)
      })
    }
  }

  openCards (cards) {
    let pack = []
    while (pack.length < 5) {
      let num = Math.floor(Math.random() * 10000) + 1
      let rarity = null
      if (num <= 7165) {
        rarity = 'Common'
      } else if (num > 7165 && num <= 9449) {
        rarity = 'Rare'
      } else if (num > 9449 && num <= 9891) {
        rarity = 'Epic'
      } else if (num > 9891 && num <= 10000) {
        rarity = 'Legendary'
      }
      let list = _.filter(cards, ['rarity', rarity])
      let sample = () => {
        let card = _.sample(list)
        if (card.rarity === rarity) {
          pack.push(card)
        } else {
          sample()
        }
      }
    }
    this.drawImage(pack)
  }

  drawImage (cards) {
    let canvas = new Canvas(2700, 1800)
    let ctx = canvas.getContext('2d')
    fs.readFile(path.join(__dirname, '.hs/packs.png'), (err, src) => {
      if (err) {
        this.logger.error('Error reading unpack base image', err)
        return
      }
      let base = new Image()
      base.src = src
      let pack = []
      ctx.drawImage(base, 0, 0, base.width, base.height)
      cards.forEach((elem, idx) => {
        base64.base64encoder(elem.img, {
          string: true
        }, (err, image) => {
          if (err) {
            return this.logger.error(
              `Image fetch from ${elem.img} failed`, err
            )
          }
          let c = new Image()
          c.src = new Buffer(image, 'base64')
          pack.push(c)
        })
      })
      let check = (arr) => {
        if (arr.length === 5) {
          this.saveFile(canvas, ctx, pack)
        } else {
          setTimeout(() => {
            check(pack)
          }, 500)
        }
      }
      check(pack)
    })
  }

  saveFile (canvas, ctx, pack) {
    let coords = [
      {
        x: 1150,
        y: 1000
      },
      {
        x: 1732,
        y: 1022
      },
      {
        x: 943,
        y: 245
      },
      {
        x: 1433,
        y: 49
      },
      {
        x: 1973,
        y: 245
      }
    ]
    pack.forEach((c, idx) => {
      ctx.drawImage(c, coords[idx].x, coords[idx].y, 480, 815)
    })
    let out = fs.createWriteStream(
      path.join(__dirname, `.hs/res-${this.message.id}.png`)
    )
    let stream = canvas.pngStream()

    stream.on('data', chunk => {
      out.write(chunk)
    })

    stream.on('end', () => {
      this.upload(
        path.join(__dirname, `.hs/res-${this.message.id}.png`), 'pack.png'
      ).then(() => {
        this.client.updateMessage(this.toUpdate, 'Pack opened!')
        fs.unlink(path.join(__dirname, `.hs/res-${this.message.id}.png`))
      })
    })
  }

  handle () {
    this.responds(/^(hearthstone|hs) newpack$/i, matches => {
      this.send(this.channel, 'Opening pack...')
      .then(msg => {
        this.toUpdate = msg
      })
      this.getCardSet()
    })
  }
}

module.exports = Hearthstone
