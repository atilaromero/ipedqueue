'use strict'

const config = require('config')
const evidenceTypes = config.evidence_types.slice()

module.exports = {
  // labels: {
  material: { type: Number, min: 130000, max: (new Date().getFullYear() - 2000 + 1) * 10000 - 1 },
  mat_suffix: {
    type: String,
    enum: evidenceTypes
  },
  operacao: String,
  ipl: { type: Number, min: 90000, max: (new Date().getFullYear() - 2000 + 1) * 10000 - 1 },
  ipl_suffix: String,
  equipe: String,
  apreensao: { type: Number, min: 90000, max: (new Date().getFullYear() - 2000 + 1) * 10000 - 1 },
  registro: { type: Number, min: 130000, max: (new Date().getFullYear() - 2000 + 1) * 10000 - 1 },
  item: Number
  // }
}

// schema.pre('save', function (next, halt) {
//   if (!this.path) {
//     let name = ([
//       this.item ? 'item' : '',
//       (this.item && this.item < 10) ? 0 : '',
//       this.item ? this.item + '-' : '',
//       'M', this.material, this.mat_suffix ? '_' + this.mat_suffix : ''
//     ]).join('')
//     let ext = '.dd'
//     if (
//       this.mat_suffix === 'mem_cel' ||
//       this.mat_suffix === 'Oi' ||
//       this.mat_suffix === 'TIM' ||
//       this.mat_suffix === 'Vivo' ||
//       this.mat_suffix === 'Tigo' ||
//       this.mat_suffix === 'Claro'
//     ) {
//       ext = '.ufdr'
//     }
//     this.path = ([
//       '/mnt/cloud/operacoes',
//       '/', this.operacao,
//       '/', this.ipl ? 'ipl_' + this.ipl : '', this.ipl_suffix ? '_' + this.ipl_suffix : '',
//       '/', this.registro ? 'reg_' + this.registro : '',
//       '/', this.equipe,
//       '/', this.apreensao ? ('auto_apreensao_' + this.apreensao) : '',
//       '/', name,
//       '/', name, ext
//     ]).join('')
//   }
//   next()
// })
