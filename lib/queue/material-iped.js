'use strict'

const debug = require('debug')('ipedqueue:queue/material-iped')
const runIPED = require('./runiped')
const wagner = require('wagner-core')
const path = require('path')

module.exports = (job, done) => {
  wagner.invoke((Material, config) => {
    Promise.resolve()
    .then(() => {
      return Material.changeState(job.data._id, 'todo', 'running', job.serverID)
    })
    .then(() => {
      let basedir = path.dirname(job.data.path)
      let ipedfolder = path.join(basedir, 'SARD')
      let result = runIPED(config, basedir, ipedfolder, job.data)
      result.event.on('data', (data) => {
        debug(data)
      })
      result.event.on('error', err => {
        job.log(err)
        debug(err)
        result.throw(err)
      })
      return result
    })
    .then(() => {
      return Material.changeState(job.data._id, 'running', 'done')
    })
    .then(() => { done() })
    .catch(code => {
      debug('runIPED error: ' + code.toString())
      return Material.changeState(job.data._id, 'running', 'failed')
      .then(() => {
        done(new Error(code))
      })
    })
    .catch(err => {
      console.log('error saving failed state: ' + err.toString())
      done(new Error(err))
    })
  })
}
