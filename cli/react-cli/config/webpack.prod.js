const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js'
  }
};
