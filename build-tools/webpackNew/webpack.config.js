const path = require('path');
const MyPlugin = require('./plugins/MyPlugin');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  plugins: [new MyPlugin()]
};
