const path = require('path');

module.exports = {
  watch: true,
  devtool: 'source-map',
  entry: './lib/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'my-first-webpack.bundle.js',
  },
  optimization: {
    minimize: false, // <---- 禁用 uglify.
    // minimizer: [new UglifyJsPlugin()] 使用自定义压缩工具
  },
  resolve: { // 路径别名
    alias: {
      '@': path.resolve('lib'),
    }
  },
};