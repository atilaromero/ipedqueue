'use strict'

const debug = require('debug')('ipedqueue:queue')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const os = require('os')
const config = require('config')
const mongoose = require('mongoose')

exports.getServerID = () => {
  let ifaces = os.networkInterfaces()
  let names = Object.keys(ifaces)
    .filter(x => (ifaces[x][0].family === 'IPv4'))
    .filter(x => (ifaces[x][0].internal === false))
  let names2 = names.filter((x) => !x.startsWith('docker'))
  if (names2.length > 0) {
    names = names2
  }
  return ifaces[names[0]][0].address
}

exports.resetState = () => {
  return mongoose.models.material.find({
    state: 'running',
    run_at: exports.getServerID()
  })
  .then(docs => {
    return Promise.each(docs, doc => {
      doc.state = 'failed'
      return doc.save()
    })
  })
}

function processOne (doc) {
  return Promise.resolve(doc)
  .then(doc => {
    if (!doc) { return Promise.reject() }
    return doc
  })
  .then(doc => {
    let job = {
      data: doc,
      serverID: exports.getServerID(),
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
      return require('./hashes-image')(job)
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
      return require('./runiped')(job)
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

exports.singleProcess = () => {
  return mongoose.models.material.find({
    state: 'todo',
    run_at: exports.getServerID()
  }).sort({
    nice: 1
  }).findOne()
  .then(processOne)
  .catch(() => {
    return mongoose.models.material.find({
      state: 'todo',
      run_at: {$in: ['', null]}
    }).sort({
      nice: 1
    }).findOne()
    .then(processOne)
  })
}

debug('ServerID:', exports.getServerID())
exports.monitor = () => {
  return exports.singleProcess()
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
