/* eslint strict: 0 */
'use strict';

const path = require('path');

module.exports = {
  sassLoader: {
    includePaths: require('node-bourbon').includePaths
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
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass?includePaths[]=' + require('node-bourbon').includePaths]
      }
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },
  plugins: [

  ],
  externals: [
    'github-cache',
    'github',
    'jsop'
    // put your node 3rd party libraries which can't be built with webpack here (mysql, mongodb, and so on..)
  ]
};