const Subject = require('rxjs/Subject').Subject;
const cp = require("child_process");
const libs = require("./streamlibs");

module.exports = function run(cmd) {
  func = function run() {
    var subject = new Subject();
    var args = cmd.split(' ');
    var exec = args.shift();
    var proc = cp.spawn(exec, args);
    var done = false;
    var messaging = {cb: code => code == 0 ? subject.complete() : (subject.error(code), subject.complete())};
    proc.stdout.pipe(libs.splitByNewlines()).pipe(libs.delay(500, messaging)).on('data', data => subject.next(data.toString()));
    proc.stderr.pipe(libs.splitByNewlines()).pipe(libs.delay(500, {})).on('data', data => subject.next("Error: " + data));
    proc.on('close', messaging.done);
    return subject;
  };
  func.displayName = "Run " + cmd;
  return func;
}
