'use strict'
require('babel-core/register')
require('babel-polyfill')
var assert = require('chai').assert
var path = require('path')
var chalk = require('chalk')

var Bot = require('../lib').Bot
var client = new Bot(false, {
  'token': process.env['discord_token'],
  'prefix': '!'
}, true)

if (typeof process.env['discord_token'] !== 'undefined') {
  describe('Initialisation', function () {
    describe('#login()', function () {
      this.timeout(30000)
      it('should login to Discord and fire on ready event', function (done) {
        var check = function () {
          setTimeout(function () {
            if (typeof client.container.get('discord') !== 'undefined') {
              done()
            } else {
              check()
            }
          }, 100)
        }
        check()
      })

      it('should register external clients', function (done) {
        setTimeout(function () {
          assert.isObject(client.container.get('clients'))
          done()
        }, 5000)
      })
    })

    describe('#prepare()', function () {
      it('should have a logger', function () {
        assert.isObject(client.container.get('logger'))
      })

      it('should have a message handler', function () {
        assert.isObject(client.container.get('handler'))
      })
    })
  })

  if (typeof process.env['channel_id'] !== 'undefined') {
    describe('Messaging', function () {
      this.timeout(10000)
      describe('#send()', function (done) {
        it('should send a message to the channel', function (done) {
          var discord = client.container.get('discord')
          var text = discord.channels.get('id', process.env['channel_id'])
          text.sendMessage('This is a test. Please ignore this message.', function (err, msg) {
            if (err) return done(err)
            done()
          })
        })

        it('should upload a file to the channel', function (done) {
          var discord = client.container.get('discord')
          var text = discord.channels.get('id', process.env['channel_id'])
          discord.sendFile(text, path.join(__dirname, 'sylphy.jpg'), 'sylphy.jpg', function (err, msg) {
            if (err) return done(err)
            done()
          })
        })
      })
    })
  }

  if (typeof process.env['voice_id'] !== 'undefined') {
    describe('Voice', function () {
      this.timeout(10000)
      describe('#connect()', function (done) {
        it('should join the voice channel', function (done) {
          var discord = client.container.get('discord')
          var voice = discord.channels.get('id', process.env['voice_id'])
          discord.joinVoiceChannel(voice, function (err, conn) {
            if (err) return done(err)
            done()
          })
        })
      })
    })
  }
} else {
  console.log(`Missing ${chalk.red('\'discord_token\'')} in env. Terminating test.`)
  process.exit(1)
}
