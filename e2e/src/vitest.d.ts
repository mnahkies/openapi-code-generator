import type {CustomMatcherResult} from "expect"

declare module "vitest" {
  interface Assertion<T = any> {
    toEqualBlob(expected: Blob): Promise<CustomMatcherResult>
  }
  interface AsymmetricMatchersContaining {
    toEqualBlob(expected: Blob): Promise<CustomMatcherResult>
  }
}
