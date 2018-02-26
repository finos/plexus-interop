#!/usr/bin/env bash

dotnet build -c release src/Plexus.Interop.sln
dotnet pack -c release -o ./../../../bin/nuget src/Plexus.Interop.sln