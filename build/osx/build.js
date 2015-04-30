#!/usr/bin/env node

var async = require('async');
var argv = require('optimist').argv;
var fs = require('fs-extra');
var path = require('path');
var exec = require('child_process').exec;

var glob = require('glob');
var fsCompare = require('fs-compare');

var NW_VER = argv.version || '';

var NW_APP = 'node-webkit' + NW_VER + '.app';

var ROOT_APPLICATIONS_PATH = '/Applications';
var USER_APPLICATIONS_PATH = path.join(process.env.HOME, ROOT_APPLICATIONS_PATH);

var NW = path.join(ROOT_APPLICATIONS_PATH, NW_APP);


var APP_NAME = 'Github Pulls';
var APP_NAME_FULL = APP_NAME + '.app';

var BASE_PATH = __dirname;
var ROOT_PATH = path.join(BASE_PATH, '../..');

var APP_SRC_PATH = path.join(ROOT_PATH, 'app');
var BIN_PATH = path.join(ROOT_PATH, 'bin');
var BUILD_APP_DIR = path.join(BASE_PATH, APP_NAME);
var BUILD_APP_PATH = path.join(BUILD_APP_DIR, 'osx64', APP_NAME_FULL);

var BASE_FILES_GLOB = APP_SRC_PATH + '/*';
var FILES_GLOB = BASE_FILES_GLOB + '*/**';

var getAppPath = function(cb) {
	async.detectSeries(
		[USER_APPLICATIONS_PATH, ROOT_APPLICATIONS_PATH],
		fs.exists,
		function(result) {
			cb(path.join(result, APP_NAME_FULL));
		}
	);
};

function update(files) {
	async.reduce(
		files,
		[],
		function(memo, item, cb) {
			var filePath = item;
			var deployedFilePath = item.replace(APP_SRC_PATH, path.join(USER_APPLICATIONS_PATH, APP_NAME_FULL, 'Contents/Resources/app.nw'));

			fs.stat(
				filePath,
				function(err, stat) {
					if (err) {
						return cb(null, memo);
					}

					var fpStat = stat;

					fs.stat(
						deployedFilePath,
						function(err, stat) {
							if (err) {
								return cb(null, memo);
							}

							var dfpStat = stat;

							if (fpStat.mtime > dfpStat.mtime) {
								memo.push([filePath, deployedFilePath]);
							}

							cb(null, memo);
						}
					);
				}
			);
		},
		function(err, results) {
			if (err) {
				console.log('Could not copy files');
				return;
			}

			if (!results.length) {
				console.log('No newer files');
				return;
			}

			results.forEach(
				function(item, index) {
					fs.copy(
						item[0],
						item[1],
						function(err) {
							if (err) {
								console.log(err);
								return;
							}

							console.log('Copied %s to %s', item[0], item[1]);
						}
					);
				}
			);
		}
	);
}

if (argv.update || argv.watch) {
	getAppPath(
		function(result) {
			if (!fs.existsSync(result)) {
				console.log('App hasn\'t been installed');
				return;
			}

			if (argv.update) {
				glob(
					BASE_FILES_GLOB,
					function(err, files) {
						update(files);
					}
				);
			}
			else {
				var watch = require('watch');

				watch.watchTree(
					APP_SRC_PATH,
					{
						ignoreDotFiles: true,
						ignoreUnreadableDir: true,
						ignoreNotPermitted: true,
						filter: function(file, stat) {
							var rootFile = stat.isFile() && path.dirname(file) === APP_SRC_PATH;

							if (rootFile) {
								console.log('Watching %s', file);
							}
							return rootFile;
						}
					},
					function(f, curr, prev) {
						var msg = '';

						if (typeof f !== 'object' && (prev === null || curr.nlink !== 0)) {
							update([f]);
						}
						else if (curr && curr.nlink === 0) {
							msg = 'deleted';
						}
					}
				);
			}
		}
	);

	return;
}


var NwBuilder = require('node-webkit-builder');

var nw = new NwBuilder(
	{
		files: FILES_GLOB,
		platforms: ['osx64'],
		appName: APP_NAME,
		buildDir: BASE_PATH,
		macIcns: path.join(BASE_PATH, 'app.icns'),
		macPlist: path.join(BASE_PATH, 'Info.plist')
	}
);

nw.on('log',  console.log);

async.series(
	[
		installNpmModules,
		installBowerComponents,
		build,
		install
	],
	function(err) {
		console.log('done');
	}
);

function build(callback) {
	nw.build().then(
		function() {
			console.log('build success');
			callback();
		}
	).catch(
		function (error) {
			console.error(error);
			callback(error);
		}
	);
}

function installNpmModules(callback) {
	exec(
		'npm install --loglevel error',
		{
			cwd: APP_SRC_PATH
		},
		function(err, stdout, stderr) {
			if (err) {
				callback(err);
			}
			else {
				console.log(stdout || stderr);

				callback();
			}
		}
	);
}

function installBowerComponents(callback) {
	exec(
		'bower install --loglevel=error',
		{
			cwd: APP_SRC_PATH
		},
		function(err, stdout, stderr) {
			if (err) {
				callback(err);
			}
			else {
				console.log(stdout || stderr);

				callback();
			}
		}
	);
}

function install(callback) {
	if (argv.install) {
		getAppPath(
			function(destination) {
				async.series(
					[
						fs.remove.bind(fs, destination),
						fs.rename.bind(fs, BUILD_APP_PATH, destination),
						fs.remove.bind(fs, BUILD_APP_DIR)
					],
					function(err, results) {
						if (err) {
							console.log('Could not copy %s to %s', BUILD_APP_PATH, destination);
							return callback(err);
						}
						callback(err, results);
					}
				);
			}
		);
	}
	else {
		callback();
	}
}