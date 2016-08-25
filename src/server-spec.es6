var wagner = require('wagner-core')

wagner.factory('config',()=>require('../config-test.json'))
require('./mongoose')(wagner)
require('./models')(wagner)
require('./kue')(wagner)
require('./queue')(wagner)
require('./app')(wagner)

var request = require('request')

wagner.invoke((matgroup,material,config,kue,queue,mongoose,app)=>{
  let server = app.listen(config.listenport)
  let baseUrl = 'http://localhost:'+config.listenport
  describe("config",()=>{
    it("exists",(done)=>{
      expect(config).not.toBeUndefined()
      expect(config).not.toBeNull()
      expect(config.listenport).toBe(8880)
      done()
    })
  })
  describe("material",()=>{
    it('count',(done)=>{
      material.count((err,data)=>{
        expect(err).toBeNull()
        expect(data).toBe(0)
        // if (data!=0){
        //   console.log('material not empty: too dangerous, aborting')
        //   process.exit()
        // }
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
  describe("queue",()=>{
    it('count',(done)=>{
      request.get(baseUrl+'/queue/jobs/0..-1',(err,res,body)=>{
        expect(err).toBeNull()
        let json = JSON.parse(body)
        expect(json.length).toBe(0)
        done()
      })
    })
    it('update matgroup status',(done)=>{
      matgroup.findOne((err,data)=>{
        expect(err).toBeNull()
        data.status = 'ready'
        data.save((err,data)=>{
          expect(err).toBeNull()
          expect(data.status).toBe('ready')
          done()
        })
      })
    })
    it('count',(done)=>{
      request.get(baseUrl+'/queue/jobs/0..-1',(err,res,body)=>{
        expect(err).toBeNull()
        let json = JSON.parse(body)
        expect(json.length).toBe(1)
        done()
      })
    })
    it('stats',(done)=>{
      request.get(baseUrl+'/queue/stats',(err,res,body)=>{
        expect(err).toBeNull()
        let json = JSON.parse(body)
        expect(json.completeCount).toBe(0)
        expect(json.activeCount).toBe(1)
        expect(json.delayedCount).toBe(0)
        done()
      })
    })
    it('wait',(done)=>{
      setTimeout(function () {
        done()
      }, 2000);
    })
    it('stats',(done)=>{
      request.get(baseUrl+'/queue/stats',(err,res,body)=>{
        expect(err).toBeNull()
        let json = JSON.parse(body)
        expect(json.completeCount).toBe(0)
        expect(json.activeCount).toBe(0)
        expect(json.delayedCount).toBe(0)
        done()
      })
    })
    let lastjobid = null
    it('find last',(done)=>{
      request.get(baseUrl+'/queue/jobs/0..-1',(err,res,body)=>{
        expect(err).toBeNull()
        let json = JSON.parse(body)
        lastjobid = json.pop().id
        done()
      })
    })
    it('log',(done)=>{
      request.get(baseUrl+'/queue/job/'+lastjobid+'/log',(err,res,body)=>{
        expect(err).toBeNull()
        // console.log(body)
        done()
      })
    })
  })
  describe("cleaning",()=>{
    it('material',(done)=>{
      material.findOne(161234).remove((err)=>{
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
      matgroup.findOne({materiais: [161234]}).remove((err)=>{
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
    it('job',(done)=>{
      request.get(baseUrl+'/queue/jobs/0..-1',(err,res,body)=>{
        expect(err).toBeNull()
        let json = JSON.parse(body)
        if (json.length>0){
          request.delete(baseUrl+'/queue/job/'+json.pop().id,(err,res,body)=>{
            expect(err).toBeNull()
            let json = JSON.parse(body)
            expect(json.error).toBeUndefined()
            done()
          })
        }else{
          done()
        }
      })
    })
    it('close server',(done)=>{
      server.close()
      done()
    })
  })
})
