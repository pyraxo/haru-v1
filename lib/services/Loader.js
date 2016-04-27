import { Client as Discord } from 'discord.js'
import rq from 'require-all'
import chalk from 'chalk'
import path from 'path'
import { EventEmitter } from 'events'
import MessageHandler from './MessageHandler'

class Loader extends EventEmitter {
  constructor (container) {
    super()

    this.container = container
    this.logger = container.get('logger')
    this.loaded = {
      clients: false,
      discord: false
    }
    this.on('loaded', () => this.checkLoaded.bind(this))
    this.failCheck = setTimeout(this.checkLoaded.bind(this), 30000)
  }

  start () {
    this.loadDiscord()
    this.on('loaded.discord', () => {
      this.loadClients()
    })
  }

  loadClients () {
    let clients = rq({
      dirname: path.join(process.cwd(), 'lib/clients'),
      filter: /(.+)\.js$/
    })
    for (let Client in clients) {
      if (clients.hasOwnProperty(Client)) {
        let client = new clients[Client](this.container)
        this.container.clients[client.name] = client
        try {
          this.container.clients[client.name].run()
        } catch (err) {
          this.logger.error(
            `Error while running client ${client.name}:\n`, err
          )
        }
      }
    }

    this.setLoaded('clients')
  }

  /** Dropping support for email, since it will be unsupported by Discord
  loginWithEmail (client, auth) {
    let logger = this.logger
    client.login(auth.email, auth.password)
    .then(() => {
      this.container.set('discord', client)
      this.setLoaded('discord')
    })
    .catch(err => {
      logger.error(
        'Error caught while connecting to Discord servers:\n', err
      )
    })
  }
  **/

  loadDiscord () {
    let auth = {
      email: this.container.getParam('email'),
      password: this.container.getParam('password'),
      token: this.container.getParam('token')
    }

    let logger = this.logger
    let client = new Discord({
      autoReconnect: true
    })
    let handler = this.container.set(
      'handler', new MessageHandler(this.container, client)
    )

    client.on('ready', () => {
      this.setLoaded('discord')
      this.container.set('discord', client)
      let admins = this.container.getParam('admin_id')
      if (admins) {
        client.admins = []
        admins.forEach(elem => {
          client.admins.push(elem)
        })
      }
      logger.info(
        `Connecting as ${chalk.red(client.user.name)} <@${client.user.id}>`
      )
      logger.info(
        `${client.servers.length} servers and ` +
        `${client.users.length} users in cache`
      )
      logger.info(`Prefix: '${this.container.getParam('prefix')}'`)
    })

    client.on('error', logger.error)
    client.on('disconnect', () => logger.info(`
      ${chalk.red(client.user.name)} has been disconnected`
    ))
    if (this.debug === true) {
      client.on('debug', msg => logger.debug(msg))
    }

    client.on('message', msg => {
      handler.handleMessage(msg)
    })
    // client.on('messageUpdated', handler.updatedMessage)

    if (auth.token) {
      client.loginWithToken(auth.token, auth.email, auth.password)
      .catch(err => {
        logger.error('Error caught while connecting with token:\n', err)
        // this.loginWithEmail(client, auth)
      })
    /**
    } else {
      this.loginWithEmail(client, auth)
    **/
    }
  }

  setLoaded (type) {
    this.loaded[type] = true
    this.emit('loaded.' + type)

    this.emit('loaded')
  }

  checkLoaded (fail) {
    this.emit('checkLoaded')
    fail = typeof fail !== 'undefined'

    if (fail) {
      throw new Error(
        'Failed initializing. Loaded: ' + JSON.stringify(this.loaded, null, 2)
      )
    }

    this.logger.debug('Loader status:\n', {
      Ready: this.isLoaded() ? 'Yes' : 'No',
      Discord: this.loaded.discord ? 'Logged in' : 'Logging in',
      Client: this.loaded.clients ? 'Loaded clients' : 'Starting clients'
    })

    if (!this.isLoaded()) {
      return false
    }

    clearTimeout(this.failCheck)
    delete this.failCheck

    setTimeout(() => {
      this.logger.debug('Finished loading. Emitting ready event')
      this.emit('ready')
    }, 1500)
  }

  isLoaded () {
    return this.loaded.discord && this.loaded.clients
  }
}

module.exports = Loader
