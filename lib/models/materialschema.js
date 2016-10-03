'use strict'

module.exports = (wagner) => {
  wagner.factory('materialSchema', (mongoose) => {
    let schema = new mongoose.Schema({
      _id: { type: Number, min: 130000, max: (new Date().getFullYear() - 2000 + 1) * 10000 - 1 },
      item: Number,
      apreensao: String,
      equipe: String,
      operacao: String,
      relativepath: String,
      path: String,
      processado: { type: Boolean, default: false }
    })
    schema.pre('save', function (next, halt) {
      if (!this.path & this.relativepath) {
        this.path = 'Z:\\operacoes\\' +
          this.operacao + '\\' + this.relativepath.replace(/\//g, '\\')
      }
      next()
    })
    return schema
  })
}
