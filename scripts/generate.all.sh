#!/usr/bin/env bash

set -xeo pipefail

find ./integration-tests -mindepth 1 -maxdepth 1 -type d | xargs -n1 -P 8 basename | xargs -n1 -P 8 ./scripts/generate.template.sh
