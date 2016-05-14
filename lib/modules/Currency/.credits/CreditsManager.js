import path from 'path'

import Database from '../../../base/Database'

class CreditsManager extends Database {
  constructor (filepath) {
    super(filepath)
  }

  hasUser (user) {
    if (!this.has(user.id)) {
      this.initUser(user)
    }
    return this.has(user.id)
  }

  getUser (user) {
    if (!this.has(user.id)) {
      this.initUser(user)
    }
    return this.get(user.id)
  }

  addCredits (user, byVal, cb) {
    if (this.hasUser(user)) {
      this.db[user.id] += parseInt(byVal, 10)
      this.save()
      if (typeof cb === 'function') {
        return cb(this.getUser(user))
      }
    } else {
      this.initUser(user)
      return this.addCredits(user, byVal, cb)
    }
  }

  removeCredits (user, byVal, cb) {
    return this.addCredits(user, parseInt(byVal, 10) * -1, cb)
  }

  setCredits (user, value, cb) {
    this.db[user.id] = parseInt(value, 10)
    this.save()
    if (typeof cb === 'function') {
      return cb(this.getUser(user))
    }
  }

  initUser (user, cb) {
    this.setCredits(user, 100)
    if (typeof cb === 'function') {
      return cb(this.getUser(user))
    }
    return this.getUser(user)
  }
}

let db = new CreditsManager(path.join(process.cwd(), 'db/credits.json'))

module.exports = db
