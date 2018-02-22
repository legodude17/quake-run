const q = require('quake-task');

const quake = q.make('update');
const run = require('.');

quake.add('ls', [run('ls -a'), run('ls')]);
quake.add('npm', [run('npm xmas'), run('npm ls', 50)]);
quake.add('global npm ls', run('npm ls -g --depth=0'));
quake.add('test', ['ls', 'npm', 'global npm ls'], quake.log('Build is almost done'.split(' ').reverse(), 10));

quake.start('test');
