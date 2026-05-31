import type {CustomMatcherResult} from "expect"

declare module "vitest" {
  interface Assertion<T = unknown> {
    toEqualBlob(expected: Blob): Promise<CustomMatcherResult>
  }
  interface AsymmetricMatchersContaining {
    toEqualBlob(expected: Blob): Promise<CustomMatcherResult>
  }
}
