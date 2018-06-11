var gulp = require('gulp'),
    watch = require('gulp-watch');

// main watch task
gulp.task('watch', function () {

    // monitor global css changes
    watch('./src/css/global/*.css', function () {
        gulp.start('global');
        gulp.start('inventory-block');
        gulp.start('select2');
        gulp.start('reserve-collect');
    });

    // dropdown related styles
    watch('./src/css/inventory/**/*.css', function () {
        gulp.start('inventory-block');
    });

    // marimekko theme for select2
    watch('./src/css/select2/**/*.css', function () {
        gulp.start('select2');
    });

    // marimekko theme for select2
    watch('./src/css/reserve-collect/**/*.css', function () {
        gulp.start('reserve-collect');
    });
});

