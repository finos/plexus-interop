
const fs = require('fs');
const path = require('path');
const rmdir = require('rmdir');
const zlib = require('zlib');
const tar = require('tar-fs');
const request = require('request');
const ProgressBar = require('progress');
const { createIfNotExistSync } = require('./files');
const { getJreDownloadUrl, getJreDir } = require('./java');
const unzipper = require('unzipper');
const { printProgress } = require('./progress');

// TODO add cached files support
const downloadJre = callback => {
  const url = getJreDownloadUrl();
  const jreDir = getJreDir();
  const isZip = url.endsWith('.zip');
  const isTarGz = url.endsWith('.tar.gz');
  console.log("Downloading JRE from: ", url);
  console.log("Target dir: ", jreDir);
  callback = callback || (() => { });
  rmdir(jreDir);
  createIfNotExistSync(jreDir);
  const basePipe = request
    .get({
      url,
      rejectUnauthorized: false,
      agent: false,
      headers: {
        connection: 'keep-alive',
        'Cookie': 'gpw_e24=http://www.oracle.com/; oraclelicense=accept-securebackup-cookie'
      }
    })
    .on('response', response => printProgress(response, 'Downloading JRE'))
    .on('error', error => {
      console.log(`JRE Download failed: ${error.message}`);
      callback(error);
    })
    .on('end', () => console.log('JRE Download finished'));

  if (isZip) {
    basePipe.pipe(unzipper.Extract({ path: jreDir }));
  } else if (isTarGz) {
    basePipe
      .pipe(zlib.createUnzip())
      .pipe(tar.extract(jreDir));
  }
};

downloadJre();