#!/usr/bin/env bash

echo $PWD

yarn openapi-code-generator \
  --input ./openapi.yaml \
  --output ./src/generated \
  --template typescript-koa \
  --schema-builder zod \
  --extract-inline-schemas \
  --grouping-strategy first-tag

yarn openapi-code-generator \
  --input ./openapi.yaml \
  --output ./src/generated/client/fetch \
  --template typescript-fetch \
  --schema-builder zod \
  --extract-inline-schemas \
  --enable-runtime-response-validation \
  --override-specification-title "E2E Test Client"

yarn openapi-code-generator \
  --input ./openapi.yaml \
  --output ./src/generated/client/axios \
  --template typescript-axios \
  --schema-builder zod \
  --extract-inline-schemas \
  --enable-runtime-response-validation \
  --override-specification-title "E2E Test Client"
