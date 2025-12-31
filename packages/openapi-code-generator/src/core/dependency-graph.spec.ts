import {describe, expect, it} from "@jest/globals"
import {
  createTestInputFromYamlString,
  testVersions,
  unitTestInput,
} from "../test/input.test-utils"
import {buildDependencyGraph} from "./dependency-graph"
import {getNameFromRef} from "./openapi-utils"

describe.each(testVersions)("%s - core/dependency-graph", (version) => {
  it("works", async () => {
    const {input} = await unitTestInput(version)

    const graph = buildDependencyGraph(input, (it) => getNameFromRef(it, "s_"))

    expect(graph.order.indexOf("s_Ordering")).toBeGreaterThan(
      graph.order.indexOf("s_AOrdering"),
    )

    expect(graph.order.indexOf("s_Ordering")).toBeGreaterThan(
      graph.order.indexOf("s_ZOrdering"),
    )

    expect(graph.order.indexOf("s_ZOrdering")).toBeGreaterThan(
      graph.order.indexOf("s_AOrdering"),
    )

    expect(graph.order.indexOf("s_AArrayOrdering")).toBeGreaterThan(
      graph.order.indexOf("s_ZOrdering"),
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

    // check record values schemas are handled correctly.
    expect(graph.order.indexOf("s_NamedNullableStringEnum")).toBeLessThan(
      graph.order.indexOf("s_AdditionalPropertiesSchema"),
    )

    expect(graph.order.indexOf("s_Recursive")).toBe(-1)

    expect(graph.circular).toStrictEqual(new Set(["s_Recursive"]))
  })

  it("handles recursion in intersection types", async () => {
    const yaml = `
openapi: 3.0.3
info:
  title: Test
  version: 1.0.0
paths: {}
components:
  schemas:
    RecursiveIntersection:
      allOf:
        - type: object
          properties:
            foo:
              type: string
        - $ref: '#/components/schemas/RecursiveIntersection'
`
    const input = await createTestInputFromYamlString(yaml)
    const graph = buildDependencyGraph(input, (it) => getNameFromRef(it, "s_"))

    expect(graph.circular).toContain("s_RecursiveIntersection")
  })
})
