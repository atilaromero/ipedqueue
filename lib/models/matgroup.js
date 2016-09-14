'use strict'

module.exports = (wagner) => {
  wagner.factory('Matgroup', (mongoose, matgroupSchema) => {
    let model = mongoose.model('matgroup', matgroupSchema)
    model.plural('matgroup')
    return model
  })
}
