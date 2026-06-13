import {describe, expect, it, vi} from "vitest"
import {testFsAdaptor} from "../file-system/test-fs-adaptor.ts"
import {loadTsConfigCompilerOptions} from "./tsconfig.loader.ts"

describe("core/loaders/tsconfig.loader", () => {
  it("returns defaults when no tsconfig.json is found", async () => {
    const fs = testFsAdaptor({})

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
    const fs = testFsAdaptor({
      "/virtual/workspace/tsconfig.json": "{}",
    })

    const actual = await loadTsConfigCompilerOptions("/virtual/workspace", fs)

    expect(actual).toEqual({
      exactOptionalPropertyTypes: false,
      rewriteRelativeImportExtensions: false,
    })
  })

  it("reads and returns specified compilerOptions overriding defaults", async () => {
    const fs = testFsAdaptor({
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
    const fs = testFsAdaptor({
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

    const fs = testFsAdaptor({
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

  it("falls back to defaults if an exception occurs", async () => {
    const fs = testFsAdaptor({
      "/virtual/ws/tsconfig.json": JSON.stringify({
        compilerOptions: {
          exactOptionalPropertyTypes: true,
        },
      }),
    })

    const spy = vi
      .spyOn(fs, "readFile")
      .mockRejectedValue(new Error("EACCES: permission denied"))

    const actual = await loadTsConfigCompilerOptions(
      "/virtual/ws/packages/pkg",
      fs,
    )

    expect(actual).toEqual({
      exactOptionalPropertyTypes: false,
      rewriteRelativeImportExtensions: false,
    })

    expect(spy).toHaveBeenCalled()
  })
})
