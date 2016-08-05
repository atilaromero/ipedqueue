let child_process = require('child_process')

module.exports = (wagner)=>{
  wagner.factory('queue',(kue,config)=>{
      let queue = kue.createQueue({redis:config.redis})
      queue.process('iped',(job,done)=>{
        console.log('new job',job.data)
        let materiais = job.data.materiais
        let path = job.data.path
        let options = [
          '-Xms512M',
          '-Xmx6G',
          '-jar',
          config.iped.jar,
          '-o',
          path+'\\'+config.iped.output
        ]
        materiais.forEach(x=>{
          options = options.concat(['-d',x.path])
        })
        let proc = child_process.spawn('java',options)
        proc.stdout.setEncoding('utf8')
        proc.stdout.on('data',data=>{
          console.log(data.toString())
        })
        proc.stderr.on('data',data=>{
          console.log(data.toString())
        })
        proc.on('close',code=>{
          console.log('exit code', code)
          done()
        })
      })
      return queue
  })
}
