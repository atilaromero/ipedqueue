var express = require('express')
var compression = require('compression')
var baucis = require('baucis')
var messa = require('messa')

module.exports = (wagner)=>{
  wagner.factory('app',(matgroup,material,config,kue,queue,mongoose)=>{
    let app = express()
    app.use(compression())

    app.use('/',(req, res, next) => {
        res.charset = "utf-8"
        next()
    })

    app.use('/queue/',kue.app)

    baucis.rest(material)
    baucis.rest(matgroup)
    app.use('/api/',baucis())

    app.use('/messa/',messa(mongoose))
    return app
  })
}
