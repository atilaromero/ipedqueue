'use strict'

const mongoose = require('mongoose')
const getServerID = require('./get-server-id')

module.exports = function chooseOne () {
  return mongoose.models.material.find({
    state: 'todo',
    run_at: getServerID()
  }).sort({
    nice: 1
  })
  .findOne()
  .catch(() => {
    return mongoose.models.material.find({
      state: 'todo',
      run_at: {$in: ['', null]}
    }).sort({
      nice: 1
    })
    .findOne()
  })
}
