var wagner = require('wagner-core')

wagner.factory('config',()=>{
  return require('../config-test.json')
})

describe("config",()=>{
  wagner.invoke((config)=>{
    it("exists",()=>{
      expect(config).not.toBeUndefined()
      expect(config).not.toBeNull()
      expect(config.listenport).toBe(80)
    })
  })
})

require('./mongoose')(wagner)
require('./models')(wagner)
require('./kue')(wagner)
require('./queue')(wagner)
