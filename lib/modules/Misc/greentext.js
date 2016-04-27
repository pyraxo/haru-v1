import BaseCommand from '../../base/BaseCommand'

class GreenText extends BaseCommand {
  static get name () {
    return 'greentext'
  }

  static get description () {
    return 'Greentexts any given input'
  }

  static get usage () {
    return [
      '<text> - Greentexts this text'
    ]
  }

  greenText (text) {
    let green = ''
    text.split(' | ').forEach((elem, idx) => {
      green += `>${elem}\n`
    })
    this.send(this.channel, [
      '```css',
      green,
      '```'
    ].join('\n'))
  }

  handle () {
    this.responds(/^greentext (.+)$/i, matches => {
      this.greenText(matches[1])
    })
  }
}

module.exports = GreenText
