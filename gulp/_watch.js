var gulp = require('gulp'),
    watch = require('gulp-watch');

// main watch task
gulp.task('watch', function () {

    // monitor global css changes
    watch('./src/css/global/*.css', function () {
        gulp.start('inventory-block');
    });

    // dropdown related styles
    watch('./src/css/inventory/**/*.css', function () {
        gulp.start('inventory-block');
    });

});

