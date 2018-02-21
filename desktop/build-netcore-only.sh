#!/usr/bin/env bash

dotnet pack -c release -o ./../../../bin/nuget src/Plexus.Interop.sln /p:CORE_ONLY=true