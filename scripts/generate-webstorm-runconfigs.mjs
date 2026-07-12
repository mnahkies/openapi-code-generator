#!/usr/bin/env node

import {execSync} from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import {Command, Option} from "@commander-js/extra-typings"

const program = new Command()
  .addOption(new Option("-t --template <value>", "filter to a single template"))
  .addOption(new Option("-s --spec <value>", "filter to a single spec"))
  .addOption(
    new Option(
      "--schema-builder <value>",
      "(typescript) runtime schema parsing library to use",
    )
      .env("OPENAPI_SCHEMA_BUILDER")
      .choices(["zod", "zod-v3", "zod-v4", "joi"])
      .default("zod-v4"),
  )
  .showHelpAfterError()

const templates = execSync(
  "find ./integration-tests -mindepth 1 -maxdepth 1 -type d",
)
  .toString("utf-8")
  .split("\n")
  .map((it) => it.trim())
  .filter(Boolean)

const definitions = execSync("find ./integration-tests-definitions -type f")
  .toString("utf-8")
  .split("\n")
  .map((it) => it.trim())
  .filter(Boolean)

const config = program.parse().opts()

const schemaBuilder = config.schemaBuilder

const filteredTemplate = config.template
const filteredSpec = config.spec ? path.normalize(config.spec) : undefined

console.info("filters", {filteredTemplate, filteredSpec})
Promise.all(
  templates
    .filter((it) => !filteredTemplate || it.includes(filteredTemplate))
    .flatMap((templatePath) =>
      definitions
        .filter(
          (it) => !filteredSpec || path.normalize(it).includes(filteredSpec),
        )
        .map((definition) => runSingle(templatePath, definition)),
    ),
)
  .then(() => {
    console.log("success!")
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

async function runSingle(templatePath, input) {
  const inputType = input.endsWith(".tsp") ? "typespec" : "openapi3"
  const filename = path.basename(input)
  const template = path.basename(templatePath)

  const args = [
    `--input="${input}"`,
    `--input-type=${inputType}`,
    `--output="integration-tests/${template}/src/generated/${filename}"`,
    `--template="${template}"`,
    `--schema-builder=${schemaBuilder}`,
  ]
  const name = `${filename} - ${template}`

  fs.writeFileSync(
    `.run/${name}.run.xml`,
    `<component name="ProjectRunConfigurationManager">
  <configuration default="false" name="${name}" type="NodeJSConfigurationType"
                 application-parameters="${args.join(" ").replaceAll('"', "&quot;")}"
                 path-to-js-file="./packages/openapi-code-generator/src/cli.ts"
                 typescript-loader="bundled"
                  folderName="${template}"
                 working-dir="$PROJECT_DIR$">
    <method v="2"/>
  </configuration>
</component>
`,
    "utf-8",
  )
}
