'use strict'

module.exports = function (next, halt) {
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
}
