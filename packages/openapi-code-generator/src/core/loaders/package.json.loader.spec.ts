import path from "node:path"
import {describe, expect, it} from "@jest/globals"
import {NodeFsAdaptor} from "../file-system/node-fs-adaptor.ts"
import {loadPackageJson} from "./package.json.loader.ts"

describe("core/loaders/package.json.loader", () => {
  const fsAdaptor = new NodeFsAdaptor()

  it("should load the nearest package.json (cwd)", async () => {
    const actual = await loadPackageJson(__dirname, fsAdaptor)

    expect(actual).toEqual({
      name: "@nahkies/openapi-code-generator",
      type: "module",
    })
  })

  it("should load the nearest package.json (monorepo-root)", async () => {
    const actual = await loadPackageJson(
      path.join(__dirname, "../../../../"),
      fsAdaptor,
    )
    expect(actual).toEqual({
      name: "openapi-code-generator-root",
      type: "commonjs",
    })
  })

  it("should default to commonjs if no package.json is found", async () => {
    const actual = await loadPackageJson("/tmp/foo/bla", fsAdaptor)
    expect(actual).toEqual({
      type: "commonjs",
    })
  })
})
