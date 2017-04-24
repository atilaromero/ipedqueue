'use strict'

const debug = require('debug')('ipedqueue:queue/ewfacquire')
const path = require('path')
const Promise = require('bluebird')
const spawn = require('child-process-promise').spawn

module.exports = function dd2ewf (doc) {
  let dirname = path.dirname(doc.path)
  let basename = path.basename(doc.path)
  let target = doc.path.replace(/\.dd$/, '')
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
    doc.path // source
  ]
  if (doc.path.endsWith('.dd')) {
    let promise = spawn(command, options)
    let child = promise.childProcess
    debug(child.spawnargs)
    child.stdout.on('data', (data) => debug('stdout', data.toString()))
    child.stderr.on('data', (data) => debug('stderr', data.toString()))
    return promise
    .then(() => {
      doc.path = target + '.E01'
      return doc.save()
    })
    .then(() => {
      doc.path = target + '.E01'
    })
  } else {
    return Promise.resolve()
  }
}
