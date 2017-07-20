'use strict'

const debug = require('debug')('ipedqueue:queue/permissions')
const path = require('path')
const spawn = require('child-process-promise').spawn
const axios = require('axios')
const config = require('config')

module.exports = function permissions (job) {
  let dirname = path.dirname(job.data.path)
  const url = `${config.EVENTS_URL}v1/evidence/${job.data.id}/events`
  return axios.post(url, {event: 'permissions started'})
  .then(() => {
    let command = 'chmod'
    let options = [ '-vR', 'a+rX', dirname + '/SARD/' ]
    let promise = spawn(command, options)
    let child = promise.childProcess
    debug(child.spawnargs)
    child.stdout.on('data', (data) => debug('stdout', data.toString()))
    child.stderr.on('data', (data) => debug('stderr', data.toString()))
    return promise
  })
  .then(() => {
    let command = 'chmod'
    let options = [ '-v', 'a+rx', dirname + '/SARD/Ferramenta de Pesquisa.exe' ]
    let promise = spawn(command, options)
    let child = promise.childProcess
    debug(child.spawnargs)
    child.stdout.on('data', (data) => debug('stdout', data.toString()))
    child.stderr.on('data', (data) => debug('stderr', data.toString()))
    return promise
  })
  .then(() => {
    return axios.post(url, {event: 'permissions done'})
  })
  .catch((err) => {
    axios.post(url, {event: 'permissions error', details: err})
    return Promise.reject(err)
  })
}
