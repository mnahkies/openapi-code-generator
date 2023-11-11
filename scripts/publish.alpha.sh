#!/usr/bin/env bash

set -ex

yarn clean

yarn --immutable

yarn ci-pipeline

./scripts/assert-clean-working-directory.sh

yarn lerna publish \
  --no-private \
  --force-publish \
  --canary \
  --pre-dist-tag "$(git branch --show-current)"
