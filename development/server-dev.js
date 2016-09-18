'use strict'
process.env.NODE_ENV = 'dev'

const wagner = require('wagner-core')
const path = require('path')
const assert = require('assert')
const Promise = require('bluebird')
const fs = require('fs-extra')

require('../lib/app')(wagner)

wagner.invoke((config, app) => {
  app.listen(config.listenport)
  wagner.invoke((Matgroup, Material, queue, kue) => {
    let mat1 = new Material({
      _id: 160001,
      operacao: 'teste',
      path: path.join(__dirname, 'ntfs.dd')
    })
    let mat2 = new Material({
      _id: 160002,
      operacao: 'teste',
      path: path.join(__dirname, 'ntfs.dd')
    })
    let grp = new Matgroup({
      ipedoutputpath: path.join(__dirname, 'output'),
      materiais: [160001, 160002],
      status: 'notready'
    })
    Promise.all([
      Matgroup.remove({}),
      Material.remove({})
    ])
    .then(() => {
      return new Promise((resolve, reject) => {
        fs.emptyDir(path.join(__dirname, 'output'), err => {
          if (err) return reject(err)
          fs.rmdir(path.join(__dirname, 'output'), err => {
            if (err) return reject(err)
            resolve()
          })
        })
      })
    })
    .then(() => {
      mat1.save()
      mat2.save()
      return grp.save()
    })
    .then(() => { return Promise.promisify(queue.active, {context: queue})() })
    .then(ids => { removeIds(ids) })
    .then(() => { return Promise.promisify(queue.failed, {context: queue})() })
    .then(ids => { removeIds(ids) })
    .then(() => { return Promise.promisify(queue.complete, {context: queue})() })
    .then(ids => { removeIds(ids) })

    function removeIds (ids) {
      ids.forEach(function (id) {
        kue.Job.get(id, function (err, job) {
          assert.ifError(err)
          job.remove()
        })
      })
    }
  })
})
