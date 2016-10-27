'use strict'

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
    return model
  })
}
