
const path = require('path');

const getJreDownloadUrl = () => {
    return process.env['PLEXUS_JRE_DOWNLOAD_URL'];
}

const getJreDir = () => path.normalize(path.join(__dirname, '..', 'dist', 'jre'));

module.exports = {
    getJreDownloadUrl, getJreDir
};