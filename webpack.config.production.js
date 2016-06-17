/* eslint strict: 0 */
'use strict';

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpackTargetElectronRenderer = require('webpack-target-electron-renderer');
const baseConfig = require('./webpack.config.base');

const config = Object.create(baseConfig);

config.devtool = 'source-map';

config.entry = './app/app/index';

config.output.publicPath = '../dist/';

config.module.loaders.push(
  {
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader')
  },
 {
    test: /\.svg$/,
    loader: 'svg-inline'
  },
 {
    test: /\.gif$/,
    loader: 'url-loader'
  }
);

config.plugins.push(
  new webpack.ProgressPlugin(defaultHandler),
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    '__DEV__': false,
    'process.env.NODE_ENV': JSON.stringify('development')
  }),
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      screw_ie8: true,
      warnings: false
    }
  }),
  new ExtractTextPlugin('[name].css', { allChunks: true })
);

config.target = webpackTargetElectronRenderer(config);

var chars = 0, lastState, lastStateTime;

function defaultHandler(percentage, msg) {
  var state = msg;

  function goToLineStart(nextMessage) {
    var str = '';

    for(; chars > nextMessage.length; chars--) {
      str += '\b \b';
    }

    chars = nextMessage.length;

    for(var i = 0; i < chars; i++) {
      str += '\b';
    }

    if(str) {
      process.stderr.write(str);
    }
  }

  if(percentage < 1) {
    percentage = Math.floor(percentage * 100);

    msg = percentage + '% ' + msg;

    if(percentage < 100) {
      msg = ' ' + msg;
    }

    if(percentage < 10) {
      msg = ' ' + msg;
    }
  }

  goToLineStart(msg);

  process.stderr.write(msg);
}

module.exports = config;