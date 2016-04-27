import path from 'path'
import rq from 'require-all'
import BaseCommand from '../../base/BaseCommand'

class HelpCommand extends BaseCommand {
  static get name () {
    return 'help'
  }

  static get description () {
    return 'Shows the help menu'
  }

  getModules () {
    let modules = rq({
      dirname: path.join(process.cwd(), 'lib/modules'),
      filter: /(.+)\.js$/
    })
    return modules
  }

  processAllCommands (commands) {
    let mod = []
    for (let command in commands) {
      if (commands.hasOwnProperty(command)) {
        if (!commands[command].hidden) {
          mod.push(`  ${this.prefix}${commands[command].name} - ` +
          `${commands[command].description}`)
        }
      }
    }
    return mod
  }

  getAllCommands () {
    let list = []
    let modules = this.getModules()
    for (let module in modules) {
      if (modules.hasOwnProperty(module)) {
        let mod = [`${module}:`]
        mod.push(this.processAllCommands(modules[module]).join('\n'))
        if (mod.length === 1) {
          continue
        }
        mod.push('')
        list.push(mod.join('\n'))
      }
    }
    return list
  }

  displayHelp () {
    // TO-DO: Add server support
    this.send(this.sender, [
      `To run these commands, prefix them with \`${this.prefix} \` or ` +
      `${this.client.user.mention()}!`,
      '```',
      this.getAllCommands().join('\n'),
      '```'
    ].join('\n'))
    this.reply(':envelope_with_arrow: **Check your PMs!**')
  }

  processAllUsage (commands, cmdName) {
    for (let command in commands) {
      if (commands.hasOwnProperty(command)) {
        if (command !== cmdName) {
          continue
        }
        let usages = []
        commands[command].usage.forEach((elem, idx) => {
          usages.push(`${this.prefix}${cmdName} ${elem}`)
        })
        this.send(this.sender, [
          '```',
          commands[command].usage === 'None'
          ? `There is no documentation on the usage of ` +
          `${commands[command].name}`
          : `${usages.join('\n')}`,
          '```'
        ].join('\n'))
        if (!this.isPM) {
          this.reply(':envelope_with_arrow: **Check your PMs!**')
        }
        return
      }
    }
  }

  displayUsage (cmdName) {
    let modules = this.getModules()
    for (let module in modules) {
      if (modules.hasOwnProperty(module)) {
        this.processAllUsage(modules[module], cmdName)
      }
    }
  }

  handle () {
    this.responds(/^help$/i, () => {
      this.displayHelp()
    })

    this.responds(/^help (\w+)$/i, matches => {
      this.displayUsage(matches[1])
    })
  }
}

module.exports = HelpCommand
