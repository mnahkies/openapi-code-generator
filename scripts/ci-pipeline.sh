#!/usr/bin/env bash

set -ex

yarn ci-build
yarn ci-test
yarn lint
yarn format
yarn integration:generate
yarn integration:validate

yarn workspace e2e clean
yarn workspace e2e generate
yarn workspace e2e build
yarn workspace e2e test
