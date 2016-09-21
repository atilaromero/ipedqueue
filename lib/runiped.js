'use strict'

const child = require('child_process')
const EventEmitter = require('events')
const Promise = require('bluebird')
const fs = require('fs-extra')
const path = require('path')

function runIPED (config, ipedoutputpath, mat) {
  let event = new EventEmitter()
  let result = new Promise(function (resolve, reject) {
    let options = config.iped.javaoptions.concat([
      '-o', ipedoutputpath
    ])
    fs.stat(path.join(ipedoutputpath, 'data'), function (err) {
      if (!err) { // directory already exists
        options = options.concat(['--append'])
      }
      options = options.concat(['-d', mat.path])
      event.emit('data', 'options: ' + options.toString())

      if (config.precmd) {
        event.emit('data', child.execSync(config.precmd).toString())
      }

      fs.mkdir(ipedoutputpath, (err) => {
        if (err) {} // ignore err on purpose
        let logfile = fs.createWriteStream(
          path.join(ipedoutputpath, 'IPED.log'),
          {'flags': 'a'}
        )

        let proc = child.spawn(config.iped.javabin, options)
        let outs = [proc.stdout, proc.stderr]
        outs.forEach(out => {
          out.setEncoding('utf8')
          out.on('data', data => {
            event.emit('data', data)
            logfile.write(data)
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
      })
    })
  })
  result.event = event
  return result
}
module.exports = runIPED
