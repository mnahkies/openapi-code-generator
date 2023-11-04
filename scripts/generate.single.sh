#!/usr/bin/env bash

set -xeo pipefail

template=$1
path=$2
filename=$(basename "$path")

node ./packages/openapi-code-generator/dist/index.js \
  --input="$path" \
  --output="integration-tests/$template/src/generated/$filename" \
  --template="$template" \
  --schema-builder=zod
