import BaseCommand from '../../base/BaseCommand'
import _ from 'lodash'

class Coinflip extends BaseCommand {
  static get name () {
    return 'coinflip'
  }

  static get description () {
    return 'Flips coins'
  }

  static get usage () {
    return [
      '[number] - Flips this many coins'
    ]
  }

  get result () {
    let res = ['HEADS', 'TAILS']
    return res[Math.floor(Math.random() * 2)]
  }

  handle () {
    this.responds(/^(coinflip|cointoss|coins)$/i, () => {
      this.reply(`You got **${this.result}**!`)
    })

    this.responds(/^(coinflip|cointoss|coins) (\d+)$/i, matches => {
      let replies = []
      for (let i = 0; i < parseInt(matches[2], 10); i++) {
        replies.push(this.result)
      }
      this.send(
        this.channel,
        [
          '```xl',
          replies.join(' '),
          '```',
          `${this.sender.name} got **${_.countBy(replies)['HEADS']}** ` +
          `heads and **${_.countBy(replies)['TAILS']}** tails!`
        ].join('\n')
      )
    })
  }
}

module.exports = Coinflip
