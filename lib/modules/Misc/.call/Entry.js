class Entry {
  constructor (origin, dest, creator) {
    this.origin = origin
    this.dest = dest
    this.creator = creator
    this.status = null
  }

  setDialling () {
    this.status = 'waiting'
  }

  setReceived () {
    this.status = 'active'
  }

  setDisconnected () {
    this.status = null
  }

  setDeclined () {
    this.status = 'declined'
  }
}

module.exports = Entry
