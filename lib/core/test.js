/* eslint-env mocha */
'use strict'

const chai = require('chai')
const expect = chai.expect
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
})
