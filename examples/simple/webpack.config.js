'use strict';

var webpack = require('webpack');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/build',
    publicPath: __dirname + '/build/'
  },
  resolve: {
    alias: {
      'react$': require.resolve('../../node_modules/react'),
      'react-animation$': require.resolve('../../lib/')
    }
  },
  module: {
    loaders: [
      {
        test:/\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.js$/,
        loader: 'jsx-loader?harmony'
      },
      {
        test: /\.(otf|eot|svg|ttf|woff)/,
        loader: 'url-loader?limit=8192'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
//        NODE_ENV: JSON.stringify('production')
      }
    })
  ]
};
