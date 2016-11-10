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

function sleep (ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

describe('Server - ', function () {
  var server
  before(function (done) {
    this.wagner = require('wagner-core')
    require('../lib/app')(this.wagner)
    this.wagner.invoke((app, config) => {
      server = app.listen(config.listenport)
    })
    done()
  })
  beforeEach(function (done) {
    this.wagner.invoke((Material) => {
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
      this.wagner.invoke(function (config) {
        expect(config.listenport).equal(8880)
        done()
      })
    })
  })

  describe('Material - ', function () {
    it('can save a material', function (done) {
      this.wagner.invoke((Material) => {
        let mat = new Material({_id: 160004, operacao: 'teste', path: 'test/ok'})
        mat.save()
        .then(() => { done() })
        .catch(done)
      })
    })
  })

  describe('Queue singleProcess - ', function () {
    it('changes material state if process exits with error', function (done) {
      queue1image(done, this.wagner, 'test/fail', 'todo', 'failed')
    })
    it('changes material state if process exits fine', function (done) {
      queue1image(done, this.wagner, 'test/ok', 'todo', 'done')
    })
    function queue1image (done, wagner, matpath, grpstatus, grpfinalstatus) {
      wagner.invoke((Material, queue) => {
        let mat = new Material({_id: 160003, operacao: 'teste', path: matpath, state: grpstatus})
        mat.save()
        .then(() => {
          return queue.singleProcess()
        })
        .then(() => {
          return Material.findById(mat._id)
          .then(doc => {
            expect(doc).not.equal(null)
            expect(doc.state).equal(grpfinalstatus)
          })
        })
        .then(() => { done() })
        .catch(done)
      })
    }
  })
})
