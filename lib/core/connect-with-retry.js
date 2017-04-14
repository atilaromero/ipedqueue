'use strict'

const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
const Promise = require('bluebird')
const debug = require('debug')('connect-with-retry')

let connectWithRetry = (host, port, db) => {
  let url = `mongodb://${host}:${port}/${db}`
  debug('connecting to', url)
  return new Promise((resolve, reject) => {
    let loop = () => {
      mongoose.connect(url, function (err) {
        if (err) {
          console.error('Failed to connect to mongo - retrying in 1 sec', err)
          setTimeout(loop, 1000)
        } else {
          debug('connected to', url)
          resolve()
        }
      })
    }
    loop()
  })
}
module.exports = connectWithRetry
