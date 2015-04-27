#!/usr/bin/env node

var async = require('async');
var argv = require('optimist').argv;
var fs = require('fs-extra');
var path = require('path');
var exec = require('child_process').exec;


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

var NwBuilder = require('node-webkit-builder');

var nw = new NwBuilder(
	{
		files: APP_SRC_PATH + '/**/**',
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
		async.detectSeries(
			[USER_APPLICATIONS_PATH, ROOT_APPLICATIONS_PATH],
			fs.exists,
			function(result) {
				var destination = path.join(result, APP_NAME_FULL);

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