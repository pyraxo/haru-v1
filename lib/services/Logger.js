import winston from 'winston'
import moment from 'moment'
import path from 'path'
import fs from 'fs'

module.exports = function (debug, fileName) {
  let logsPath = path.join(process.cwd(), 'logs')
  if (!fs.existsSync(logsPath)) {
    fs.mkdirSync(logsPath)
  }
  let transports = [
    new (winston.transports.Console)({
      level: debug ? 'verbose' : 'info',
      timestamp: function () {
        return moment(Date.now()).format('YYYY-MM-DD hh:mm:ss a')
      }
    }),
    new (winston.transports.File)({
      filename: `${logsPath}/` +
      `${fileName || moment(Date.now()).format('YYYY-MM-DD HHmm')}.log`,
      colorize: false,
      timestamp: true,
      json: true
    })
  ]
  let logger = new (winston.Logger)({
    exitOnError: !debug,
    transports: transports
  })
  logger.cli()
  return logger
}
