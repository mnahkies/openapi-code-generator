import {describe, expect, it} from "@jest/globals"
import {WebFsAdaptor} from "../file-system/web-fs-adaptor"
import {loadTsConfigCompilerOptions} from "./tsconfig.loader"

function fsAdaptor(files: Record<string, string>) {
  return new WebFsAdaptor(new Map(Object.entries(files)))
}

describe("core/loaders/tsconfig.loader", () => {
  it("returns defaults when no tsconfig.json is found", async () => {
    const fs = fsAdaptor({})

    const actual = await loadTsConfigCompilerOptions(
      "/virtual/workspace/src",
      fs,
    )

    expect(actual).toEqual({
      exactOptionalPropertyTypes: false,
      rewriteRelativeImportExtensions: false,
    })
  })

  it("parses tsconfig.json without compilerOptions and applies defaults", async () => {
    const fs = fsAdaptor({
      "/virtual/workspace/tsconfig.json": "{}",
    })

    const actual = await loadTsConfigCompilerOptions("/virtual/workspace", fs)

    expect(actual).toEqual({
      exactOptionalPropertyTypes: false,
      rewriteRelativeImportExtensions: false,
    })
  })

  it("reads and returns specified compilerOptions overriding defaults", async () => {
    const fs = fsAdaptor({
      "/virtual/ws/tsconfig.json": JSON.stringify({
        compilerOptions: {
          exactOptionalPropertyTypes: true,
        },
      }),
    })

    const actual = await loadTsConfigCompilerOptions(
      "/virtual/ws/packages/pkg",
      fs,
    )

    expect(actual).toEqual({
      exactOptionalPropertyTypes: true,
      rewriteRelativeImportExtensions: false,
    })
  })

  it("supports both options when set", async () => {
    const fs = fsAdaptor({
      "/v/tsconfig.json": JSON.stringify({
        compilerOptions: {
          exactOptionalPropertyTypes: true,
          rewriteRelativeImportExtensions: true,
        },
      }),
    })

    const actual = await loadTsConfigCompilerOptions("/v/src", fs)

    expect(actual).toEqual({
      exactOptionalPropertyTypes: true,
      rewriteRelativeImportExtensions: true,
    })
  })

  it("merges compilerOptions from an extends chain", async () => {
    const basePath = "/virt/base/tsconfig.base.json"
    const childPath = "/virt/proj/tsconfig.json"

    const fs = fsAdaptor({
      [basePath]: JSON.stringify({
        compilerOptions: {
          exactOptionalPropertyTypes: true,
          rewriteRelativeImportExtensions: false,
        },
      }),
      [childPath]: JSON.stringify({
        extends: "./../base/tsconfig.base.json",
        compilerOptions: {
          rewriteRelativeImportExtensions: true,
        },
      }),
    })

    const actual = await loadTsConfigCompilerOptions("/virt/proj/src", fs)

    expect(actual).toEqual({
      exactOptionalPropertyTypes: true,
      rewriteRelativeImportExtensions: true,
    })
  })
})
