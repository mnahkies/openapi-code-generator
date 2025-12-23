import type {CustomMatcherResult} from "expect"

declare module "expect" {
  interface AsymmetricMatchers {
    toEqualBlob(this: R, expected: Blob): Promise<CustomMatcherResult>
  }
  interface Matchers<R> {
    toEqualBlob(this: R, expected: Blob): Promise<CustomMatcherResult>
  }
}
