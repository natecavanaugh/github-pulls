var async = require('async');
var gulp = require('gulp-help')(require('gulp'));
var plugins = require('gulp-load-plugins')();
var path = require('path');
var runSequence = require('run-sequence');
var fs = require('fs-extra');

var exec = require('child_process').exec;

var APP_FILES_GLOB = [
	'./**/*',
	'!./gulpfile.js',
	'!./build{,/**}',
	'!./node_modules{,/**}',
	'!./bower_components{,/**}'
];

var ROOT_APPLICATIONS_PATH = '/Applications';
var USER_APPLICATIONS_PATH = path.join(process.env.HOME, ROOT_APPLICATIONS_PATH);

var APP_NAME = 'Github Pulls';
var APP_NAME_FULL = APP_NAME + '.app';

var BASE_PATH = __dirname;
var BUILD_DIR = path.join(BASE_PATH, 'build');

var BUILD_APP_DIR = path.join(BUILD_DIR, 'app_files');
var BUILD_APP_PATH = path.join(BUILD_DIR, 'releases', 'osx64', APP_NAME_FULL);

var BASE_FILES_GLOB = BUILD_APP_DIR + '/*';
var FILES_GLOB = BASE_FILES_GLOB + '*/*';

var getAppPath = function(cb) {
	async.detectSeries(
		[USER_APPLICATIONS_PATH, ROOT_APPLICATIONS_PATH],
		fs.exists,
		function(result) {
			cb(path.join(result, APP_NAME_FULL));
		}
	);
};

function installNpmModules(callback) {
	exec(
		'npm install --production --loglevel error',
		{
			cwd: BUILD_APP_DIR
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
			cwd: BUILD_APP_DIR
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

gulp.task(
	'copy-files',
	function() {
		return gulp.src(APP_FILES_GLOB)
		.pipe(plugins.debug())
		.pipe(gulp.dest(BUILD_APP_DIR));
	}
);

gulp.task(
	'install-deps',
	function(done) {
		async.series(
			[installNpmModules, installBowerComponents],
			done
		);
	}
);

gulp.task(
	'build:app',
	function(done) {
		var NwBuilder = require('node-webkit-builder');

		var nw = new NwBuilder(
			{
				files: FILES_GLOB,
				platforms: ['osx64'],
				appName: APP_NAME,
				buildDir: BUILD_DIR,
				buildType: function() {
					return 'releases';
				},
				cacheDir: path.join(BUILD_DIR, 'cache'),
				macIcns: path.join(BUILD_DIR, 'app.icns'),
				macPlist: path.join(BUILD_DIR, 'Info.plist')
			}
		);

		nw.on('log',  console.log);

		nw.build().then(
			function() {
				console.log('build success');
				done();
			}
		).catch(
			function (error) {
				console.error(error);
				done(error);
			}
		);
	}
);

gulp.task('build', function(done) {
	return runSequence('copy-files', 'install-deps', 'build:app', done);
});

gulp.task(
	'build:copy',
	function(done) {
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
							return done(err);
						}

						done();
					}
				);
			}
		);
	}
);

var appExists = function(destination) {
	var exists = fs.existsSync(destination);

	if (!exists) {
		console.log('App hasn\'t been installed. Run "gulp build" first.');
	}

	return exists;
};

gulp.task(
	'build:update',
	function(done) {
		getAppPath(
			function(destination) {
				if (!appExists(destination)) {
					return;
				}

				var deployedPath = path.join(destination, 'Contents/Resources/app.nw');

				gulp.src(APP_FILES_GLOB)
				.pipe(plugins.newer(deployedPath))
				// .pipe(plugins.debug())
				.pipe(gulp.dest(deployedPath));

				done();
			}
		);
	}
);

gulp.task(
	'build:watch',
	function(done) {
		getAppPath(
			function(destination) {
				if (!appExists(destination)) {
					return;
				}

				var filesGlob = [].concat(APP_FILES_GLOB);

				filesGlob.push('!./css/*');

				gulp.watch(
					filesGlob,
					['scss', 'build:update']
				);
			}
		);
	}
);

gulp.task(
	'scss',
	function() {
		gulp.src('./scss/*.scss')
		.pipe(plugins.sass())
		.pipe(gulp.dest('./css'));
	}
);

gulp.task(
	'build:install',
	function(done) {
		return runSequence('build', 'build:copy', done)
	}
);