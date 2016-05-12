import BaseCommand from '../../base/BaseCommand'
import _ from 'lodash'

class Dice extends BaseCommand {
  static get name () {
    return 'diceroll'
  }

  static get description () {
    return 'Rolls dice'
  }

  static get usage () {
    return [
      '- Rolls a die',
      'A - Rolls A number of dice',
      'dX - Rolls 1 die with X faces',
      'AdX - Rolls A number of dice with X faces',
      'AdX+B - Rolls A number of dice with X faces, adding B to the result',
      'AdX-L - Rolls A number of dice with X faces, ' +
      'subtracting L from the result'
    ]
  }

  static get aliases () {
    return [
      'rolldice',
      'dice'
    ]
  }

  roll (num = 1, fac = 6) {
    num = parseInt(num, 10)
    fac = parseInt(fac, 10)
    let result = []
    for (let i = 0; i < num; i++) {
      result.push(Math.floor(Math.random() * fac + 1))
    }
    return result
  }

  handle () {
    this.responds(/^(rolldice|diceroll|dice)$/i, () => {
      this.send(this.channel,
        `${this.sender.name} rolled a **${this.roll()[0]}**!`)
    })

    this.responds(/^(rolldice|diceroll|dice) (\d+)$/i, matches => {
      let result = this.roll(matches[1])
      this.send(this.channel, [
        '```xl',
        result.join(' '),
        '```',
        `Total: **${_.sum(result)}**`
      ])
    })

    this.responds(/^(rolldice|diceroll|dice) d(\d+)$/i, matches => {
      let result = this.roll(1, matches[2])
      this.send(this.channel, [
        '```xl',
        result.join(' '),
        '```',
        `Total: **${_.sum(result)}**`
      ])
    })

    this.responds(/^(rolldice|diceroll|dice) (\d+)d(\d+)$/i, matches => {
      let result = this.roll(matches[2], matches[3])
      this.send(this.channel, [
        '```xl',
        result.join(' '),
        '```',
        `Total: **${_.sum(result)}**`
      ])
    })

    this.responds(/^(rolldice|diceroll|dice) (\d+)d(\d+)(\+|\-)(\d+)$/i, matches => {
      let result = this.roll(matches[2], matches[3], matches[4] + matches[5])
      this.send(this.channel, [
        '```xl',
        result.join(' '),
        '```',
        `Total: ${_.sum(result)} ${matches[4]} ${matches[5]} = ` +
        `**${_.sum(result) + parseInt(matches[4] + matches[5], 10)}**`
      ])
    })
  }
}

module.exports = Dice
