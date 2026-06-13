import {describe, expect, it} from "vitest"
import {testFsAdaptor} from "../file-system/test-fs-adaptor.ts"
import {
  findConfigFile,
  loadTypescriptFormatterConfig,
} from "./typescript-formatter-config.loader.ts"

describe("core/loaders/typescript-formatter-config.loader", () => {
  describe("#loadTypescriptFormatterConfig", () => {
    it("returns null when no config file is found and reaches root", async () => {
      const fs = testFsAdaptor({})
      const result = await loadTypescriptFormatterConfig(
        "/virtual/workspace/src",
        fs,
      )
      expect(result).toBeNull()
    })

    it("finds and loads biome.json", async () => {
      const fs = testFsAdaptor({
        "/virtual/workspace/biome.json": JSON.stringify({
          formatter: {enabled: true},
        }),
      })

      const result = await loadTypescriptFormatterConfig(
        "/virtual/workspace/src",
        fs,
      )

      expect(result).toEqual({
        type: "biome",
        config: {formatter: {enabled: true}},
      })
    })

    it("finds and loads biome.jsonc", async () => {
      const fs = testFsAdaptor({
        "/virtual/workspace/biome.jsonc":
          '{"formatter": {"enabled": true}} // comment',
      })

      const result = await loadTypescriptFormatterConfig(
        "/virtual/workspace/src",
        fs,
      )

      expect(result).toEqual({
        type: "biome",
        config: {formatter: {enabled: true}},
      })
    })
  })

  describe.each([
    {root: "/virtual/workspace/src", sep: "/" as const},
    {
      root: "C:\\Users\\Alice\\My Documents",
      sep: "\\" as const,
    },
  ])("#findConfigFile with root $root and path sep $sep", ({root, sep}) => {
    it("returns null when no config file is found and reaches root", async () => {
      const fs = testFsAdaptor({})

      const result = findConfigFile(["biome.json", "biome.jsonc"], root, fs)
      expect(result).toBeNull()
    })

    it("(in root) returns the first file found from the provided list", () => {
      const biomeJsoncPath = root.split(sep).concat("biome.jsonc").join(sep)
      const biomeJsonPath = root.split(sep).concat("biome.json").join(sep)

      const fs = testFsAdaptor(
        {
          [biomeJsoncPath]: JSON.stringify({
            formatter: {enabled: true},
          }),
          [biomeJsonPath]: JSON.stringify({
            formatter: {enabled: false},
          }),
        },
        sep,
      )

      const result = findConfigFile(["biome.jsonc", "biome.json"], root, fs)

      expect(result).toBe(biomeJsoncPath)
    })

    it("(above root) returns the first file found from the provided list", () => {
      const biomeJsoncPath = root
        .split(sep)
        .slice(0, -1)
        .concat("biome.jsonc")
        .join(sep)
      const biomeJsonPath = root
        .split(sep)
        .slice(0, -1)
        .concat("biome.json")
        .join(sep)

      const fs = testFsAdaptor(
        {
          [biomeJsoncPath]: JSON.stringify({
            formatter: {enabled: true},
          }),
          [biomeJsonPath]: JSON.stringify({
            formatter: {enabled: false},
          }),
        },
        sep,
      )

      const result = findConfigFile(["biome.jsonc", "biome.json"], root, fs)

      expect(result).toBe(biomeJsoncPath)
    })
  })
})
