import BaseCommand from '../../base/BaseCommand'
import tcpp from 'tcp-ping'

class PingCommand extends BaseCommand {
  static get name () {
    return 'ping'
  }

  static get description () {
    return 'Pong!'
  }

  handle () {
    this.responds(/^ping$/i, () => {
      this.reply('Pong!')
    })

    this.responds(/^ping (\d+\.\d+\.\d+\.\d+)$/i, matches => {
      this.send(this.channel, `:mag:  Pinging **${matches[1]}**`)
      .then(msg => {
        tcpp.ping({
          address: matches[1]
        }, (err, data) => {
          if (err) {
            this.client.updateMessage(msg,
              `:negative_squared_cross_mark:  Pinging failed! **${err}**`
            )
            return
          }
          this.client.updateMessage(msg, [
            `:white_check_mark:  Pinged **${matches[1]}**`,
            '```xl',
            `address: ${matches[1]}`,
            'port: 80',
            'attempts: 10',
            `avg: ${data.avg.toPrecision(3)} ms`,
            `max: ${data.max.toPrecision(3)} ms`,
            `min: ${data.min.toPrecision(3)} ms`,
            '```'
          ].join('\n'))
        })
      })
    })
  }
}

module.exports = PingCommand
