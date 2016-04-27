import Track from './Track'

class SoundcloudTrack extends Track {
  constructor (options, logger) {
    super({
      addedBy: options.addedBy,
      url: options.url
    })
    this.title = options.title
    this.author = options.author
    this.length = options.length
    this.plays = options.plays
  }

  get basicPrint () {
    return `**${this.title}** `
  }

  get prettyPrint () {
    return `${this.basicPrint} (${this.prettyPlays} plays) by ${this.author}`
  }

  get prettyPlays () {
    return this.plays
    ? this.plays.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 'unknown'
  }

  get prettyTime () {
    let millis = this.length
    let minutes = Math.floor(millis / 60000)
    let seconds = ((millis % 60000) / 1000).toFixed(0)
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
  }

  get fullInfo () {
    return `${this.prettyPrint} [${this.prettyTime}] ` +
    `- added by ${this.addedBy.username}`
  }
}

module.exports = SoundcloudTrack
