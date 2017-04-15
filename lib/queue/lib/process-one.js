'use strict'

const getServerID = require('./get-server-id')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const debug = require('debug')('queue:process-one')
const mongoose = require('mongoose')

module.exports = function processOne (doc) {
  return Promise.resolve(doc)
  .then(doc => {
    if (!doc) { return Promise.reject() }
    return doc
  })
  .then(doc => {
    let job = {
      data: doc,
      serverID: getServerID(),
      log: console.log.bind(console)
    }
    return job
  })
  .then(job => {
    // if run_at is filled, I will only run the job if it is for me
    if (job.data.run_at && job.data.run_at !== job.serverID) {
      return Promise.reject()
    }
    return job
  })
  .then(job => {
    // Reject non existent path
    return fs.statAsync(job.data.path)
    .then((stat) => {
      return job
    })
    .catch(() => {
      debug('caminho inexistente: ' + job.data.path)
      job.data.state = 'hold'
      job.data.obs = 'State TODO with invalid path - waiting correction'
      return job.data.save()
      .then(() => {
        return Promise.reject()
      })
    })
  })
  .then(job => {
    debug('found job:', job)
    return mongoose.models.material.update({
      _id: job.data._id,
      state: 'todo'
    }, {$set: {
      state: 'running',
      run_at: job.serverID
    }})
    .then(() => {
      doc.stage = 'hashlog'
      return doc.save()
    })
    .then(() => {
      return require('./tasks/hashlog')(job)
    })
    .then(() => {
      doc.stage = 'dd2ewf'
      return doc.save()
    })
    .then(() => {
      return require('./dd2ewf')(job)
    })
    .then(() => {
      doc.stage = 'iped'
      return doc.save()
    })
    .then(() => {
      return require('./iped')(job)
    })
    .then(() => {
      debug('job done', job)
      return mongoose.models.material.update({
        _id: job.data._id,
        state: 'running'
      }, {$set: {
        state: 'done'
      }})
    })
    .catch(err => {
      debug('job error: ' + err.toString())
      return mongoose.models.material.update({
        _id: job.data._id,
        state: 'running'
      }, {$set: {
        state: 'failed'
      }})
    })
  })
}
