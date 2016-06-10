'use strict';

const _ = require('lodash');

const Spinner = require('cli-spinner').Spinner;
const chalk = require('chalk');
const del = require('del');
const exec = require('child_process').exec;
const os = require('os');
const release = require('electron-release');
const Promise = require('bluebird');
const util = require('util');
const electronInstaller = require('electron-winstaller');

const packager = Promise.promisify(require('electron-packager'));

const webpack = require('webpack');

const cfg = require('./webpack.config.production.js');

const pkg = require('./package.json');

const archs = ['ia32', 'x64'];

const platforms = {
	darwin: archs.slice(1),
	linux: archs,
	win32: archs
};

const MAP_EXTENSIONS = {
	darwin: '.app',
	win32: '.exe',
	DEFAULT: ''
};

const MAP_ICONS = {
	darwin: '.icns',
	win32: '.ico',
	DEFAULT: '.png'
};

const error = _.flow(util.format, chalk.red, console.error);
const log = _.flow(util.format, chalk.green, console.log);

const packList = [];

Spinner.setDefaultSpinnerString(19);

const spinner = new Spinner('Packaging platforms...');

const argv = require('yargs')
			.env('GHPULLS')
			.options(
				{
					a: {
						alias: 'asar',
						boolean: true,
						default: true
					},
					all: {
						boolean: true,
						default: false
					},
					app: {
						array: true,
						default: [`release/${os.platform()}-${os.arch()}/${pkg.productName}.app`]
					},
					i: {
						alias: 'icon',
						default: 'app/app',
						string: true
					},
					n: {
						alias: 'name',
						default: pkg.productName,
						string: true
					},
					o: {
						alias: 'output'
					},
					platforms: {
						array: true,
						default: [`${os.platform()}-${os.arch()}`]
					},
					r: {
						alias: 'release',
						boolean: true,
						default: false
					},
					s: {
						alias: 'sign',
						requiresArg: true,
						string: true
					},
					t: {
						alias: 'token',
						requiresArg: true,
						string: true
					},
					v: {
						alias: 'version',
						default: function() {
							return require('electron-prebuilt/package.json').version;
						},
						requiresArg: true,
						string: true
					}
				}
			)
			.check(mapArgs)
			.implies('r', 't')
			.argv;

const devDeps = Object.keys(pkg.devDependencies);

const asar = argv.asar;
const buildAll = argv.all;
const icon = argv.icon;
const name = argv.name;
const version = argv.version;

var osxSign = null;

if (argv.sign) {
	osxSign = {
		identity: argv.sign
	};
}

const DEFAULT_OPTS = {
	asar,
	'app-bundle-id': 'com.natecavanaugh.github_pulls',
	dir: './',
	icon,
	ignore: [
		'^/test($|/)',
		'^/tools($|/)',
		'^/release($|/)',
		'^/bower_components/(bootstrap.*|jquery|lexicon|momentjs|svg4everybody|roboto-fontface/(?!fonts.*))',
		'^/(server|webpack.*|package)\.js$',
	].concat(devDeps.map(module => `/node_modules/${module}($|/)`)),
	name,
	'osx-sign': osxSign,
	overwrite: true,
	version
};

startPack();

function createInstallers(results) {
	let platforms = _.transform(
		argv.platforms,
		function(result, item, index) {
			if (item.includes('win32')) {
				result.push(item);
			}
		}
	);

	return _.map(
		platforms,
		function(item, index) {
			return electronInstaller.createWindowsInstaller(
				{
					appDirectory: `./release/${item}/${pkg.productName}-${item}`,
					description: pkg.description,
					exe: 'Github Pulls.exe',
					iconUrl: 'https://raw.githubusercontent.com/natecavanaugh/github-pulls/redux/app/app.ico',
					outputDirectory: `./release/${item}/${pkg.productName}-${item}-installer`
				}
			);
		}
	);
}

function logger(plat, arch) {
	return (filepath) => {
		log(`${plat}-${arch} finished!`);
	};
}

function mapArgs(argv, aliases) {
	if (argv.all) {
		const map = _.transform(
			platforms,
			function(result, item, index) {
				item.map(
					arch => {
						let ext = MAP_EXTENSIONS[index] || MAP_EXTENSIONS.DEFAULT;
						let productName = pkg.productName.replace(/ /g, '\\ ');

						result.apps.push(`./release/${index}-${arch}/${productName}-${index}-${arch}/${productName}${ext}`);
						result.platforms.push(`${index}-${arch}`);
					}
				)
			},
			{apps: [], platforms: []}
		);

		argv.app = map.apps;
		argv.platforms = map.platforms;
	}

	return true;
}

function pack(platform, arch) {
	const iconObj = {
		icon: DEFAULT_OPTS.icon + (MAP_ICONS[platform] || MAP_ICONS.DEFAULT)
	};

	const version = pkg.version || DEFAULT_OPTS.version;

	const opts = Object.assign(
		{},
		DEFAULT_OPTS,
		iconObj,
		{
			'app-version': version,
			arch,
			platform,
			prune: true,
			out: `release/${platform}-${arch}`,
			'version-string': {
				CompanyName: pkg.companyName,
				FileDescription: pkg.productName,
				FileVersion: version,
				ProductName: pkg.productName
			}
		}
	);

	return packager(opts);
}

function packPlatforms(platforms) {
	spinner.start();
	return _.map(
		argv.platforms,
		(item) => {
			var pieces = item.split('-');

			var platform = pieces[0];

			var arch = pieces[1];

			return pack(platform, arch).then(
				res => {
					log(`${platform}-${arch} finished!`);

					return res;
				}
			);
		}
	);
}

function releaseApp(results) {
	let opts = release.normalizeOptions(_.pick(argv, ['app', 'token']));

	var result = Promise.resolve();

// TODO
// need to uncomment these
// uncomment startPack
// test packaging all without releasing (get app extensions)
// possibly test releasing on a tmp repo
// rename package.js to build.js
	if (argv.release) {
		result = result
		.then(() => release.compress(opts))
		.then(() => release.release(_.merge(opts, {verbose: true})))
		.then(url => release.updateUrl(url))
		.then(() => {
			log('Published new release to GitHub (' + opts.tag + ')')
		});
	}

	return result;
}

function startPack() {
	console.log('start pack...');
	webpack(
		cfg,
		(err, stats) => {
			if (err) {
				return console.error(err);
			}

			del('release').then(
				paths => {
					var promises = packPlatforms(argv.platforms);

					return Promise.all(promises)
							.then(createInstallers)
							.then(releaseApp);
				}
			)
			.catch(err => console.error(err))
			.done(() => {
				spinner.stop();
			});
		}
	);
}