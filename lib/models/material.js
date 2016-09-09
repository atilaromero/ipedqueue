'use strict'

module.exports = (wagner) => {
  wagner.factory('Material', (mongoose, materialSchema) => {
    let model = mongoose.model('material', materialSchema)
    model.plural('material')
    return model
  })
}
