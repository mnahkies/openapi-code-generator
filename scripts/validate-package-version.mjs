import {glob} from "node:fs/promises"
import path from "node:path"

async function main(expectedVersion) {
  // biome-ignore lint/style/noParameterAssign: ignore
  expectedVersion = expectedVersion.startsWith("v")
    ? expectedVersion.split("v")[1]
    : expectedVersion

  if (!/^\d+.\d+.\d+(-alpha\.\d+)?$/.test(expectedVersion)) {
    throw new Error(`Invalid version '${expectedVersion}'`)
  }

  const packages = glob("packages/*/package.json")

  console.info(`checking all packages are version ${expectedVersion}`)

  for await (const it of packages) {
    const {private: isPrivate, version} = (
      await import(path.join("..", it), {with: {type: "json"}})
    ).default

    if (isPrivate) {
      console.info(`skipping private package ${it}`)
      continue
    } else {
      console.info(`checking ${it}`)
    }

    if (version !== expectedVersion) {
      throw new Error(
        `Package ${it} has version ${version} but should be ${expectedVersion}`,
      )
    }
  }
}

try {
  await main(process.argv[2])
  console.info("success")
  process.exit(0)
} catch (err) {
  console.error(err)
  process.exit(1)
}
