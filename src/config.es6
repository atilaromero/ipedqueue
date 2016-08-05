var path = require('path')
module.exports = (wagner)=>{
  wagner.factory('config',()=>{
    let fpath='../config.json'
    if (process.argv.length>2){
      fpath=process.argv[2]
      if (fpath[0]!=='/'){
        fpath = path.join('../',fpath)
      }
    }
    return require(fpath)
  })
}
