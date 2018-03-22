

const fs = require('fs');
const dir = './tmp';

const createIfNotExistSync = dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
};

module.exports = {
    createIfNotExistSync
};