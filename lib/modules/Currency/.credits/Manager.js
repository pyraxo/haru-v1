import fs from 'fs'
import path from 'path'

class Manager {
  constructor () {
    try {
      const db = require('./credits')
      this.credits = db
    } catch (err) {
      fs.writeFileSync(path.join(__dirname, 'credits.json'), '{}')
      this.credits = require('./credits')
    }
  }

  checkExists (user) {
    if (typeof this.credits[user.id] === 'undefined') {
      return false
    }
    return true
  }

  getUser (user) {
    if (this.checkExists(user)) {
      return this.credits[user.id]
    } else {
      return this.initUser(user)
    }
  }

  addCredits (user, add) {
    this.checkExists(user)
    this.credits[user.id] += parseInt(add, 10)
    this.save()
  }

  setCredits (user, total) {
    this.credits[user.id] = parseInt(total, 10)
    this.save()
  }

  initUser (user) {
    this.setCredits(user, 100)
    return this.getUser(user)
  }

  removeCredits (user, del) {
    this.checkExists(user)
    this.credits[user.id] -= parseInt(del, 10)
    this.save()
  }

  save () {
    let filepath = path.join(__dirname, 'credits.json')
    fs.writeFileSync(filepath, JSON.stringify(this.credits, null, 2))
  }

  getDB () {
    return this.credits
  }
}

module.exports = new Manager()
