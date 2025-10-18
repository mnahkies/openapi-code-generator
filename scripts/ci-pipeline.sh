#!/usr/bin/env bash

set -ex

SCHEMA_BUILDERS=(
  joi
  zod
)

pnpm ci-build
pnpm ci-test

pnpm lint
pnpm format

for SCHEMA_BUILDER in "${SCHEMA_BUILDERS[@]}"; do
  pnpm integration:clean
  pnpm integration:generate --schema-builder "$SCHEMA_BUILDER"
  pnpm integration:validate
done

SCHEMA_BUILDER=zod pnpm e2e:generate
pnpm e2e:validate
