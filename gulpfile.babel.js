const { series, parallel, src, dest, watch } = require("gulp");
const babel = require("gulp-babel");
const pug = require("gulp-pug");
const sourcemaps = require("gulp-sourcemaps"); // aun no configurado a travez del plugin, pero sí a travez degulp

const terser = require("gulp-terser");

const postCss = require("gulp-postcss");
const prefijos = require("autoprefixer");

const { join } = require("path");
const erroresDeReinicio = require("gulp-plumber");

const refrescarCache = require("gulp-cache-bust");

const limpiarCss = require("gulp-purgecss");

const sassPaquete = require("gulp-sass")(require("sass"));
const browsersync = require("browser-sync").create();

const path = join(__dirname, "src");
const minEnProduccion = false;

const compilarPug = () => {
  return (
    src(join(path, "views", "pages", "*.pug"))
      .pipe(erroresDeReinicio())
      // src("./src/views/pages/*.pug")
      .pipe(pug({ pretty: minEnProduccion ? false : true }))
      .pipe(refrescarCache({ type: "timestamp" }))
      .pipe(dest("./dist"))
  );
};

const compilarJs = () => {
  return (
    src("src/js/**/*.js", { sourcemaps: true })
      // src("./src/js/**/*.js")
      .pipe(erroresDeReinicio())
      // .pipe(sourcemaps.init())
      .pipe(babel())
      .pipe(terser())
      // .pipe(sourcemaps.write())
      .pipe(refrescarCache({ type: "timestamp" }))
      .pipe(dest("./dist/js", { sourcemaps: "." }))
  );
};

const postCssPlugin = [prefijos()];

const compilarSass = (cb) => {
  src("src/scss/*.scss", { sourcemaps: true })
    .pipe(erroresDeReinicio())
    // .pipe(sourcemaps.init())
    .pipe(sassPaquete({ outputStyle: "expanded" }))
    // .pipe(sourcemaps.write())
    // .pipe(postCss(postCssPlugin)) // false
    .pipe(refrescarCache({ type: "timestampe" }))
    .pipe(dest("./dist/css", { sourcemaps: "." }));
  cb();
};

const limpiarCssProduccion = (cb) => {
  return src("./dist/css/style.css")
    .pipe(
      limpiarCss({
        content: ["./dist/index.html"],
      })
    )
    .pipe(dest("./dist/css"));
  cb();
};

exports.limpiarCssProduccion = limpiarCssProduccion;

const browsersyncServer = (cb) => {
  browsersync.init({
    server: {
      baseDir: "./dist",
    },
  });
  cb();
};

//-browsesyncReload
const actualizarBrowser = (cb) => {
  browsersync.reload();
  cb();
};

const vigilarCambios = () => {
  watch("*.html", actualizarBrowser);
  watch(
    ["./src/**/*.js", "./src/**/*.pug", "./src/**/*.scss"],
    series(compilarJs, compilarPug, compilarSass, actualizarBrowser)
  );
};

const _default = series(
  parallel(compilarPug, compilarSass, compilarJs),
  parallel(browsersyncServer, vigilarCambios)
);
export { _default as default };
