let child_process = require('child_process')

module.exports = (wagner)=>{
  wagner.factory('queue',(kue,config)=>{
      let queue = kue.createQueue({redis:config.redis})
      queue.process('iped',(job,done)=>{
        function log(d1,d2){
          [job,console].forEach(x=>{
            if (d2){
              x.log(d1,d2)
            }else{
              x.log(d1)
            }
          })
        }
        function execSync(cmd){
          log(cmd,child_process.execSync(cmd).toString())
        }
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
        execSync('whoami')
        execSync('if not exist z: (net use z: \\\\setecrs\\iped )')
        execSync('net use')
        log('options:',options)

        let proc = child_process.spawn('java',options)
        let outs = [proc.stdout,proc.stderr]
        outs.forEach(out=>{
          out.setEncoding('utf8')
          out.on('data',data=>{
            log(data)
          })
        })
        proc.on('close',code=>{
          console.log('exit code', code)
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
