'use strict'

let mongoose = require('mongoose')

let partitionSchema = new mongoose.Schema({
  letter: String,
  type: String,
  offset: { type: Number, default: 0 },
  options: String
})
partitionSchema.set('collection', 'partition')
partitionSchema.pre('save', function (next, halt) {
  if (!this.options) {
    this.options = 'ro,offset=' + (this.offset * 512)
  }
  next()
})

module.exports = {
  // mounter: {
  partitions: [partitionSchema]
  // }
}
