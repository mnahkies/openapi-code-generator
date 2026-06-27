#!/usr/bin/env bash

set -e

if [ -n "$(git status --porcelain=v1 -- . ':(exclude)pnpm-lock.yaml' ':(exclude)pnpm-workspace.yaml')" ]; then
  echo "Uncommitted changes to repo found!"
  git status --porcelain=v1
  git diff
  exit 1
fi
