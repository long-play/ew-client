const gulp = require("gulp");
const bro = require("gulp-bro");
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
    .pipe(gulp.dest("public/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("public/css"))
    .pipe(server.reload({stream: true}));
});

gulp.task("jscript", function () {
  gulp.src("source/js/*.js")
    .pipe(plumber())
    .pipe(jsmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest("public/js/"))
    .pipe(server.reload({stream: true}));
});

gulp.task("jscript-bll", function () {
  gulp.src("js/*.js")
    .pipe(plumber())
    .pipe(bro({
      transform: [ [ 'uglifyify', { global: false } ] ]
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest("public/js/"))
    .pipe(server.reload({stream: true}));
});

gulp.task("serve", function() {
  server.init({
    server: "public",
    open: false
  });
  gulp.watch("source/{styles,blocks}/**/*.scss", ["styles"]);
  gulp.watch("source/*.html", ["copyhtml"]);
  gulp.watch("source/js/**/*.js", ["jscript"]);
  gulp.watch("js/**/*.js", ["jscript-bll"]);
});

gulp.task("images", function() {
  gulp.src("public/img/**/*.{png,jpg,gif}")
    .pipe(image({
      jpegRecompress: false,
      jpegoptim: true,
      mozjpeg: false
    }))
    .pipe(gulp.dest("public/img"));
});

gulp.task("symbols", function() {
  const cleanSymbols = del("public/sprite/symbols.svg");
  const svgs = gulp
    .src("source/icons/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
       inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("public/sprite"));

  return gulp
    .src('public/*.html')
    .pipe(inject(svgs, { transform: fileContents }))
    .pipe(gulp.dest('public'));
});

gulp.task("copy", function() {
  return gulp.src([
    "source/static/**/*",
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**/*",
    "source/lib/**/*",
    "source/*.html"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("public"));
});

gulp.task("copyhtml", function() {
  const sprite = gulp.src('public/sprite/symbols.svg');
  return gulp.src([
    "source/*.html"
  ], {
    base: "source"
  })
  .pipe(inject(sprite, { transform: fileContents }))
  .pipe(gulp.dest("public"))
  .pipe(server.reload({stream: true}));
});

gulp.task("clean", function() {
  return del("public");
});

gulp.task("debug", function(fn) {
  run(
    "clean",
    "copy",
    "symbols",
    "styles",
    "jscript",
    "jscript-bll",
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
    "jscript-bll",
    fn
  );
});

