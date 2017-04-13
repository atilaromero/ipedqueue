/* eslint-env mocha */
'use strict'

// const debug = require('debug')('ipedqueue:queue-test')
const Promise = require('bluebird')
const config = require('config')
const app = require('../lib/app')
require('../lib/connect-with-retry')

describe('Server.', function () {
  var server
  before(function (done) {
    require('../lib/app')
    server = app.listen(config.listenport)
    done()
  })
  beforeEach(function (done) {
    let Material = require('../lib/models/material')
    Promise.resolve()
    .then(() => { return Material.remove({}) })
    .then(() => { done() })
    .catch(done)
  })
  after(function (done) {
    server.close()
    done()
  })

  describe('config', function () {
    let tests = require('./config')
    it('port is 8888', tests.port)
  })

  describe('Material.', function () {
    let tests = require('./material')
    it('can save a material', tests.save)
  })

  describe('queue.', function () {
    describe('all.', function () {
      let tests = require('./queue')
      it('changes material state if process exits with error', tests.fail)
      it('changes material state if process exits fine', tests.ok)
      it('does not change state if image does not exist', tests.missing)
    })

    describe('hashes-dir.', function () {
      let tests = require('./queue/hashes-dir')
      describe('directory empty.', function () {
        it('hash all files', tests.dirempty)
      })
      describe('hashes exists.', function () {
        it('hash all files again', tests.rehash)
      })
    })

    describe('hashes-image', function () {
      let tests = require('./queue/hashes-image')
      it('calc hashes when no hashes exists', tests.nohashes)
      it('calc hashes when they exists but are incomplete', tests.incomplete)
      describe('do nothing when hashes are done', function () {
        it('image size: 0 bytes', tests.donothing(0, 0, true))
        it('image size: 1 byte', tests.donothing(1, 1, true))
        it('image size: 1G - 1 byte', tests.donothing(Math.pow(1024, 3) - 1, 1, true))
        it('image size: 1G', tests.donothing(Math.pow(1024, 3), 1, true))
        it('image size: 1G + 1 byte', tests.donothing(Math.pow(1024, 3) + 1, 2, true))
      })
    })
  })
})
