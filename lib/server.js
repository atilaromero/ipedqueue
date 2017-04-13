'use strict'

const config = require('config')
const wagner = require('wagner-core')
const app = require('./app')
require('./connect-with-retry')

wagner.invoke((queue) => {
  app.listen(config.listenport)
  queue.resetState()
  queue.monitor()
})
