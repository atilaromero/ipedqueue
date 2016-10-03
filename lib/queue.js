'use strict'

const debug = require('debug')('ipedqueue:queue')
const runIPED = require('./runiped')
const Promise = require('bluebird')
const fs = require('fs')

let fsstat = Promise.promisify(fs.stat)
function checkMats (materiais) {
  debug('checkMats')
  return Promise.map(materiais, x => {
    return fsstat(x.path)
  })
}

module.exports = (wagner) => {
  wagner.factory('queue', (kue, Matgroup, Material, config) => {
    function changeState (grpid, newstate) {
      return Matgroup.findById(grpid)
      .then(doc => {
        debug('changing matgroup state', doc._id, doc.status, newstate)
        doc.status = newstate
        return doc.save()
      })
    }
    let queue = kue.createQueue({redis: config.redis})
    queue.process('iped', (job, done) => {
      debug('new job', job.data)
      let materiais = job.data.materiais
      let ipedoutputpath = job.data.ipedoutputpath
      let matpromises =
        checkMats(materiais)
        .then(() => { return changeState(job.data._id, 'running') })
      materiais.forEach(x => {
        if (!x.processado) {
          matpromises = matpromises.then(() => {
            debug('adding material', x)
            let result = runIPED(config, ipedoutputpath, x)
            result.event.on('data', (data) => {
              job.log(data)
              debug(data)
            })
            result.event.on('error', err => {
              job.log(err)
              debug(err)
              throw (err)
            })
            return result
          }).then(() => {
            return Material.findById(x)
            .then(doc => {
              doc.processado = true
              return doc.save()
            })
          })
        }
      })
      matpromises
      .then(() => {
        return changeState(job.data._id, 'done')
      })
      .then(() => { done() })
      .catch(code => {
        debug('runIPED error: ' + code.toString())
        changeState(job.data._id, 'failed')
        done(new Error(code))
      })
      .catch(err => {
        console.log('error saving failed state: ' + err.toString())
        done(new Error(err))
      })
    })
    return queue
  })
}
