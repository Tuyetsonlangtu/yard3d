/**
 * Created by hien.tran on 2/21/2017.
 */

const path = require('path');
const webpack = require("webpack");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const isPro = JSON.parse(process.env.NODE_ENV || '0') === 1;

const plugins = [
  new CleanWebpackPlugin(['dist', 'public'], {
    root: __dirname,
    verbose: true,
    dry: false,
    exclude: ['assets','object-3d']
  }),
  new HtmlWebpackPlugin({
    filename: 'index.html',
    template: __dirname + '/index.html'
  }),
  new ExtractTextPlugin({
    filename: '[name].bundle.css',
    allChunks: true,
  }),
];
if(isPro) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      debug: true,
      minimize: true,
      sourceMap: false,
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    })
  );
}

const rules = [
  {
    test: /\.js$/,
    exclude: /node_modules/,
    use: [{
      loader: 'babel-loader',
      options: {
        babelrc: false,
        presets: [
          'es2015'
        ]
      }
    }]
  },
  {
    test: /\.css$/,
    loader: ExtractTextPlugin.extract({
      loader: 'css-loader?importLoaders=1',
    }),
  },
  {
    test: /\.png$/,
    loader: "url-loader?limit=100000"
  },
  {
    test: /\.jpg$/,
    loader: "file-loader"
  },
  {
    test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url?limit=10000&mimetype=application/font-woff'
  },
  {
    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url?limit=10000&mimetype=application/octet-stream'
  },
  {
    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'file'
  },
  {
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url?limit=10000&mimetype=image/svg+xml'
  },
  {
    test: /\.(sass|scss)$/,
    loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
  },
  {
    test: /\.json$/,
    use: 'json-loader'
  }
];

module.exports = {
  entry: ['./js/main.js', './css/app.scss'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isPro ?  'bundle.min.js' : 'bundle.js',
  },
  module: {rules: rules},
  resolve: {
    extensions: [".js", ".css", ".sass", "scss"]
  },
  devtool: isPro ? "nosources-source-map" : "eval-cheap-module-source-map",
  plugins: plugins
}