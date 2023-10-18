const path = require('path');
const MyPlugin = require('./plugins/MyPlugin');

module.exports = {
  entry: {
    main: './src/index.js',
    entry2: './src/index1.js'
  },
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  plugins: [new MyPlugin()]
};
