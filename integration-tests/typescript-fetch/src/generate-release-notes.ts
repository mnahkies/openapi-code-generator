import * as fs from "node:fs"
import path from "node:path"
import {
  GitHubV3RestApi,
  GitHubV3RestApiServers,
} from "./generated/api.github.com.yaml/client.ts"

function formatDate(dateStr: string | null) {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export async function generateReleaseNotes() {
  const client = new GitHubV3RestApi({
    basePath: GitHubV3RestApiServers.default(),
    defaultHeaders: {},
  })

  const res = await client.reposListReleases({
    owner: "mnahkies",
    repo: "openapi-code-generator",
    perPage: 100,
  })

  if (res.status === 200) {
    const body = await res.json()

    return body.map(
      (it) => `### ${formatDate(it.published_at)} (${it.name})
${it.body
  ?.split("\n")
  .filter((it) => it.startsWith("#") === false)
  .map((it) => it.trim())
  .join("\n")}
`,
    )
  }

  throw new Error("failed to fetch releases", {
    cause: new Error(await res.text()),
  })
}

async function main() {
  const notes = await generateReleaseNotes()
  const result = `---
title: Release Notes
description: Changelog of all OpenAPI Code Generator releases, including new features, bug fixes, breaking changes, and upgrade instructions for each version.
---

import { Callout, Steps } from 'nextra/components'

# Release notes

<Callout emoji="💡">
  This page is statically generated from the [Github releases](https://github.com/mnahkies/openapi-code-generator/releases),
  and may sometimes be slightly out of date.
</Callout>

<Steps>
${notes.join("\n")}
</Steps>
`

  fs.writeFileSync(
    path.resolve(
      __dirname,
      "../../../packages/documentation/src/app/reference/release-notes/page.mdx",
    ),
    result.replace(/\r\n/g, "\n"),
    "utf-8",
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
