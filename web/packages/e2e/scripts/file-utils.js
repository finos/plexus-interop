
const baseReadline = require('readline');
const chokidar = require('chokidar');

function readline(filePath, callBack) {
    var lineReader = baseReadline.createInterface({
        input: require('fs').createReadStream(filePath)
    });
    lineReader.on('line', function (line) {
        callBack(line);
    });
};

function onFileAdded(dir, callback) {
    var wsAddressWatcher = chokidar.watch(dir, {
        ignored: /(^|[\/\\])\../,
        persistent: true
    });
    wsAddressWatcher
        .on('add', path => {
            console.log(`File ${path} has been added`);
            setTimeout(() => callback(path), 2000);
        })
        .on('change', path => console.log(`File ${path} has been changed`));
}

module.exports = {
    readline,
    onFileAdded
};