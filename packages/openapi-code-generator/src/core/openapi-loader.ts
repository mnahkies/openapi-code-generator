import path from "path"
import util from "util"

import { isRemote, loadFile } from "./file-loader"

import { generationLib, VirtualDefinition } from "./generation-lib"
import { OpenapiValidator } from "./openapi-validator"
import {
  OpenapiDocument,
  Operation,
  Parameter,
  Path,
  Reference,
  RequestBody,
  Response,
  Schema,
} from "./openapi-types"
import { isRef } from "./openapi-utils"

export class OpenapiLoader {

  private readonly virtualLibrary = new Map<string, VirtualDefinition>()
  private readonly library = new Map<string, any>()

  private constructor(
    private readonly entryPointKey: string,
    private readonly validator: OpenapiValidator,
  ) {
    this.virtualLibrary.set(generationLib.key, generationLib)
    this.library.set(generationLib.key, generationLib.definition)
  }

  addVirtualType(context: string, name: string, schema: Schema): string {
    const def = this.virtualLibrary.get(context) ?? new VirtualDefinition(context)
    this.virtualLibrary.set(context, def)
    this.library.set(context, def.definition)
    def.addSchema(name, schema)

    return `${ context }#/components/schemas/${ name }`
  }

  get entryPoint(): OpenapiDocument {
    // This is guaranteed by the combination of a private constructor,
    // and the factory function loading the entry point at this key.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.library.get(this.entryPointKey)!
  }

  paths(maybeRef: Reference | Path): Path {
    return isRef(maybeRef) ? this.$ref(maybeRef) : maybeRef
  }

  operation(maybeRef: Reference | Operation): Operation {
    return isRef(maybeRef) ? this.$ref(maybeRef) : maybeRef
  }

  requestBody(maybeRef: Reference | RequestBody): RequestBody {
    return isRef(maybeRef) ? this.$ref(maybeRef) : maybeRef
  }

  response(maybeRef: Reference | Response): Response {
    return isRef(maybeRef) ? this.$ref(maybeRef) : maybeRef
  }

  parameter(maybeRef: Reference | Parameter): Parameter {
    return isRef(maybeRef) ? this.$ref(maybeRef) : maybeRef
  }

  schema(maybeRef: Reference | Schema): Schema {
    return isRef(maybeRef) ? this.$ref(maybeRef) : maybeRef
  }

  private $ref<T>({ $ref }: Reference): T {
    const [key, objPath] = $ref.split("#")

    const obj = this.library.get(key)

    if (!obj) {
      throw new Error(`could not load $ref, key not loaded. $ref: '${ $ref }'`)
    }

    if (!objPath) {
      return obj
    }

    const segments = objPath
      .split("/")
      .map(decodeSegment)
      .filter(it => !!it)

    let result = obj

    for (const segment of segments) {
      result = result[segment]

      if (!result) {
        throw new Error(`could not load $ref, path not found. $ref: '${ $ref }'`)
      }
    }

    if (isRef(result)) {
      return this.$ref(result)
    }

    return result

    function decodeSegment(segment: string) {
      return segment
        .replace(/~1/g, "/")
        .replace(/%7B/g, "{")
        .replace(/%7D/g, "}")
    }
  }

  private async loadFile(file: string) {

    if (this.library.has(file)) {
      return
    }

    const [loadedFrom, definition] = await loadFile(file)

    await this.validator.validate(file, definition)

    this.library.set(loadedFrom, definition)
    await this.normalizeRefs(loadedFrom, definition)
  }

  private async normalizeRefs(loadedFrom: string, obj: any) {
    for (const key in obj) {

      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        continue
      }

      if (key === "$ref") {
        obj[key] = normalizeRef(obj[key])
        await this.loadFile(pathFromRef(obj[key]))
      } else if (typeof obj[key] === "object" && !!obj[key]) {
        await this.normalizeRefs(loadedFrom, obj[key])
      }
    }

    function normalizeRef($ref: string) {
      // eslint-disable-next-line prefer-const
      let [file, objPath] = $ref.split("#")

      if (file === "") {
        return objPath ? `${ loadedFrom }#${ objPath }` : `${ loadedFrom }`
      }

      if (isRemote(file)) {
        return $ref
      }

      if (path.isAbsolute(file)) {
        return $ref
      }

      file = path.resolve(path.dirname(loadedFrom), file)

      return objPath ? `${ file }#${ objPath }` : file
    }

    function pathFromRef($ref: string) {
      return $ref.split("#")[0]
    }
  }

  static async create(entryPoint: string, validator: OpenapiValidator): Promise<OpenapiLoader> {
    entryPoint = path.resolve(entryPoint)
    const loader = new OpenapiLoader(entryPoint, validator)

    await loader.loadFile(entryPoint)

    return loader
  }

  toJSON(): Record<string, unknown> {
    return Array.from(this.library.keys()).reduce((acc, key) => {
      const { title, version } = this.library.get(key)?.info ?? {}
      acc[prettyKey(key)] = { title, version }
      return acc
    }, {} as any)
  }

  toString(): string {
    return `loaded ${ this.library.size } files: ${ Array.from(this.library.keys()).map(prettyKey).join(", ") }`
  }

  [util.inspect.custom](): Record<string, unknown> {
    return this.toJSON()
  }
}

function prettyKey(key: string) {
  return key.replace(process.cwd(), "")
}
