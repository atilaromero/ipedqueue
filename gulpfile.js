var gulp = require('gulp')
var $ = require('gulp-load-plugins')()

gulp.task('test', () => {
  return gulp
    .src('test/**-test.js')
    .pipe($.mocha({reporter: 'dot'}))
    .on('error', $.util.log)
})

gulp.task('watch-test', ['test'], () => {
  gulp.watch(['lib/**', 'test/**'], ['test'])
})
