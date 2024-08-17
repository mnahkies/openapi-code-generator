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
