#!/usr/bin/env bash

set -ex

if [[ $(git branch --show-current) != "main" ]]; then
  echo 'releases must be published from main'
  exit 1
fi

git pull origin main

pnpm clean

pnpm install --frozen-lockfile

pnpm ci-pipeline

./scripts/assert-clean-working-directory.sh

pnpm lerna publish \
  --no-private \
  --force-publish \
  --conventional-commits
