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

pnpm exec lerna version minor \
  --no-private \
  --force-publish \
  --no-push \
  --conventional-commits

# workaround https://github.com/lerna/lerna/issues/3981
TAG=$(git tag --points-at HEAD)

pnpm i --lockfile-only
git add pnpm-lock.yaml
git commit --amend --no-edit

git tag -f "${TAG}"
