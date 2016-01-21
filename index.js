import gulp from 'gulp';
import notify from 'gulp-notify';
import mocha from 'gulp-mocha';
import notifierReporter from 'mocha-notifier-reporter';
import path from 'path';

notifierReporter.icon_pass = '';
notifierReporter.icon_fail = '';
notifierReporter.title_pass = 'Passed ✅';
notifierReporter.title_fail = 'Failed 🚫';

function reportError(errorReporter) {
  return errorReporter === 'process'
    ? process.exit.bind(process, 1)
    : notify.onError;
}

export default function mochaTester(errorReporter = 'process') {
  return (file) => {
    let source = '**/__test__/*spec.js';

    if (file) {
      if (typeof file === 'string') {
        source = file;
      } else {
        const parts = file.path.split(path.sep);
        const filename = parts.pop(1);
        const dir = parts.join(path.sep);

        if (/\.(json)?$/.test(file.path)) {
          source = `${dir}/__test__/index*.js`;
        } else if (!/\.(js)?$/.test(file.path)) {
          return null;
        } else if (file.path.indexOf('__test__') !== -1) {
          source = [
            file.path,
            `${dir}/index*.js`
          ];
        } else {
          source = [
            `${dir}/__test__/index*.js`,
            `${dir}/__test__/${filename.split('.')[0]}*.js`
          ];
        }
      }
    }

    console.log(`Running ${source}`);
    return gulp.src(source, {read: false})
      .pipe(mocha({
        reporter: notifierReporter.decorate('spec')
      }))
      .on('error', reportError(errorReporter));
  };
}
