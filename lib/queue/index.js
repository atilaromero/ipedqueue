'use strict'

module.exports = (wagner) => {
  wagner.factory('queue', (kue, Matgroup, Material, config) => {
    let queue = kue.createQueue({redis: config.redis})
    queue.process('matgroup-iped', require('./matgroup-iped'))
    queue.process('material-iped', require('./material-iped'))
    // queue.process('material-hashes', require('./material-hashes'))
    return queue
  })
}
