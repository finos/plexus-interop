#!/usr/bin/env node
const main = require('./dist/main/src/index').main;
const version = require('./package.json').version;
main(process.argv, version);