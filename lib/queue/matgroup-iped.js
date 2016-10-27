'use strict'

const debug = require('debug')('ipedqueue:queue/iped')
const runIPED = require('./runiped')
const wagner = require('wagner-core')

module.exports = (job, done) => {
  wagner.invoke((Matgroup, Material, config) => {
    function changeState (grpid, newstate) {
      return Matgroup.findById(grpid)
      .then(doc => {
        debug('changing matgroup state', doc._id, doc.status, newstate)
        doc.status = newstate
        return doc.save()
      })
    }
    debug('new job', job.data)
    let matpromises = changeState(job.data._id, 'running')
    job.data.materiais.forEach(x => {
      debug('on mat', x)
      if (!x.processado) {
        matpromises = matpromises.then(() => {
          debug('adding material', x)
          job.log('adding material: ', x)
          let result = runIPED(config, job.data.basedir, job.data.ipedfolder, x)
          result.event.on('data', (data) => {
            debug(data)
          })
          result.event.on('error', err => {
            job.log(err)
            debug(err)
            result.throw(err)
          })
          return result
        }).then(() => {
          return Material.findById(x)
          .then(doc => {
            doc.processado = true
            job.log('finished: ', x)
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
}
