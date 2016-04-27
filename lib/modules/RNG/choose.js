import BaseCommand from '../../base/BaseCommand'

class Choose extends BaseCommand {
  static get name () {
    return 'choose'
  }

  static get description () {
    return 'Makes me choose between 2 or more options'
  }

  static get usage () {
    return [
      '<choice 1>, <choice 2>[, <choices..>]'
    ]
  }

  handle () {
    // i'm not familiar enough with regex to be able to fully use lookarounds,
    // so this will have to do
    this.responds(/^(choose|pick) (.+)/i, matches => {
      let result = matches[2].split(', ')
      this.reply(
        `I pick **${result[Math.floor(Math.random() * result.length)]}**!`
      )
    })
  }
}

module.exports = Choose
