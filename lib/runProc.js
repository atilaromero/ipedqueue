'use strict'

const debug = require('debug')('ipedqueue:runProc')
const child = require('child_process')

function runProc (command, options, logfile, event) {
  return new Promise((resolve, reject) => {
    debug('runProc:', command, options.join(' '))
    let proc = child.spawn(command, options, {shell: true})
    let outs = [proc.stdout, proc.stderr]
    outs.forEach(out => {
      out.setEncoding('utf8')
      out.on('data', data => {
        debug(data)
        if (event) event.emit('data', data)
        if (logfile) logfile.write(data)
      })
    })
    proc.on('close', code => {
      if (logfile) logfile.end()
      if (code) {
        reject(code)
      } else {
        resolve(code)
      }
    })
    proc.on('error', err => {
      debug('error:', err)
      reject(err)
    })
  })
}

module.exports = runProc
