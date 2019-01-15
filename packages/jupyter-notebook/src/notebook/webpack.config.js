const path = require('path');

module.exports = {
  entry: ['whatwg-fetch', './src/index.ts'],
  output: {
    path: path.resolve('/Users/shelms/Documents/git-repos/jupyter-extension/packages/jupyter-notebook/media', 'dist'),
    filename: 'bundle.js'
    // publicPath: './example/'
  },
  bail: true,
  devtool: 'cheap-source-map',
  mode: 'production',
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.html$/, use: 'file-loader' },
      { test: /\.md$/, use: 'raw-loader' },
      { test: /\.js.map$/, use: 'file-loader' },
      {
        test: /\.svg/,
        use: [
          { loader: 'svg-url-loader', options: {} },
          { loader: 'svgo-loader', options: { plugins: [] } }
        ]
      },
      {
        test: /\.(png|jpg|gif|ttf|woff|woff2|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [{ loader: 'url-loader', options: { limit: 10000 } }]
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};