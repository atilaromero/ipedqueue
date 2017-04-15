'use strict'

const os = require('os')

module.exports = function getServerID () {
  let ifaces = os.networkInterfaces()
  let names = Object.keys(ifaces)
    .filter(x => (ifaces[x][0].family === 'IPv4'))
    .filter(x => (ifaces[x][0].internal === false))
  let names2 = names.filter((x) => !x.startsWith('docker'))
  if (names2.length > 0) {
    names = names2
  }
  return ifaces[names[0]][0].address
}
