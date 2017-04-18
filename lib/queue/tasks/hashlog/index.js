'use strict'

const debug = require('debug')('ipedqueue:queue/hashlog')
const path = require('path')
const exec = require('child_process').exec
const spawn = require('child-process-promise').spawn
const fs = require('fs-extra')
const Promise = require('bluebird')

function hashlogDone (path, size) {
  return new Promise((resolve, reject) => {
    fs.stat(path, function (err) {
      if (!err) { // hashlog exists
        exec(
          `cat '${path}' | sed -e '/^#/d' | wc -l`,
          (err, stdout, stderr) => {
            if (err) {
              debug(stderr)
              resolve(false)
            } else {
              let expected = Math.ceil(size / 1073741824) + 1
              let observed = Number(stdout)
              let result = (expected === observed)
              debug('correct line count:', result)
              if (!result) {
                debug('expected:', expected)
                debug('observed:', observed)
                debug('image size:', size)
              }
              resolve(result)
            }
          }
        )
      } else {
        debug('file does not exist:', path)
        resolve(false)
      }
    })
  })
}

module.exports = function hashlog (job) {
  let workdir = path.dirname(job.data.path)
  return Promise.promisify(fs.stat)(job.data.path)
  .then((stats) => {
    let hashlogPath = path.join(workdir, 'hashlog.md5')
    if (job.data.path.endsWith('E01')) {
      // if dealing with E01, existing hashlogs prevail
      // if hashlogPath exists, fs.stat will return data
      // , which will be treated as isdone == true
      return Promise.promisify(fs.stat)(hashlogPath)
    } else {
      // for regular dd files, compare hashlog line count with image size
      return hashlogDone(hashlogPath, stats.size)
    }
  })
  .then((isdone) => {
    if (!isdone) {
      let promise = spawn(path.join(__dirname, 'hash/parallelhash.sh'), [job.data.path])
      let child = promise.childProcess
      debug(child.spawnargs)
      child.stdout.on('data', (data) => debug('stdout', data.toString()))
      child.stderr.on('data', (data) => debug('stderr', data.toString()))
      return promise
    }
  })
}
