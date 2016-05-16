class Ratelimits {
  constructor (limit, refresh) {
    this.limit = limit || 3
    this.refresh = refresh || 5000
    this.db = {}
  }

  inc (user) {
    if (typeof this.db[user.id] !== 'undefined') {
      this.db[user.id] += 1
    } else {
      this.db[user.id] = 1
    }
  }

  reset (user) {
    setTimeout(() => {
      delete this.db[user.id]
    }, this.refresh)
  }

  get (user) {
    return this.db[user.id]
  }

  isLimited (user) {
    let bool = this.db[user.id] >= this.limit
    if (bool) this.reset(user)
    return bool
  }
}

module.exports = new Ratelimits()
