const shell = require('shelljs');
const from = `${process.env.LERNA_ROOT_PATH}/.ci-npmrc`;
shell.cp(`${process.env.LERNA_ROOT_PATH}/.ci-npmrc`,`.npmrc`);