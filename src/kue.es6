module.exports = (wagner)=>{
  wagner.factory('kue',(config)=>{
      let kue = require('kue')
      return kue
  })
}
