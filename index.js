const Subject = require('rxjs/Subject').Subject;
const cp = require("child_process");
const libs = require("./streamlibs");

module.exports = function run(cmd, delay) {
  if (delay == null) delay=500;
  func = function run() {
    var subject = new Subject();
    var args = cmd.split(' ');
    var exec = args.shift();
    var proc = cp.spawn(exec, args);
    var done = false;
    var messaging1 = {
      cb(code) {
        if (!done) {
          done = true;
          return;
        }
        if (code == 0) {
          subject.complete();
        } else {
          subject.error(code);
          subject.complete();
        }
      }
    };
    var messaging2 = {cb: messaging1.cb};
    proc.stdout.pipe(libs.splitByNewlines()).pipe(libs.delay(delay, messaging1)).on('data', data => subject.next(data.toString()));
    proc.stderr.pipe(libs.splitByNewlines()).pipe(libs.delay(delay, messaging2)).on('data', data => subject.next(data.toString()));
    proc.on('close', () => setTimeout(() => {messaging1.done(), messaging2.done();}, 500));
    return subject;
  };
  func.displayName = "Run " + cmd;
  return func;
}
