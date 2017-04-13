'use strict'

const config = require('config')
const wagner = require('wagner-core')
// require('debug').enable('ipedqueue:*')

require('./app')

wagner.invoke((app, queue) => {
  app.listen(config.listenport)
  queue.resetState()
  queue.monitor()
})
