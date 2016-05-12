import path from 'path'
import Database from '../../../base/Database'

let db = new Database(path.join(process.cwd(), 'db/prayers.json'))
module.exports = db
