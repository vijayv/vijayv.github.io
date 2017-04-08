const gulp = require('gulp');
const child = require('child_process');
const cssnano = require('gulp-cssnano');
const imagemin = require('gulp-imagemin');
const gutil = require('gulp-util');
const sass = require('gulp-sass');

const siteRoot = '_site';

// Concat all scss files together
const scssFiles = './_scss/*.scss';
gulp.task('css', () => {
  gulp.src(scssFiles)
    .pipe(sass())
    .pipe(cssnano())
    .pipe(gulp.dest('assets'))
});

// Optimize Images
const imageFiles = './_images/*';
gulp.task('images', () =>
    gulp.src(imageFiles)
      .pipe(imagemin())
      .pipe(gulp.dest('./assets/images'))
);

gulp.task('watch', () => {
  gulp.watch(scssFiles, ['css']);
});

// Sets gulp command to build the site
gulp.task('jekyll', () => {
  const jekyll = child.spawn('jekyll', ['serve',
    '--watch',
    '--incremental',
    '--drafts'
  ]);

  const jekyllLogger = (buffer) => {
    buffer.toString()
      .split(/\n/)
      .forEach((message) => gutil.log('Jekyll: ' + message));
  };

  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);
});

gulp.task('default', ['css', 'images', 'watch', 'jekyll']);