import {readFile, writeFile} from "node:fs/promises"
import {remark} from "remark"
import remarkToc from "remark-toc"

async function generateToc(filename) {
  const result = await remark()
    .use(remarkToc)
    .process(await readFile(filename, "utf-8"))

  await writeFile(filename, String(result), "utf-8")
}

await generateToc("./README.md")
await generateToc("./CONTRIBUTING.md")
await generateToc("./packages/openapi-code-generator/README.md")
await generateToc("./packages/documentation/README.md")
