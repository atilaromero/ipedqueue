'use strict'

const debug = require('debug')('ipedqueue:queue')
const wagner = require('wagner-core')
const Promise = require('bluebird')
const os = require('os')

exports.getServerID = () => {
  let ifaces = os.networkInterfaces()
  let names = Object.keys(ifaces)
    .filter(x => (ifaces[x][0].family === 'IPv4'))
    .filter(x => (ifaces[x][0].internal === false))
  return ifaces[names[0]][0].address
}

exports.resetState = () => {
  return wagner.invoke((Material) => {
    return Material.find({
      state: 'running',
      running_on: exports.getServerID()
    })
    .then(docs => {
      return Promise.each(docs, doc => {
        doc.state = 'failed'
        return doc.save()
      })
    })
  })
}

exports.singleProcess = () => {
  return wagner.invoke((Material) => {
    return Material.findOne({
      state: 'todo'
    })
    .then(doc => {
      if (!doc) {
        return Promise.reject()
      }
      let job = {
        data: doc,
        serverID: exports.getServerID(),
        log: console.log
      }
      return new Promise((resolve) => {
        debug('found job', job)
        require('./material-iped')(job, resolve)
      })
      .then(() => {
        debug('job done', job)
      })
    })
  })
}

wagner.invoke((config) => {
  exports.monitor = () => {
    return exports.singleProcess()
    .catch(reason => {
      return new Promise((resolve) => {
        setTimeout(function () {
          debug('polling jobs')
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
