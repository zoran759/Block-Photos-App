const path = require('path');

// copy manifest.json to the path: 'public/build'
// this will allow for the authRequest to see the file at www.example.com/manifest.json
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ManifestAssetPlugin = new CopyWebpackPlugin([{ from: 'public/manifest.json', to: 'manifest.json' }]);
const ServerAssetPlugin = new CopyWebpackPlugin([{ from: 'src/server.js', to: 'server.js' }]);
// const IconAssetPlugin = new CopyWebpackPlugin([ { from: 'src/images/icon-192x192.png', to: 'icon-192x192.png' } ]);

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './public/index.html',
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  entry: './src/index.js',
  target: 'web',
  output: {
    path: path.resolve('build'),
    filename: 'index_bundle.js',
  },
  devServer: {
    historyApiFallback: true,
    watchOptions: { aggregateTimeout: 300, poll: 1000 },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
    },
    port: 9876
  },
  module: {
    rules: [
      { test: /\.json$/, use: 'json-loader' },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /\.(\/node_modules\/|\/build\/|\/main.js|\/src\/server.js)(\?\S*)?$/
      },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif)(\?\S*)?$/,
        loader: 'file-loader!url-loader',
      },
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  },
  plugins: [HtmlWebpackPluginConfig, ManifestAssetPlugin, ServerAssetPlugin]
}
