'use strict'

const debug = require('debug')('ipedqueue:queue')
const runIPED = require('./runiped')

module.exports = (wagner) => {
  wagner.factory('queue', (kue, Matgroup, config) => {
    let queue = kue.createQueue({redis: config.redis})
    queue.process('iped', (job, done) => {
        // hooker.hook(job,'log',()=>{
        //   //console.log(sliced(arguments))
        // })
      let materiais = job.data.materiais
      let ipedoutputpath = job.data.ipedoutputpath
      let matpromises = new Promise((resolve, reject) => { resolve() })
      materiais.forEach(x => {
        matpromises = matpromises.then(() => {
          let result = runIPED(config, ipedoutputpath, x)
          result.event.on('data', (data) => {
            job.log(data)
            debug(data)
          })
          return result
        })
      })
      matpromises
      .then(code => {
        debug('exit code: ' + code.toString())
        Matgroup.findOne(job.data._id, (err, doc) => {
          if (err) done(err)
          debug('found id', doc._id, doc.status)
          doc.status = 'done'
          doc.save((err, doc) => {
            debug('doc saved', doc.status)
            done(err)
          })
        })
      })
      .catch(code => {
        debug('exit code: ' + code.toString())
        Matgroup.findOne(job.data._id, (err, doc) => {
          if (err) done(err)
          doc.status = 'failed'
          doc.save((err) => {
            if (err) done(err)
            done(new Error('exit code: ' + code.toString()))
          })
        })
      })
    })
    return queue
  })
}
