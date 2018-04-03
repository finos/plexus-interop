/*
 * Copyright 2017 Plexus Interop Deutsche Bank AG
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Karma configuration
// Generated on Fri Dec 29 2017 15:31:22 GMT+0300 (Russia TZ 2 Standard Time)

module.exports = function (config) {
  config.set({

    client: { 
        // pass dynamic param to test
        hostPath: config.hostPath,
        runInParent: true,
        useIframe: false
    },

    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'browserify'],


    // list of files / patterns to load in the browser
    files: [
      '../../node_modules/long/dist/long.js',
      'scripts/karma-*.js',
      'dist/main/tests/web/*.spec.js',
      'dist/main/src/polyfills.js'
    ],

    // list of files to exclude
    exclude: [
      'dist/main/tests/web/*Streaming.spec.js'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'dist/main/tests/web/*.spec.js': ['browserify'],
      'scripts/karma-*.js': ['browserify'],
      'dist/main/src/polyfills.js': ['browserify']
    },

    browserify: {
      debug: true
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    // reporters: ['progress', "mocha"],
    reporters: ['progress', 'mocha'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'IE_no_addons'],

    customLaunchers: {
      IE_no_addons: {
        base: 'IE',
        flags: ['-extoff']
      }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
