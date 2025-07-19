#!/usr/bin/env bash

set -ex

pnpm clean

pnpm install --frozen-lockfile

pnpm ci-pipeline

./scripts/assert-clean-working-directory.sh

BRANCH="$(git branch --show-current | sed -e 's|/|-|g')"

pnpm lerna publish \
  --no-private \
  --force-publish \
  --canary \
  --preid "${BRANCH}" \
  --pre-dist-tag "${BRANCH}"
