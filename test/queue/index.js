'use strict'

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const wagner = require('wagner-core')
const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.config.includeStack = false
const expect = chai.expect

module.exports.fail = function (done) {
  queue1image(done, 'test/tmp/fail', 'todo', 'failed')
}

module.exports.ok = function (done) {
  queue1image(done, 'test/tmp/ok', 'todo', 'done')
}

module.exports.missing = function (done) {
  _queue1image(done, 'test/tmp/missing', 'todo', 'todo')
  .catch(() => { return done() }) // ignore missing file error
}

function _queue1image (done, matpath, grpstatus, grpfinalstatus) {
  return wagner.invoke((Material, queue) => {
    let mat = new Material({material: 160003, operacao: 'teste', path: matpath, state: grpstatus})
    return mat.save()
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
  })
}

function queue1image (done, matpath, grpstatus, grpfinalstatus) {
  fs.ensureFileAsync(matpath)
  .then(() => {
    return _queue1image(done, matpath, grpstatus, grpfinalstatus)
  })
  .catch(done)
}
