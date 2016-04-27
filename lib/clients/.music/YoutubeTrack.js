import Track from './Track'
import ytdl from 'ytdl-core'

class YoutubeTrack extends Track {
  constructor (id, author, logger, callback) {
    super({
      url: `http://www.youtube.com/?v=${id}`,
      addedBy: author
    })
    this.logger = logger
    ytdl.getInfo(this.url, {
      filter: format => format.container === 'mp4', quality: 'lowest'
    }, (err, info) => {
      if (err) {
        this.logger.error(err)
        return callback(err)
      }
      this.title = info.title
      this.author = info.author
      this.plays = info.view_count
      this.length = info.length_seconds
    })
  }

  get basicPrint () {
    return `**${this.title}** `
  }

  get prettyPrint () {
    return `${this.basicPrint} (${this.prettyPlays} plays) by ${this.author}`
  }

  get prettyPlays () {
    return this.plays
    ? this.plays.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 'unknown'
  }

  get prettyTime () {
    let seconds = this.length
    return `${Math.round((seconds - Math.ceil(seconds % 60)) / 60)}:` +
    `${String('00' + Math.ceil(seconds % 60)).slice(-2)}`
  }

  get fullInfo () {
    return `${this.prettyPrint} [${this.prettyTime}] ` +
    `- added by ${this.addedBy.username}`
  }

  get stream () {
    return ytdl(this.url, {
      filter: format => format.container === 'mp4', quality: 'lowest'
    })
  }
}

module.exports = YoutubeTrack
