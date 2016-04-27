'use strict'
require('babel-core/register')
require('babel-polyfill')
var expect = require('chai').expect

var Bot = require('../src').Bot

describe('Initialisation', function () {
  describe('#login()', function () {
    it('should login the client', function () {
      var client = new Bot(false, {
        'token': process.env['discord_token'],
        'prefix': '!'
      })
      setTimeout(function () {
        expect(client).to.have.deep.property('discord')
      }, 10)
    })
  })
})
