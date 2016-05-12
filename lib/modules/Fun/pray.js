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

  handle () {
    this.responds(/^pray$/i, () => {
      this.wrongUsage('pray')
    })

    this.responds(/^pray sylphy$/i, () => {
      if (prayers.has(this.sender.id)) {
        if (moment().diff(
          moment(prayers.get(this.sender.id)
        ), 'seconds') < 86400) {
          this.reply('You have recently prayed for the Goddesses\' blessings.')
          return
        }
      }
      let amount = Math.floor(Math.random() * 100) + 100
      this.send(this.channel, [
        `${this.sender.mention()} prays to **Sylphy**, the Goddess of Love.`,
        `She grants him a small gift of ${amount} credits.`
      ].join('\n'))
      manager.addCredits(this.sender, amount, () => {
        prayers.set(this.sender.id, +moment())
      })
    })

    this.responds(/^pray roxy$/i, () => {
      if (prayers.has(this.sender.id)) {
        if (moment().diff(
          moment(prayers.get(this.sender.id)
        ), 'seconds') < 86400) {
          this.reply('You have recently prayed for the Goddesses\' blessings.')
          return
        }
      }
      let amount = Math.floor(Math.random() * 100) + 100
      this.send(this.channel, [
        `${this.sender.mention()} prays to **Roxy**, the Goddess of Wisdom.`,
        `She grants him a small gift of ${amount} credits.`
      ].join('\n'))
      manager.addCredits(this.sender, amount, () => {
        prayers.set(this.sender.id, +moment())
      })
    })

    this.responds(/^pray eris$/i, () => {
      if (prayers.has(this.sender.id)) {
        if (moment().diff(
          moment(prayers.get(this.sender.id)
        ), 'seconds') < 86400) {
          this.reply('You have recently prayed for the Goddesses\' blessings.')
          return
        }
      }
      let amount = Math.floor(Math.random() * 100) + 100
      this.send(this.channel, [
        `${this.sender.mention()} prays to **Eris**, the Goddess of Strength.`,
        `She grants him a small gift of ${amount} credits.`
      ].join('\n'))
      manager.addCredits(this.sender, amount, () => {
        prayers.set(this.sender.id, +moment())
      })
    })
  }
}

module.exports = Pray
