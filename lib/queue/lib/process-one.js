'use strict'

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const debug = require('debug')('ipedqueue:process-one')
const mongoose = require('mongoose')
const serverID = require('./server-id')

module.exports = function processOne (doc) {
  const tasks = require('../').tasks
  return Promise.resolve(doc)
  .then(doc => {
    if (!doc) { return Promise.reject() }
    return doc
  })
  .then(doc => {
    // if run_at is filled, I will only run the job if it is for me
    if (doc.run_at && doc.run_at !== serverID) {
      return Promise.reject()
    }
    return doc
  })
  .then(doc => {
    // Reject non existent path
    return fs.statAsync(doc.path)
    .then((stat) => {
      return doc
    })
    .catch((err) => {
      debug(err)
      doc.state = 'hold'
      doc.obs = 'State TODO with invalid path - waiting correction'
      return doc.save()
      .then(() => {
        return Promise.reject()
      })
    })
  })
  .then(doc => {
    debug('found job:', doc)
    return mongoose.models.material.update({
      _id: doc._id,
      state: 'todo'
    }, {$set: {
      state: 'running',
      run_at: serverID
    }})
    .then(() => {
      return Promise.each(tasks, (task) => {
        doc.stage = task.name
        return doc.save()
        .then(() => {
          return task(doc)
        })
      })
    })
    .then(() => {
      debug('job done', doc)
      return mongoose.models.material.update({
        _id: doc._id,
        state: 'running'
      }, {$set: {
        state: 'done'
      }})
    })
    .catch(err => {
      debug('job error: ' + err.toString())
      return mongoose.models.material.update({
        _id: doc._id,
        state: 'running'
      }, {$set: {
        state: 'failed'
      }})
    })
  })
}
