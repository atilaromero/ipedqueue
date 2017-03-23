'use strict'

const debug = require('debug')('ipedqueue:queue/hashes-image')
const runProc = require('../runProc')
const path = require('path')
const child = require('child_process')
const fs = require('fs-extra')
const Promise = require('bluebird')

function hashlogDone (path, size) {
  return new Promise((resolve, reject) => {
    fs.stat(path, function (err) {
      if (!err) { // hashlog exists
        child.exec(
          `cat "${path}" | sed -e '/^#/d' | wc -l`,
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

module.exports = (job) => {
  let workdir = path.dirname(job.data.path)
  return Promise.promisify(fs.stat)(job.data.path)
  .then((stats) => {
    return hashlogDone(path.join(workdir, 'hashlog.md5'), stats.size)
  })
  .then((isdone) => {
    if (!isdone) {
      let command = (path.join(__dirname, '../../hash/parallelhash.sh'))
      let options = [`'${job.data.path}'`]
      return runProc(command, options)
    }
  })
}
