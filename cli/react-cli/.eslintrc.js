module.exports = {
  extends: ['react-app'],
  parserOptions: {
    babelOptions: {
      presets: [
        // 解决页面报错
        ['babel-preset-react-app', false],
        'babel-preset-react-app/prod'
      ]
    }
  }
};
