let child_process = require('child_process')

module.exports = (wagner)=>{
  wagner.factory('queue',(kue,config)=>{
      let queue = kue.createQueue({redis:config.redis})
      queue.process('iped',(job,done)=>{
        console.log('new job',job.data)
        let materiais = job.data.materiais
        let ipedoutputpath = job.data.ipedoutputpath
        let options = [
          '-Xms512M',
          '-Xmx6G',
          '-jar', config.iped.jar,
          '--nogui', '--nologfile',
          '-o', ipedoutputpath
        ]
        materiais.forEach(x=>{
          options = options.concat(['-d',x.path])
        })
        let proc = child_process.spawn('java',options)
        job.log('options:',options)
        
        let outs = [proc.stdout,proc.stderr]
        outs.forEach(out=>{
          out.setEncoding('utf8')
          out.on('data',data=>{
            [job,console].forEach(x=>{
              x.log(data.toString())
            })
          })
        })
        proc.on('close',code=>{
          console.log('exit code', code)
          done()
        })
      })
      return queue
  })
}
