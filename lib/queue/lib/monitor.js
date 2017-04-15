'use strict'

const debug = require('debug')('queue:monitor')
const config = require('config')
const processOne = require('./process-one')
const chooseOne = require('./choose-one')
const Promise = require('bluebird')

module.exports.monitor = () => {
  return chooseOne()
  .then(processOne)
  .catch(reason => {
    if (reason) {
      debug(reason)
    }
    return new Promise((resolve) => {
      setTimeout(function () {
        // debug('polling jobs')
        resolve()
      }, config.polling_interval)
    })
  })
  .then(() => {
    return exports.monitor()
  })
}
