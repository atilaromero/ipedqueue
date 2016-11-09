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
      state: {
        type: String,
        enum: ['hold', 'todo', 'running', 'done', 'failed'],
        default: 'hold'
      },
      running_on: String
    })
    schema.set('collection', 'material')
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
    schema.on('error', (err) => {
      console.log('schema error:', err)
    })
    return schema
  })
}
