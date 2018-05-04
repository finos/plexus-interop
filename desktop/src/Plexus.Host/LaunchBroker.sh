#!/usr/bin/env bash
java -jar ../sdk/plexusgen.jar --type=json_meta --baseDir=metadata/interop --out=interop && ./../broker/plexus broker