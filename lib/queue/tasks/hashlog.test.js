/* eslint-env mocha */
'use strict'

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const path = require('path')
const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.config.includeStack = false
const expect = chai.expect
const runProc = require('../../../lib/runProc')

module.exports = describe('queue.', function () {
  describe('hashlog', function () {
    it('calc hashes when no hashes exists', nohashes)
    it('calc hashes when they exists but are incomplete', incomplete)
    describe('do nothing when hashes are done', function () {
      it('image size: 0 bytes', donothing(0, 0, true))
      it('image size: 1 byte', donothing(1, 1, true))
      it('image size: 1G - 1 byte', donothing(Math.pow(1024, 3) - 1, 1, true))
      it('image size: 1G', donothing(Math.pow(1024, 3), 1, true))
      it('image size: 1G + 1 byte', donothing(Math.pow(1024, 3) + 1, 2, true))
    })
  })
})

function nohashes (done) {
  let dir = path.join(__dirname, '../tmp')
  let job = {data: {path: path.join(dir, 'imagem.dd')}}
  fs.emptyDirAsync(dir)
  .then(() => {
    return fs.ensureFileAsync(job.data.path)
  })
  .then(() => {
    return require('../../../lib/queue/hashlog')(job)
  })
  .then(() => {
    return fs.statAsync(path.join(dir, 'hashlog.md5'))
  })
  .then((stat) => {
    expect(stat.size).above(0)
    done()
  })
  .catch(done)
}

function incomplete (done) {
  let dir = path.join(__dirname, '../../../test/tmp')
  let job = {data: {path: path.join(dir, 'imagem.dd')}}
  fs.emptyDirAsync(dir)
  .then(() => {
    return fs.ensureFileAsync(job.data.path)
  })
  .then(() => {
    return fs.ensureFileAsync(path.join(dir, 'hashlog.md5'))
  })
  .then(() => {
    return require('../../../lib/queue/hashlog')(job)
  })
  .then(() => {
    return fs.statAsync(path.join(dir, 'hashlog.md5'))
  })
  .then((stat) => {
    expect(stat.size).above(0)
    done()
  })
  .catch(done)
}

function donothing (imagesize, lines, withcomments) {
  return function (done) {
    this.timeout(10000)
    let dir = path.join(__dirname, '../../../test/tmp')
    let job = {data: {path: path.join(dir, 'imagem.dd')}}
    let text = ''
    if (withcomments) {
      text += '#comment 1\n#comment 2\n'
    }
    text += '\n'.repeat(lines)
    text += 'Total (n bytes): asdf\n'

    fs.emptyDirAsync(dir)
    .then(() => {
      if (imagesize) {
        return runProc(
          'dd',
          [
            'if=/dev/zero',
            `bs=${imagesize}`,
            `of="${job.data.path}"`,
            'seek=1',
            'count=0'
          ]
        )
      } else {
        return fs.ensureFileAsync(job.data.path)
      }
    })
    .then(() => {
      return fs.writeFileAsync(path.join(dir, 'hashlog.md5'), text)
    })
    .then(() => {
      return require('../../../lib/queue/hashlog')(job)
    })
    .then(() => {
      return fs.readFileAsync(path.join(dir, 'hashlog.md5'))
    })
    .then((newtext) => {
      expect(newtext.toString()).equal(text)
      done()
    })
    .catch(done)
  }
}
