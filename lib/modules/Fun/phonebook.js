import BaseCommand from '../../base/BaseCommand'
import operator from './.call/Operator'

class Call extends BaseCommand {
  static get name () {
    return 'phonebook'
  }

  static get description () {
    return 'Phonebook management system'
  }

  static get usage () {
    return [
      '- Lists public channels in the phonebook',
      'publish - Publishes this channel to the public phonebook',
      'hide - Hides the channel from the public phonebook',
      'call <id> - Calls the channel with the specific ID',
      'pickup <id> - Picks up the call from channel with that ID',
      'decline <id> - Declines the call from channel with that ID',
      'hangup - Hangs up the current call'
    ]
  }

  handle () {
    this.responds(/^(phonebook|pb)$/i, () => {
      if (operator.channels.length === 0) {
        this.reply('There are currently no open channels available.')
        return
      }
      let reply = []
      operator.channels.forEach((elem, idx) => {
        let channel = this.client.channels.get('id', elem)
        reply.push(
          `${idx + 1}. **${channel.name}** - ${channel.server.name}`
        )
      })
      this.send(this.channel,
        'List of open channels available for call:\n' +
        reply.join('\n')
      )
    })

    this.responds(/^(phonebook|pb) publish$/i, () => {
      let index = operator.getIndexFromChannel(this.channel)
      if (index) {
        this.send(this.channel,
          `:negative_squared_cross_mark:  Public channel is already open as ` +
          `entry #**${parseInt(index, 10) + 1}**`
        )
        return
      }
      operator.addOpenChannel(this.channel)
      this.send(this.channel, [
        `:white_check_mark:  Added <#${this.channel.id}> to ` +
        `list of public channels as entry **#${operator.channels.length}**`
      ].join('\n'))
    })

    this.responds(/^(phonebook|pb) hide$/i, matches => {
      let index = operator.getIndexFromChannel(this.channel)
      if (!index) {
        this.send(this.channel, [
          `:negative_squared_cross_mark:  This channel is not open!`,
          `:telephone:  To enable calling, ` +
          `type **\`${this.prefix}${matches[1]} publish\`**`
        ].join('\n'))
        return
      }
      let entry = operator.getEntryFromChannel(this.channel)
      if (entry) {
        this.send(this.channel,
          ':negative_squared_cross_mark:  There is an existing call entry!'
        )
        return
      }
      operator.removeChannel(this.channel)
      this.send(this.channel,
        `:white_check_mark:  Removed <#${this.channel.id}> from ` +
        'list of public channels'
      )
    })

    this.responds(/^(phonebook|pb) call (\d+)$/i, matches => {
      let idx = operator.getIndexFromChannel(this.channel)
      if (!idx) {
        this.send(this.channel, [
          `:negative_squared_cross_mark:  This channel is not open!`,
          `:telephone:  To enable calling, ` +
          `type **\`${this.prefix}${matches[1]} publish\`**`
        ].join('\n'))
        return
      }
      let index = parseInt(matches[2], 10)
      let chanID = operator.getChannelFromIndex(index)
      if (chanID === this.channel.id) {
        this.send(this.channel,
          ':negative_squared_cross_mark:  You can\'t call the same channel!'
        )
        return
      }
      this.send(this.channel,
        `:telephone:  Establishing a link with public channel ` +
        `#**${index}**`
      ).then(msg => {
        if (!chanID) {
          this.client.updateMessage(msg,
            `:negative_squared_cross_mark:  Could not find public channel ` +
            `#**${index}**`
          )
          return
        }
        operator.startCallFromIndex(
          index, this.channel, this.sender
        ).then(entry => {
          let channel = this.client.channels.get('id', entry.dest)
          this.client.updateMessage(msg,
            `:white_check_mark:  Located channel #**${index}** - ` +
            `**${channel.name}** (${channel.server.name})`
          )
          let check = (msg) => {
            if (entry.status === 'active') {
              this.client.updateMessage(msg,
                `:telephone:  **${channel.name}** accepted the call\n` +
                ':loudspeaker: To send messages through, ' +
                'prefix your messages with **\^**'
              )
            } else if (entry.status === 'declined') {
              this.client.updateMessage(msg,
                `:telephone:  **${channel.name}** declined the call`
              )
              operator.stopCall(this.channel)
            } else if (entry.status === 'waiting') {
              setTimeout(() => {
                check(msg)
              }, 1000)
            }
          }
          this.send(this.channel,
            `:telephone:  Calling **${channel.name}**. Waiting for response.`
          ).then(msg => {
            this.send(channel, [
              `:telephone:  Incoming call from **${this.channel.name}** ` +
              `(${this.server.name})`,
              `:loudspeaker:  To pick up the call, ` +
              `type **\`${this.prefix}${matches[1]} pickup ` +
              `${parseInt(idx, 10) + 1}\`**`
            ].join('\n'))
            check(msg)
          })
        }).catch(err => {
          this.client.updateMessage(msg,
            ':negative_squared_cross_mark:  Could not link channel: ' +
            `**${err}**`
          )
        })
      })
    })

    this.responds(/^(phonebook|pb) pickup (\d+)$/i, matches => {
      let idx = operator.getIndexFromChannel(this.channel)
      if (!idx) {
        this.send(this.channel, [
          `:negative_squared_cross_mark:  This channel is not open!`,
          `:telephone:  To enable calling, ` +
          `type **\`${this.prefix}${matches[1]} publish\`**`
        ].join('\n'))
        return
      }
      let origin = operator.getChannelFromIndex(parseInt(matches[2], 10))
      if (!origin) {
        this.send(this.channel,
          ':negative_squared_cross_mark:  ' +
          `There is no incoming call from channel with index #**${matches[2]}**`
        )
        return
      }
      let entry = operator.getEntryFromChannel(this.channel)
      if (!entry) {
        this.send(this.channel,
          ':negative_squared_cross_mark:  ' +
          'There is no call entry for this channel'
        )
        return
      } else if (entry.status === 'active') {
        this.send(this.channel,
          ':negative_squared_cross_mark:  There is already an ongoing call ' +
          `from **${this.client.channels.get('id', entry.origin)}**`
        )
        return
      } else if (entry.status === 'waiting') {
        this.send(this.channel,
          ':white_check_mark:  Accepted call from ' +
          `**${this.client.channels.get('id', entry.origin)}**!\n` +
          ':loudspeaker: To send messages through, ' +
          'prefix your messages with **\^**'
        )
        entry.setReceived()
        return
      }
    })

    this.responds(/^(phonebook|pb) decline (\d+)$/i, matches => {
      let idx = operator.getIndexFromChannel(this.channel)
      if (!idx) {
        this.send(this.channel, [
          `:negative_squared_cross_mark:  This channel is not open!`,
          `:telephone:  To enable calling, ` +
          `type **\`${this.prefix}${matches[1]} publish\`**`
        ].join('\n'))
        return
      }
      let origin = operator.getChannelFromIndex(parseInt(matches[2], 10))
      if (!origin) {
        this.send(this.channel,
          ':negative_squared_cross_mark:  ' +
          'There is no incoming call for this channel'
        )
        return
      }
      let entry = operator.getEntryFromChannel(this.channel)
      if (!entry) {
        this.send(this.channel,
          ':negative_squared_cross_mark:  ' +
          `There is no incoming call from channel with index #**${matches[2]}**`
        )
        return
      } else if (entry.status === 'active') {
        this.send(this.channel,
          ':negative_squared_cross_mark:  There is already an ongoing call ' +
          `from **${this.client.channels.get('id', entry.origin)}**`
        )
        return
      } else if (entry.status === 'waiting') {
        this.send(this.channel,
          ':white_check_mark:  Declined call from ' +
          `**${this.client.channels.get('id', entry.origin)}**`
        )
        entry.setDeclined()
        return
      }
    })

    this.responds(/^(phonebook|pb) hangup$/i, matches => {
      let idx = operator.getIndexFromChannel(this.channel)
      if (!idx) {
        this.send(this.channel, [
          `:negative_squared_cross_mark:  This channel is not open!`,
          `:telephone:  To enable calling, ` +
          `type **\`${this.prefix}${matches[1]} publish\`**`
        ].join('\n'))
        return
      }
      let entry = operator.getEntryFromChannel(this.channel)
      if (!entry) {
        this.send(this.channel,
          ':negative_squared_cross_mark:  ' +
          `There is no ongoing call in this channel`
        )
        return
      }
      let target = null
      if (this.channel.id === entry.origin) {
        target = entry.dest
      } else if (this.channel.id === entry.dest) {
        target = entry.origin
      }
      let channel = this.client.channels.get('id', target)
      if (entry.status === 'active') {
        this.send(this.channel,
          `:telephone:  Hanging up the call with ` +
          `**${channel.name}**`
        ).then(msg => {
          entry.setDeclined()
          operator.stopCall(this.channel)
          this.client.updateMessage(msg,
            `:telephone:  Disconnected from call with **${channel.name}**`
          )
          this.send(channel,
            `:telephone:  The other party hung up.`
          )
        })
      } else if (entry.status === 'waiting') {
        this.send(this.channel,
          ':white_check_mark:  Terminated call with ' +
          `**${channel.name}**`
        )
        this.send(channel,
          `:telephone:  The other party hung up.`
        )
        entry.setDeclined()
        operator.stopCall(this.channel)
        return
      }
    })

    this.hears(/^\^(.+)/i, matches => {
      let entry = operator.getEntryFromChannel(this.channel)
      if (entry && entry.status === 'active') {
        var target = null
        if (this.channel.id === entry.dest) {
          target = this.client.channels.get('id', entry.origin)
        } else if (this.channel.id === entry.origin) {
          target = this.client.channels.get('id', entry.dest)
        }
        this.send(target,
          `:telephone_receiver:  **${this.sender.name}**: ${matches[1]}`
        )
      }
    })
  }
}

module.exports = Call
