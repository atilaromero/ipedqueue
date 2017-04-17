'use strict'

const queue = require('./queue')
require('./connect-with-retry')

queue.resetState()
queue.singleProcess()
