const quake = new (require('quake-task').Quake)("update");
const run = require('.');

quake.add('ls', run('ls -a'));

quake.start('ls');
