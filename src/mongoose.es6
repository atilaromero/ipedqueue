var mongoose = require('mongoose')
var baucis = require('baucis')

module.exports = (wagner)=>{
  wagner.factory('mongoose',(config)=>{
    let {host,port,db} = config.mongodb
    let url = `mongodb://${host}:${port}/${db}`
    let connectWithRetry = ()=>{
        return mongoose.connect(url, function(err) {
            if (err) {
                console.error('Failed to connect to mongo on startup - retrying in 1 sec', err)
                setTimeout(connectWithRetry, 1000);
            }
        })
    }
    connectWithRetry();
    return mongoose
  })
}
