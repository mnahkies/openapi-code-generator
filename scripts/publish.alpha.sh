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

pnpm exec lerna version preminor \
  --no-private \
  --force-publish \
  --no-push \
  --conventional-commits \
  --conventional-prerelease \
  --preid alpha
