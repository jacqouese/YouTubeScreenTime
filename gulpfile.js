const gulp = require('gulp');
const { src, series, parallel, dest, watch, task } = require('gulp');

const fileinclude = require('gulp-file-include');

const html = 'src/popup/*.html';
const js = 'src/**/*.js';
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
    return src(js).pipe(gulp.dest('dist'));
}

function copyCSS() {
    return src(css).pipe(gulp.dest('dist'));
}

function watchTask() {
    watch(['src/**/*.html', js, css], parallel(copyHTML, copyJS, copyCSS));
}

exports.default = watchTask;
