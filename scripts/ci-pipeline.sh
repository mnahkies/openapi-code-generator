#!/usr/bin/env bash

set -ex

pnpm ci-build
pnpm ci-test

pnpm lint
pnpm format

pnpm integration:clean
pnpm integration:generate
pnpm integration:validate

pnpm e2e:generate
pnpm e2e:validate
