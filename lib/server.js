'use strict'

const config = require('config')
const app = require('./app')
const queue = require('./queue')
require('./connect-with-retry')

app.listen(config.listenport)
queue.resetState()
queue.monitor()
