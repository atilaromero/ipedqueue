/* eslint-env mocha */
'use strict'

// const debug = require('debug')('ipedqueue:queue-test')
const Promise = require('bluebird')
const config = require('config')
const opencaseCore = require('../lib/core')
const mongoose = require('mongoose')

describe('Server.', function () {
  var server
  before(function (done) {
    opencaseCore.connect(config.mongodb.host, config.mongodb.port, config.mongodb.db)
    .then(() => {
      require('baucis') // must be required before registering the model
      opencaseCore.mkModel()
      let app = require('../lib/app')
      server = app.listen(config.listenport)
      done()
    })
    .catch(done)
  })
  beforeEach(function (done) {
    Promise.resolve()
    .then(() => { return mongoose.models.material.remove({}) })
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

    require('../lib/core/test')
    require('../lib/queue/tasks/hashlog/test')
  })
})
