'use strict'

const child = require('child_process')

module.exports = (wagner) => {
  wagner.factory('queue', (kue, config) => {
    let queue = kue.createQueue({redis: config.redis})
    queue.process('iped', (job, done) => {
      console.log('1234')
      function execSync (cmd) {
        job.log(cmd, child.execSync(cmd).toString())
      }
        // hooker.hook(job,'log',()=>{
        //   //console.log(sliced(arguments))
        // })
      let materiais = job.data.materiais
      let ipedoutputpath = job.data.ipedoutputpath
      let options = [
        '-Xms512M',
        '-Xmx6G',
        '-jar', config.iped.jar,
        '--nogui', '--nologfile',
        '-o', ipedoutputpath
      ]
      materiais.forEach(x => {
        options = options.concat(['-d', x.path])
      })
      job.log('options:', options)

      if (config.precmd) {
        execSync(config.precmd)
      }

      let proc = child.spawn('java', options)
      let outs = [proc.stdout, proc.stderr]
      outs.forEach(out => {
        out.setEncoding('utf8')
        out.on('data', data => {
          job.log(data)
        })
      })
      proc.on('close', code => {
        if (code) {
          done(new Error('exit code: ' + code.toString()))
        } else {
          done()
        }
      })
    })
    return queue
  })
}
