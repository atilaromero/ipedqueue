/* eslint-env mocha */
'use strict'
process.env.NODE_ENV = 'test'
// require('debug').enable('ipedqueue:*')
// require('debug').enable('ipedqueue:queue')

// const debug = require('debug')('ipedqueue:queue-test')
const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
const Promise = require('bluebird')
const request = require('superagent')

function sleep (ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

describe('queue', function () {
  var server
  before(function (done) {
    this.wagner = require('wagner-core')
    require('../lib/app')(this.wagner)
    this.wagner.invoke((app, config, queue) => {
      server = app.listen(config.listenport)
      queue.testMode.enter(true)
    })
    done()
  })
  beforeEach(function (done) {
    this.wagner.invoke((Matgroup, Material) => {
      Promise.resolve()
      .then(() => { return Matgroup.remove({}) })
      .then(() => { return Material.remove({}) })
      .then(() => { done() })
      .catch(done)
    })
  })
  afterEach(function () {
    this.wagner.invoke((queue) => {
      queue.testMode.clear()
    })
  })
  after(function (done) {
    server.close()
    this.wagner.invoke((queue) => {
      queue.testMode.exit()
    })
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

  describe('queue.jobs.length', () => {
    it('add job on "ready" matgroup state', function (done) {
      this.wagner.invoke((Material, Matgroup, queue) => {
        let mat = new Material({_id: 160004, operacao: 'teste', path: 'test/ok'})
        let grp = new Matgroup({materiais: [160004], status: 'ready', ipedoutputpath: './'})
        mat.save()
        .then(() => { return grp.save() })
        .then(() => {
          return sleep(200)
          .then(() => {
            expect(queue.testMode.jobs.length).equal(1)
          })
        })
        .then(() => { done() })
        .catch(done)
      })
    })
  })
  describe('failedCount e completeCount', () => {
    it('fails if process exits with error', function (done) {
      testcounts(done, this.wagner, 'test/fail', 1, 0)
    })
    it('does not fail if process exits with 0', function (done) {
      testcounts(done, this.wagner, 'test/ok', 0, 1)
    })
    function testcounts (done, wagner, matpath, failedincr, completedincr) {
      wagner.invoke((Material, Matgroup, queue) => {
        let mat = new Material({_id: 160002, operacao: 'teste', path: matpath})
        let grp = new Matgroup({materiais: [160002], status: 'ready', ipedoutputpath: './'})
        let failedCount = Promise.promisify(queue.failedCount, {context: queue})
        let completeCount = Promise.promisify(queue.completeCount, {context: queue})
        let activeCount = Promise.promisify(queue.activeCount, {context: queue})
        let initial
        Promise.props({
          failed: failedCount(),
          completed: completeCount()
        })
        .then(props => { initial = props })
        .then(() => { return mat.save() })
        .then(() => { return grp.save() })
        .then(() => {
          return sleep(200)
          .then(() => {
            return Promise.props({
              failed: failedCount(),
              completed: completeCount(),
              active: activeCount()
            })
          })
        })
        .then(props => {
          expect(props.failed).equal(initial.failed + failedincr)
          expect(props.completed).equal(initial.completed + completedincr)
        })
        .then(() => { done() })
        .catch(done)
      })
    }
  })

  describe('queue1image', () => {
    it('changes matgroup state if process exits with error', function (done) {
      queue1image(done, this.wagner, 'test/fail', 'ready', 'failed')
    })
    it('changes matgroup state if process exits fine', function (done) {
      queue1image(done, this.wagner, 'test/ok', 'ready', 'done')
    })
    function queue1image (done, wagner, matpath, grpstatus, grpfinalstatus) {
      wagner.invoke((Material, Matgroup) => {
        let mat = new Material({_id: 160002, operacao: 'teste', path: matpath})
        let grp = new Matgroup({materiais: [160002], status: grpstatus, ipedoutputpath: './'})
        mat.save()
        .then(() => { return grp.save() })
        .then(x => {
          return sleep(100).then(() => {
            return Matgroup.findOne(x._id)
            .then(doc => {
              expect(doc.status).equal(grpfinalstatus)
            })
          })
        })
        .then(() => { done() })
        .catch(done)
      })
    }
  })

  describe('log', function () {
    it('is being written', function (done) {
      this.wagner.invoke((Material, Matgroup, config) => {
        let mat = new Material({_id: 160002, operacao: 'teste', path: 'test/ok'})
        let grp = new Matgroup({materiais: [160002], status: 'ready', ipedoutputpath: './'})
        mat.save()
        .then(() => { return grp.save() })
        .then(() => {
          return sleep(100).then(() => {
            request
            .get('http://localhost:8880/queue/jobs/-1..-1', (err, res) => {
              expect(err).equal(null)
              let lastjobid = res.body.pop().id
              let url = 'http://localhost:8880/queue/job/' + lastjobid + '/log'
              request.get(url, (err, res) => {
                expect(err).equal(null)
                expect(res.body.pop()).equal('Mocking queue execution. args: ' +
                  JSON.stringify(config.iped.javaoptions.concat(
                    ['-o', './', '-d', 'test/ok']
                  )).replace(/"/g, "'").replace(/,/g, ', ')
                )
                done()
              })
            })
          })
        })
        .catch(done)
      })
    })
  })

  describe('queue2images', () => {
    it('can process 2 images', function (done) {
      queue2images(done, this.wagner, 'test/ok', 'test/ok', 'ready', 'done')
    })
    it('fail when mat 1/2 fails', function (done) {
      queue2images(done, this.wagner, 'test/fail', 'test/ok', 'ready', 'failed')
    })
    it('fail when mat 2/2 fails', function (done) {
      queue2images(done, this.wagner, 'test/ok', 'test/fail', 'ready', 'failed')
    })
    it('fail when both images fails', function (done) {
      queue2images(done, this.wagner, 'test/fail', 'test/fail', 'ready', 'failed')
    })
    function queue2images (done, wagner, matpath1, matpath2, grpstatus, grpfinalstatus) {
      wagner.invoke((Material, Matgroup, queue, config) => {
        let mat = new Material({_id: 160001, operacao: 'teste', path: matpath1})
        let mat2 = new Material({_id: 160002, operacao: 'teste', path: matpath2})
        let grp = new Matgroup({materiais: [160001, 160002], status: grpstatus, ipedoutputpath: './'})
        mat.save()
        .then(() => { return mat2.save() })
        .then(() => { return grp.save() })
        .then(x => {
          return sleep(200).then(() => {
            return Matgroup.findOne(x._id)
            .then(doc => {
              expect(doc.status).equal(grpfinalstatus)
            })
          })
        })
        .then(() => { done() })
        .catch(done)
      })
    }
  })
  it('replaces directory if ok')
  it('rollback when image 2 fails')
  it('resume only from failed image')
})
