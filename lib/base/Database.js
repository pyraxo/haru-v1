import fs from 'fs'
import path from 'path'
import jsonfile from 'jsonfile'
import moment from 'moment'

class Database {
  constructor (filepath) {
    if (typeof filepath !== 'undefined') {
      this.filepath = filepath
      jsonfile.readFile(filepath, (err, obj) => {
        if (err) {
          fs.readFile(filepath, (err, data) => {
            if (err) {
              console.log(err)
            }
            if (data) {
              fs.writeFile(
                path.join(process.cwd(), `backups/${moment().unix()}`),
                data, err => {
                  if (err) {
                    console.log(err)
                    return
                  }
                }
              )
            }
          })
          this.db = {}
        } else {
          this.db = obj
        }
      })
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
        return cb('Key-value pair does not exist.')
      }
    }
    delete this.db[key]
    this.save(err => {
      if (err) return cb(err)
      if (typeof cb === 'function') {
        return cb()
      }
    })
  }

  save (cb) {
    if (typeof this.filepath !== 'undefined') {
      jsonfile.writeFile(this.filepath, this.db, {spaces: 2}, (err) => {
        if (typeof cb === 'function') {
          if (err) return cb(err)
          return cb()
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
