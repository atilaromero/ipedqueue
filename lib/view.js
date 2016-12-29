'use strict'

var wagner = require('wagner-core')
// require('debug').enable('ipedqueue:*')

require('./app')

wagner.invoke((config, app, queue) => {
  app.listen(config.listenport)
})
