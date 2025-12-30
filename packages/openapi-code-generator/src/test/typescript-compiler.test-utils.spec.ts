import {describe, expect, it} from "@jest/globals"
import {TestOutputTypeChecker} from "./typescript-compiler.test-utils"

describe("test/typescript-compiler", () => {
  const typechecker = new TestOutputTypeChecker()

  it("should throw is provided code doesn't typecheck successfully", async () => {
    expect(() =>
      typechecker.typecheck([
        {
          filename: "unit-test.ts",
          content: `
          const x = "foo"
          const y: number = x
        `,
        },
      ]),
    ).toThrow(/TS2322: Type 'string' is not assignable to type 'number'/)
  })

  it("should not throw if the provided code is valid", async () => {
    expect(() =>
      typechecker.typecheck([
        {
          filename: "unit-test.ts",
          content: `
            const x = "foo"
            const y: string = x
        `,
        },
      ]),
    ).not.toThrow()
  })
})
