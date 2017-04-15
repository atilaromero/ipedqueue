'use strict'

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.config.includeStack = false
const expect = chai.expect
const queue = require('../../lib/queue')
const mongoose = require('mongoose')

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
  let mat = new mongoose.models.material({material: 160003, operacao: 'teste', path: matpath, state: grpstatus})
  return mat.save()
  .then(() => {
    return queue.chooseOne().then(queue.processOne)
  })
  .then(() => {
    return mongoose.models.material.findById(mat._id)
    .then(doc => {
      expect(doc).not.equal(null)
      expect(doc.state).equal(grpfinalstatus)
    })
  })
  .then(() => { done() })
}

function queue1image (done, matpath, grpstatus, grpfinalstatus) {
  fs.ensureFileAsync(matpath)
  .then(() => {
    return _queue1image(done, matpath, grpstatus, grpfinalstatus)
  })
  .catch(done)
}
