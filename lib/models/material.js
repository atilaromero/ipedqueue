'use strict'

const mongoose = require('mongoose')
const materialSchema = require('./material.schema')

let model = mongoose.model('material', materialSchema)
model.changeState = (id, oldState, newState, runningOn) => {
  return model.update({
    _id: id,
    state: oldState
  }, {$set: {
    state: newState,
    run_at: runningOn
  }})
}
module.exports = model
