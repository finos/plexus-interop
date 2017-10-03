#!/usr/bin/env bash
PATH=/usr/local/bin:/bin:/usr/bin:$PATH:./build/unix/sdk/dotnet/

dotnet test src/Plexus.Interop.sln /p:CORE_ONLY=true