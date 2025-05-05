#!/usr/bin/env bash

set -e

SCHEMA_BUILDER=zod

yarn openapi-code-generator \
  --input ./openapi.yaml \
  --output ./src/generated/server/koa \
  --template typescript-koa \
  --schema-builder "$SCHEMA_BUILDER" \
  --extract-inline-schemas \
  --grouping-strategy first-tag

yarn openapi-code-generator \
  --input ./openapi.yaml \
  --output ./src/generated/server/express \
  --template typescript-express \
  --schema-builder "$SCHEMA_BUILDER" \
  --extract-inline-schemas \
  --grouping-strategy first-tag

yarn openapi-code-generator \
  --input ./openapi.yaml \
  --output ./src/generated/client/fetch \
  --template typescript-fetch \
  --schema-builder "$SCHEMA_BUILDER" \
  --extract-inline-schemas \
  --enable-runtime-response-validation \
  --override-specification-title "E2E Test Client"

yarn openapi-code-generator \
  --input ./openapi.yaml \
  --output ./src/generated/client/axios \
  --template typescript-axios \
  --schema-builder "$SCHEMA_BUILDER" \
  --extract-inline-schemas \
  --enable-runtime-response-validation \
  --override-specification-title "E2E Test Client"
