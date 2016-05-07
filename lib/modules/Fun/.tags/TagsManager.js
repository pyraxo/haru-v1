import path from 'path'
import Database from '../../../base/Database'

module.export = new Database(path.join(process.cwd(), 'db/tags.json'))
