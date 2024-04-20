#!/usr/bin/env bash

set -xeo pipefail

template=$1
path=$2
filename=$(basename "$path")

export OPENAPI_INTEGRATION_TESTS='true'

output="integration-tests/$template/src/generated/$filename"

# NextJS is an outlier due to it's path based routing
if [[ "$template" == "typescript-nextjs" ]]; then
  output="integration-tests/$template/src"
fi

node ./packages/openapi-code-generator/dist/index.js \
  --input="$path" \
  --output="$output" \
  --template="$template" \
  --schema-builder=zod
