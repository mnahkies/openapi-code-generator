#!/usr/bin/env bash

set -ex

SCHEMA_BUILDERS=(
  joi
  zod-v3
  zod-v4
)

if [[ -n "$FAST" ]]; then
  SCHEMA_BUILDERS=(zod-v4)
fi

pnpm run build
pnpm run build:docs
pnpm run ci-test

pnpm run lint

for SCHEMA_BUILDER in "${SCHEMA_BUILDERS[@]}"; do
  pnpm run integration:clean
  pnpm run integration:generate --schema-builder "$SCHEMA_BUILDER"
  pnpm run integration:validate
done

if [[ -z "$FAST" ]]; then
  SCHEMA_BUILDER=zod-v3 pnpm run e2e:generate
  pnpm run e2e:validate
fi

SCHEMA_BUILDER=zod-v4 pnpm run e2e:generate
pnpm run e2e:validate
