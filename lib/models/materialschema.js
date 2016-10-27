'use strict'

const path = require('path')

module.exports = (wagner) => {
  wagner.factory('materialSchema', (mongoose) => {
    let schema = new mongoose.Schema({
      _id: { type: Number, min: 130000, max: (new Date().getFullYear() - 2000 + 1) * 10000 - 1 },
      item: Number,
      apreensao: String,
      equipe: String,
      operacao: String,
      path: String,
      espelhado: { type: Boolean, default: false },
      hashes: {
        type: String,
        enum: ['todo', 'onqueue', 'running', 'done', 'failed'],
        default: 'todo'
      },
      processamento: {
        type: String,
        enum: ['todo', 'onqueue', 'running', 'done', 'failed'],
        default: 'todo'
      }
    })
    function correctBars (somepath) {
      if (path.join('a', 'a')[1] === '/') { // linux
        return somepath.replace(/\\/g, '/').replace(/^.*:/, '')
      } else {
        return somepath
      }
    }
    schema.pre('save', function (next, halt) {
      this.path = correctBars(this.path)
      next()
    })
    schema.post('save', doc => {
      wagner.invoke((queue) => {
        let changed = false
        if (doc.espelhado && doc.processamento === 'todo') {
          queue.create('material-iped', doc).save()
          doc.processamento = 'onqueue'
          changed = true
        }
        if (doc.espelhado && doc.hashes === 'todo') {
          queue.create('material-hashes', doc).save()
          doc.hashes = 'onqueue'
          changed = true
        }
        if (changed) doc.save()
      })
    })
    schema.on('error', (err) => {
      console.log('schema error:', err)
    })
    return schema
  })
}
