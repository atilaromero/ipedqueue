'use strict'

const wagner = require('wagner-core')

wagner.factory('devidSchema', (mongoose) => {
  let schema = new mongoose.Schema({
    material: { type: Number, min: 130000, max: (new Date().getFullYear() - 2000 + 1) * 10000 - 1 },
    mat_suffix: String,
    item: Number,
    apreensao: { type: Number, min: 130000, max: (new Date().getFullYear() - 2000 + 1) * 10000 - 1 },
    equipe: String,
    operacao: String,
    ipl: { type: Number, min: 130000, max: (new Date().getFullYear() - 2000 + 1) * 10000 - 1 },
    ipl_suffix: String,
    properties: {}
  })
  schema.set('collection', 'material')
  schema.on('error', (err) => {
    console.log('schema error:', err)
  })
  return schema
})
