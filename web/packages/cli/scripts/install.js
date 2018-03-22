
const fs = require('fs');
const path = require('path');
const rmdir = require('rmdir');
const zlib = require('zlib');
const tar = require('tar-fs');
const request = require('request');
const ProgressBar = require('progress');
const { createIfNotExistSync } = require('./files');

const getJreDir = () => path.join(__dirname, 'jre');

const downloadJre = () => {
    const url = process.env['PLEXUS_JRE_DOWNLOAD_URL'];
    const jreDir = getJreDir();
    console.log("Downloading from: ", url);
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
		console.log(res.headers);
        var len = parseInt(res.headers['content-length'], 10);
        var bar = new ProgressBar('  downloading and preparing JRE [:bar] :percent :etas', {
          complete: '=',
          incomplete: ' ',
          width: 80,
          total: len
        });
        res.on('data', chunk => bar.tick(chunk.length));
      })
      .on('error', err => {
        console.log(`problem with request: ${err.message}`);
        callback(err);
      })
      .on('end', () => console.log('Finished'))
      .pipe(zlib.createUnzip())
      .pipe(tar.extract(jreDir()));
  };

  downloadJre();