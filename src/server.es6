var wagner = require('wagner-core')

require('./config')(wagner)
require('./mongoose')(wagner)
require('./models')(wagner)
require('./kue')(wagner)
require('./queue')(wagner)
require('./app')(wagner)

wagner.invoke((matgroup,material,config,kue,queue,mongoose,app)=>{
  let server = app.listen(config.listenport)
})
