import {describe, expect, it} from "@jest/globals"
import {ImportBuilder, naturalCompare} from "./import-builder"

describe("typescript/common/import-builder", () => {
  describe("naturalCompare", () => {
    it("puts uppercase before lowercase", () => {
      expect(
        ["a", "A", "startServer", "StatusCode"].sort(naturalCompare),
      ).toEqual(["A", "a", "StatusCode", "startServer"])
    })
  })

  it("can import whole modules", () => {
    const builder = new ImportBuilder()
    builder.addModule("_", "lodash")

    expect(builder.toString()).toBe("import _ from 'lodash'")
  })

  it("can import individual exports", () => {
    const builder = new ImportBuilder()

    builder.addSingle("Cat", "./models", false)
    builder.addSingle("Dog", "./models", false)

    expect(builder.toString()).toBe("import {Cat, Dog} from './models'")
  })

  it("can import a whole module, and individual exports", () => {
    const builder = new ImportBuilder()

    builder.addSingle("Next", "koa", false)
    builder.addSingle("Context", "koa", false)
    builder.addModule("koa", "koa")

    expect(builder.toString()).toBe("import koa, {Context, Next} from 'koa'")
  })

  describe("relative path handling", () => {
    it("same directory", () => {
      const builder = new ImportBuilder({filename: "./foo/example"})

      builder.addSingle("Cat", "./foo/models", false)

      expect(builder.toString()).toBe("import {Cat} from './models'")
    })

    it("parent directory", () => {
      const builder = new ImportBuilder({filename: "./foo/example"})

      builder.addSingle("Cat", "./models", false)

      expect(builder.toString()).toBe("import {Cat} from '../models'")
    })

    it("child directory", () => {
      const builder = new ImportBuilder({filename: "./example"})

      builder.addSingle("Cat", "./foo/models", false)

      expect(builder.toString()).toBe("import {Cat} from './foo/models'")
    })

    it("sibling directory", () => {
      const builder = new ImportBuilder({filename: "./foo/example"})

      builder.addSingle("Cat", "./bar/models", false)

      expect(builder.toString()).toBe("import {Cat} from '../bar/models'")
    })
  })

  describe("type imports", () => {
    it("can import types", () => {
      const builder = new ImportBuilder()

      builder.addSingle("Cat", "./models", false)
      builder.addSingle("Dog", "./models", true)

      expect(builder.toString()).toBe("import {Cat, type Dog} from './models'")
    })

    it("formats all-type named imports as 'import type {A, B}'", () => {
      const builder = new ImportBuilder()

      builder.addSingle("A", "lib", true)
      builder.addSingle("B", "lib", true)

      expect(builder.toString()).toBe("import type {A, B} from 'lib'")
    })

    it("mixes default import with only-type named imports", () => {
      const builder = new ImportBuilder()

      builder.addModule("Default", "lib")
      builder.addSingle("A", "lib", true)
      builder.addSingle("B", "lib", true)

      expect(builder.toString()).toBe(
        "import Default, {type A, type B} from 'lib'",
      )
    })

    it("deduplicates names when added as both value and type (prefers value)", () => {
      const builder = new ImportBuilder()

      builder.addSingle("Overlap", "pkg", false)
      builder.addSingle("Overlap", "pkg", true)
      builder.addSingle("OnlyType", "pkg", true)

      expect(builder.toString()).toBe(
        "import {type OnlyType, Overlap} from 'pkg'",
      )
    })
  })

  describe("from() chaining API", () => {
    it("supports add, addType, and all in a single chain", () => {
      const builder = new ImportBuilder()

      builder.from("koa").add("Context", "Next").addType("State").all("koa")

      expect(builder.toString()).toBe(
        "import koa, {Context, Next, type State} from 'koa'",
      )
    })
  })

  describe("usage-based pruning", () => {
    it("omits unused named and default imports based on provided code", () => {
      const builder = new ImportBuilder()

      builder.addModule("_, defaultExport", "ignore-me") // ensure not used
      builder.addModule("Lodash", "lodash")
      builder.addSingle("Cat", "./models", false)
      builder.addSingle("Dog", "./models", true)
      builder.addSingle("Unused", "./models", false)

      const code = [
        "function demo() {",
        "  const x: Dog = {} as any;",
        "  console.log(Lodash, Cat)",
        "}",
      ].join("\n")

      expect(builder.toString(code)).toBe(
        [
          "import Lodash from 'lodash'",
          "import {Cat, type Dog} from './models'",
        ].join("\n"),
      )
    })
  })

  describe("sorting", () => {
    it("sorts named imports alphabetically and groups types correctly", () => {
      const builder = new ImportBuilder()

      builder.addSingle("Bravo", "pkg", false)
      builder.addSingle("Alpha", "pkg", false)
      builder.addSingle("Zulu", "pkg", true)
      builder.addSingle("Mike", "pkg", true)

      expect(builder.toString()).toBe(
        "import {Alpha, Bravo, type Mike, type Zulu} from 'pkg'",
      )
    })

    it("orders sources by Biome distance (URL > protocol pkg > pkg > alias > paths)", () => {
      const builder = new ImportBuilder({filename: "./foo/example"})

      builder.addModule("S1", "./file.js") // sibling
      builder.addModule("A1", "#alias") // alias
      builder.addModule("F1", "fs") // bare package
      builder.addModule("NT", "node:test") // protocol package
      builder.addModule("NP", "node:path") // protocol package
      builder.addModule("P1", "../parent.js") // parent path
      builder.addModule("J1", "jsr:@scoped/lib") // protocol package
      builder.addModule("U1", "https://example.org") // URL
      builder.addModule("L1", "lib") // bare package
      builder.addModule("S2", "@scoped/lib") // scoped package
      builder.from("@some/lib").add("startServer").addType("StatusCode")

      expect(builder.toString()).toBe(
        [
          "import U1 from 'https://example.org'",
          "import J1 from 'jsr:@scoped/lib'",
          "import NP from 'node:path'",
          "import NT from 'node:test'",
          "import S2 from '@scoped/lib'",
          "import {type StatusCode, startServer} from '@some/lib'",
          "import F1 from 'fs'",
          "import L1 from 'lib'",
          "import A1 from '#alias'",
          "import S1 from '../file.js'",
          "import P1 from '../parent.js'",
        ].join("\n"),
      )
    })
  })

  describe("merge()", () => {
    it("merges multiple builders and preserves types/values", () => {
      const a = new ImportBuilder()
      a.addSingle("A", "x", false)
      a.addSingle("TA", "x", true)

      const b = new ImportBuilder()
      b.addModule("Def", "x")
      b.addSingle("B", "x", false)

      const merged = ImportBuilder.merge(undefined, a, b)

      expect(merged.toString()).toBe("import Def, {A, B, type TA} from 'x'")
    })

    it("throws when merging builders with conflicting default imports for same module", () => {
      const a = new ImportBuilder()
      a.addModule("DefA", "x")

      const b = new ImportBuilder()
      b.addModule("DefB", "x")

      expect(() => ImportBuilder.merge(undefined, a, b)).toThrow(
        "cannot merge imports with colliding importAlls",
      )
    })
  })
})
