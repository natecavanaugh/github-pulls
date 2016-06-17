/* eslint strict: 0 */
'use strict';

const path = require('path');
const webpack = require('webpack');

let includePaths = [].concat(require('node-bourbon').includePaths);

includePaths.push(path.resolve(__dirname, './app/bower_components'));

module.exports = {
  sassLoader: {
    includePaths: includePaths
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /.(png|woff(2)?|eot|ttf|svg)(\?[a-z0-9=\.]+)?$/,
        loader: 'url?limit=100000'
      }
    ]
  },
  output: {
    path: path.join(__dirname, 'app', 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main'],
    root: [path.join(__dirname, 'app', "bower_components")]
  },
  plugins: [
    new webpack.ResolverPlugin(
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('.bower.json', ['main'])
    )
  ],
  externals: [
    'github-cache',
    'github',
    'jsop'
    // put your node 3rd party libraries which can't be built with webpack here (mysql, mongodb, and so on..)
  ]
};