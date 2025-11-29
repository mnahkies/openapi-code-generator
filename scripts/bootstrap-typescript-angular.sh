#!/usr/bin/env bash

# Use to help refresh the typescript-angular integration tests
# when new major versions of angular are released.
#
# We aim to avoid deviating from the default template as much as possible.

set -e

pushd integration-tests

rm -rf typescript-angular

pnpm dlx @angular/cli new typescript-angular \
  --package-manager pnpm \
  --minimal \
  --strict \
  --zoneless \
  --style css \
  --ssr false \
  --ai-config none

# Review changed files, revert undesired changes in package.json, etc.
# then `pnpm run integration:generate` to restore the generated src.

popd
