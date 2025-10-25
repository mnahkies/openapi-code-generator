import {describe, expect, it} from "@jest/globals"
import {ImportBuilder} from "./import-builder"

describe("typescript/common/import-builder", () => {
  it("can import whole modules", () => {
    const builder = new ImportBuilder()
    builder.addModule("_", "lodash")

    expect(builder.toString()).toBe("import _ from 'lodash'")
  })

  it("can import individual exports", () => {
    const builder = new ImportBuilder()

    builder.addSingle("Cat", "./models.ts", false)
    builder.addSingle("Dog", "./models.ts", false)

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
      const builder = new ImportBuilder({filename: "./foo/example.ts"})

      builder.addSingle("Cat", "./foo/models.ts", false)

      expect(builder.toString()).toBe("import {Cat} from './models'")
    })

    it("parent directory", () => {
      const builder = new ImportBuilder({filename: "./foo/example.ts"})

      builder.addSingle("Cat", "./models.ts", false)

      expect(builder.toString()).toBe("import {Cat} from '../models'")
    })

    it("child directory", () => {
      const builder = new ImportBuilder({filename: "./example.ts"})

      builder.addSingle("Cat", "./foo/models.ts", false)

      expect(builder.toString()).toBe("import {Cat} from './foo/models'")
    })

    it("sibling directory", () => {
      const builder = new ImportBuilder({filename: "./foo/example.ts"})

      builder.addSingle("Cat", "./bar/models.ts", false)

      expect(builder.toString()).toBe("import {Cat} from '../bar/models'")
    })
  })

  describe("type imports", () => {
    it("can import types", () => {
      const builder = new ImportBuilder()

      builder.addSingle("Cat", "./models.ts", false)
      builder.addSingle("Dog", "./models.ts", true)

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
      builder.addSingle("Cat", "./models.ts", false)
      builder.addSingle("Dog", "./models.ts", true)
      builder.addSingle("Unused", "./models.ts", false)

      const code = [
        "function demo() {",
        "  const x: Dog = {} as any;",
        "  console.log(Lodash, Cat)",
        "}",
      ].join("\n")

      expect(builder.toString(code)).toBe(
        [
          "import {Cat, type Dog} from './models'",
          "import Lodash from 'lodash'",
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
