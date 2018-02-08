
const argv = require('minimist')(process.argv.slice(2));
const backward = !!argv.backward;
const paramName = "NPM_REGISTRY_URL";

console.log(`Looking for ${paramName} env variable`);

const value = process.env[paramName];
if (!value) {
    console.log("Env variable is empty");
    process.exit(0);
}

console.log("Registry value found, replacing lock file entries");

const shell = require('shelljs');

let from = 'resolved "https://registry.npmjs.org';
let to = `resolved "${value}`;

if (backward) {
    const temp = from;
    from = to;
    to = temp;
}

console.log(`Replacing [${from}] to [${to}]`);

shell.ls('yarn.lock').forEach(file => {
    shell.sed('-i', from, to, file);    
});

console.log(`Done!`);


