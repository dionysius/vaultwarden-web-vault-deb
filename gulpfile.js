const gulp = require('gulp'),
    gulpif = require('gulp-if'),
    filter = require('gulp-filter'),
    replace = require('gulp-replace'),
    googleWebFonts = require('gulp-google-webfonts'),
    jeditor = require("gulp-json-editor"),
    child = require('child_process'),
    zip = require('gulp-zip'),
    manifest = require('./src/manifest.json'),
    xmlpoke = require('gulp-xmlpoke'),
    del = require('del'),
    fs = require('fs');

const paths = {
    build: './build/',
    dist: './dist/',
    coverage: './coverage/',
    node_modules: './node_modules/',
    popupDir: './src/popup/',
    cssDir: './src/popup/css/'
};

const filters = {
    fonts: [
        '!build/popup/fonts/*',
        'build/popup/fonts/Open_Sans*.woff',
        'build/popup/fonts/fontawesome*.woff2',
        'build/popup/fonts/fontawesome*.woff'
    ],
    safari: [
        '!build/safari/**/*',
        '!build/downloader/**/*'
    ],
    webExt: [
        '!build/manifest.json'
    ],
    edge: [
        '!build/edge/**/*'
    ],
    nonSafariApp: [
        '!build/background.html',
        '!build/popup/index.html'
    ],
};

function buildString() {
    var build = '';
    if (process.env.APPVEYOR_BUILD_NUMBER && process.env.APPVEYOR_BUILD_NUMBER !== '') {
        build = `-${process.env.APPVEYOR_BUILD_NUMBER}`;
    }
    return build;
}

function distFileName(browserName, ext) {
    return `dist-${browserName}${buildString()}.${ext}`;
}

function dist(browserName, manifest) {
    return gulp.src(paths.build + '**/*')
        .pipe(filter(['**'].concat(filters.edge).concat(filters.fonts).concat(filters.safari)))
        .pipe(gulpif('popup/index.html', replace('__BROWSER__', 'browser_' + browserName)))
        .pipe(gulpif('manifest.json', jeditor(manifest)))
        .pipe(zip(distFileName(browserName, 'zip')))
        .pipe(gulp.dest(paths.dist));
}

function distFirefox() {
    return dist('firefox', (manifest) => {
        delete manifest['-ms-preload'];
        delete manifest.content_security_policy;
        removeShortcuts(manifest);
        return manifest;
    });
}

function distOpera() {
    return dist('opera', (manifest) => {
        delete manifest['-ms-preload'];
        delete manifest.applications;
        delete manifest.content_security_policy;
        removeShortcuts(manifest);
        return manifest;
    });
}

function distChrome() {
    return dist('chrome', (manifest) => {
        delete manifest['-ms-preload'];
        delete manifest.applications;
        delete manifest.content_security_policy;
        delete manifest.sidebar_action;
        delete manifest.commands._execute_sidebar_action;
        return manifest;
    });
}

function removeShortcuts(manifest) {
    if (manifest.content_scripts && manifest.content_scripts.length > 1) {
        const shortcutsScript = manifest.content_scripts[1];
        if (shortcutsScript.js.indexOf('content/shortcuts.js') > -1) {
            manifest.content_scripts.splice(1, 1);
        }
    }
}

// Since Edge extensions require makeappx to be run we temporarily store it in a folder.
function distEdge(cb) {
    const edgePath = paths.dist + 'Edge/';
    const extensionPath = edgePath + 'Extension/';
    const fileName = distFileName('edge', 'appx');
    const appxPath = paths.dist + fileName;

    return del([edgePath, appxPath])
        .then(() => edgeCopyBuild(paths.build + '**/*', extensionPath))
        .then(() => edgeCopyAssets('./store/windows/**/*', edgePath))
        .then(() => {
            // makeappx.exe must be in your system's path already
            child.spawn('makeappx.exe', ['pack', '/h', 'SHA256', '/d', edgePath, '/p', appxPath]);
            return cb;
        }, () => {
            return cb;
        });
}

function edgeCopyBuild(source, dest) {
    return new Promise((resolve, reject) => {
        gulp.src(source)
            .on('error', reject)
            .pipe(filter(['**'].concat(filters.fonts).concat(filters.safari)))
            .pipe(gulpif('popup/index.html', replace('__BROWSER__', 'browser_edge')))
            .pipe(gulpif('manifest.json', jeditor((manifest) => {
                delete manifest.applications;
                delete manifest.sidebar_action;
                delete manifest.commands._execute_sidebar_action;
                delete manifest.content_security_policy;
                return manifest;
            })))
            .pipe(gulp.dest(dest))
            .on('end', resolve);
    });
}

function edgeCopyAssets(source, dest) {
    return new Promise((resolve, reject) => {
        gulp.src(source)
            .on('error', reject)
            .pipe(gulpif('AppxManifest.xml', xmlpoke({
                replacements: [{
                    xpath: '/p:Package/p:Identity/@Version',
                    value: manifest.version + '.0',
                    namespaces: {
                        'p': 'http://schemas.microsoft.com/appx/manifest/foundation/windows10'
                    }
                }]
            })))
            .pipe(gulp.dest(dest))
            .on('end', resolve);
    });
}

function distSafari(cb) {
    const buildPath = paths.dist + 'Safari/';
    const extBuildPath = buildPath + 'bitwarden.safariextension/';
    const extAssetsBuildPath = extBuildPath + 'safari/';

    return del([buildPath + '**/*'])
        .then(() => safariCopyBuild(paths.build + '**/*', extBuildPath))
        .then(() => copy(extAssetsBuildPath + '**/*', extBuildPath))
        .then(() => del([extAssetsBuildPath]))
        .then(() => safariZip(buildPath))
        .then(() => {
            return cb;
        }, () => {
            return cb;
        });
}

function safariCopyBuild(source, dest) {
    return new Promise((resolve, reject) => {
        gulp.src(source)
            .on('error', reject)
            .pipe(filter(['**'].concat(filters.edge).concat(filters.fonts).concat(filters.webExt)))
            .pipe(gulpif('popup/index.html', replace('__BROWSER__', 'browser_safari')))
            .pipe(gulp.dest(dest))
            .on('end', resolve);
    });
}

function safariZip(buildPath) {
    return new Promise((resolve, reject) => {
        gulp.src(buildPath + '**/*')
            .on('error', reject)
            .pipe(zip(distFileName('safari', 'zip')))
            .pipe(gulp.dest(paths.dist))
            .on('end', resolve);
    });
}

function distSafariApp(cb) {
    const buildPath = paths.dist + 'Safari/';
    const extBuildPath = buildPath + 'app_extension/';
    const appPath = './src/safari/app/desktop/'

    return del([buildPath + '**/*'])
        .then(() => copy(appPath + '**/*', extBuildPath))
        .then(() => safariAppCopyBuild(paths.build + '**/*', extBuildPath + 'safari/app'))
        .then(() => {
            return cb;
        }, () => {
            return cb;
        });
}

function safariAppCopyBuild(source, dest) {
    return new Promise((resolve, reject) => {
        gulp.src(source)
            .on('error', reject)
            .pipe(filter(['**'].concat(filters.edge).concat(filters.fonts).concat(filters.safari)
                .concat(filters.webExt).concat(filters.nonSafariApp)))
            .pipe(gulp.dest(dest))
            .on('end', resolve);
    });
}

function webfonts() {
    return gulp.src('./webfonts.list')
        .pipe(googleWebFonts({
            fontsDir: 'webfonts',
            cssFilename: 'webfonts.css'
        }))
        .pipe(gulp.dest(paths.cssDir));
}

function ciCoverage(cb) {
    return gulp.src(paths.coverage + '**/*')
        .pipe(filter(['**', '!coverage/coverage*.zip']))
        .pipe(zip(`coverage${buildString()}.zip`))
        .pipe(gulp.dest(paths.coverage));
}

function copy(source, dest) {
    return new Promise((resolve, reject) => {
        gulp.src(source)
            .on('error', reject)
            .pipe(gulp.dest(dest))
            .on('end', resolve);
    });
}

// ref: https://github.com/t4t5/sweetalert/issues/890
function fixSweetAlert(cb) {
    fs.writeFileSync(paths.node_modules + 'sweetalert/typings/sweetalert.d.ts',
        'import swal, { SweetAlert } from "./core";export default swal;export as namespace swal;');
    cb();
}

exports['dist:firefox'] = distFirefox;
exports['dist:chrome'] = distChrome;
exports['dist:opera'] = distOpera;
exports['dist:edge'] = distEdge;
exports['dist:safari'] = distSafari;
exports['dist:safariApp'] = distSafariApp;
exports.dist = gulp.parallel(distFirefox, distChrome, distOpera, distEdge, distSafari);
exports['ci:coverage'] = ciCoverage;
exports.ci = ciCoverage;
exports.webfonts = webfonts;
exports.build = webfonts;
exports.fixSweetAlert = fixSweetAlert;
exports.postinstall = fixSweetAlert;
