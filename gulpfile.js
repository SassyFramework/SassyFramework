var gulp         = require('gulp'),
    sass         = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss    = require('gulp-minify-css'),
    filter       = require('gulp-filter'), // for sass source-map
    uglify       = require('gulp-uglify'),
    gutil        = require('gulp-util'), // Utility functions for gulp plugins
    plumber      = require('gulp-plumber'),
    rename       = require('gulp-rename'), // renaming file
    concat       = require('gulp-concat'), // Concatenating file for JS
    changed      = require('gulp-changed'), // watch HTML files change
    // kss          = require('gulp-kss'), // KSS Styleguide
    browserSync  = require("browser-sync"),
    imagemin     = require('gulp-imagemin'), // image compression
    rimraf       = require('rimraf'); // cleaning of files

// Directories
var BUILD_DIR    = "build";
var SRC_DIR      = "src";
var PUBLIC_DIR   = "public";
var DOC_DIR      = "styleguide"; // documentation folder

var SASS_DIR     = "sass";
var CSS_DIR      = "css";
var JS_DIR       = "./js";
var IMAGES_DIR   = "img";


// A cache for Gulp tasks. It is used as a workaround for Gulp's dependency resolution
// limitations. It won't be needed anymore starting with Gulp 4.
var task = {};


// Clean up
gulp.task('clean', function(done) {
    rimraf('./' + BUILD_DIR, done);
    gutil.log("Cleaning " + BUILD_DIR + " directory");
});


// browser-sync task for starting the server.
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: BUILD_DIR
        }
    });
});


// Copy public/static files
gulp.task('public', task.public = function() {
    return gulp.src(PUBLIC_DIR + '/**')
        .pipe(gulp.dest(BUILD_DIR));
});
gulp.task('public-clean', ['clean'], task.public);

gulp.task('styles', task.styles = function() {
    return gulp.src(SRC_DIR + '/' + SASS_DIR + '/**/*.scss')
        .pipe(plumber())
        .pipe(sass({ style: 'expanded' }))
        .on('error', gutil.log)
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
        .pipe(gulp.dest(BUILD_DIR + '/' + CSS_DIR))
        .pipe(filter(BUILD_DIR + '/' + CSS_DIR + '/*.css')) // Filtering stream to only css files
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest(BUILD_DIR + '/' + CSS_DIR))
        .pipe(browserSync.reload({stream:true}));
});
gulp.task('styles-clean', ['clean'], task.styles);


// process JS files and return the stream.
gulp.task('scripts', task.scripts = function () {
    return gulp.src(SRC_DIR + '/' + JS_DIR + '/**/*.js')
        .pipe(uglify())
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest(BUILD_DIR + '/' + JS_DIR));
});
gulp.task('scripts-clean', ['clean'], task.scripts);

// HTML views
gulp.task('views', task.views = function() {
    return gulp.src(SRC_DIR + '/**/*.html')
        .pipe(changed(BUILD_DIR))
        .pipe(gulp.dest(BUILD_DIR));
});
gulp.task('views-clean', ['clean'], task.views);


// Generate styleguide with templates
// gulp.task('kss', task.kss = function() {
//     return gulp.src([SRC_DIR + '/' + SASS_DIR +'/**/*.scss'])
//         .pipe(kss({ overview: __dirname + DOC_DIR + '/css/styleguide.md' }))
//         .pipe(gulp.dest(DOC_DIR + '/'))
//         .pipe(sass({ style: 'expanded' }))
//         .pipe(concat(DOC_DIR + 'public/style.css'))
//         .pipe(gulp.dest(DOC_DIR + '/'));
// });
// gulp.task('kss-clean', ['clean'], task.kss);


gulp.task('watch', ['build'], function() {
    // Watch for changes in source files
    gulp.watch(PUBLIC_DIR + '/**', ['public', browserSync.reload]);
    gulp.watch(SRC_DIR + '/' + SASS_DIR + '/**/*.scss', ['styles', browserSync.reload]);
    gulp.watch(SRC_DIR + '/' + JS_DIR + '/**/*.js', ['scripts', browserSync.reload]);
    gulp.watch(SRC_DIR + '/**/*.html', ['views', browserSync.reload]);
});


// Build the app from source code
gulp.task('build', ['public-clean', 'views-clean', 'styles-clean', 'scripts-clean']);

gulp.task('default', ['browser-sync', 'watch']);