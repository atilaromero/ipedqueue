'use strict'

const Material = require('../../lib/models/material')

module.exports.save = function (done) {
  let mat = new Material({material: 160004, operacao: 'teste', path: 'test/ok'})
  mat.save()
  .then(() => { done() })
  .catch(done)
}
