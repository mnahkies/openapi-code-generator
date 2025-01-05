#!/usr/bin/env bash

set -e

if [ -n "$(git status --porcelain=v1)" ]; then
  echo "Uncommitted changes to repo found!"
  git status --porcelain=v1
  exit 1
fi
