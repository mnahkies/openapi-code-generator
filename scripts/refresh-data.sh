#!/usr/bin/env bash

set -e

# Openapi v3 schema definitions
curl https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/schemas/v3.0/schema.json -o ./packages/openapi-code-generator/src/core/openapi-3-specification.json

# Example API Definitions
curl -L https://github.com/octokit/routes/releases/download/v30.0.2/api.github.com.json -o ./integration-tests-definitions/api.github.com.json
curl -L https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/petstore-expanded.yaml -o ./integration-tests-definitions/petstore-expanded.yml
