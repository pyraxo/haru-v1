import BaseCommand from '../../base/BaseCommand'
import request from 'superagent'
import path from 'path'
import _ from 'lodash'
import jsonfile from 'jsonfile'
import fs from 'fs'
import base64 from 'node-base64-image'
import gm from 'gm'
import Canvas, {Image as Image} from 'canvas'

class Hearthstone extends BaseCommand {
  static get name () {
    return 'hs'
  }

  static get aliases () {
    return [
      'hearthstone'
    ]
  }

  static get description () {
    return 'Opens a new Hearthstone pack'
  }

  static get usage () {
    return [
      '- Opens a new Classic Hearthstone pack',
      'gvg - Opens a new GoG HS pack',
      'wotog - Opens a new WotOG pack'
    ]
  }

  getCardSet (set) {
    set = set || 'Classic'
    this.send(this.channel, 'Opening pack...')
    .then(msg => {
      this.toUpdate = msg
      let cards = {}
      try {
        cards = require(`./hs/${set}.json`)
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
          let filepath = path.join(__dirname, `hs/${set}.json`)
          jsonfile.writeFileSync(filepath, res.body, {spaces: 2})
          this.logger.info(`Saved HS card set ${set} to ${filepath}`)
          cards = res.body
          this.openCards(cards)
        })
      }
    })
  }

  openCards (cards) {
    let pack = []
    while (pack.length < 5) {
      let num = Math.floor(Math.random() * 10000) + 1
      if (pack.length === 4 &&
        _.filter(cards, ['rarity', 'Common']).length === 4) {
        num = Math.floor(Math.random() * 10000 - 7166) + 7166
      }
      let rarity = null
      let golden = false
      if (num <= 7037) {
        rarity = 'Common'
      } else if (num > 7038 && num <= 9196) {
        rarity = 'Rare'
      } else if (num > 9197 && num <= 9604) {
        rarity = 'Epic'
      } else if (num > 9605 && num <= 9752) {
        rarity = 'Legendary'
      } else if (num > 9753 && num < 9879) {
        rarity = 'Common'
        golden = true
      } else if (num > 9880 && num < 9973) {
        rarity = 'Rare'
        golden = true
      } else if (num > 9974 && num < 9992) {
        rarity = 'Epic'
        golden = true
      } else if (num > 9993 && num < 10000) {
        rarity = 'Legendary'
        golden = true
      }
      let list = _.filter(cards, ['rarity', rarity])
      let sample = () => {
        let card = _.sample(list)
        if (card.rarity === rarity) {
          pack.push({
            card: card,
            golden: golden
          })
        } else {
          sample()
        }
      }
      sample()
    }
    this.drawImage(pack)
  }

  drawImage (cards) {
    let canvas = new Canvas(2700, 1615)
    let ctx = canvas.getContext('2d')
    fs.readFile(path.join(__dirname, 'hs/packs.png'), (err, src) => {
      if (err) {
        this.logger.error('Error reading unpack base image', err)
        return
      }
      let base = new Image()
      base.src = src
      let pack = []
      ctx.drawImage(base, 0, 0, base.width, base.height)
      let fetch = (elem, q, local) => {
        base64.base64encoder(q, {
          string: true,
          localFile: local
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
      }
      cards.forEach((elem, idx) => {
        let q = null
        if (elem.golden) {
          let file = path.join(__dirname, `hs/golden/${elem.card.cardId}.png`)
          if (fs.existsSync(file)) {
            q = file
            fetch(elem, q, false)
          } else {
            gm(elem.card.imgGold + '[0]')
            .write(file, err => {
              if (err) {
                this.logger.error(
                  `Error saving golden card ${elem.card.cardId}`, err
                )
                return
              }
              q = file
              fetch(elem, q, true)
            })
          }
        } else {
          q = elem.card.img
          fetch(elem, q, false)
        }
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
        y: 870
      },
      {
        x: 1732,
        y: 870
      },
      {
        x: 943,
        y: 145
      },
      {
        x: 1433,
        y: 20
      },
      {
        x: 1973,
        y: 145
      }
    ]
    pack.forEach((c, idx) => {
      ctx.drawImage(c, coords[idx].x, coords[idx].y, 480, 750)
    })
    let out = fs.createWriteStream(
      path.join(__dirname, `hs/res-${this.message.id}.png`)
    )
    let stream = canvas.pngStream()

    stream.on('data', chunk => {
      out.write(chunk)
    })

    stream.on('end', () => {
      setTimeout(() => {
        this.sendPack()
      }, 500)
    })
  }

  sendPack () {
    this.upload(
      path.join(__dirname, `hs/res-${this.message.id}.png`), 'pack.png'
    ).then(() => {
      this.client.updateMessage(this.toUpdate, 'Pack opened!')
      fs.unlink(path.join(__dirname, `hs/res-${this.message.id}.png`))
    })
  }

  handle () {
    this.responds(/^hs$/i, matches => {
      this.getCardSet()
    })

    this.responds(/^hs gvg$/i, matches => {
      this.getCardSet('Goblins vs Gnomes')
    })

    this.responds(/^hs wotog$/i, matches => {
      this.getCardSet('Whispers of the Old Gods')
    })

    this.responds(/^hs tgt$/i, matches => {
      this.getCardSet('The Grand Tournament')
    })
  }
}

module.exports = Hearthstone
