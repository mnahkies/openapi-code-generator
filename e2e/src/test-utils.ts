import {Blob} from "node:buffer"
import {expect} from "@jest/globals"
import {AsymmetricMatcher} from "expect"

class NumberInRange extends AsymmetricMatcher<number> {
  constructor(
    private readonly min: number,
    private readonly max: number,
  ) {
    super(10)
  }

  override asymmetricMatch(other: unknown) {
    return typeof other === "number" && other >= this.min && other <= this.max
  }

  override toString(): string {
    return `Number between ${this.min} and ${this.max} (inclusive)`
  }

  override toAsymmetricMatcher() {
    return `NumberInRange<${this.min}, ${this.max}>`
  }
}

export const numberBetween = (min: number, max: number) =>
  new NumberInRange(min, max)

expect.extend({
  async toEqualBlob(received: Blob, expected: Blob) {
    if (!(received instanceof Blob)) {
      return {
        pass: false,
        message: () =>
          "received is not a blob:\n" +
          `received: '${this.utils.printReceived(received)}'` +
          `expected: '${this.utils.printExpected(expected)}'`,
      }
    }

    const [bufA, bufB] = await Promise.all([
      received.arrayBuffer(),
      expected.arrayBuffer(),
    ])

    const a = new Uint8Array(bufA)
    const b = new Uint8Array(bufB)

    const pass = a.length === b.length && a.every((v, i) => v === b[i])

    if (pass) {
      return {
        pass: true,
        message: () => "expected blobs not to be equal",
      }
    } else {
      return {
        pass: false,
        message: () =>
          `expected blobs to be equal, but got:\n` +
          `received: ${[...a].map((x) => x.toString(16).padStart(2, "0")).join(" ")}\n` +
          `expected: ${[...b].map((x) => x.toString(16).padStart(2, "0")).join(" ")}`,
      }
    }
  },
})
