
# Plexus Interop Web Components [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

## General 

Contains all JS modules and integration tests for Plexus Interop JS Client and Interop solution for stand alone browser.

## Local Build

Code base is splitted to multiple isolated modules, managed using [lerna](https://lernajs.io/) and [yarn](https://yarnpkg.com). So first you need to install all build dependencies including lerna with: 

```
npm i
```
Then you can run 
```
npm run build
```
Which will install dependencies for all child modules, link them between each other with symlinks and trigger build in topological order.

## CI Build configuration

Build scripts rely on following Environment variables for CI build and publishing of artifacts:

- NPM_LOCK_REGISTRY (Optional) - NPM Registry URL to be used in lock files instead of 'https://registry.npmjs.org'
- NPM_REGISTRY - Registry URL for publishing the artifacts to registry
- NPM_AUTH_TOKEN - Auth Token used for publishing to registry
- NPM_AUTH_USER - User Account used for publishing to registry
- BuildRunner - CI build tasks triggered during default gradle build 
- NPM_PUBLISH - If set to "true" then CI build triggers publish to configured NPM registry
- NPM_INSTALL_AUTH - If set to "true" then auth credentials used for install operations, default settings used instead
- PackageVersion - Version used for publishing the artifacts

Run build without publishing of artifacts:

```
npm run ci-build
```

Run build and publish artifacts to configured registry:

```
npm run ci-publish
```