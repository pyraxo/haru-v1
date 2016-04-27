import BaseCommand from '../../base/BaseCommand'
import util from 'util'

class Eval extends BaseCommand {
  static get name () {
    return 'eval'
  }

  static get description () {
    return 'Evaluates the given code'
  }

  static get usage () {
    return [
      '<code> - Evaluates the code'
    ]
  }

  get adminOnly () {
    return true
  }

  static get hidden () {
    return true
  }

  evalCode (code) {
    let message
    let self = this
    this.reply('Executing code.')
    .then(msg => {
      message = msg
      setTimeout(() => {
        let response
        try {
          response = eval(code)
        } catch (error) {
          response = `${error.message}\n\n${error.stack}`
        }

        if (Array.isArray(response) || typeof response === 'object') {
          response = util.inspect(response)
        }

        this.client.updateMessage(message, '```xl\n' + response + '\n```')
        .catch(err => {
          this.logger.error('Message update for eval failed', err)
          this.client.updateMessage(
            message, '```\nError while updating message:\n' + err + '\n```')
        })
      }, 500)
    })
    .catch(this.logger.error)
  }

  handle () {
    this.responds(/^eval(?:\s+)```[a-z]*\n([\s\S]*)?\n```$/, (matches) => {
      this.evalCode(matches[1])
    })

    this.responds(/^eval(?:\s+)`?([^`]*)?`?$/, (matches) => {
      this.evalCode(matches[1])
    })
  }
}

module.exports = Eval
