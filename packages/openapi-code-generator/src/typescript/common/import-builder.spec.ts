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
  })
})
