
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

- BuildRunner - CI build tasks triggered during default gradle build 
- NPM_REGISTRY - Custom NPM registry URL
- NPM_AUTH_TOKEN - Auth Token
- NPM_AUTH_USER - User Account
- PackageVersion - Version used for publishing the artifacts

If you want to use specific values for publish and install operations - you can add ```_PUBLISH``` and ```_INSTALL``` postfixes to env property names correspondingly.

Run build without publishing of artifacts:

```
npm run ci-build
```

Run build and publish artifacts to configured registry:

```
npm run ci-publish
```