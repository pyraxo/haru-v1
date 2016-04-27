import BaseCommand from '../../base/BaseCommand'
import img from './.img/img'

class Danbooru extends BaseCommand {
  static get name () {
    return 'danbooru'
  }

  static get description () {
    return 'Searches the Danbooru image board'
  }

  static get usage () {
    return [
      '<tags...> - Searches danbooru'
    ]
  }

  getImage (query) {
    img('danbooru', query, this)
    .then((res) => {
      let r = res.body[0]
      if (r && r.file_url) {
        return this.send(this.channel, [
          `**Score**: ${r.score}`,
          `http://danbooru.donmai.us${r.file_url}`
        ].join('\n'))
      } else {
        return this.send(this.channel,
          `**Error**: Query "${query.split('+').join(', ')}"` +
          ` returned no pictures.`
        )
      }
    })
  }

  handle () {
    this.responds(/^danbooru$/i, () => {
      this.getImage(null)
    })

    this.responds(/^danbooru (.+)$/i, matches => {
      let query = matches[1].split(' ').join('+')
      this.getImage(query)
    })
  }
}

module.exports = Danbooru
