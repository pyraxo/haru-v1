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
      'add <user> <no. of credits> - Topup credits for a user',
      'remove <user> <no. of credits> - Remove credits from a user',
      'set <user> <no. of credits> - Sets a user\'s number of credits'
    ]
  }

  static get hidden () {
    return true
  }

  get adminOnly () {
    return true
  }

  giveCredits (user, amount, reason) {
    if (!user) {
      return this.reply(
        'I don\'t know that user.'
      )
    }
    manager.addCredits(user, amount)
    this.reply(`Added **${amount}** credits to ${user}'s account.`)
    let receipt = [
      '```ruby',
      '=== NOTICE OF BALANCE ADJUSTMENT ===',
      `FROM: ${this.sender.name}`,
      `TO: ${user.name}`,
      `AMOUNT ADDED: ${amount} credits\n`
    ].join('\n')
    if (reason) {
      receipt += `DESCRIPTION: ${reason}`
    }
    this.send(user, receipt + '```')
  }

  setCredits (user, amount, reason) {
    if (!user) {
      return this.reply(
        'I don\'t know that user.'
      )
    }
    manager.setCredits(user, amount)
    this.reply(`Set ${user}'s credits to **${amount}**.`)
    let receipt = [
      '```ruby',
      '=== NOTICE OF BALANCE ADJUSTMENT ===',
      `FROM: ${this.sender.name}`,
      `TO: ${user.name}`,
      `AMOUNT ADJUSTED TO: ${amount} credits\n`
    ].join('\n')
    if (reason) {
      receipt += `DESCRIPTION: ${reason}\n`
    }
    this.send(user, receipt + '```')
  }

  removeCredits (user, amount, reason) {
    if (!user) {
      return this.reply(
        'I don\'t know that user.'
      )
    }
    manager.removeCredits(user, amount)
    this.reply(`Removed **${amount}** credits from ${user}.`)
    let receipt = [
      '```ruby',
      '=== NOTICE OF BALANCE ADJUSTMENT ===',
      `FROM: ${this.sender.name}`,
      `TO: ${user.name}`,
      `AMOUNT REMOVED: ${amount} credits\n`
    ].join('\n')
    if (reason) {
      receipt += `DESCRIPTION: ${reason}\n`
    }
    this.send(user, receipt + '```')
  }

  handle () {
    this.responds(/^credits (topup|add) <@!*(\d+)> (\d+)$/i, matches => {
      this.giveCredits(
        this.client.users.get('id', matches[2]), matches[3]
      )
    })

    this.responds(/^credits (topup|add) <@!*(\d+)> (\d+) (.+)$/i, matches => {
      this.giveCredits(
        this.client.users.get('id', matches[2]), matches[3], matches[4]
      )
    })

    this.responds(/^credits (set|force) <@!*(\d+)> (\d+)$/i, matches => {
      this.setCredits(
        this.client.users.get('id', matches[2]), matches[3]
      )
    })

    this.responds(/^credits (set|force) <@!*(\d+)> (\d+) (.+)$/i, matches => {
      this.setCredits(
        this.client.users.get('id', matches[2]), matches[3], matches[4]
      )
    })

    this.responds(/^credits (remove|take) <@!*(\d+)> (\d+)$/i, matches => {
      this.removeCredits(
        this.client.users.get('id', matches[2]), matches[3]
      )
    })

    this.responds(/^credits (remove|take) <@!*(\d+)> (\d+) (.+)$/i, matches => {
      this.removeCredits(
        this.client.users.get('id', matches[2]), matches[3], matches[4]
      )
    })
  }
}

module.exports = Credits
