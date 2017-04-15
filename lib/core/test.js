/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const mongoose = require('mongoose')

module.exports = describe('model', function () {
  it('should be defined', function () {
    let model = mongoose.models.material
    expect(model).not.undefined
    expect(model).not.null
  })
  it('should have some fields', function () {
    let model = mongoose.models.material
    expect(model).has.property('schema')
    expect(model.schema).has.property('tree')
    expect(model.schema.tree).has.property('material')
    expect(model.schema.tree).has.property('path')
  })
  it('saves data', function () {
    let Model = mongoose.models.material
    let x = new Model({material: 160004, operacao: 'teste', path: 'test/ok'})
    expect(x.operacao).equal('teste')
    x.operacao = 9283
    return x.save()
    .then((result) => {
      expect(result.operacao).equal('9283')
    })
  })
})
