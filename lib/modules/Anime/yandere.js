import BaseCommand from '../../base/BaseCommand'
import img from './.img/img'

class Yandere extends BaseCommand {
  static get name () {
    return 'yandere'
  }

  static get description () {
    return 'Searches the Yande.re image board'
  }

  static get usage () {
    return [
      '<tags...> - Searches yande.re'
    ]
  }

  noPictures (query) {
    this.send(this.channel,
      `**Error**: Query "${query.split('+').join(', ')}"` +
      ` returned no pictures.`
    )
  }

  getImage (query) {
    img('yandere', query, this)
    .then((res) => {
      let r = res.body[0]
      if (typeof res.body[0] !== 'undefined') {
        this.send(
          this.channel,
          `**Score**: ${res.body[0].score}\n${res.body[0].file_url}`
        )
      } else {
        return this.noPictures(query)
      }
    })
  }

  handle () {
    this.responds(/^yandere$/i, () => {
      this.getImage(null)
    })

    this.responds(/^yandere (.+)$/i, matches => {
      let query = matches[1].split(' ').join('+')
      this.getImage(query)
    })
  }
}

module.exports = Yandere
