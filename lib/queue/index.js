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
        doc.state = 'todo'
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

exports.monitor = () => {
  exports.singleProcess()
  .catch(reason => {
    return new Promise((resolve) => {
      setTimeout(function () {
        debug('polling jobs')
        resolve()
      }, 2000)
    })
  })
  .then(() => {
    return exports.monitor()
  })
}

wagner.constant('queue', exports)
