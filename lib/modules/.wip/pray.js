import BaseCommand from '../../base/BaseCommand'

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
