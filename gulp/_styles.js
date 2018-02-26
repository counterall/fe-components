var gulp = require('gulp'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cssvars = require('postcss-simple-vars'),
    cssnested = require('postcss-nested'),
    cssImport = require('postcss-import'),
    mixins = require('postcss-mixins');

gulp.task('inventory-block', function () {
    return gulp.src('./src/css/inventory.css')
        .pipe(postcss([cssImport, mixins, cssvars, cssnested, autoprefixer]))
        .on('error', function (info) {
            console.log(info);
            this.emit('end');
        })
        .pipe(gulp.dest('./dest/css/'));
});
