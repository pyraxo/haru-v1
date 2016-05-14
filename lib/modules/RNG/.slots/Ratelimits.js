class Ratelimits {
  constructor (limit, refresh) {
    this.limit = limit || 3
    this.refresh = refresh || 10000
    this.db = {}
    this.check()
  }

  inc (user) {
    if (typeof this.db[user.id] !== 'undefined') {
      this.db[user.id] += 1
    } else {
      this.db[user.id] = 1
    }
  }

  check () {
    setTimeout(() => {
      if (Object.keys(this.db) > 0) this.db = {}
      this.check()
    }, this.refresh)
  }

  get (user) {
    return this.db[user.id]
  }

  isLimited (user) {
    return this.db[user.id] >= this.limit
  }
}

module.exports = new Ratelimits()
