'use strict'

const processOne = require('./process-one')
const chooseOne = require('./choose-one')

module.exports = function monitor () {
  return chooseOne()
  .then(processOne)
  .then(monitor)
}
