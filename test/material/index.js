'use strict'

const mongoose = require('mongoose')

module.exports.save = function (done) {
  let mat = new mongoose.models.material({material: 160004, operacao: 'teste', path: 'test/ok'})
  mat.save()
  .then(() => { done() })
  .catch(done)
}
