#!/usr/bin/env bash

set -eo pipefail

if [ -z "$1" ]; then
echo "Please specify new version as command line parameter"
exit 1
fi
echo "Updating to version $1"

TEMPFILE=$(mktemp)

jq ".version=\"$1\"" frontend/package.json > $TEMPFILE
cp $TEMPFILE frontend/package.json

jq ".version=\"$1\"" backend/package.json > $TEMPFILE
cp $TEMPFILE backend/package.json

sed -i "s/version=\".*\"\s/version=\"$1\" /g" frontend/src/components/App.js
sed -i "s/WebSocket API.*/WebSocket API $1/g" doc/API.md
