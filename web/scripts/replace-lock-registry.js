

const paramName = "NPM_REGISTRY_URL";

console.log(`Looking for ${paramName} env variable`);

const value = process.env[paramName];
if (!value) {
    console.log("Env variable is empty");
    process.exit(0);
}

console.log("Registry value found, replacing lock file entries");

const shell = require('shelljs');

shell.ls('yarn.lock').forEach(file => {
    shell.sed('-i', 'resolved "https://registry.npmjs.org', `resolved "${value}`, file);    
});

