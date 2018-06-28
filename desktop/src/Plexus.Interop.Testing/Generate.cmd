if not defined NUGET_PACKAGES (
	set NUGET_PACKAGES=%USERPROFILE%\.nuget\packages
)
java -jar ..\..\..\bin\win-x86\sdk\plexusgen.jar --baseDir=TestBrokerConfig\metadata\interop --input={echo_client.interop,echo_server.interop,test_app_launcher.interop} --type=csharp --out=Generated --namespace=Plexus.Interop.Testing.Generated --protoc=%NUGET_PACKAGES%\google.protobuf.tools\3.5.1\tools\windows_x86\protoc.exe
java -jar ..\..\..\bin\win-x86\sdk\plexusgen.jar --baseDir=TestBrokerConfig\metadata\interop --type=json_meta --out=TestBrokerConfig\metadata --protoc=%NUGET_PACKAGES%\google.protobuf.tools\3.5.1\tools\windows_x86\protoc.exe