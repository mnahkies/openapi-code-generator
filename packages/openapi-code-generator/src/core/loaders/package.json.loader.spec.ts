import path from "node:path"
import {describe, expect, it} from "@jest/globals"
import {NodeFsAdaptor} from "../file-system/node-fs-adaptor"
import {loadPackageJson} from "./package.json.loader"

describe("core/loaders/package.json.loader", () => {
  const fsAdaptor = new NodeFsAdaptor()

  it("should load the nearest package.json (commonjs)", async () => {
    const actual = await loadPackageJson(__dirname, fsAdaptor)

    expect(actual).toEqual({
      type: "commonjs",
    })
  })

  it("should load the nearest package.json (esm)", async () => {
    const actual = await loadPackageJson(
      path.join(__dirname, "../../../../../e2e"),
      fsAdaptor,
    )
    expect(actual).toEqual({
      type: "module",
    })
  })

  it("should default to commonjs if no package.json is found", async () => {
    const actual = await loadPackageJson("/tmp/foo/bla", fsAdaptor)
    expect(actual).toEqual({
      type: "commonjs",
    })
  })
})
