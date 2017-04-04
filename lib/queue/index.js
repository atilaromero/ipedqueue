'use strict'

const debug = require('debug')('ipedqueue:queue')
const wagner = require('wagner-core')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const os = require('os')

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
  return wagner.invoke((Material) => {
    return Material.find({
      state: 'running',
      run_at: exports.getServerID()
    })
    .then(docs => {
      return Promise.each(docs, doc => {
        doc.state = 'failed'
        return doc.save()
      })
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
    return wagner.invoke((Material) => {
      return Material.changeState(job.data._id, 'todo', 'running', job.serverID)
      .then(() => {
        return require('./hashes-image')(job)
      })
      .then(() => {
        return require('./dd2ewf')(job)
      })
      .then(() => {
        return require('./runiped')(job)
      })
      .then(() => {
        return require('./hashes-dir')(job)
      })
      .then(() => {
        debug('job done', job)
        return Material.changeState(job.data._id, 'running', 'done', job.serverID)
      })
      .catch(err => {
        debug('job error: ' + err.toString())
        return Material.changeState(job.data._id, 'running', 'failed', job.serverID)
      })
    })
  })
}

exports.singleProcess = () => {
  return wagner.invoke((Material) => {
    return Material.find({
      state: 'todo',
      run_at: exports.getServerID()
    }).sort({
      nice: 1
    }).findOne()
    .then(processOne)
    .catch(() => {
      return Material.find({
        state: 'todo',
        run_at: {$in: ['', null]}
      }).sort({
        nice: 1
      }).findOne()
      .then(processOne)
    })
  })
}

debug('ServerID:', exports.getServerID())
wagner.invoke((config) => {
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

  wagner.constant('queue', exports)
})
