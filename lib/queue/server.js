'use strict'

const config = require('config')
const opencaseCore = require('../core')
opencaseCore.mkModel()
opencaseCore.connect(config.mongodb.host, config.mongodb.port, config.mongodb.db)
const queue = require('./')

queue.resetState()
queue.chooseOne().then(queue.processOne)
