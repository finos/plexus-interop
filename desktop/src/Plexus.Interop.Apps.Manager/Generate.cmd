set INTEROP_METADATA_PATH=..\..\..\dsl\interop-lang\src\main\resources
set INTEROP_MANIFEST_PATH={app_lifecycle_manager.interop,native_app_launcher.interop}
set CSHARP_NAMESPACE=internal_access:Plexus.Interop.Apps.Internal.Generated
set CSHARP_OUT=Internal\Generated

plexus gen-csharp -b %INTEROP_METADATA_PATH% -i %INTEROP_MANIFEST_PATH% -o %CSHARP_OUT% -n %CSHARP_NAMESPACE% -v