import type {Config} from "@nahkies/openapi-code-generator"

export type WorkerMessage = {type: "generate"; config: Config; input: string}
export type WorkerResult = {files: Map<string, string>; elapsed: number}

export type Monad<T> =
  | {success: true; loading: false; result: T}
  | {success: false; loading: false; err: Error}
  | {success: null; loading: true}
