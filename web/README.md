
# Plexus Interop Web Components

## Local Build

First you need to install all build dependencies with:

```
npm i
```
Then you can run 
```
npm run build
```
Which will install dependencies and trigger build for all child modules

## CI Build configuration

Build scripts rely on following Environment variables for CI build and publishing of artifacts:

- NPM_REGISTRY - NPM Registry URL to install dependencies from/publish packages to
- NPM_AUTH_TOKEN - Auth Token value used for publishing to NPM repo
- PackageVersion - Version used for publishing the artifacts

Run build without publishing dependencies:

```
npm run ci-build
```

Run build and publish artifacts to configured registry:

```
npm run ci-publish
```