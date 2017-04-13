'use strict'

// const debug = require('debug')('ipedqueue:queue/ewfacquire')
const runProc = require('../runProc')
const path = require('path')
const Promise = require('bluebird')
const Material = require('../models/material')

module.exports = (job) => {
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
    return runProc(command, options)
    .then(() => {
      return Material.findById(job.data._id)
    })
    .then(function (doc) {
      doc.path = target + '.E01'
      return doc.save()
    })
    .then(() => {
      job.data.path = target + '.E01'
    })
  } else {
    return Promise.resolve()
  }
}
