
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
Which will install dependencies for all child modules, link then between each other with symlinks and build all of them.

## CI Build configuration

Build scripts rely on following Environment variables for CI build and publishing of artifacts:

- NPM_REGISTRY - NPM Registry URL to install dependencies from/publish packages to
- NPM_AUTH_TOKEN - Auth Token value used for publishing to NPM repo
- PackageVersion - Version used for publishing the artifacts

Run build without publishing of artifacts:

```
npm run ci-build
```

Run build and publish artifacts to configured registry:

```
npm run ci-publish
```