'use strict'

const config = require('config')
const app = require('./app')
require('./connect-with-retry')

app.listen(config.listenport)
