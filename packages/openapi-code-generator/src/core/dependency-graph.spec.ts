/**
 * @prettier
 */

import {describe, it, expect} from "@jest/globals"
import {testVersions, unitTestInput} from "../test/input.test-utils"
import {buildDependencyGraph} from "./dependency-graph"
import {getSchemaNameFromRef} from "./openapi-utils"

describe.each(testVersions)("%s - core/dependency-graph", (version) => {
  it("works", async () => {
    const {input} = await unitTestInput(version)

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

    expect(graph.order.indexOf("s_OneOfAllOf")).toBeGreaterThan(
      graph.order.indexOf("s_ZOrdering"),
    )

    expect(graph.order.indexOf("s_OneOfAllOf")).toBeGreaterThan(
      graph.order.indexOf("s_AOrdering"),
    )

    expect(graph.order.indexOf("s_Recursive")).toBe(-1)

    expect(graph.circular).toEqual(new Set(["s_Recursive"]))
  })
})
