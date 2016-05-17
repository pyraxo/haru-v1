import BaseCommand from '../../base/BaseCommand'
import _ from 'lodash'
import manager from '../Currency/.credits/CreditsManager'
import rl from './.slots/Ratelimits'

class Slots extends BaseCommand {
  static get name () {
    return 'slots'
  }

  static get description () {
    return 'Spins the slot machine'
  }

  static get usage () {
    return [
      '[bet] - Spins with the amount of wager'
    ]
  }

  get symbols () {
    return [
      '🍒', '🍒', '🍒',
      '7⃣',
      '🍐', '🍐', '🍐', '🍐',
      '🇱🇻', '🇱🇻',
      '🍈', '🍈', '🍈', '🍈',
      '🍇', '🍇', '🍇', '🍇',
      '🍊', '🍊', '🍊', '🍊',
      '💎',
      '🍉', '🍉', '🍉', '🍉',
      '🔔'
    ]
  }

  get wins () {
    return {
      '🍒1': 2,
      '🍒2': 5,
      '🍒3': 10,
      '7⃣2': 50,
      '7⃣3': 150,
      '🍐3': 20,
      '🍈3': 20,
      '🍇3': 20,
      '🍊3': 20,
      '💎2': 25,
      '💎3': 200,
      '🔔3': 50,
      '🍉3': 20,
      '🇱🇻2': 40,
      '🇱🇻3': 100
    }
  }

  spin (symbols, bet) {
    if (rl.isLimited(this.sender)) {
      this.client.deleteMessage(this.message)
      return this.reply(
        `Calm down, you\'re spamming \`${this.prefix}slots\` too quickly!`, {
          deleteDelay: 3000
        })
    }
    rl.inc(this.sender)
    if (bet <= 0) bet = 1
    if (bet > 100) bet = 100
    let credits = manager.getUser(this.sender)
    if (credits === 0) {
      return this.reply(
        `You have no remaining funds.`)
    } else if (credits < bet) {
      return this.reply(
        `You have insufficient funds of only **${credits}** credit(s).`)
    }
    manager.removeCredits(this.sender, bet)
    let machine = []
    for (let i = 0; i < 3; i++) {
      let sample = []
      while (sample.length < 3) {
        sample = _.uniq(_.sampleSize(symbols, 3))
      }
      machine.push(sample)
    }
    let payline = [machine[0][1], machine[1][1], machine[2][1]]
    this.send(this.channel, [
      '**__   S   L   O   T   S   __**',
      `|| ${machine[0][0]} ${machine[1][0]} ${machine[2][0]} ||`,
      `> ${payline.join(' ')} <`,
      `|| ${machine[0][2]} ${machine[1][2]} ${machine[2][2]} ||`,
      `\n${this.sender.name} used **${bet}** credit(s) and...`
    ].join('\n'))
    .then(msg => {
      this.checkWins(payline, bet)
      .then(amount => {
        let message = ` won **${amount}** credits! Congratulations!`
        this.client.updateMessage(msg, msg.content + message)
        manager.addCredits(this.sender, amount)
      })
      .catch(() => {
        this.client.updateMessage(msg, msg.content +
        ' didn\'t win anything... Better luck next time!')
      })
    })
  }

  checkWins (payline, bet) {
    let payout = this.wins
    return new Promise(function (res, rej) {
      let report = _.countBy(payline)
      let reward = 0
      Object.keys(report).forEach((elem, idx) => {
        let win = payout[`${elem}${report[elem]}`]
        reward += win ? win * bet : 0
      })
      if (reward > 0) return res(reward)
      return rej()
    })
  }

  handle () {
    this.responds(/^slots$/i, () => {
      this.spin(this.symbols, 1)
    })

    this.responds(/^slots (\d+)$/i, matches => {
      let bet = matches[1]
      this.spin(this.symbols, bet)
    })

    this.responds(/^slots max$/i, matches => {
      this.spin(this.symbols, manager.getUser(this.sender))
    })
  }
}

module.exports = Slots
