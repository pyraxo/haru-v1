import BaseCommand from '../../base/BaseCommand'

class Stats extends BaseCommand {
  static get name () {
    return 'info'
  }

  static get description () {
    return 'Shows some statistics'
  }

  fetchBot () {
    let uptime = this.client.uptime
    return [
      '```xl',
      '== Statistics ==',
      `Uptime: ${Math.round(uptime / (1000 * 60 * 60))} hours, ` +
      `${Math.round(uptime / (1000 * 60)) % 60} minutes, ` +
      `${Math.round(uptime / 1000) % 60} seconds`,
      `Currently in ${this.client.servers.length} servers and ` +
      `${this.client.channels.length} channels,`,
      `Seeing ${this.client.users.length} users.`,
      '```'
    ].join('\n')
  }

  handle () {
    this.responds(/^(info|stats)$/i, () => {
      this.send(this.channel, this.fetchBot())
    })
  }
}

module.exports = Stats
