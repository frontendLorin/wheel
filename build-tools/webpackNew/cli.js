const webpack = require('./lib/index');
const options = require('./webpack.config');
const compiler = webpack(options);

compiler.run((err, stat) => {
  console.log(err);
  console.log(stat);
});
