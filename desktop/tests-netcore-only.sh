#!/usr/bin/env bash

dotnet test src\Plexus.Interop.Tests.sln /p:CORE_ONLY=true --verbosity quiet --no-build --no-restore