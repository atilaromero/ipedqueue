'use strict'

const debug = require('debug')('ipedqueue:queue/ewfacquire')
const path = require('path')
const Promise = require('bluebird')
const spawn = require('child-process-promise').spawn
const config = require('config')
const axios = require('axios')

module.exports = function dd2ewf (job) {
  let dirname = path.dirname(job.data.path)
  let basename = path.basename(job.data.path)
  let target = job.data.path.replace(/\.dd$/, '')
  let command = 'ewfacquire'
  let options = [
    '-t', target, // target without extension
    '-c', 'fast', // compression level
    '-f', 'encase6', // default format
    '-S', '7EiB', // split segment size
    '-b', '8192', // sectors to read at once 8192*512=4M, 4M is default cephfs block size
    '-g', '8192', // sectors of error granularity
    '-u', // unattended mode
    '-e', 'ewfacquire', // examiner_name
    '-E', basename, // evidence number
    '-m', 'fixed', // media type
    '-l', dirname + '/ewfacquire.log', // log
    job.data.path // source
  ]
  if (job.data.path.endsWith('.dd')) {
    const url = `${config.EVENTS_URL}v1/evidence/${job.data.id}/events`
    return axios.post(url, {event: 'dd2ewf started'})
    .then(() => {
      let promise = spawn(command, options)
      let child = promise.childProcess
      debug(child.spawnargs)
      child.stdout.on('data', (data) => debug('stdout', data.toString()))
      child.stderr.on('data', (data) => debug('stderr', data.toString()))
      return promise
    })
    .then(() => {
      job.data.path = target + '.E01'
      return job.data.save()
    })
    .then(() => {
      job.data.path = target + '.E01'
    })
    .then(() => {
      return axios.post(url, {event: 'dd2ewf done'})
    })
    .catch((err) => {
      axios.post(url, {event: 'dd2ewf error', details: err})
      return Promise.reject(err)
    })
  } else {
    return Promise.resolve()
  }
}
