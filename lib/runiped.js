'use strict'

const child = require('child_process')
const EventEmitter = require('events')
const Promise = require('bluebird')
const fs = require('fs-extra')
const path = require('path')
const debug = require('debug')('ipedqueue:runiped')

function precmd (scope) {
  return new Promise((resolve, reject) => {
    debug('precmd')
    if (scope.config.precmd) {
      child.exec(scope.config.precmd, (err, stdout, stderr) => {
        scope.event.emit('data', stdout.toString())
        scope.event.emit('data', stderr.toString())
        if (err) {
          scope.event.emit('data', err)
          return reject(err)
        }
        resolve()
      })
    } else resolve()
  })
}

function getOptions (scope) {
  return new Promise((resolve, reject) => {
    debug('getOptions')
    let options = scope.config.iped.javaoptions.concat([
      '-o', scope.ipedoutputpath
    ])
    fs.stat(path.join(scope.ipedoutputpath, 'indexador'), function (err) {
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
    debug('getLogfile')
    fs.mkdir(scope.ipedoutputpath, (err) => {
      if (err) {} // ignore err on purpose
      let logfile = fs.createWriteStream(
        path.join(scope.ipedoutputpath, 'IPED.log'),
        {'flags': 'a'}
      )
      logfile.on('error', (err) => {
        scope.event.emit('error', err)
      })
      scope.logfile = logfile
      resolve()
    })
  })
}

function runProc (scope) {
  return new Promise((resolve, reject) => {
    debug('runProc')
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
