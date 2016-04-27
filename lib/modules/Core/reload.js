import BaseCommand from '../../base/BaseCommand'

class PingCommand extends BaseCommand {
  static get name () {
    return 'reload'
  }

  static get description () {
    return 'Reloads all modules.'
  }

  get adminOnly () {
    return true
  }

  static get hidden () {
    return true
  }

  handle () {
    this.responds(/^reload$/i, () => {
      let moduleNum = Object.keys(
        this.container.get('handler').getModules()
      ).length
      this.container.get('handler').reloadModules()
      this.logger.info(`${this.sender.name} has reloaded all modules.`)
      this.send(
        this.channel, `Reloaded all **${moduleNum}** modules.`
      )
    })
  }
}

module.exports = PingCommand
