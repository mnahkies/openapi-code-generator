#!/usr/bin/env bash

set -ex

if [[ $(git branch --show-current) != "main" ]]; then
  echo 'releases must be published from main'
  exit 1
fi

git pull origin main

yarn clean

yarn --immutable

yarn ci-pipeline

./scripts/assert-clean-working-directory.sh

yarn lerna publish \
  --no-private \
  --force-publish \
  --conventional-commits
