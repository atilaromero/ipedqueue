'use strict'

const wagner = require('wagner-core')

wagner.factory('materialSchema', (mongoose, partitionSchema) => {
  let schema = new mongoose.Schema({
    material: { type: Number, min: 130000, max: (new Date().getFullYear() - 2000 + 1) * 10000 - 1 },
    mat_suffix: {
      type: String,
      enum: ['HD', 'pendrive', 'TIM', 'Vivo', 'Oi', 'Claro', 'mem_cel']
    },
    item: Number,
    apreensao: { type: Number, min: 130000, max: (new Date().getFullYear() - 2000 + 1) * 10000 - 1 },
    equipe: String,
    operacao: String,
    ipl: { type: Number, min: 130000, max: (new Date().getFullYear() - 2000 + 1) * 10000 - 1 },
    ipl_suffix: String,
    path: String,
    state: {
      type: String,
      enum: ['hold', 'todo', 'running', 'done', 'failed'],
      default: 'hold'
    },
    stage: String,
    run_at: String,
    nice: {type: Number, default: 0},
    progress: String,
    obs: String,
    partitions: [partitionSchema]
  })
  schema.set('collection', 'material')
  schema.pre('save', function (next, halt) {
    if (!this.path) {
      let name = ([
        this.item ? 'item' : '',
        (this.item && this.item < 10) ? 0 : '',
        this.item ? this.item + '-' : '',
        'M', this.material, this.mat_suffix ? '_' + this.mat_suffix : ''
      ]).join('')
      this.path = ([
        '/operacoes',
        '/', this.operacao,
        '/', this.ipl ? 'ipl_' + this.ipl : '', this.ipl_suffix ? '_' + this.ipl_suffix : '',
        '/', this.equipe,
        '/', this.apreensao ? ('auto_apreensao_' + this.apreensao) : '',
        '/', name,
        '/', name, '.dd'
      ]).join('')
    }
    next()
  })
  schema.on('error', (err) => {
    console.log('schema error:', err)
  })
  return schema
})
