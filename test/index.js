/* eslint-env mocha */
'use strict'
// require('debug').enable('ipedqueue:*')
// require('debug').enable('ipedqueue:queue')

// const debug = require('debug')('ipedqueue:queue-test')
const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.config.includeStack = false
const expect = chai.expect
const Promise = require('bluebird')
const wagner = require('wagner-core')
require('../lib/app')

describe('Server - ', function () {
  var server
  before(function (done) {
    wagner.invoke((app, config) => {
      server = app.listen(config.listenport)
    })
    done()
  })
  beforeEach(function (done) {
    wagner.invoke((Material) => {
      Promise.resolve()
      .then(() => { return Material.remove({}) })
      .then(() => { done() })
      .catch(done)
    })
  })
  after(function (done) {
    server.close()
    done()
  })

  describe('config', function () {
    it('port is 8880', function (done) {
      wagner.invoke(function (config) {
        expect(config.listenport).equal(8880)
        done()
      })
    })
  })

  describe('Material - ', function () {
    let tests = require('./material')
    it('can save a material', tests.save)
  })

  describe('Queue singleProcess - ', function () {
    let tests = require('./queue')
    it('changes material state if process exits with error', tests.fail)
    it('changes material state if process exits fine', tests.ok)
  })
})
