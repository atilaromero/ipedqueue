var gulp = require('gulp');
var $ = require('gulp-load-plugins')();


gulp.task('babel',()=>{
  return gulp
    .src('src/**/*.es6')
    .pipe($.babel())
    .pipe(gulp.dest('dist/'))
});

gulp.task('copyjs',()=>{
  return gulp
    .src('src/**/*.js')
    .pipe(gulp.dest('dist/'))
});

gulp.task('test',['default'],(done)=>{
  gulp
    .src('dist/**-test.js')
    .pipe($.jasmine({
      "spec_dir": "dist/",
      "spec_files": [
        "dist/**/*-test.js"
      ],
      "helpers": [
        "helpers/**/*.js"
      ],
      "stopSpecOnExpectationFailure": true,
      "random": false
    }))
    .on('finish',function() {
      done();
    });
})

gulp.task('default',['babel','copyjs']);

gulp.task('watch',['test'],()=>{
  gulp.watch('src/**/*.*',['test'])
});
