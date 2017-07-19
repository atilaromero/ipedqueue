/* eslint-env mocha */
'use strict'

const config = require('config')
const core = require('../lib/core')
const mongoose = require('mongoose')
const expect = require('chai').expect

describe('Server.', function () {
  var server
  before(function () {
    return core.connect(config.mongodb.host, config.mongodb.port, config.mongodb.db)
    .then(() => {
      require('baucis') // must be required before registering the model
      core.mkModel()
      let app = require('../lib/app')
      server = app.listen(config.listenport)
    })
  })
  beforeEach(function () {
    return mongoose.models.material.remove({})
  })
  after(function () {
    server.close()
  })

  describe('config', function () {
    it('port is 8888', () => {
      expect(config.listenport).equal(8888)
    })
  })

  require('../lib/core/test')
  require('../lib/queue/test')
})
