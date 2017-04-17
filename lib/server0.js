'use strict'

const queue = require('./queue')
require('./connect-with-retry')

queue.resetState()
let monitor = () => {
  return queue.singleProcess()
  .catch(reason => {
    if (!reason) {
      return new Promise((resolve) => {
        setTimeout(function () {
          // debug('polling jobs')
          resolve()
        }, 2000)
      })
      .then(() => {
        return monitor()
      })
    }
  })
}
