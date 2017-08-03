/* eslint-env mocha */
'use strict'

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const expect = require('chai').expect
const mongoose = require('mongoose')
const queue = require('./')

module.exports = describe('queue.', function () {
  it('state:failed if process exits with error', fail)
  it('state:done if process exits fine', ok)
  it('state:hold if image does not exist', missing)
  xit('creates E01 if process a dd file', dd) // dd2ewf is disabled

  require('./tasks/hashlog/test')
})

function fail () {
  let filePath = 'test/tmp/fail'
  return fs.ensureFileAsync(filePath)
  .then(() => {
    return queue1image(filePath)
  })
  .then(doc => {
    expect(doc.state).equal('failed')
  })
}

function dd () {
  let filePath = 'test/tmp/dd.dd'
  return fs.ensureFileAsync(filePath)
  .then(() => {
    return queue1image(filePath)
  })
  .then(doc => {
    expect(doc.state).equal('done')
  })
  .then(() => {
    return fs.statSync(filePath.replace(/\.dd$/, '.E01'))
  })
  .then((stat) => {
    expect(!stat).equal(false)
  })
}

function ok () {
  let filePath = 'test/tmp/ok'
  return fs.ensureFileAsync(filePath)
  .then(() => {
    return fs.ensureFileAsync('test/tmp/SARD/IPED-SearchApp.exe')
  })
  .then(() => {
    return queue1image(filePath)
  })
  .then(doc => {
    expect(doc.state).equal('done')
  })
}

function missing () {
  return queue1image('test/tmp/missing')
  .then(doc => {
    expect(doc.state).equal('hold')
  })
}

function queue1image (matpath) {
  let Model = mongoose.models.material
  let mat = new Model({material: 160003, operacao: 'teste', path: matpath, state: 'todo'})
  return mat.save()
  .then(() => {
    return queue.chooseOne().then(queue.processOne)
  })
  .catch((err) => {
    // we can receive an empty reject() when file is missing, lets ignore that
    if (err) {
      // but we should care otherwise
      Promise.reject(err)
    }
  })
  .then(() => {
    return mongoose.models.material.findById(mat._id)
  })
}
