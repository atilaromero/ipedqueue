'use strict'

const debug = require('debug')('ipedqueue:queue/material-iped')
const runIPED = require('./runiped')
const wagner = require('wagner-core')
const path = require('path')
const os = require('os')

function getServerID () {
  let ifaces = os.networkInterfaces()
  let names = Object.keys(ifaces)
    .filter(x => (ifaces[x][0].family === 'IPv4'))
    .filter(x => (ifaces[x][0].internal === false))
  return ifaces[names[0]][0].address
}

module.exports = (job, done) => {
  wagner.invoke((Material, config) => {
    Promise.resolve()
    .then(() => {
      return Material.findById(job.data._id)
      .then(doc => {
        doc.processamento = 'running'
        doc.running_on = getServerID()
        return doc.save()
      })
    })
    .then(() => {
      let basedir = path.dirname(job.data.path)
      let ipedfolder = path.join(basedir, 'SARD')
      let result = runIPED(config, basedir, ipedfolder, job.data)
      result.event.on('data', (data) => {
        debug(data)
      })
      result.event.on('error', err => {
        job.log(err)
        debug(err)
        result.throw(err)
      })
      return result
    })
    .then(() => {
      return Material.changeState(job.data._id, 'done')
    })
    .then(() => { done() })
    .catch(code => {
      debug('runIPED error: ' + code.toString())
      return Material.changeState(job.data._id, 'failed')
      .then(() => {
        done(new Error(code))
      })
    })
    .catch(err => {
      console.log('error saving failed state: ' + err.toString())
      done(new Error(err))
    })
  })
}
