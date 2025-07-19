#!/usr/bin/env bash

set -eo pipefail

pnpm markdown-toc -i --bullets=- ./README.md
pnpm markdown-toc -i --bullets=- ./CONTRIBUTING.md
pnpm markdown-toc -i --bullets=- ./packages/openapi-code-generator/README.md
pnpm markdown-toc -i --bullets=- ./packages/documentation/README.md
