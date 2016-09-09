var gulp = require('gulp')
var $ = require('gulp-load-plugins')()

gulp.task('test', (done) => {
  gulp
    .src('test/**-test.js')
    .pipe($.mocha({reporter: 'list'}))
    .on('error', $.util.log)
    .on('finish', function () {
      done()
    })
})

gulp.task('watch', ['test'], () => {
  gulp.watch(['lib/**/*.*', 'test/**/*.*'], ['test'])
})
