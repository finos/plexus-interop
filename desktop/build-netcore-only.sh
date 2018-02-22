#!/usr/bin/env bash

dotnet build -c release src/Plexus.Interop.sln /p:CORE_ONLY=true
dotnet pack -c release -o ./../../../bin/nuget src/Plexus.Interop.sln /p:CORE_ONLY=true