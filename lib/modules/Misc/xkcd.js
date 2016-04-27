import BaseCommand from '../../base/BaseCommand'
import request from 'superagent'

class XKCD extends BaseCommand {
  static get name () {
    return 'xkcd'
  }

  static get description () {
    return 'Fetches XKCD comics'
  }

  static get usage () {
    return [
      '[comic ID] - Returns the comic with the specified ID (optional)'
    ]
  }

  fetchComic (id) {
    request
    .get(`http://xkcd.com/${id}/info.0.json`)
    .end((err, res) => {
      if (err) {
        this.logger.error(`Error fetching XKCD comic: `, err)
        return this.reply(`**Error**: XKCD query returned no pictures.`)
      }
      return this.send(this.channel, [
        `**${res.body.title}**`,
        `*${res.body.alt}*`,
        res.body.img
      ].join('\n'))
    })
  }

  handle () {
    this.responds(/^xkcd$/i, () => {
      let max = 1600
      request
      .get('http://xkcd.com/info.0.json')
      .end((err, res) => {
        if (!err) {
          max = res.body.num
        }
        return this.fetchComic(Math.floor((Math.random() * max) + 1))
      })
    })

    this.responds(/^xkcd \d+$/i, matches => {
      return this.fetchComic(matches[1])
    })
  }
}

module.exports = XKCD
