import { assert } from "chai"
import { ImportBuilder } from "./import-builder"

describe("typescript/common/import-builder", function () {

  it("can import whole modules", () => {
    const builder = new ImportBuilder()
    builder.addModule("_", "lodash")

    assert.equal(builder.toString(), `import _ from 'lodash'`)
  })

  it("can import individual exports", () => {
    const builder = new ImportBuilder()

    builder.addSingle("Cat", "./models.ts")
    builder.addSingle("Dog", "./models.ts")

    assert.equal(builder.toString(), `import {Cat, Dog} from './models'`)
  })

  it("can import a whole module, and individual exports", function () {
    const builder = new ImportBuilder()

    builder.addSingle("Next", "koa")
    builder.addSingle("Context", "koa")
    builder.addModule("koa", "koa")

    assert.equal(builder.toString(), `import koa, {Context, Next} from 'koa'`)
  })
})
