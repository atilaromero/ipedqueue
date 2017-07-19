'use strict'

const config = require('config')
const core = require('./core')
require('baucis')
core.mkModel()
core.connect(config.mongodb.host, config.mongodb.port, config.mongodb.db)
const app = require('./app')
const queue = require('./queue')

app.listen(config.listenport, () => {
  console.log('Listening at %s', config.listenport)
})
queue.resetState()
queue.monitor()
