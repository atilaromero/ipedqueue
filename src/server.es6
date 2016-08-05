var wagner = require('wagner-core')
var express = require('express')
var compression = require('compression')
var baucis = require('baucis')

require('./config')(wagner)
require('./mongoose')(wagner)
require('./models')(wagner)
require('./kue')(wagner)
require('./queue')(wagner)

wagner.invoke((matgroup,config,kue,queue)=>{
  let app = express()
  app.use(compression())

  app.use('/',(req, res, next) => {
      res.charset = "utf-8"
      next()
  })

  app.use('/queue/',kue.app)

  baucis.rest(matgroup)
  app.use('/',baucis())

  let test = new matgroup({
    ipedoutputpath: "Z:\\operacoes\\operacao_teste\\auto_apreensao_teste\\SARD_Midias",
    materiais: [
      {path: "Z:\\operacoes\\operacao_teste\\auto_apreensao_teste\\item02-M161234_001372995DDD5B941B13000C\\item02-M161234_001372995DDD5B941B13000C.dd"}
    ]
  })
  test.save((err,doc)=>{
    if (err) return console.error(err)
    queue.create('iped', doc).save()
  })


  app.listen(config.listenport)
})
