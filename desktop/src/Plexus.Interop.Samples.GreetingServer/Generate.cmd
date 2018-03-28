REM Generate code from GreetingServer interop definitions

set PLEXUS_GEN_PATH=..\..\..\bin\win-x86\sdk\plexusgen.jar
set INTEROP_METADATA_PATH=..\..\..\samples\greeting\registry
if not defined NUGET_PACKAGES (
  set NUGET_PACKAGES=%USERPROFILE%\.nuget\packages
)
set PROTOC_PATH=%NUGET_PACKAGES%\google.protobuf.tools\3.5.1\tools\windows_x86\protoc.exe

set INTEROP_MANIFEST_PATH=greeting_server.interop
set CSHARP_NAMESPACE=internal_access:Plexus.Interop.Samples.GreetingServer.Generated
set CSHARP_OUT=Generated

java -jar %PLEXUS_GEN_PATH% --baseDir=%INTEROP_METADATA_PATH% --input=%INTEROP_MANIFEST_PATH% --type=csharp --out=%CSHARP_OUT% --namespace=%CSHARP_NAMESPACE% --protoc=%PROTOC_PATH%