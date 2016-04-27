import path from 'path'
import rq from 'require-all'

class MessageHandler {
  constructor (container, client) {
    this.container = container
    this.client = client
    this.logger = container.get('logger')

    this.getModules()
  }

  getModules () {
    this.modules = rq({
      dirname: path.join(process.cwd(), 'lib/modules'),
      filter: /(.+)\.js$/
    })
    return this.modules
  }

  reloadModules () {
    let modules = this.modules
    for (let module in modules) {
      if (modules.hasOwnProperty(module)) {
        for (let command in modules[module]) {
          if (modules.hasOwnProperty(module)) {
            delete require.cache[require.resolve(
              path.join(process.cwd(), 'lib/modules', module, command)
            )]
          }
        }
      }
    }
    this.getModules()
  }

  handleMessage (msg) {
    if (msg.sender.id === this.client.user.id) {
      return false
    }

    this.checkModules(msg, this.modules)
  }

  checkModules (msg, modules) {
    return new Promise((res, rej) => {
      for (let module in modules) {
        if (!modules.hasOwnProperty(module)) {
          continue
        }
        let commands = modules[module]
        for (let idx in commands) {
          if (!commands.hasOwnProperty(idx)) {
            continue
          }
          let command = new commands[idx](
            this.container, msg, this.logger, this.client
          )
          try {
            command.handle()
          } catch (err) {
            this.logger.error('Error while handling command:\n', err.stack)
            rej(err)
          }
        }
        res()
      }
    })
  }
}

module.exports = MessageHandler
