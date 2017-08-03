'use strict'

const debug = require('debug')('ipedqueue:queue/permissions')
const path = require('path')
const spawn = require('child-process-promise').spawn
const axios = require('axios')
const config = require('config')

module.exports = function permissions (job) {
  let dirname = path.dirname(job.data.path)
  const url = `${config.EVENTS_URL}v2/events`
  return axios.post(url, {
    channel: 'permissions',
    type: 'permissions started',
    evidence: job.data.id
  })
  .then(() => {
    let command = 'chmod'
    let options = [ '-cR', 'a+rX', dirname + '/SARD/' ]
    let promise = spawn(command, options)
    let child = promise.childProcess
    debug(child.spawnargs)
    child.stdout.on('data', (data) => debug('stdout', data.toString()))
    child.stderr.on('data', (data) => debug('stderr', data.toString()))
    return promise
  })
  .then(() => {
    let command = 'chmod'
    let options = [ '-c', 'a+rx', dirname + '/SARD/IPED-SearchApp.exe' ]
    let promise = spawn(command, options)
    let child = promise.childProcess
    debug(child.spawnargs)
    child.stdout.on('data', (data) => debug('stdout', data.toString()))
    child.stderr.on('data', (data) => debug('stderr', data.toString()))
    return promise
  })
  .then(() => {
    return axios.post(url, {
      channel: 'permissions',
      type: 'permissions done',
      evidence: job.data.id
    })
  })
  .catch((err) => {
    axios.post(url, {
      channel: 'permissions',
      type: 'permissions error',
      evidence: job.data.id,
      error: err
    })
    return Promise.reject(err)
  })
}
