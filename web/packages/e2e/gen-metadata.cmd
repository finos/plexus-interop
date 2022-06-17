call plexus gen-json-meta -b metadata/interop -o metadata
call plexus gen-ts -b metadata/interop -i echo_client.interop -o src/echo/client
call plexus gen-ts -b metadata/interop -i echo_server.interop -o src/echo/server
