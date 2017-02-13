'use strict'

const wagner = require('wagner-core')

wagner.factory('partitionSchema', (mongoose) => {
  let schema = new mongoose.Schema({
    letter: String,
    type: String,
    offset: Number,
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
  return schema
})
