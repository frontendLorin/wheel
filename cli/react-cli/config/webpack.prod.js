const path = require('path');
const EslintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

// 获取样式 loaders
const getStyleLoaders = (pre) => {
  return [
    // 将模块导出的内容作为样式并添加到 DOM 中
    MiniCssExtractPlugin.loader,
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
  mode: 'production',
  devtool: 'source-map',
  entry: path.resolve(__dirname, '../src/main.js'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/[name].[contenthash:10].js',
    chunkFilename: 'js/[name].[contenthash:10].chunk.js',
    clean: true
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
              cacheDirectory: true,
              cacheCompression: false
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
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:10].css',
      chunkFilename: 'css/[name].[contenthash:10].chunk.css'
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../public'),
          to: path.resolve(__dirname, '../dist'),
          globOptions: {
            ignore: ['**/index.html']
          }
        }
      ]
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}.js`
    },
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()]
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json']
  }
};
