var gulp = require('gulp');
var $ = require('gulp-load-plugins')();


gulp.task('babel',()=>{
  gulp
    .src('src/**/*.es6')
    .pipe($.babel())
    .pipe(gulp.dest('dist/'))
});

gulp.task('default',['babel']);

gulp.task('watch',['default'],()=>{
  gulp.watch('src/**/*.es6',['default'])
});
