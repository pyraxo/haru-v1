import BaseCommand from '../../base/BaseCommand'
import img from './.img/img'

class Gelbooru extends BaseCommand {
  static get name () {
    return 'gelbooru'
  }

  static get description () {
    return 'Searches the Gelbooru image board'
  }

  static get usage () {
    return [
      '<tags...> - Searches danbooru'
    ]
  }

  noPictures (query) {
    this.send(this.channel,
      `**Error**: Query "${query.split('+').join(', ')}"` +
      ` returned no pictures.`
    )
  }

  reducePage (query) {
    // Temporary workaround for tags with less than 10000 images
    img('gelbooru', query, this, `limit=100`)
    .then(res => {
      this.fetchResults(res, query)
    })
  }

  fetchResults (res, query) {
    let r = []
    try {
      r = JSON.parse(res.text)[0]
    } catch (err) {
      return this.noPictures(query)
    }
    if (r && r.file_url) {
      return this.send(this.channel, [
        `**Score**: ${r.score}`,
        r.file_url
      ].join('\n'))
    }
    return this.reducePage(query)
  }

  getImage (query, pid) {
    query = query ? query : null
    pid = pid || 10000
    img('gelbooru', query, this, `pid=${Math.floor(Math.random() * pid)}`)
    .then(res => {
      this.fetchResults(res, query)
    })
  }

  handle () {
    this.responds(/^gelbooru$/i, () => {
      this.getImage(null)
    })

    this.responds(/^gelbooru (.+)$/i, matches => {
      let query = matches[1].split(' ').join('+')
      this.getImage(query)
    })
  }
}

module.exports = Gelbooru
