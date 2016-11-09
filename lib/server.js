'use strict'

var wagner = require('wagner-core')
// require('debug').enable('ipedqueue:*')

require('./app')(wagner)

wagner.invoke((config, app, Material) => {
  app.listen(config.listenport)
  Material.resetProcessamento()
  Material.monitor()
})
