'use strict'

const config = require('config')
const mongoose = require('mongoose')
const opencaseCore = require('../core')
opencaseCore.mkModel()
opencaseCore.connect(config.mongodb.host, config.mongodb.port, config.mongodb.db)
const queue = require('./')
const app = require('express').Router()

app.use('/health', (req, res) => {
  res.json({status: 'ok'})
})

app.use('/readiness', (req, res) => {
  res.json({status: 'ok'})
})

queue.resetState()
queue.chooseOne().then(queue.processOne)
.finally(() => {
  mongoose.connection.close()
})
