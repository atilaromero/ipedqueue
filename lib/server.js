'use strict'

var wagner = require('wagner-core')

require('./app')(wagner)

wagner.invoke((config, app) => {
  app.listen(config.listenport)
})
