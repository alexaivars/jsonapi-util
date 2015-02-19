/* jshint node:true, es3:false */
// Karma configuration

module.exports = function(config) {

	"use strict";
  
	config.set({

	// base path, that will be used to resolve files and exclude
	basePath: './',


	// frameworks to use
	frameworks: ['es5-shim', 'mocha', 'sinon-chai'],

	files: [
		'index_test.js',
	],

	// list of preprocessors
	preprocessors: {
	  '**/*_test.js': ['webpack']
	},
	
	
	webpack: {
		watch: true,
		disableSha1:true,
		disableLogging:false,
		externals: {
			chai: 'chai',
			sinon: 'sinon'
		}
	},


	webpackServer: {
		noInfo: true,
		stats: {
			colors: true
		}
	},


	// test results reporter to use
	// possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
	reporters: ['progress'],


	// web server port
	port: 9876,


	// enable / disable colors in the output (reporters and logs)
	colors: true,


	// level of logging
	// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
	logLevel: config.LOG_INFO,


	// enable / disable watching file and executing tests whenever any file changes
	autoWatch: true,


	// Start these browsers, currently available:
	// - Chrome
	// - ChromeCanary
	// - Firefox
	// - Opera (has to be installed with `npm install karma-opera-launcher`)
	// - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
	// - PhantomJS
	// - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
	browsers: ['PhantomJS'],
	//browsers: ['Chrome'],


	// If browser does not capture in given timeout [ms], kill it
	captureTimeout: 60000,


	// Continuous Integration mode
	// if true, it capture browsers, run tests and exit
	singleRun: false,


	// List plugins explicitly, since autoloading karma-webpack
	// won't work here
	plugins: [
		require("karma-es5-shim"),
		require("karma-mocha"),
		require("karma-sinon-chai"),
		require("karma-webpack"),
		require("karma-phantomjs-launcher")
	]
  });
};

