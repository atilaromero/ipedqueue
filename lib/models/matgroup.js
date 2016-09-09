'use strict'

module.exports = (wagner) => {
  wagner.factory('Matgroup', (mongoose, matgroupSchema, queue) => {
    let model = mongoose.model('matgroup', matgroupSchema)
    model.plural('matgroup')
    matgroupSchema.post('save', doc => {
      if (doc.status && doc.status === 'ready') {
        model.populate(doc, {path: 'materiais'}, (err, doc2) => {
          if (err) matgroupSchema.emit('error', err)
          else queue.create('iped', doc2).save()
        })
      }
    })
    return model
  })
}
