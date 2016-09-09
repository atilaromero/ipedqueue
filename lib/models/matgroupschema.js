'use strict'

module.exports = (wagner) => {
  wagner.factory('matgroupSchema', (mongoose) => {
    let schema = new mongoose.Schema({
      ipedoutputpath: String,
      status: {type: String, default: 'notready'},
      materiais: [{type: Number, ref: 'material'}]
    })
    return schema
  })
}
