'use strict'

const mongoose = require('mongoose')
const getServerID = require('./get-server-id')
const Promise = require('bluebird')

module.exports = function resetState () {
  return mongoose.models.material.find({
    state: 'running',
    run_at: getServerID()
  })
  .then(docs => {
    return Promise.each(docs, doc => {
      doc.state = 'failed'
      return doc.save()
    })
  })
}
