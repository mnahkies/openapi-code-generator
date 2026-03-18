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
pnpm ci-test

pnpm lint
pnpm format

for SCHEMA_BUILDER in "${SCHEMA_BUILDERS[@]}"; do
  pnpm integration:clean
  pnpm integration:generate --schema-builder "$SCHEMA_BUILDER"
  pnpm integration:validate
done

if [[ -z "$FAST" ]]; then
  SCHEMA_BUILDER=zod-v3 pnpm e2e:generate
  pnpm e2e:validate
fi

SCHEMA_BUILDER=zod-v4 pnpm e2e:generate
pnpm e2e:validate
