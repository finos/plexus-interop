#!/usr/bin/env bash

dotnet restore src/Plexus.Interop.sln /p:CORE_ONLY=true
dotnet build -c release src/Plexus.Interop.sln /p:CORE_ONLY=true
dotnet pack -c release -o ./../../../bin/nuget src/Plexus.Interop.sln /p:CORE_ONLY=true