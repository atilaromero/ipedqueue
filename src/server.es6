var wagner = require('wagner-core')
var express = require('express')
var compression = require('compression')
var baucis = require('baucis')

require('./config')(wagner)
require('./mongoose')(wagner)
require('./models')(wagner)
require('./kue')(wagner)
require('./queue')(wagner)

let messa = require('messa')

wagner.invoke((matgroup,material,config,kue,queue,mongoose)=>{
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


  function teste(){
    let m1 = new material({
      _id: 161234,
      path: "Z:\\operacoes\\operacao_teste\\auto_apreensao_teste\\item02-M161234_001372995DDD5B941B13000C\\item02-M161234_001372995DDD5B941B13000C.dd"
    })
    m1.save()

    let test = new matgroup({
      ipedoutputpath: "Z:\\operacoes\\operacao_teste\\auto_apreensao_teste\\SARD_Midias",
      status: "ready",
      materiais: [161234]
    })
    test.save()
  }

  //teste()

  app.listen(config.listenport)
})
