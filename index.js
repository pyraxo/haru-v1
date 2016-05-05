'use strict'
require('babel-core/register')
require('babel-polyfill')

const Bot = require('./lib').Bot
let env = process.env

let debug = {
  'production': true,
  'development': false
}

let bot = new Bot(!debug[env.NODE_ENV])
