'use strict'

var wagner = require('wagner-core')
var express = require('express')
var compression = require('compression')
var baucis = require('baucis')
var messa = require('messa')

require('./config')(wagner)
require('./models/')(wagner)
require('./kue')(wagner)
require('./queue')(wagner)

module.exports = (wagner) => {
  wagner.factory('app', (Matgroup, Material, config, kue, queue, mongoose) => {
    let app = express()
    app.use(compression())

    app.use('/', (req, res, next) => {
      res.charset = 'utf-8'
      next()
    })

    app.use('/queue/', kue.app)

    baucis.rest(Material)
    baucis.rest(Matgroup)
    app.use('/api/', baucis())

    app.use('/messa/', messa(mongoose))

    app.get('/', (req, res) => {
      res.sendFile(require('path').join(__dirname, '/index.html'))
    })

    return app
  })
}
