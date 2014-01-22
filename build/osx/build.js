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

var APP = 'Github Pulls.app';

var BASE_PATH = __dirname;
var ROOT_PATH = path.join(BASE_PATH, '../..');
var APP_PATH = path.join(BASE_PATH, APP);
var APP_SRC_PATH = path.join(ROOT_PATH, 'app');
var BIN_PATH = path.join(ROOT_PATH, 'bin');
var BUILD_APP_PATH = path.join(BIN_PATH, APP);

async.detect(
	[NW, path.join(USER_APPLICATIONS_PATH, NW_APP)],
	fs.exists,
	checkNodeWebkit
);

function checkNodeWebkit(result) {
	if (!result) {
		console.log('This script requires ' + NW_APP + ' to be in your applications directory');

		return process.exit(1);
	}

	NW = result;

	init();
}

function copy(from, to) {
	return fs.copy.bind(fs, from, to);
}

function init() {
	async.series(
		[
			installModules,
			copy(NW, APP_PATH),
			copy(APP_SRC_PATH, path.join(APP_PATH, 'Contents/Resources/app.nw')),
			copy(path.join(BASE_PATH, 'app.icns'), path.join(APP_PATH, 'Contents/Resources/app.icns')),
			copy(path.join(BASE_PATH, 'Info.plist'), path.join(APP_PATH, 'Contents/Info.plist')),
			fs.remove.bind(fs, BUILD_APP_PATH),
			fs.rename.bind(fs, path.join(BASE_PATH, APP), BUILD_APP_PATH),
			install,
		],
		function(err) {
			console.log('done');
		}
	)
}

function installModules(callback) {
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

function install(callback) {
	if (argv.install) {
		async.detectSeries(
			[USER_APPLICATIONS_PATH, ROOT_APPLICATIONS_PATH],
			fs.exists,
			function(result) {
				var destination = path.join(result, APP);

				async.series(
					[
						fs.remove.bind(fs, destination),
						fs.rename.bind(fs, BUILD_APP_PATH, destination)
					],
					function(results) {
						console.log('copied?', BUILD_APP_PATH, destination);
						callback(results);
					}
				);
			}
		);
	}
	else {
		callback();
	}
}