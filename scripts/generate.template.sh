#!/usr/bin/env bash

set -xeo pipefail

template=$1

find ./integration-tests-definitions -type f | xargs -n 1 -P 8 ./scripts/generate.single.sh "$template"
