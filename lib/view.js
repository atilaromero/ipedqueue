'use strict'

const config = require('config')
const wagner = require('wagner-core')
// require('debug').enable('ipedqueue:*')

require('./app')
require('./connect-with-retry')

wagner.invoke((app, queue) => {
  app.listen(config.listenport)
})
