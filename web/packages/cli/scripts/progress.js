
const ProgressBar = require('progress');

const printProgress = (response, text) => {
    text = text || 'Downloading';
    const length = parseInt(response.headers['content-length'], 10);
    const progress = new ProgressBar(`${text} [:bar] :percent :etas`, {
      complete: '=',
      incomplete: '.',
      width: 80,
      total: length
    });
    response.on('data', chunk => progress.tick(chunk.length));
};

module.exports = {
    printProgress
};