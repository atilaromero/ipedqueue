'use strict'

const child = require('child_process')
const EventEmitter = require('events')
const Promise = require('bluebird')
const fs = require('fs-extra')
const path = require('path')

function precmd (scope) {
  return new Promise((resolve, reject) => {
    if (scope.config.precmd) {
      child.exec((err, stdout, stderr) => {
        if (err) return reject(err)
        scope.event.emit('data', stdout.toString())
        resolve()
      })
    } else resolve()
  })
}

function getOptions (scope) {
  return new Promise((resolve, reject) => {
    let options = scope.config.iped.javaoptions.concat([
      '-o', scope.ipedoutputpath
    ])
    fs.stat(path.join(scope.ipedoutputpath, 'data'), function (err) {
      if (!err) { // directory already exists
        options = options.concat(['--append'])
      }
      options = options.concat(['-d', scope.mat.path])
      scope.event.emit('data', 'options: ' + options.toString())
      scope.options = options
      resolve()
    })
  })
}

function getLogfile (scope) {
  return new Promise((resolve, reject) => {
    fs.mkdir(scope.ipedoutputpath, (err) => {
      if (err) {} // ignore err on purpose
      let logfile = fs.createWriteStream(
        path.join(scope.ipedoutputpath, 'IPED.log'),
        {'flags': 'a'}
      )
      scope.logfile = logfile
      resolve()
    })
  })
}

function runProc (scope) {
  return new Promise((resolve, reject) => {
    let proc = child.spawn(scope.config.iped.javabin, scope.options)
    let outs = [proc.stdout, proc.stderr]
    outs.forEach(out => {
      out.setEncoding('utf8')
      out.on('data', data => {
        scope.event.emit('data', data)
        scope.logfile.write(data)
      })
    })
    proc.on('close', code => {
      if (scope.logfile) scope.logfile.end()
      if (code) {
        reject(code)
      } else {
        resolve(code)
      }
    })
  })
}

function runIPED (config, ipedoutputpath, mat) {
  let scope = {}
  scope.config = config
  scope.event = new EventEmitter()
  scope.ipedoutputpath = ipedoutputpath
  scope.mat = mat

  let result = precmd(scope)
  .then(() => { return getOptions(scope) })
  .then(() => { return getLogfile(scope) })
  .then(() => { return runProc(scope) })
  result.event = scope.event
  return result
}
module.exports = runIPED
