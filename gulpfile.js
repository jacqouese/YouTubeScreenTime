const gulp = require('gulp');
const uglify = require('gulp-uglify');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const { src, series, parallel, dest, watch, task } = require('gulp');

const fileinclude = require('gulp-file-include');

const concat = require('gulp-concat');

const html = 'src/popup/*.html';
const js = 'src/**/*.js';
const contentJS = 'src/content';
const css = 'src/**/*.css';

function copyHTML() {
    return src(html)
        .pipe(
            fileinclude({
                prefix: '@@',
                basepath: '@file',
            })
        )
        .pipe(gulp.dest('dist/popup'));
}

function copyJS() {
    return src(['src/background/*.js'])
        .pipe(rollup({ plugins: [babel(), resolve(), commonjs()] }, 'umd'))
        .pipe(gulp.dest('dist/background'));
}

function copyPopupJS() {
    return src(['src/popup/*.js'])
        .pipe(rollup({ plugins: [babel(), resolve(), commonjs()] }, 'umd'))
        .pipe(gulp.dest('dist/popup'));
}

function copyContentJS() {
    return src(['src/content/*.js'])
        .pipe(rollup({ plugins: [babel(), resolve(), commonjs()] }, 'umd'))
        .pipe(gulp.dest('dist/content'));
}

function copyCSS() {
    return src(css).pipe(gulp.dest('dist'));
}

function watchTask() {
    watch(['src/**/*.html', js, css], parallel(copyHTML, copyJS, copyContentJS, copyPopupJS, copyCSS));
}

exports.default = watchTask;
