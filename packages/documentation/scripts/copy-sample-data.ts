import {copyFile} from "node:fs/promises"
import {dirname, resolve} from "node:path"
import {fileURLToPath} from "node:url"
import {sampleFilenames} from "../src/lib/playground/consts"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

for (const sample of sampleFilenames) {
  const sourcePath = resolve(
    __dirname,
    `../../../integration-tests-definitions/${sample}`,
  )
  const destinationPath = resolve(__dirname, `../public/samples/${sample}`)

  try {
    await copyFile(sourcePath, destinationPath)
    console.log(`Copied ${sample} to ${destinationPath}`)
  } catch (error) {
    console.error(`Failed to copy ${sample}:`, error)
  }
}
