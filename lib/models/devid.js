'use strict'

const wagner = require('wagner-core')

wagner.factory('Devid', (mongoose, devidSchema) => {
  let model = mongoose.model('devid', devidSchema)
  model.plural('material')
  return model
})
