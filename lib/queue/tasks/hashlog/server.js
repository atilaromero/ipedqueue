'use strict'

const hashlog = require('./')
const express = require('express')
const mongoose = require('mongoose')

const app = express()
let ready = false

app.use('/:id', function (req, res) {
  if (!ready) {
    return res.status(500).json({status: 'not ready'})
  }
  ready = false
  let Material = mongoose.models.material
  Material.findById(req.params.id)
  .then((doc) => {
    hashlog(doc)
    .finally(() => {
      ready = true
    })
    return res.json('ok')
  })
  .catch((err) => {
    ready = true
    return res.status(500).json({error: err})
  })
})

app.listen(() => {
  ready = true
})
