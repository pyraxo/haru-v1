class Stream {
  constructor (options) {
    this.text = options.text
    this.voice = options.voice
    this.voiceConnection = options.voiceConnection
    this.currentVideo = null
    this.playlist = []
  }

  queue (vid) {
    this.playlist.push(vid)
  }
}

module.exports = Stream
