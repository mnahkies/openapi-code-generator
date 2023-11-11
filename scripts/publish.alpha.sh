#!/usr/bin/env bash

set -ex

yarn clean

yarn --immutable

yarn ci-pipeline

./scripts/assert-clean-working-directory.sh

BRANCH="$(git branch --show-current | sed -e 's|/|-|g')"

yarn lerna publish \
  --no-private \
  --force-publish \
  --canary \
  --preid "${BRANCH}" \
  --pre-dist-tag "${BRANCH}"
