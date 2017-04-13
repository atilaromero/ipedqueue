'use strict'

const mongoose = require('mongoose')
const devidSchema = require('./devid.schema')

let model = mongoose.model('devid', devidSchema)
module.exports = model
