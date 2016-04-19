import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import baseConfig from './webpack.config.base';

const config = {
	...baseConfig,

	devtool: 'source-map',

	entry: './app/index',

	output: {
		...baseConfig.output,
		publicPath: '../dist/'
	},

	module: {
		...baseConfig.module,
		loaders: [
			...baseConfig.module.loaders,
			{
				test: /\.scss$/,
				loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader')
			},
			{
				test: /\.svg$/,
				loader: 'svg-inline'
			}
		]
	},

	plugins: [
		...baseConfig.plugins,
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.DefinePlugin({
			'__DEV__': false,
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
			compressor: {
				screw_ie8: true,
				warnings: false
			}
		}),
		new ExtractTextPlugin('[name].css', { allChunks: true })
	],

	target: 'electron-renderer'
};

module.exports = config;