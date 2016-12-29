'use strict'
process.env.NODE_ENV = 'dev'

const wagner = require('wagner-core')
const path = require('path')
const Promise = require('bluebird')
const fs = require('fs-extra')

require('../lib/app')

wagner.invoke((config, app) => {
  app.listen(config.listenport)
  wagner.invoke((Material, queue) => {
    let mat1 = new Material({
      material: 160001,
      mat_suffix: 'chip',
      item: 3,
      apreensao: 160290,
      ipl: 161234,
      ipl_suffix: 'cxs',
      equipe: 'POA01',
      operacao: 'teste'
    })
    let mat2 = new Material({
      material: 160002,
      operacao: 'teste',
      path: path.join(__dirname, 'ntfs.dd'),
      state: 'todo'
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
