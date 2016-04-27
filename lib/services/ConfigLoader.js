import path from 'path'
import fs from 'fs'

class ConfigLoader {
  constructor (logger) {
    try {
      const config = require(path.join(process.cwd(), 'config'))
      this.params = config
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        let filePath = path.join(process.cwd(), 'config.json')
        let defaultPath = path.join(process.cwd(), 'config.example.json')
        logger.error('Configuration file \'config.json\' missing.')

        fs.writeFileSync(filePath, fs.readFileSync(defaultPath, 'utf8'))
        logger.error(`A new one has been created. Please edit it.`)
      } else {
        logger.error(`Error reading configuration 'config.json'.\n${err}`)
      }
    }
  }
}

module.exports = ConfigLoader
