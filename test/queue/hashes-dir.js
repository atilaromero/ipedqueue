'use strict'

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const path = require('path')
const hashesdir = require('../../lib/queue/hashes-dir')
const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.config.includeStack = false
const expect = chai.expect

module.exports.dirempty = function (done) {
  let dir = path.join(__dirname, '../tmp')
  let job = {data: {path: path.join(dir, 'imagem.dd')}}
  fs.emptyDirAsync(dir)
  .then(() => {
    return fs.ensureFileAsync(job.data.path)
  })
  .then(() => {
    return hashesdir(job)
  })
  .then(() => {
    return fs.statAsync(path.join(dir, 'hashes.txt'))
  })
  .then((stat) => {
    expect(stat.size).above(0)
    done()
  })
  .catch(done)
}

module.exports.rehash = function (done) {
  let dir = path.join(__dirname, '../tmp')
  let job = {data: {path: path.join(dir, 'imagem.dd')}}
  fs.emptyDirAsync(dir)
  .then(() => {
    return fs.ensureFileAsync(job.data.path)
  })
  .then(() => {
    return fs.ensureFileAsync(path.join(dir, 'hashes.txt'))
  })
  .then(() => {
    return hashesdir(job)
  })
  .then(() => {
    return fs.statAsync(path.join(dir, 'hashes.txt'))
  })
  .then((stat) => {
    expect(stat.size).above(0)
    done()
  })
  .catch(done)
}
