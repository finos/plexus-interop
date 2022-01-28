#!/usr/bin/env bash

dotnet.sh build -c release src/Plexus.Interop.sln /p:CORE_ONLY=true
dotnet.sh pack -c release -o ./../../../bin/nuget src/Plexus.Interop.sln /p:CORE_ONLY=true