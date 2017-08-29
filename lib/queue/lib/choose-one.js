'use strict'

const mongoose = require('mongoose')
const getServerID = require('./get-server-id')
// const debug = require('debug')('ipedqueue:chooseOne')
const config = require('config')
const Promise = require('bluebird')

module.exports = function chooseOne () {
  const nicer = new Promise(resolve => {
    mongoose.models.material.collection.updateMany({nice: {$exists: false}}, {$set: {nice: 0}}, resolve)
  })
  return nicer
  .then(() => {
    return mongoose.models.material.find({
      state: 'todo',
      run_at: getServerID()
    }).sort({
      nice: 1
    })
    .findOne()
  })
  .then((x) => {
    if (x) {
      return x
    } else {
      return mongoose.models.material.find({
        state: 'todo',
        run_at: {$in: ['', null]}
      }).sort({
        nice: 1
      })
      .findOne()
    }
  })
  .then((x) => {
    if (x) {
      return x
    } else {
      return new Promise((resolve) => {
        setTimeout(function () {
          // debug('polling jobs')
          resolve()
        }, config.polling_interval)
      })
      .then(chooseOne)
    }
  })
}
