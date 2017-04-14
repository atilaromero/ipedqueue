'use strict'

const merge = require('merge')
const mongoose = require('mongoose')

let Core = function () {
  this.specs = [
    require('./specs/core'),
    require('./specs/imager'),
    require('./specs/labels'),
    require('./specs/mounter'),
    require('./specs/queue'),
    require('./specs/tmp')
  ]
  this.preSave = [
    require('./pre-save/labels')
  ]
  this.mkModel = (specs, preSave) => {
    if (specs) {
      this.specs = specs
    }
    if (preSave) {
      this.preSave = preSave
    }
    let mergeSpec = merge.apply(null, this.specs)
    let opencaseSchema = new mongoose.Schema(mergeSpec)
    opencaseSchema.set('collection', 'material')
    this.preSave.forEach((pre) => opencaseSchema.pre('save', pre))
    mongoose.model('material', opencaseSchema)
  }
  this.connect = require('./connect-with-retry')
}

module.exports = new Core()
