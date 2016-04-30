import BaseCommand from '../../base/BaseCommand'
import _ from 'lodash'

class Whois extends BaseCommand {
  static get name () {
    return 'whois'
  }

  static get description () {
    return 'Shows information of a specific user'
  }

  static get usage () {
    return [
      '[user mention] - Finds the info of this user'
    ]
  }

  fetchUser (user) {
    if (!user) {
      return 'I don\'t know that user.'
    }
    let roles = []
    _.remove(this.server.rolesOfUser(user), r => {
      return r.name !== '@everyone'
    }).forEach(elem => {
      roles.push(elem.name)
    })
    return [
      '```xl',
      '================ [PROFILE] =================',
      `Name: ${user.username}`,
      `ID: ${user.id}`,
      `Discriminator: ${user.discriminator}`,
      `Status: ${user.status}`,
      `Game: ${user.game.game ? user.game.game : 'none'}`,
      `Bot: ${user.bot}`,
      `Roles: ${roles.join(', ')}`,
      '============================================',
      '```'
    ].join('\n')
  }

  handle () {
    this.responds(/^(whois|whoami)$/i, () => {
      this.send(this.channel, this.fetchUser(this.sender))
      this.upload(this.sender.avatarURL)
    })

    this.responds(/^whois <@!*(\d+)>$/i, matches => {
      let user = this.client.users.get('id', matches[1])
      this.send(this.channel, this.fetchUser(user))
      this.upload(user.avatarURL)
    })
  }
}

module.exports = Whois
