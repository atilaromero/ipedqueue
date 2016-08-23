var wagner = require('wagner-core')

wagner.factory('config',()=>require('../config-test.json'))
require('./mongoose')(wagner)
require('./models')(wagner)
require('./kue')(wagner)
require('./queue')(wagner)
require('./app')(wagner)

wagner.invoke((matgroup,material,config,kue,queue,mongoose,app)=>{
  let server = app.listen(config.listenport)
  describe("config",()=>{
    it("exists",()=>{
      expect(config).not.toBeUndefined()
      expect(config).not.toBeNull()
      expect(config.listenport).toBe(8880)
    })
  })
  describe("material",()=>{
    it('count',(done)=>{
      material.count((err,data)=>{
        expect(err).toBeNull()
        expect(data).toBe(0)
        done()
      })
    })
    it("save",(done)=>{
      let m1 = new material({
        _id: 161234,
        path: "Z:\\operacoes\\operacao_teste\\auto_apreensao_teste\\item02-M161234_001372995DDD5B941B13000C\\item02-M161234_001372995DDD5B941B13000C.dd"
      })
      m1.save((err)=>{
        expect(err).toBeNull()
        done()
      })
    })
    it('count',(done)=>{
      material.count((err,data)=>{
        expect(err).toBeNull()
        expect(data).toBe(1)
        done()
      })
    })
    it('getone',(done)=>{
      material.findOne((err,data)=>{
        expect(err).toBeNull()
        expect(data._id).toBe(161234)
        done()
      })
    })
  })
  describe("matgroup",()=>{
    it("new",(done)=>{
      let test = new matgroup({
        ipedoutputpath: "Z:\\operacoes\\operacao_teste\\auto_apreensao_teste\\SARD_Midias",
        status: "notready",
        materiais: [161234]
      })
      test.save((err)=>{
        expect(err).toBeNull()
        done()
      })
    })
  })
  describe("cleaning",()=>{
    it('material',(done)=>{
      material.remove((err)=>{
        expect(err).toBeNull()
        done()
      })
    })
    it('material - count',(done)=>{
      material.count((err,data)=>{
        expect(err).toBeNull()
        expect(data).toBe(0)
        done()
      })
    })
    it('matgroup',(done)=>{
      matgroup.remove((err)=>{
        expect(err).toBeNull()
        done()
      })
    })
    it('matgroup - count',(done)=>{
      matgroup.count((err,data)=>{
        expect(err).toBeNull()
        expect(data).toBe(0)
        done()
      })
    })
  })

  server.close()
})
