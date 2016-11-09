'use strict'

module.exports = (wagner) => {
  wagner.factory('Material', (mongoose, materialSchema) => {
    let model = mongoose.model('material', materialSchema)
    model.plural('material')
    model.changeState = (id, oldState, newState, runningOn) => {
      return model.update({
        _id: id,
        state: oldState
      }, {$set: {
        state: newState,
        running_on: runningOn
      }})
    }
    return model
  })
}
