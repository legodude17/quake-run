const { Subject } = require('rxjs/Subject');
const cp = require('child_process');
const libs = require('./streamlibs');

module.exports = function run(cmd, delay) {
  if (delay == null) delay = 500;
  const func = function run() {
    const subject = new Subject();
    const args = cmd.split(' ');
    const exec = args.shift();
    const proc = cp.spawn(exec, args, { cwd: process.cwd() });
    let done = false;
    const messaging1 = {
      cb(code) {
        if (!done) {
          done = true;
          return;
        }
        if (code === 0) {
          subject.complete();
        } else {
          subject.error(code);
          subject.complete();
        }
      }
    };
    const messaging2 = { cb: messaging1.cb };
    proc.stdout
      .pipe(libs.splitByNewlines()).pipe(libs.delay(delay, messaging1))
      .on('data', data => subject.next(data.toString()));
    proc.stderr
      .pipe(libs.splitByNewlines()).pipe(libs.delay(delay, messaging2))
      .on('data', data => subject.next(data.toString()));
    proc.on('close', () => setTimeout(() => { messaging1.done(); messaging2.done(); }, 500));
    return subject;
  };
  func.displayName = `Run ${cmd}`;
  return func;
};
