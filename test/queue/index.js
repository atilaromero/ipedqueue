'use strict'

const wagner = require('wagner-core')
const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.config.includeStack = false
const expect = chai.expect

module.exports.fail = function (done) {
  queue1image(done, 'test/fail', 'todo', 'failed')
}

module.exports.ok = function (done) {
  queue1image(done, 'test/ok', 'todo', 'done')
}

function queue1image (done, matpath, grpstatus, grpfinalstatus) {
  wagner.invoke((Material, queue) => {
    let mat = new Material({material: 160003, operacao: 'teste', path: matpath, state: grpstatus})
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
