import path from 'path'
import fs from 'fs'

class TagManager {
  constructor () {
    try {
      this.tags = require('./tags')
    } catch (err) {
      fs.writeFileSync(path.join(__dirname, 'tags.json'), '{}')
      this.tags = require('./tags')
    }
  }

  getAll () {
    return this.tags
  }

  get (tag) {
    return this.tags[tag]
  }

  set (tag, text) {
    if (this.tags[tag]) {
      return false
    }
    this.tags[tag] = text
    this.save()
    return true
  }

  del (tag) {
    if (!this.tags[tag]) {
      return false
    }
    delete this.tags[tag]
    this.save()
    return true
  }

  save () {
    let filepath = path.join(__dirname, 'tags.json')
    fs.writeFileSync(filepath, JSON.stringify(this.tags, null, 2))
  }
}

module.exports = new TagManager()
