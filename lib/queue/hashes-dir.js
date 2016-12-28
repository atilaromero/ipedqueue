'use strict'

// const debug = require('debug')('ipedqueue:queue/hashes-dir')
const runProc = require('../runProc')
const path = require('path')

module.exports = (job) => {
  let mydir = path.dirname(job.data.path)
  let command = '/bin/bash'
  let options = [
    '-lc',
    `'cd ${mydir}; find * \\( -path '*SARD/indexador' -o -name '*.dd' \\)
    -prune -o -type f -print0 |
    xargs -L1 -0 sha256sum > hashes.txt'`.replace(/\n/g, '')
  ]
  return runProc(command, options)
}
