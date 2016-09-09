'use strict'

module.exports = (wagner) => {
  wagner.factory('kue', () => {
    return require('kue')
  })
}
