#!/usr/bin/env bash

set -e

# Openapi v3.1 schema definitions
curl https://spec.openapis.org/oas/3.1/schema/2025-02-13 -o ./schemas/openapi-3.1-specification.json
curl https://spec.openapis.org/oas/3.0/schema/2024-10-18 -o ./schemas/openapi-3.0-specification.json

# Example API Definitions
curl -L https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.yaml -o ./integration-tests-definitions/api.github.com.yaml
curl -L https://github.com/OAI/learn.openapis.org/raw/refs/heads/main/examples/v3.0/petstore-expanded.yaml -o ./integration-tests-definitions/petstore-expanded.yaml

curl -L https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.yaml -o ./integration-tests-definitions/stripe.yaml

curl -L https://github.com/okta/okta-management-openapi-spec/raw/master/dist/current/idp-minimal.yaml -o ./integration-tests-definitions/okta.idp.yaml

# spec is currently invalid (https://github.com/okta/okta-management-openapi-spec/issues/180)
#curl -L https://github.com/okta/okta-management-openapi-spec/raw/master/dist/current/management-minimal.yaml -o ./integration-tests-definitions/okta.management.yaml
curl -L https://github.com/okta/okta-management-openapi-spec/raw/master/dist/current/oauth-minimal.yaml -o ./integration-tests-definitions/okta.oauth.yaml

# typespec samples
curl -L https://raw.githubusercontent.com/Azure/typespec-azure/main/packages/typespec-azure-playground-website/samples/arm.tsp -o ./integration-tests-definitions/azure-resource-manager.tsp
curl -L https://raw.githubusercontent.com/Azure/typespec-azure/main/packages/typespec-azure-playground-website/samples/azure-core.tsp -o ./integration-tests-definitions/azure-core-data-plane-service.tsp

curl -L https://raw.githubusercontent.com/bump-sh-examples/train-travel-api/main/openapi.yaml -o ./integration-tests-definitions/train-travel.yaml
