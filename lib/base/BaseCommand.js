import moment from 'moment'
import _ from 'lodash'
import prettyjson from 'prettyjson'

const MESSAGE_CHAR_LIMIT = 2000
const MESSAGE_RATE_LIMIT = 10

class BaseCommand {
  constructor (container, message, logger, client) {
    if (this.constructor === BaseCommand) {
      throw new Error('Can\'t instantiate abstract class!')
    }

    this.container = container
    this.message = message
    this.logger = logger
    this.client = client

    this.init()
  }

  init () {

  }

  static get name () {
    throw new Error('Commands must have names')
  }

  static get description () {
    throw new Error('Commands must have descriptions')
  }

  static get usage () {
    return 'None'
  }

  static get hidden () {
    return false
  }

  get adminOnly () {
    return false
  }

  get noPrivate () {
    return false
  }

  get server () {
    return this.message.channel.server
  }

  get channel () {
    return this.message.channel
  }

  get time () {
    return moment(this.message.timestamp).format('HH:mm:ss')
  }

  get sender () {
    return this.message.sender
  }

  get isBotMentioned () {
    return this.rawContent.indexOf(this.prefix) === 0 ||
      this.message.isMentioned(this.client.user) || this.isPM
  }

  get isEveryoneMentioned () {
    return this.message.everyoneMentioned
  }

  get rawContent () {
    return this.message.content
  }

  get content () {
    let content = this.rawContent
    content = _.trim(content.replace(
      new RegExp(`^(${this.client.user.mention()})|(\\${this.prefix})`), ''
    ))
    return content
  }

  get isPM () {
    return this.message.channel.isPrivate
  }

  get prefix () {
    return this.container.getParam('prefix')
  }

  get mentions () {
    let users = []
    for (let idx in this.message.mentions) {
      if (this.message.mentions.hasOwnProperty(idx)) {
        let user = this.message.mentions[idx]
        if (typeof user.id !== 'undefined' &&
        typeof user.username !== 'undefined') {
          users.push({
            id: user.id,
            name: user.username,
            mention: user.mention
          })
        }
      }
    }

    return users
  }

  isOwner (pm) {
    return this.sender.id === this.server.owner.id
  }

  isAdmin () {
    let admin = false
    this.client.admins.forEach((elem, idx) => {
      if (this.sender.id === elem) {
        admin = true
      }
    })
    return admin
  }

  isAdminOrOwner (pm) {
    return this.isAdmin() || this.isOwner(pm)
  }

  wrongUsage (name) {
    this.reply(
      `Please run \`${this.prefix}help ${name}\` to use this command properly`
    )
  }

  reply (content, options) {
    if (!this.isPM) {
      content = `${this.sender.mention()}, ${content}`
    }
    return this.send(this.message, content, options)
  }

  send (dest, content, options = {delay: 0, deleteDelay: 0}) {
    //  Not sure if destructuring works
    let {delay, deleteDelay} = options
    if (content.length > MESSAGE_RATE_LIMIT * MESSAGE_CHAR_LIMIT) {
      return this.logger.error(
        'Error sending a message larger than the character and rate limit\n' +
        content
      )
    }

    if (delay) {
      return setTimeout(() => {
        this.send(dest, content, {delay: 0, deleteDelay})
      }, delay)
    }

    let msgRem = ''
    if (content.length > 2000) {
      content = content.match(/.{1,20000}/g)
      msgRem = content.shift()
      content = content.join('')
    }

    return new Promise((res, rej) => {
      /**
      hydrabolt has reported that sending messages will be different in the
      future. hence, i'm just changing it earlier according to what he said.

      dest.sendMessage(content, (err, msg) => {
        if (err) return rej(err)

        if (deleteDelay) {
          dest.deleteMessage(msg, {wait: delay}, err => {
            if (err) return rej(err)
            if (!msgRem) res()
          })

          if (!msgRem) return
        }

        if (msgRem) {
          return this.send(dest, msgRem, options)
            .then(msg => {
              return res(Array.isArray(msg) ? msg.concat(msg) : [msg])
            })
            .catch(rej)
        }

        res(msg)
      })

      if you haven't noticed, it means that instead of:
        client.sendMessage(channel, content)
      it's now:
        channel.sendMessage(content)

      this will affect all other classes.
      other changes:
        - servers will be named guilds (following discord developers)

      there should be a guide on transitioning from 7.0.0 to rewrite
      **/
      this.client.sendMessage(dest, content, (err, msg) => {
        if (err) return rej(err)

        if (deleteDelay) {
          this.client.deleteMessage(msg, {wait: delay}, err => {
            if (err) return rej(err)
            if (!msgRem) res(msg)
          })

          if (!msgRem) return
        }

        if (msgRem) {
          return this.send(dest, msgRem, options)
            .then(msg => {
              return res(Array.isArray(msg) ? msg.concat(msg) : [msg])
            })
            .catch(rej)
        }

        res(msg)
      })
    })
  }

  upload (attachment, name, channel) {
    channel = channel || this.channel
    return new Promise((res, rej) => {
      this.client.sendFile(channel, attachment, name)
      .then(msg => res(msg))
      .catch(err => rej(err))
    })
  }

  handle () {
    throw new Error('Commands must override message handler')
  }

  checkPrivateAndAdminOnly () {
    if (this.noPrivate && this.isPM) {
      this.reply('This command cannot be run via PMs.')
      return false
    }
    if (this.adminOnly === true && !this.isAdmin()) {
      return false
    }

    return true
  }

  prettyPrint (regex, matches) {
    let commandInfo = prettyjson.render({
      Command: {
        time: this.time,
        sender: this.sender.username,
        server: typeof this.server === 'undefined'
          ? undefined : this.server.name,
        channel: typeof this.channel === 'undefined'
          ? undefined : this.channel.name,
        content: this.content,
        botMention: this.isBotMentioned,
        pm: this.isPM,
        regex: regex ? regex.toString() : '',
        matches: matches,
        mentions: this.mentions
      }
    })
    return commandInfo
  }

  getMatches (content, regex, cb, noPrint) {
    let matches = regex.exec(content)

    if (matches === null || !this.checkPrivateAndAdminOnly()) {
      return false
    }

    let result = cb(matches)

    if (!noPrint && result !== false) {
      this.logger.debug(`\n${this.prettyPrint(regex, matches)}`)
    }
  }

  hears (regex, callback) {
    let noPrint = !this.container.get('debug')
    return this.getMatches(this.rawContent, regex, callback, noPrint)
  }

  responds (regex, callback) {
    if (!this.isBotMentioned) {
      return
    }
    let noPrint = !this.container.get('debug')
    return this.getMatches(this.content, regex, callback, noPrint)
  }
}

module.exports = BaseCommand
