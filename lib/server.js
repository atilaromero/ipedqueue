'use strict'

const config = require('config')
const opencaseCore = require('./core')
require('baucis')
opencaseCore.mkModel()
opencaseCore.connect(config.mongodb.host, config.mongodb.port, config.mongodb.db)
const app = require('./app')
const queue = require('./queue')

app.listen(config.listenport, () => {
  console.log('Listening at %s', config.listenport)
})
queue.resetState()
queue.monitor()
