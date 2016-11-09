'use strict'

var wagner = require('wagner-core')
var express = require('express')
var compression = require('compression')
var baucis = require('baucis')
var messa = require('messa')

require('./config')(wagner)
require('./models/')(wagner)
require('./queue/')

module.exports = (wagner) => {
  wagner.factory('app', (Material, config, mongoose) => {
    let app = express()
    app.use(compression())

    app.use('/', (req, res, next) => {
      res.charset = 'utf-8'
      next()
    })

    baucis.rest(Material)
    app.use('/api/', baucis())

    // app.use('/cmd/', require('./cmd'))

    app.use('/messa/', messa(mongoose))

    app.get('/', (req, res) => {
      res.sendFile(require('path').join(__dirname, '/index.html'))
    })

    return app
  })
}
