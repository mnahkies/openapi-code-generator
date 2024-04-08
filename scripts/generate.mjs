#!/usr/bin/env node

import {exec, execSync} from "node:child_process"
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

  if (template === "typescript-nextjs" && !input.endsWith("todo-lists.yaml")) {
    console.warn(`skipping generation of ${templatePath} using ${template}`)
    return
  }

  const output =
    template === "typescript-nextjs"
      ? `integration-tests/${template}/src`
      : `integration-tests/${template}/src/generated/${filename}`

  const args = [
    `--input="${input}"`,
    `--input-type=${inputType}`,
    `--output="${output}"`,
    `--template="${template}"`,
    `--schema-builder=${schemaBuilder}`,
  ]

  try {
    const result = await runCmd(
      `node ./packages/openapi-code-generator/dist/cli.js ${args.join(" ")}`,
    )
    for (const it of result) {
      console.info(`[${template} - ${filename}] ${it}`)
    }
  } catch (err) {
    console.error(err)
    for (const it of err.output) {
      console.error(`[${template} - ${filename}] ${it}`)
    }
    throw err
  }
}

function runCmd(cmd) {
  return new Promise((resolve, reject) => {
    const output = []

    console.info(cmd)

    const child = exec(
      cmd,
      {env: {...process.env, OPENAPI_INTEGRATION_TESTS: "true"}},
      (err) => {
        if (err) {
          err.output = output
          reject(err)
          return
        }

        resolve(output)
      },
    )

    child.stdout.on("data", (it) => {
      output.push(it.trim())
    })
    child.stderr.on("data", (it) => {
      output.push(it.trim())
    })
  })
}
