'use strict'

module.exports = (wagner) => {
  wagner.factory('materialSchema', (mongoose) => {
    let schema = new mongoose.Schema({
      _id: Number,
      item: Number,
      apreensao: String,
      equipe: String,
      operacao: String,
      relativepath: String,
      path: String
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
