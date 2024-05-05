#!/usr/bin/env bash

set -eo pipefail

yarn markdown-toc -i --bullets=- ./README.md
yarn markdown-toc -i --bullets=- ./CONTRIBUTING.md
yarn markdown-toc -i --bullets=- ./packages/openapi-code-generator/README.md
yarn markdown-toc -i --bullets=- ./packages/documentation/README.md
