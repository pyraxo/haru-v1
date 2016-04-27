import escape from 'escape-string-regexp'
import BaseCommand from '../../base/BaseCommand'
const expressions = require('./expressions')

class RandomReplies extends BaseCommand {
  static get name () {
    return 'replies'
  }

  static get description () {
    return 'Replies to certain keywords'
  }

  static get hidden () {
    return true
  }

  replaceString (string) {
    let replacements = {
      '%sender%': this.sender.username,
      '%server%': this.server.name,
      '%channel%': this.channel.name
    }
    for (let str in replacements) {
      if (replacements.hasOwnProperty(str)) {
        string = string.replace(str, replacements[str])
      }
    }
    return string
  }

  hearExpression (exp) {
    this.hears(new RegExp(`\^${escape(exp)}\$`, 'i'), () => {
      let reply = ''
      let r = expressions[exp]
      if (Array.isArray(expressions[exp])) {
        reply = r[Math.floor(Math.random() * r.length)]
      } else {
        reply = r
      }
      reply = this.replaceString(reply)
      this.send(this.channel, reply)
    })
  }

  handle () {
    for (let exp in expressions) {
      if (expressions.hasOwnProperty(exp)) {
        this.hearExpression(exp)
      }
    }

    this.hears(/^ay(y+)$/i, matches => {
      this.send(this.channel, `lma${Array(matches[1].length + 1).join('o')}`)
    })
  }

}

module.exports = RandomReplies
