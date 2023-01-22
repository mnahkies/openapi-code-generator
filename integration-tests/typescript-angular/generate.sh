#!/usr/bin/env bash

# To upgrade Angular version under test
# - rm -rf ./typescript-angular (keep this file)
# - npx @angular/cli@15.1.2 new typescript-angular --skip-git true --style scss --routing true --package-manager yarn
# - edit app.module.ts to import api modules
# - edit package.json to include these scripts:
#     "scripts": { "generate": "./generate.sh", "validate": "ng build --configuration production" },
for path in ../../integration-tests-definitions/*; do
  filename=$(basename "$path")

  rm -rf "./src/app/$filename"

  node ../../packages/openapi-code-generator/dist/index.js \
    --input="$path" \
    --output="./src/app/$filename" \
    --template=typescript-angular
done
