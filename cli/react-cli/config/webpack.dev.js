const path = require('path');
const EslintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

// 获取样式 loaders
const getStyleLoaders = (pre) => {
  return [
    // 将模块导出的内容作为样式并添加到 DOM 中
    'style-loader',
    // 加载 CSS 文件并解析 import 的 CSS 文件，最终返回 CSS 代码
    {
      loader: 'css-loader',
      options: {
        modules: true
      }
    },
    {
      /**
       * 处理 css 兼容性问题，默认读取项目根目录的 postcss.config.js 作为配置项
       * 配合 .browserslistrc 文件来指定兼容性做到什么程度，主要是 autoprefix、postcss-preset-env 插件用来加前缀
       */
      loader: 'postcss-loader'
    },
    pre
  ].filter((loader) => !!loader);
};

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: path.resolve(__dirname, '../src/main.js'),
  devServer: {
    host: '0.0.0.0',
    open: true,
    hot: true
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js'
  },
  module: {
    rules: [
      // 处理样式
      {
        test: /\.css$/,
        use: getStyleLoaders()
      },
      {
        test: /\.less$/,
        // less-loader 加载并编译 LESS 文件
        use: getStyleLoaders('less-loader')
      },
      {
        test: /\.s[ac]ss$/,
        // sass-loader 加载并编译 SASS/SCSS 文件
        use: getStyleLoaders('sass-loader')
      },
      {
        test: /\.styl$/,
        // stylus-loader 加载并编译 Stylus 文件
        use: getStyleLoaders('stylus-loader')
      },
      // 处理图片
      {
        test: /\.(jpe?g|png|gif|webp|svg)/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 8kb
          }
        }
      },
      // 处理字体
      {
        test: /\.(woff?|ttf)/,
        type: 'asset/resource',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 8kb
          }
        }
      },
      {
        test: /\.jsx?$/,
        include: path.resolve(__dirname, '../src'),
        use: [
          {
            loader: 'babel-loader',
            options: {
              // cacheDirectory: true,
              // cacheCompression: false,
              plugins: [require.resolve('react-refresh/babel')]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html')
    }),
    new EslintPlugin({
      context: path.resolve(__dirname, '../src'),
      cache: true,
      cacheLocation: path.resolve(__dirname, '../node_modules/.cache/.eslintcache'),
      threads: true
    }),
    new ReactRefreshWebpackPlugin()
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}.js`
    }
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json']
  }
};
