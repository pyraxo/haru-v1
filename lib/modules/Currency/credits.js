import BaseCommand from '../../base/BaseCommand'
import manager from './.credits/Manager'

class Credits extends BaseCommand {
  static get name () {
    return 'credits'
  }

  static get description () {
    return 'Command for the credits system'
  }

  static get usage () {
    return [
      'give <user> <no. of credits> - Sends credits to a user'
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

  handle () {
    this.responds(/^credits$/i, () => {
      this.reply(`You have **${manager.getUser(this.sender)}** credits.`)
    })

    this.responds(/^credits (give|send) <@(\d+)> (\d+)$/i, matches => {
      this.tradeCredits(
        this.sender, this.client.users.get('id', matches[2]), matches[3]
      )
    })

    this.responds(/^credits (give|send) <@(\d+)> (\d+) (.+)$/i, matches => {
      this.tradeCredits(
        this.sender, this.client.users.get('id', matches[2]),
        matches[3], matches[4]
      )
    })
  }
}

module.exports = Credits
