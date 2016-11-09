'use strict'
process.env.NODE_ENV = 'dev'

const wagner = require('wagner-core')
const path = require('path')
const Promise = require('bluebird')
const fs = require('fs-extra')

require('../lib/app')(wagner)

wagner.invoke((config, app) => {
  app.listen(config.listenport)
  wagner.invoke((Material, queue) => {
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
    Promise.all([
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
    .then(() => { return mat1.save() })
    .then(() => { return mat2.save() })
    .then(() => { return queue.monitor() })
  })
})
