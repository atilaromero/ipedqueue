'use strict'

const child = require('child_process')
const EventEmitter = require('events')
const Promise = require('bluebird')
const fs = require('fs-extra')
const path = require('path')
const debug = require('debug')('ipedqueue:runiped')
const config = require('config')
const axios = require('axios')

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
      '-o', scope.reloutputdir
    ])
    options.splice(2, 0, '-w')
    options.splice(3, 0, `'${scope.workdir}'`)
    options.splice(4, 0, '-v')
    options.splice(5, 0, `'${scope.workdir}':'${scope.workdir}'`)
    options = options.concat(['-d', scope.matrelpath])
    scope.event.emit('data', 'options: ' + options.toString())
    scope.options = options
    resolve()
  })
}

function getLogfile (scope) {
  return new Promise((resolve, reject) => {
    debug('getLogfile')
    fs.mkdir(scope.outputdir, (err) => {
      if (err) {} // ignore err on purpose
      let logfile = fs.createWriteStream(
        path.join(scope.outputdir, 'IPED.log'),
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
  return require('../../runProc')(
    scope.config.iped.javabin,
    scope.options,
    scope.logfile,
    scope.event
  )
}

function pathtorelative (workdir, somepath) {
  if (workdir && somepath.startsWith(workdir)) {
    somepath = somepath.slice(workdir.length)
    if (somepath[0] === '/' || somepath[0] === '\\') {
      somepath = somepath.slice(1)
    }
  }
  return somepath
}

let progressFlag = true

function progress (doc, line) {
  if (progressFlag) {
    if (line.slice(23, 41) === '\t[MSG]\tProcessando') {
      progressFlag = false
      setTimeout(function () {
        progressFlag = true
      }, 10000)

      doc.progress = line
      doc.save()
    }
  }
}

module.exports = function iped (job) {
  let scope = {}
  scope.config = config
  scope.event = new EventEmitter()
  scope.mat = job.data
  scope.workdir = path.dirname(job.data.path)
  scope.outputdir = path.join(scope.workdir, 'SARD')
  scope.matrelpath = pathtorelative(scope.workdir, job.data.path)
  scope.reloutputdir = pathtorelative(scope.workdir, scope.outputdir)

  const url = `${config.EVENTS_URL}v2/events`
  let result = axios.post(url, {
    channel: 'iped',
    type: 'iped started',
    evidence: job.data.id
  })
  .then(() => { return precmd(scope) })
  .then(() => { return getOptions(scope) })
  .then(() => { return getLogfile(scope) })
  .then(() => { return runProc(scope) })
  .then(() => {
    return axios.post(url, {
      channel: 'iped',
      type: 'iped done',
      evidence: job.data.id
    })
  })
  .catch((err) => {
    axios.post(url, {
      channel: 'iped',
      type: 'iped error',
      evidence: job.data.id,
      error: err
    })
    return Promise.reject(err)
  })

  result.event = scope.event
  result.event.on('data', (data) => {
    progress(job.data, data.split('\n')[0])
  })
  result.event.on('error', err => {
    job.log(err)
    result.throw(err)
  })
  return result
}
