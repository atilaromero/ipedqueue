'use strict'

module.exports = (wagner) => {
  wagner.factory('matgroupSchema', (mongoose) => {
    let schema = new mongoose.Schema({
      ipedoutputpath: String,
      status: {
        type: String,
        enum: ['notready', 'ready', 'running', 'done', 'failed'],
        default: 'notready'
      },
      materiais: [{type: Number, ref: 'material'}],
      title: String
    })
    schema.pre('save', function (next, halt) {
      if (!this.title) {
        this.title = this.ipedoutputpath
      }
      next()
    })
    schema.post('save', doc => {
      wagner.invoke((queue) => {
        if (doc.status && doc.status === 'ready') {
          mongoose.model('matgroup').populate(doc, {path: 'materiais'}, (err, doc2) => {
            if (err) schema.emit('error', err)
            else queue.create('iped', doc2).save()
          })
        }
      })
    })
    schema.on('error', (err) => {
      console.log('schema error:', err)
    })
    return schema
  })
}
