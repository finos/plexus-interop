# Plexus

## Documentation

Documentation project is located in folder 'plexus-docs'. We build documentation using [AsciiDoc](http://asciidoc.org/). 

Invoke the following command to run the documentation build:

`./gradlew -p plexus-docs`

After successful build documentation is available via:

`plexus-docs/build/html5/index.html`

## Build/Install

### Prerequisites

#### Plexus Interop Desktop Components

- .NET Core 2.0 SDK x86 https://www.microsoft.com/net/download/core must be installed and added to PATH
- Windows-only: .NET Framework 4.5.2 https://www.microsoft.com/net/download/framework
- Windows-only: .NET Framework 4.6.2 https://www.microsoft.com/net/download/framework

#### Plexus Interop DSL

- Download [Antlr Generator](http://download.itemis.com/antlr-generator-3.2.0-patch.jar) component and place it to
 
`plexus-interop-dsl/dsl/.antlr-generator-3.2.0-patch.jar`

### Build

All Plexus components can be build using [Gradle](https://gradle.org/) tool using following command:

`./gradlew build`