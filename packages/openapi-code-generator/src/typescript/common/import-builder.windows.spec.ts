import {describe, expect, it, vi} from "vitest"
import {ImportBuilder} from "./import-builder.ts"

vi.mock(import("node:path"), async (importOriginal) => {
  const original = await importOriginal()
  return {
    ...original,
    default: original.win32,
    ...original.win32,
  }
})

describe("typescript/common/import-builder - windows behavior", () => {
  it("should use forward slashes for imports even on Windows", () => {
    const builder = new ImportBuilder({
      unit: {
        filename: "src\\index.ts",
      },
      includeFileExtensions: false,
    })

    builder.addSingle("Cat", "./models.ts", false)

    expect(builder.toString()).toBe("import {Cat} from '../models'")
  })

  describe("relative path handling", () => {
    it("same directory", () => {
      const builder = new ImportBuilder({
        unit: {
          filename: "foo\\example.ts",
        },
        includeFileExtensions: false,
      })

      builder.addSingle("Cat", "./foo/models.ts", false)

      expect(builder.toString()).toBe("import {Cat} from './models'")
    })

    it("parent directory", () => {
      const builder = new ImportBuilder({
        unit: {
          filename: "foo\\example.ts",
        },
        includeFileExtensions: false,
      })

      builder.addSingle("Cat", "./models.ts", false)

      expect(builder.toString()).toBe("import {Cat} from '../models'")
    })

    it("child directory", () => {
      const builder = new ImportBuilder({
        unit: {
          filename: "example.ts",
        },
        includeFileExtensions: false,
      })

      builder.addSingle("Cat", "./foo/models.ts", false)

      expect(builder.toString()).toBe("import {Cat} from './foo/models'")
    })

    it("sibling directory", () => {
      const builder = new ImportBuilder({
        unit: {
          filename: "foo\\example.ts",
        },
        includeFileExtensions: false,
      })

      builder.addSingle("Cat", "./bar/models.ts", false)

      expect(builder.toString()).toBe("import {Cat} from '../bar/models'")
    })

    it("handles absolute paths", () => {
      const builder = new ImportBuilder({
        unit: {
          filename: "D:\\Users/user\\project\\src\\index.ts",
        },
        includeFileExtensions: false,
      })

      builder.addSingle("Cat", "D:\\Users/user\\project\\src\\models.ts", false)
      builder.addSingle(
        "Dog",
        "D:\\Users/user\\project\\other\\models.ts",
        false,
      )

      expect(builder.toString()).toBe(
        "import {Dog} from '../other/models'\nimport {Cat} from './models'",
      )
    })
  })
})
