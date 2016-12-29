'use strict'

const wagner = require('wagner-core')

module.exports.save = function (done) {
  wagner.invoke((Material) => {
    let mat = new Material({material: 160004, operacao: 'teste', path: 'test/ok'})
    mat.save()
    .then(() => { done() })
    .catch(done)
  })
}
