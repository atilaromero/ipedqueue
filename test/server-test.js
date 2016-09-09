/* eslint-env mocha */
'use strict'

process.env.NODE_ENV = 'test'
const chai = require('chai')
const expect = chai.expect

describe('server', function () {
  var request = require('request')
  let server
  let baseUrl
  before(function () {
    this.wagner = require('wagner-core')
    require('../lib/app')(this.wagner)
    this.wagner.invoke(function (config, app) {
      server = app.listen(config.listenport)
      baseUrl = 'http://localhost:' + config.listenport
    })
  })
  after(function () {
    this.wagner.clear()
  })

  describe('config', function () {
    it('exists', function (done) {
      this.wagner.invoke(function (config) {
        expect(config).not.equal(undefined)
        expect(config).not.equal(null)
        expect(config.listenport).equal(8880)
        done()
      })
    })
  })
  var count = 0
  describe('Material', function () {
    it('count', function (done) {
      this.wagner.invoke(function (Material) {
        Material.count(function (err, data) {
          expect(err).equal(null)
          count = data
          done()
        })
      })
    })
    it('save', function (done) {
      this.wagner.invoke(function (Material) {
        let m1 = new Material({
          _id: 161234,
          linuxpath: '/storages/storage2/imagens/operacao_teste/auto_apreensao_teste/item02-M161234_001372995DDD5B941B13000C/item02-M161234_001372995DDD5B941B13000C.dd'
        })
        m1.save(function (err) {
          expect(err).equal(null)
          done()
        })
      })
    })
    it('count', function (done) {
      this.wagner.invoke(function (Material) {
        Material.count(function (err, data) {
          expect(err).equal(null)
          expect(data).equal(count + 1)
          done()
        })
      })
    })
    it('getone', function (done) {
      this.wagner.invoke(function (Material) {
        Material.findOne(function (err, data) {
          expect(err).equal(null)
          expect(data._id).equal(161234)
          done()
        })
      })
    })
  })
  describe('Matgroup', function () {
    it('new', function (done) {
      this.wagner.invoke(function (Matgroup) {
        let test = new Matgroup({
          ipedoutputpath: 'Z:\\operacoes\\operacao_teste\\auto_apreensao_teste\\SARD_Midias',
          status: 'notready',
          materiais: [161234]
        })
        test.save(function (err) {
          expect(err).equal(null)
          done()
        })
      })
    })
  })
  var queuecount = 0
  describe('queue', function () {
    it('count', function (done) {
      request.get(baseUrl + '/queue/jobs/0..-1', (err, res, body) => {
        expect(err).equal(null)
        let json = JSON.parse(body)
        queuecount = json.length
        done()
      })
    })
    it('update Matgroup status', function (done) {
      this.wagner.invoke(function (Matgroup) {
        Matgroup.findOne(function (err, data) {
          expect(err).equal(null)
          data.status = 'ready'
          data.save((err, data) => {
            expect(err).equal(null)
            expect(data.status).equal('ready')
            done()
          })
        })
      })
    })
    it('count', function (done) {
      request.get(baseUrl + '/queue/jobs/0..-1', (err, res, body) => {
        expect(err).equal(null)
        let json = JSON.parse(body)
        expect(json.length).equal(queuecount + 1)
        done()
      })
    })
    it('stats', function (done) {
      request.get(baseUrl + '/queue/stats', (err, res, body) => {
        expect(err).equal(null)
        let json = JSON.parse(body)
        expect(json.completeCount).equal(0)
        expect(json.activeCount).equal(1)
        expect(json.delayedCount).equal(0)
        done()
      })
    })
    it('wait', function (done) {
      setTimeout(function () {
        done()
      }, 1000)
    })
    it('stats', function (done) {
      request.get(baseUrl + '/queue/stats', (err, res, body) => {
        expect(err).equal(null)
        let json = JSON.parse(body)
        expect(json.completeCount).equal(0)
        expect(json.activeCount).equal(0)
        expect(json.delayedCount).equal(0)
        done()
      })
    })
    let lastjobid = null
    it('find last', function (done) {
      request.get(baseUrl + '/queue/jobs/0..-1', (err, res, body) => {
        expect(err).equal(null)
        let json = JSON.parse(body)
        lastjobid = json.pop().id
        done()
      })
    })
    it('log', function (done) {
      request.get(baseUrl + '/queue/job/' + lastjobid + '/log', (err, res, body) => {
        expect(err).equal(null)
        done()
      })
    })
  })
  describe('cleaning', function () {
    it('Material', function (done) {
      this.wagner.invoke(function (Material) {
        Material.findOne(161234).remove((err) => {
          expect(err).equal(null)
          done()
        })
      })
    })
    it('Material - count', function (done) {
      this.wagner.invoke(function (Material) {
        Material.count((err, data) => {
          expect(err).equal(null)
          expect(data).equal(0)
          done()
        })
      })
    })
    it('Matgroup', function (done) {
      this.wagner.invoke(function (Matgroup) {
        Matgroup.findOne({materiais: [161234]}).remove((err) => {
          expect(err).equal(null)
          done()
        })
      })
    })
    it('Matgroup - count', function (done) {
      this.wagner.invoke(function (Matgroup) {
        Matgroup.count((err, data) => {
          expect(err).equal(null)
          expect(data).equal(0)
          done()
        })
      })
    })
    it('job', function (done) {
      request.get(baseUrl + '/queue/jobs/0..-1', (err, res, body) => {
        expect(err).equal(null)
        let json = JSON.parse(body)
        if (json.length > 0) {
          request.delete(baseUrl + '/queue/job/' + json.pop().id, (err, res, body) => {
            expect(err).equal(null)
            let json = JSON.parse(body)
            expect(json.error).equal(undefined)
            done()
          })
        } else {
          done()
        }
      })
    })
    it('server', function (done) {
      server.close()
      done()
    })
    it('mongoose', function (done) {
      this.wagner.invoke(function (mongoose) {
        mongoose.connection.close()
        delete mongoose.models.matgroup
        delete mongoose.models.material
        done()
      })
    })
  })
})
