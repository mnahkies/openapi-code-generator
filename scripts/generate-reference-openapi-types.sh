#!/usr/bin/env bash

set -e

# Unfortunately the types output by the below are not high enough quality to use as-is,
# but they form a good base reference when making changes to the handwritten types in
# ./src/core/openapi-types.ts in conjunction with the reference material here:
# https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md

npx json-schema-to-typescript ./data/openapi-3-specification.json > ./data/openapi-generated-types.d.ts
