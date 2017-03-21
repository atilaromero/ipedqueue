'use strict'

var wagner = require('wagner-core')
var express = require('express')
var compression = require('compression')
var baucis = require('baucis')
var messa = require('messa')

// /api/swagger.json
require('baucis-swagger2')

require('./config')(wagner)
require('./models/')
require('./queue/')

module.exports =
  wagner.factory('app', (Material, Devid, config, mongoose) => {
    let app = express()
    app.use(compression())

    // allows CORS
    app.use(function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      next()
    })

    app.use('/', (req, res, next) => {
      res.charset = 'utf-8'
      next()
    })

    baucis.rest(Material)
    baucis.rest(Devid)
    let baucisInstance = baucis()
    baucisInstance.generateSwagger2()
    baucisInstance.swagger2Document.info.title = 'Ipedqueue api'
    baucisInstance.swagger2Document.info.description = 'User interface: <a href=./messa>Edit data</a>'
    app.use('/api/', baucisInstance)

    app.use('/messa/', express.static('messa-rewrite'))
    app.use('/messa/', messa(mongoose))

    require('express-swagger-ui')({
      app: app,
      swaggerUrl: '/api/swagger.json',
      localPath: '/'
    })

    return app
  })
