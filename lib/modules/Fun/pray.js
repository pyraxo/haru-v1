import moment from 'moment'

import BaseCommand from '../../base/BaseCommand'
import manager from '../Currency/.credits/CreditsManager'
import prayers from './.prayer/Prayer'

class Pray extends BaseCommand {
  static get name () {
    return 'pray'
  }

  static get description () {
    return 'Prays to their Grace for her divine blessings'
  }

  static get usage () {
    return [
      'roxy - Prays to Roxy',
      'eris - Prays to Eris',
      'sylphy - Prays to Sylphy'
    ]
  }

  pray (name, desc) {
    if (prayers.has(this.sender.id)) {
      if (moment().diff(
        moment(prayers.get(this.sender.id)
      ), 'hours') < 24) {
        this.reply(
          'You have recently prayed for the Goddesses\' ' +
          'blessings in the last 24 hours.'
        )
        return
      }
    }
    let amount = Math.floor(Math.random() * 100) + 100
    this.send(this.channel, [
      `${this.sender.mention()} prays to **${name}**, the ${desc}.`,
      `She grants them a small gift of ${amount} credits.`
    ].join('\n'))
    manager.addCredits(this.sender, amount, () => {
      prayers.set(this.sender.id, +moment())
    })
  }

  handle () {
    this.responds(/^pray$/i, () => {
      this.wrongUsage('pray')
    })

    this.responds(/^pray sylphy$/i, () => {
      this.pray('Sylphy', 'Goddess of Love')
    })

    this.responds(/^pray roxy$/i, () => {
      this.pray('Roxy', 'Goddess of Wisdom')
    })

    this.responds(/^pray eris$/i, () => {
      this.pray('Eris', 'Goddess of Strength')
    })
  }
}

module.exports = Pray
