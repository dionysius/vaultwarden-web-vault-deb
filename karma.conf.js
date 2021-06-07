const path = require('path');

module.exports = function(config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            { pattern: 'src/**/*.spec.ts', watch: false },
        ],

        exclude: [
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/**/*.ts': 'webpack'
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'kjhtml'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        client:{
            clearContext: false // leave Jasmine Spec Runner output visible in browser
        },

        webpack: {
            mode: 'production',
            resolve: {
                extensions: ['.js', '.ts', '.tsx'],
                alias: {
                    "jslib-common": path.join(__dirname, 'jslib/common/src'),
                    "jslib-angular": path.join(__dirname, 'jslib/angular/src'),
                },
            },
            module: {
                rules: [
                    {test: /\.tsx?$/, loader: 'ts-loader'}
                ]
            },
            stats: {
                colors: true,
                modules: true,
                reasons: true,
                errorDetails: true
            },
            devtool: 'inline-source-map',
        },
    })
}
