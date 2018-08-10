const gulp = require("gulp");
const plumber = require('gulp-plumber');
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const mqpacker = require("css-mqpacker");

const server = require("browser-sync");
const minify = require("gulp-csso");
const rename = require("gulp-rename");
const image = require("gulp-image");
const del = require("del");
const run = require("run-sequence");

const jsmin = require('gulp-jsmin');
const svgstore = require("gulp-svgstore");
const svgmin = require("gulp-svgmin");
const inject = require('gulp-inject');

function fileContents (filePath, file) {
  return file.contents.toString();
}

gulp.task("styles", function() {
  gulp.src("source/styles/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 1 version",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions",
        "IE 11"
      ]}),
      mqpacker({
        sort: false
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.reload({stream: true}));
});

gulp.task("jscript", function () {
  gulp.src("source/js/*.js")
    .pipe(plumber())
    .pipe(jsmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest("build/js/"))
    .pipe(server.reload({stream: true}));
});

gulp.task("serve", function() {
  server.init({
    server: "build",
    open: false
  });
  gulp.watch("source/{styles,blocks}/**/*.scss", ["styles"]);
  gulp.watch("source/*.html", ["copyhtml"]);
  gulp.watch("source/js/**/*.js", ["jscript"]);
});

gulp.task("images", function() {
  gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(image({
      jpegRecompress: false,
      jpegoptim: true,
      mozjpeg: false
    }))
    .pipe(gulp.dest("build/img"));
});

gulp.task("symbols", function() {
  const cleanSymbols = del("build/sprite/symbols.svg");
  const svgs = gulp
    .src("source/icons/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
       inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("build/sprite"));

  return gulp
    .src('build/*.html')
    .pipe(inject(svgs, { transform: fileContents }))
    .pipe(gulp.dest('build'));
});

gulp.task("copy", function() {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**/*",
    "source/data/**/*",
    "source/*.html",
    "source/lib/**/*"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("copyhtml", function() {
  const sprite = gulp.src('build/sprite/symbols.svg');
  return gulp.src([
    "source/*.html"
  ], {
    base: "source"
  })
  .pipe(inject(sprite, { transform: fileContents }))
  .pipe(gulp.dest("build"))
  .pipe(server.reload({stream: true}));
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("debug", function(fn) {
  run(
    "clean",
    "copy",
    "symbols",
    "styles",
    "jscript",
    fn
  );
});

gulp.task("build", function(fn) {
  run(
    "clean",
    "copy",
    "symbols",
    "images",
    "styles",
    "jscript",
    fn
  );
});

