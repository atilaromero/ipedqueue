'use strict'

module.exports.chooseOne = require('./lib/choose-one')
module.exports.processOne = require('./lib/process-one')
module.exports.resetState = require('./lib/reset-state')
module.exports.monitor = require('./lib/monitor')
module.exports.tasks = [
  require('./tasks/hashlog'),
  require('./tasks/dd2ewf'),
  require('./tasks/iped')
]
