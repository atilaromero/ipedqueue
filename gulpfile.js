var gulp = require('gulp')
var $ = require('gulp-load-plugins')()

gulp.task('test', () => {
  return gulp
    .src('test/**-test.js')
    .pipe($.mocha({reporter: 'list'}))
    .on('error', $.util.log)
})

gulp.task('watch', () => {
  gulp.start(['test'])
  gulp.watch(['lib/**', 'test/**.js'], ['test'])
})
