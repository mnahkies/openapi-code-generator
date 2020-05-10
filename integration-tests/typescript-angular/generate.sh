#!/usr/bin/env bash

for path in ../../integration-tests-definitions/*; do
  filename=$(basename "$path")

  rm -rf "./src/app/$filename"

  node ../../packages/openapi-code-generator/dist/index.js \
    --input="$path" \
    --output="./src/app/$filename" \
    --template=typescript-angular
done
