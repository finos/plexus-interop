
const fs = require('fs');
const path = require('path');
const rmdir = require('rmdir');
const zlib = require('zlib');
const tar = require('tar-fs');
const request = require('request');
const ProgressBar = require('progress');
const { createIfNotExistSync } = require('./files');

const getJreDir = () => path.normalize(path.join(__dirname, '..', 'dist', 'jre'));

// TODO add cached files support
const downloadJre = callback => {
    const url = process.env['PLEXUS_JRE_DOWNLOAD_URL'];
    const jreDir = getJreDir();
    console.log("Downloading JRE from: ", url);
    console.log("Target dir: ", jreDir);
    callback = callback || (() => {});
    rmdir(jreDir);
    createIfNotExistSync(jreDir);
    request
      .get({
        url,
        rejectUnauthorized: false,
        agent: false,
        headers: {
          connection: 'keep-alive',
          'Cookie': 'gpw_e24=http://www.oracle.com/; oraclelicense=accept-securebackup-cookie'
        }
      })
      .on('response', res => {
        var length = parseInt(res.headers['content-length'], 10);
        var progress = new ProgressBar('  Downloading JRE [:bar] :percent :etas', {
          complete: '=',
          incomplete: ' ',
          width: 80,
          total: length
        });
        res.on('data', chunk => progress.tick(chunk.length));
      })
      .on('error', err => {
        console.log(`problem with request: ${err.message}`);
        callback(err);
      })
      .on('end', () => console.log('Finished'))
      .pipe(zlib.createUnzip())
      .pipe(tar.extract(jreDir));
  };

  downloadJre();