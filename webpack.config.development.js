import webpack from 'webpack';
import webpackTargetElectronRenderer from 'webpack-target-electron-renderer';
import baseConfig from './webpack.config.base';

const config = {
	...baseConfig,
	debug: true,

	devtool: 'cheap-module-eval-source-map',

	entry: [
		'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr',
		'./app/index'
	],

	output: {
		...baseConfig.output,
		publicPath: 'http://localhost:3000/dist/'
	},

	module: {
		...baseConfig.module,
		loaders: [
			...baseConfig.module.loaders,
			{
				test: /\.scss$/,
				loaders: ['style', 'css', 'sass']
			},
			{
				test: /\.svg$/,
				loader: 'svg-inline'
			}
		]
	},

	plugins: [
		...baseConfig.plugins,
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin(),
		new webpack.DefinePlugin({
			'__DEV__': true,
			'process.env': {
				'NODE_ENV': JSON.stringify('development')
			}
		})
	]
};

config.target = webpackTargetElectronRenderer(config);

export default config;