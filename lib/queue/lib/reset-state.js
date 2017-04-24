'use strict'

const mongoose = require('mongoose')
const serverID = require('./server-id')
const Promise = require('bluebird')

module.exports = function resetState () {
  return mongoose.models.material.find({
    state: 'running',
    run_at: serverID
  })
  .then(docs => {
    return Promise.each(docs, doc => {
      doc.state = 'failed'
      return doc.save()
    })
  })
}
