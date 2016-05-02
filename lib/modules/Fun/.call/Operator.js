import Entry from './Entry'
import _ from 'lodash'

class Operator {
  constructor () {
    this.entries = []
    this.channels = []
  }

  addOpenChannel (channel) {
    this.channels.push(channel.id)
  }

  removeChannel (channel) {
    this.channels.splice(_.indexOf(this.channels, channel.id), 1)
  }

  getIndexFromChannel (channel) {
    for (let c in this.channels) {
      if (channel.id === this.channels[c]) {
        return c
      }
    }
    return null
  }

  getChannelFromIndex (index) {
    return this.channels[index - 1]
  }

  getEntryFromChannel (channel) {
    return _.find(this.entries, ['origin', channel.id]) ||
    _.find(this.entries, ['dest', channel.id])
  }

  startCallFromIndex (index, origin, user) {
    if (!this.channels[index - 1]) return false
    return this.startCall(this.channels[index - 1], origin, user)
  }

  startCall (dest, origin, user) {
    dest = dest.id ? dest.id : dest
    origin = origin.id ? origin.id : origin
    return new Promise((res, rej) => {
      if (!_.includes(this.channels, origin) ||
      !_.includes(this.channels, dest)) {
        return rej('Channel is not public')
      }
      if (this.entries.every(
        e => e.origin !== origin && e.dest !== dest
      )) {
        let entry = new Entry(origin, dest, user.id)
        entry.setDialling()
        this.entries.push(entry)
        return res(entry)
      }
      return rej('Channel already in another call')
    })
  }

  stopCall (channel) {
    return new Promise((res, rej) => {
      if (this.entries.every(
        e => e.origin !== channel.id && e.dest !== channel.id
      )) {
        return rej()
      }
      let entry = this.getEntryFromChannel(channel)
      entry.setDisconnected()
      this.entries.splice(_.indexOf(entry), 1)
      res()
    })
  }
}

module.exports = new Operator()
