'use strict'

const debug = require('debug')('ipedqueue:queue')
const runIPED = require('./runiped')

module.exports = (wagner) => {
  wagner.factory('queue', (kue, Matgroup, config) => {
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
      let matpromises = changeState(job.data._id, 'running')
      materiais.forEach(x => {
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
        })
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
