'use strict'

const Promise = require('bluebird')
const debug = require('debug')('ipedqueue:material')

module.exports = (wagner) => {
  wagner.factory('Material', (mongoose, materialSchema) => {
    let model = mongoose.model('material', materialSchema)
    model.plural('material')
    model.changeState = (id, state) => {
      return model.findById(id)
      .then(doc => {
        doc.processamento = state
        return doc.save()
      })
    }
    model.resetProcessamento = () => {
      return model.find({
        processamento: {$in: ['onqueue', 'running']}
      })
      .then(docs => {
        return Promise.each(docs, doc => {
          doc.processamento = 'todo'
          return doc.save()
        })
      })
    }
    model.monitor = () => {
      return model.findOne({
        processamento: 'todo'
      })
      .then(doc => {
        if (!doc) {
          return new Promise((resolve) => {
            setTimeout(function () {
              resolve()
            }, 2000)
          })
        }
        let job = {
          data: doc,
          log: console.log
        }
        return new Promise((resolve) => {
          require('../queue/material-iped')(job, resolve)
        })
      })
      .then(() => {
        return model.monitor()
      })
    }
    return model
  })
}
