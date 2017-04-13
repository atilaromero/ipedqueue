'use strict'

const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.config.includeStack = false
const expect = chai.expect
const config = require('config')

module.exports.port = function (done) {
  expect(config.listenport).equal(8888)
  done()
}
