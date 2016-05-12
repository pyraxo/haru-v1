import fs from 'fs'

class Database {
  constructor (filepath) {
    if (typeof filepath !== 'undefined') {
      this.filepath = filepath
      try {
        this.db = require(filepath)
      } catch (err) {
        fs.writeFileSync(filepath, '{}')
        this.db = {}
      }
    } else {
      this.db = {}
    }
  }

  getAll () {
    return this.db
  }

  has (key) {
    return typeof this.db[key] !== 'undefined'
  }

  get (key) {
    return this.db[key]
  }

  set (key, val, overwrite, cb) {
    if (this.has(key) && overwrite === false) {
      if (typeof cb === 'function') {
        return cb('Unable to overwrite existing key')
      }
    }
    this.db[key] = val
    this.save(err => {
      if (err) {
        return cb(err)
      }
      if (typeof cb === 'function') {
        return cb(null, this.db[key])
      }
    })
  }

  del (key, cb) {
    if (!this.has(key)) {
      if (typeof cb === 'function') {
        return cb(false)
      }
    }
    delete this.db[key]
    this.save(err => {
      if (err) return cb(err)
      if (typeof cb === 'function') {
        return cb(true)
      }
    })
  }

  save (cb) {
    if (typeof this.filepath !== 'undefined') {
      fs.writeFile(this.filepath, JSON.stringify(this.db, null, 2),
      (err, data) => {
        if (err) {
          if (typeof cb === 'function') {
            return cb(err)
          }
        }
        if (typeof cb === 'function') {
          return cb(data)
        }
      })
    } else {
      if (typeof cb === 'function') {
        return cb()
      }
    }
  }
}

module.exports = Database
