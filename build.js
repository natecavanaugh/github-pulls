'use strict';

const _ = require('lodash');

const chalk = require('chalk');
const del = require('del');
const exec = require('child_process').exec;
const os = require('os');
const release = require('electron-release');
const got = require('got');
const Promise = require('bluebird');
const util = require('util');
const electronInstaller = require('electron-winstaller');

const fs = require('fs');
const writeFile = Promise.promisify(fs.writeFile);
const packager = Promise.promisify(require('electron-packager'));
const publishRelease = Promise.promisify(require('publish-release'));
const builder = require("electron-builder");

const GitHubApi = require('github');

var github = new GitHubApi(
	{
		debug: false,
		headers: {
			'user-agent': 'Github Pulls app v1.0'
		},
		protocol: 'https',
		version: '3.0.0'
	}
);

_.forOwn(
	github,
	function(item, index) {
		if (_.isPlainObject(item)) {
			Promise.promisifyAll(item);
		}
	}
);

const webpack = Promise.promisify(require('webpack'));

const cfg = require('./webpack.config.production.js');

const pkg = require('./app/package.json');

const archs = ['x64'];

const platforms = 'linux osx win'.split(' ');

const error = _.flow(util.format, chalk.red, console.error);
const log = _.flow(util.format, chalk.green, console.log);

_.forOwn(
	chalk.styles,
	(item, index) => {
		log[index] = _.flow(util.format, chalk[index], console.log);
	}
)

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
						default: [`${os.platform()}`]
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

const build = {
	asar,
	appId: 'com.natecavanaugh.github_pulls',
	'app-category-type': 'public.app-category.developer-tools',
	files: [
		'**/*',
		'bower_components/roboto-fontface/fonts{,/**}',
		'!bower_components/{bootstrap,bootstrap-sass,jquery,lexicon,momentjs,svg4everybody}{,/**/*}',
		'!bower_components/roboto-fontface/!(fonts){,/**}'
	],

	npmRebuild: false,

	osx: {}
};

if (argv.all) {
	build.linux = {
		target: ['deb', 'rpm']
	};

	build.win = {
		iconUrl: 'https://github.com/natecavanaugh/github-pulls/blob/master/build/icon.ico?raw=true',
		remoteReleases: 'https://github.com/natecavanaugh/github-pulls'
	};
}

const DEFAULT_OPTS = {
	arch: archs[0],
	platform: argv.platforms,
	cscName: argv.sign,
	githubToken: argv.token,
	publish: argv.release ? 'always' : 'never',
	'version-string': {
		CompanyName: pkg.companyName,
		FileDescription: pkg.productName,
		FileVersion: version,
		ProductName: pkg.productName
	},

	devMetadata: {
		build
	}
};

startPack();

function mapArgs(argv, aliases) {
	if (argv.all) {
		argv.platforms = platforms;
	}

	return true;
}

// function pack(platform, arch) {
// 	const iconObj = {
// 		icon: DEFAULT_OPTS.icon + (MAP_ICONS[platform] || MAP_ICONS.DEFAULT)
// 	};

// 	const version = pkg.version || DEFAULT_OPTS.version;

// 	const opts = Object.assign(
// 		{},
// 		DEFAULT_OPTS,
// 		iconObj,
// 		{
// 			'app-version': version,
// 			arch,
// 			platform,
// 			prune: true,
// 			out: `release/${platform}-${arch}`,
// 			'version-string': {
// 				CompanyName: pkg.companyName,
// 				FileDescription: pkg.productName,
// 				FileVersion: version,
// 				ProductName: pkg.productName
// 			}
// 		}
// 	);

// 	return packager(opts);
// }

function getRepo(pkg) {
	let url = pkg.repository.url.split('/')

	return url[3] + '/' + url[4].replace(/\.[^/.]+$/, '');
}

function releaseApp(results) {
	let repoInfo = getRepo(pkg);

	let [owner, repo] = repoInfo.split('/');

	let tag = `v${pkg.version}`;

	github.authenticate(
		{
			token: argv.token,
			type: 'oauth',
			owner
		}
	);

	return github.repos.getReleasesAsync(
		{
			user: owner,
			repo
		}
	).then(releases => {
		var release = _.find(releases, ['tag_name', tag]);

		var result;

		if (release) {
			result = github.repos.editReleaseAsync(
				{
					user: owner,
					repo,
					tag_name: tag,
					id: release.id,
					draft: false
				}
			);
		}
		else {
			result = Promise.reject(`Couldn't find a release with a tag name of ${tag}`);
		}

		return result;
	})
	.then(
		release => {
			var releaseURL = _.get(release, 'assets[0].browser_download_url');

			release.releaseURL = releaseURL;

			return releaseURL ? release : Promise.reject(`Couldn't find the assets browser_download_url`);
		}
	)
	.then(
		release => {
			const fileName = './auto_updater.json';

			var autoUpdater = require(fileName);

			var {releaseURL, name, published_at, created_at} = release;

			autoUpdater.url = releaseURL;
			autoUpdater.name = name;
			autoUpdater.pub_date = published_at || created_at;

			return writeFile(fileName, JSON.stringify(autoUpdater, null, '\t'));
		}
	)
	.then(
		release => {
			log.blue(
				`The ${tag} release has been published,
				and auto_updater.json has been modified.

				${chalk.red('You need to commit and push the auto_updater.json file!')}`
				.replace(/^\s*/gm, '')
			);

			return release;
		}
	);

// TODO
// need to fix editing the release options and set draft to false
}

function startPack() {
	webpack(cfg)
	.then(() => del('dist'))
	.then(() => builder.build(DEFAULT_OPTS))
	.then(argv.release ? releaseApp : _.identity)
	.catch(err => error(err.stack))
	.done(() => {
		log('Finished!');
	});
}