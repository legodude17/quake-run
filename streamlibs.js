const stream = require('stream');

module.exports.splitByNewlines = function splitByNewlines() {
  let bufferedData = '';
  return new stream.Transform({
    encoding: 'utf8',
    transform(data, encoding, callback) {
      bufferedData += data;
      let index = Array.from(bufferedData).indexOf('\n');
      while (index !== -1) {
        this.push(bufferedData.slice(0, index));
        bufferedData = bufferedData.slice(index + 1);
        index = Array.from(bufferedData).indexOf('\n');
      }
      callback();
    }
  });
};

module.exports.delay = function delay(time, messaging) {
  if (!messaging) messaging = { cb() {} };
  let done = false;
  let runnings = 0;
  messaging.done = () => {
    done = true;
    if (runnings === 0) {
      messaging.cb();
    }
  };
  return new stream.Transform({
    transform(data, encoding, callback) {
      runnings++;
      setTimeout(() => {
        this.push(data);
        callback();
        runnings--;
        if (runnings === 0 && done) messaging.cb();
      }, time);
    }
  });
};
