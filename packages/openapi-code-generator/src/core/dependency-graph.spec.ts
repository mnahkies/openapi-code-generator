/**
 * @prettier
 */

import {describe, it, expect} from "@jest/globals"
import {unitTestInput} from "../test/input.test-utils"
import {buildDependencyGraph} from "./dependency-graph"
import {getSchemaNameFromRef} from "./openapi-utils"

describe("core/dependency-graph", () => {
  it("works", async () => {
    const {input} = await unitTestInput()

    const graph = buildDependencyGraph(input, getSchemaNameFromRef)

    expect(graph.order.indexOf("s_Ordering")).toBeGreaterThan(
      graph.order.indexOf("s_AOrdering"),
    )

    expect(graph.order.indexOf("s_Ordering")).toBeGreaterThan(
      graph.order.indexOf("s_ZOrdering"),
    )

    expect(graph.order.indexOf("s_ZOrdering")).toBeGreaterThan(
      graph.order.indexOf("s_AOrdering"),
    )

    expect(graph.order.indexOf("s_ObjectWithRefs")).toBeGreaterThan(
      graph.order.indexOf("s_SimpleObject"),
    )

    expect(graph.order.indexOf("s_AllOf")).toBeGreaterThan(
      graph.order.indexOf("s_Base"),
    )

    expect(graph.order.indexOf("s_Recursive")).toBe(-1)

    expect(graph.circular).toEqual(new Set(["s_Recursive"]))
  })
})
