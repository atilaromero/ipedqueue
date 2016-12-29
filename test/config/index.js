'use strict'

const wagner = require('wagner-core')
const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.config.includeStack = false
const expect = chai.expect

module.exports.port = function (done) {
  wagner.invoke(function (config) {
    expect(config.listenport).equal(8880)
    done()
  })
}
