import fs from 'fs'
import path from 'path'
import _ from 'lodash'

class WaifuDB {
  constructor () {
    this.waifus = this.read(path.join(__dirname, 'waifulist.txt'))
    this.shipgirls = this.read(path.join(__dirname, 'shipgirls.txt'))
  }

  read (filepath) {
    return _.compact(fs.readFileSync(filepath, 'utf-8')).split('\n')
  }
}

module.exports = new WaifuDB()
