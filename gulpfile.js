var gulp = require('gulp');
var $ = require('gulp-load-plugins')();


gulp.task('babel',(done)=>{
  gulp
    .src('src/**/*.es6')
    .pipe($.babel())
    .pipe(gulp.dest('dist/'))
    .on('finish',()=>{
      done()
    })
});

gulp.task('test',['babel'],()=>{
  gulp
    .src('dist/**-spec.js')
    .pipe($.jasmine())
})

gulp.task('default',['babel']);

gulp.task('watch',['test'],()=>{
  gulp.watch('src/**/*.es6',['test'])
});
