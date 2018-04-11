
plexus gen-json-meta -b metadata/interop -o metadata

plexus gen-ts -b metadata/interop -i echo_client.interop -o src/echo/client

plexus gen-ts -b metadata/interop -i echo_server.interop -o src/echo/server