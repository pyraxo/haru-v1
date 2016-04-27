import BaseCommand from '../../base/BaseCommand'
import request from 'superagent'

class Stocks extends BaseCommand {
  static get name () {
    return 'stocks'
  }

  static get description () {
    return 'Fetches certain stock from ticker symbols'
  }

  static get usage () {
    return [
      '<symbol> - Fetches the specific stock'
    ]
  }

  fetchStock (symbol) {
    request
    .get(`http://www.google.com/finance/info?q=${symbol}`)
    .end((err, res) => {
      if (err) {
        this.logger.error(
          `Error fetching stock $${symbol.toUpperCase()}: `, err
        )
        return this.reply(
          `**Error**: Stock $${symbol.toUpperCase()} met with ${err}`
        )
      }
      res = JSON.parse(res.text.replace('//', ''))[0]
      this.send(this.channel, [
        '```xl',
        `${res.e}:${res.t}`,
        '```',
        `**Current price**: ${res.l}`,
        `**Change**: ${res.c} (${res.cp}%)`,
        `**Last update**: ${res.ltt}`
      ].join('\n'))
    })
  }

  handle () {
    this.responds(/^stocks (.+)$/i, matches => {
      return this.fetchStock(matches[1])
    })
  }
}

module.exports = Stocks
