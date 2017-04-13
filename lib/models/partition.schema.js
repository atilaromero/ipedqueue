'use strict'

const mongoose = require('mongoose')

let schema = new mongoose.Schema({
  letter: String,
  type: String,
  offset: { type: Number, default: 0 },
  options: String
})
schema.set('collection', 'partition')
schema.pre('save', function (next, halt) {
  if (!this.options) {
    this.options = 'ro,offset=' + (this.offset * 512)
  }
  next()
})
schema.on('error', (err) => {
  console.log('schema error:', err)
})
module.exports = schema