import escape from 'escape-string-regexp'
import BaseCommand from '../../base/BaseCommand'

class LMGTFY extends BaseCommand {
  static get name () {
    return 'lmgtfy'
  }

  static get description () {
    return 'Let me Google that for you!'
  }

  static get usage () {
    return [
      '<text> - Google this text'
    ]
  }

  handle () {
    this.responds(/^lmgtfy$/i, () => {
      this.reply('http://lmgtfy.com/?q=how+to+use+lmgtfy')
    })

    this.responds(/^lmgtfy (.+)$/i, matches => {
      this.reply(`http://lmgtfy.com/?q=${
        escape(matches[1].split(' ').join('+'))
      }`)
    })
  }
}

module.exports = LMGTFY
