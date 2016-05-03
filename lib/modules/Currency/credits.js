import BaseCommand from '../../base/BaseCommand'
import manager from './.credits/Manager'
import _ from 'lodash'

class Credits extends BaseCommand {
  static get name () {
    return 'credits'
  }

  static get description () {
    return 'Command for the credits system'
  }

  static get usage () {
    return [
      'give <user> <no. of credits> [message] - Sends credits to a user',
      'peek <user> - Takes a peek at a user\'s number of credits',
      'rankings - Gets the rankings for credit amounts'
    ]
  }

  tradeCredits (sender, receiver, amount, reason) {
    if (!sender || !receiver) {
      return this.reply(
        'I don\'t know that user.'
      )
    }
    let credits = manager.getUser(sender)
    if (credits < amount) {
      return this.reply(
        `You have insufficient funds of only **${credits}** credit(s).`
      )
    }

    if (sender.id === receiver.id) {
      return this.reply(
        'You can\'t send credits to yourself!\n' +
        '(I mean you could, but why would you?)'
      )
    }
    manager.removeCredits(sender, amount)
    manager.addCredits(receiver, amount)
    let receipt = [
      '```ruby',
      '=== RECEIPT ===',
      `FROM: ${sender.name}`,
      `AMOUNT: ${amount} credits`,
      `FOR: ${receiver.name}\n`
    ].join('\n')
    if (reason) {
      receipt += `DESCRIPTION: ${reason}\n`
    }
    this.reply(`**${amount}** credits sent to ${receiver}. PMing receipt.`)
    this.send(sender, receipt + [
      `CURRENT AMOUNT: ${manager.getUser(sender)} credits`,
      '```'
    ].join('\n'))
    this.send(receiver, receipt + [
      `CURRENT AMOUNT: ${manager.getUser(receiver)} credits`,
      '```'
    ].join('\n'))
  }

  getCredits (user) {
    this.reply(`${user.name} has **${manager.getUser(user)}** credits.`)
  }

  sortRankings () {
    let reply = [
      '```ruby',
      '=== DISCORD WEALTH RANKINGS ===',
    ]
    if (manager.getDB().length === 0) {
      reply.push('There are no registered users.')
    } else {
      let db = manager.getDB()
      let rankings = []
      for (let id in db) {
        rankings.push([id, db[id]])
      }
      rankings.sort((a, b) => { return b[1] - a[1] })
      console.log(rankings)
      for (let i = 0; i < 3; i++) {
        reply.push(
          `[${i + 1}]: ${this.client.users.get('id', rankings[i][0]).name} ` +
          `- ${rankings[i][1]} credits`
        )
      }
    }
    reply.push('```')
    this.send(this.channel, reply.join('\n'))
  }

  handle () {
    this.responds(/^credits$/i, () => {
      this.reply(`You have **${manager.getUser(this.sender)}** credits.`)
    })

    this.responds(/^credits (leaderboards|lb|rankings)$/i, () => {
      this.sortRankings()
    })

    this.responds(/^credits (give|send) <@!*(\d+)> (\d+)$/i, matches => {
      this.tradeCredits(
        this.sender, this.client.users.get('id', matches[2]), matches[3]
      )
    })

    this.responds(/^credits (give|send) <@!*(\d+)> (\d+) (.+)$/i, matches => {
      this.tradeCredits(
        this.sender, this.client.users.get('id', matches[2]),
        matches[3], matches[4]
      )
    })

    this.responds(/^credits (peek|get) <@!*(\d+)>$/i, matches => {
      this.getCredits(this.client.users.get('id', matches[2]))
    })
  }
}

module.exports = Credits
