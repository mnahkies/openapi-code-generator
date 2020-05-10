#!/usr/bin/env bash

for path in ../../integration-tests-definitions/*; do
  filename=$(basename "$path")

  rm -rf "./src/$filename"

  node ../../packages/openapi-code-generator/dist/index.js \
    --input="$path" \
    --output="./src/$filename" \
    --template=typescript-fetch
done
