let child_process = require('child_process')

module.exports = (wagner)=>{
  wagner.factory('queue',(kue,config)=>{
      let queue = kue.createQueue({redis:config.redis})
      let preparecmd = config.preparecmd
      queue.process('iped',(job,done)=>{
        function execSync(cmd){
          job.log(cmd,child_process.execSync(cmd).toString())
        }
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
        job.log('options:',options)

        if (config.precmd){
          execSync(config.precmd)
        }

        let proc = child_process.spawn('java',options)
        let outs = [proc.stdout,proc.stderr]
        outs.forEach(out=>{
          out.setEncoding('utf8')
          out.on('data',data=>{
            job.log(data)
          })
        })
        proc.on('close',code=>{
          if (code){
            done(new Error('exit code: '+code.toString()))
          }else{
            done()
          }
        })
      })
      return queue
  })
}
