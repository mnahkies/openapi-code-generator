#!/usr/bin/env bash

set -ex

yarn ci-build
yarn ci-test
yarn lint
yarn format
yarn integration:generate
yarn integration:validate
