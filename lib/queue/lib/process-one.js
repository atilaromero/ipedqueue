'use strict'

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const debug = require('debug')('queue:process-one')
const mongoose = require('mongoose')
const getServerID = require('./get-server-id')

module.exports = function processOne (doc) {
  const tasks = require('../').tasks
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
    .catch((err) => {
      debug(err)
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
      return Promise.each(tasks, (task) => {
        doc.stage = task.name
        return doc.save()
        .then(() => {
          return task(job)
        })
      })
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
