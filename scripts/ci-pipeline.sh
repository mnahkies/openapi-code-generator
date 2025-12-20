#!/usr/bin/env bash

set -ex

SCHEMA_BUILDERS=(
  joi
  zod-v3
  zod-v4
)

pnpm run build
pnpm run build:docs
pnpm ci-test

pnpm lint
pnpm format

for SCHEMA_BUILDER in "${SCHEMA_BUILDERS[@]}"; do
  pnpm integration:clean
  pnpm integration:generate --schema-builder "$SCHEMA_BUILDER"
  pnpm integration:validate
done

SCHEMA_BUILDER=zod-v3 pnpm e2e:generate
pnpm e2e:validate

SCHEMA_BUILDER=zod-v4 pnpm e2e:generate
pnpm e2e:validate
