'use strict'
process.env.NODE_ENV = 'dev'

const wagner = require('wagner-core')
const path = require('path')
const Promise = require('bluebird')
const fs = require('fs-extra')
const runProc = require('../lib/runProc')
const config = require('config')
require('../lib/connect-with-retry')
const app = require('../lib/app')
const Material = require('../lib/models/material')

app.listen(config.listenport, () => {
  console.log('Listening at %s', config.listenport)
})
wagner.invoke((queue) => {
  let mat1 = new Material({
    material: 160001,
    mat_suffix: 'Oi',
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
    path: path.join(__dirname, 'output/ntfs.dd'),
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
  .then(() => {
    return runProc('mkdir', [path.join(__dirname, '/output/')])
  })
  .then(() => {
    return runProc('cp', [path.join(__dirname, '/ntfs.dd'), path.join(__dirname, '/output/ntfs.dd')])
  })
  .then(() => { return mat1.save() })
  .then(() => { return mat2.save() })
  .then(() => { return queue.monitor() })
})
