#!/usr/bin/env bash

set -e

# Openapi v3 schema definitions
curl https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/schemas/v3.0/schema.json -o ./packages/openapi-code-generator/src/core/openapi-3-specification.json

# Example API Definitions
curl -L https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.yaml -o ./integration-tests-definitions/api.github.com.yaml
curl -L https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/petstore-expanded.yaml -o ./integration-tests-definitions/petstore-expanded.yml
