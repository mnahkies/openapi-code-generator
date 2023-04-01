import { describe, it, expect } from "@jest/globals"
import { ImportBuilder } from "./import-builder"

describe("typescript/common/import-builder", function () {

  it("can import whole modules", () => {
    const builder = new ImportBuilder()
    builder.addModule("_", "lodash")

    expect(builder.toString()).toBe("import _ from 'lodash'")
  })

  it("can import individual exports", () => {
    const builder = new ImportBuilder()

    builder.addSingle("Cat", "./models.ts")
    builder.addSingle("Dog", "./models.ts")

    expect(builder.toString()).toBe("import {Cat, Dog} from './models'")
  })

  it("can import a whole module, and individual exports", function () {
    const builder = new ImportBuilder()

    builder.addSingle("Next", "koa")
    builder.addSingle("Context", "koa")
    builder.addModule("koa", "koa")

    expect(builder.toString()).toBe("import koa, {Context, Next} from 'koa'")
  })
})
