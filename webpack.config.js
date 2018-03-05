const path = require('path')
module.exports = {
  entry: path.resolve(__dirname, 'js/comm.js'),
  output: {
    filename: 'comm.js',
    path: path.resolve(__dirname, 'build')
  }
}