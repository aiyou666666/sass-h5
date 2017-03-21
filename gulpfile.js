var gulp = require('gulp');
var spritesmith = require('gulp.spritesmith');
var imagemin = require('gulp-imagemin');

gulp.task('default', function () {
    var spriteData = gulp.src('webapp/images/icon/*.png').pipe(spritesmith({
        imgName: 'icon.png',
        cssName: 'g_icon.css'
    }));
    spriteData.img.pipe(gulp.dest('webapp/images/'));
    spriteData.css.pipe(gulp.dest('webapp/src/libs/scss/'));
});
