import path from "node:path"
import util from "node:util"

import * as console from "node:console"
import {load} from "js-yaml"
import {VirtualDefinition, generationLib} from "./generation-lib"
import type {GenericLoader} from "./loaders/generic.loader"
import type {TypespecLoader} from "./loaders/typespec.loader"
import {isRemote} from "./loaders/utils"
import type {
  OpenapiDocument,
  Operation,
  Parameter,
  Path,
  Reference,
  RequestBody,
  Response,
  Schema,
  xInternalPreproccess,
} from "./openapi-types"
import {isRef} from "./openapi-utils"
import type {OpenapiValidator} from "./openapi-validator"

export class OpenapiLoader {
  private readonly virtualLibrary = new Map<string, VirtualDefinition>()
  private readonly library = new Map<string, OpenapiDocument>()

  private constructor(
    private readonly entryPointKey: string,
    private readonly validator: OpenapiValidator,
    private readonly genericLoader: GenericLoader,
  ) {
    this.virtualLibrary.set(generationLib.key, generationLib)
    this.library.set(generationLib.key, generationLib.definition)
  }

  addVirtualType(context: string, name: string, schema: Schema): Reference {
    const def =
      this.virtualLibrary.get(context) ?? new VirtualDefinition(context)
    this.virtualLibrary.set(context, def)
    this.library.set(context, def.definition)
    def.addSchema(name, schema)

    return {$ref: `${context}#/components/schemas/${name}`}
  }

  get entryPoint(): OpenapiDocument {
    // This is guaranteed by the combination of a private constructor,
    // and the factory function loading the entry point at this key.
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    return this.library.get(this.entryPointKey)!
  }

  allDocuments(): OpenapiDocument[] {
    return Array.from(this.library.values())
  }

  paths(maybeRef: Reference | Path): Path {
    return isRef(maybeRef) ? this.$ref(maybeRef) : maybeRef
  }

  operation(maybeRef: Reference | Operation): Operation {
    return isRef(maybeRef) ? this.$ref(maybeRef) : maybeRef
  }

  requestBody(maybeRef: Reference | RequestBody): RequestBody {
    return isRef(maybeRef) ? this.$ref<RequestBody>(maybeRef) : maybeRef
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

  preprocess(maybeRef: Reference | xInternalPreproccess): xInternalPreproccess {
    return isRef(maybeRef) ? this.$ref(maybeRef) : maybeRef
  }

  private $ref<T>({$ref}: Reference): T {
    const [key, objPath] = $ref.split("#")

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const obj: any = key && this.library.get(key)

    if (!obj) {
      throw new Error(`could not load $ref, key not loaded. $ref: '${$ref}'`)
    }

    if (!objPath) {
      return obj
    }

    const segments = objPath
      .split("/")
      .map(decodeSegment)
      .filter((it) => !!it)

    let result = obj

    for (const segment of segments) {
      result = result[segment]

      if (!result) {
        throw new Error(`could not load $ref, path not found. $ref: '${$ref}'`)
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

    const [loadedFrom, definition] = await this.genericLoader.loadFile(file)
    await this.loadFileContent(loadedFrom, definition)
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private async loadFileContent(loadedFrom: string, definition: any) {
    await this.validator.validate(loadedFrom, definition)

    this.library.set(loadedFrom, definition)
    await this.normalizeRefs(loadedFrom, definition)
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private async normalizeRefs(loadedFrom: string, obj: any) {
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        continue
      }

      // TODO: allowing $ref to be used anywhere, makes it tricky
      //       for things like an object property named '$ref', such
      //       as on the SCIM v2 Group member schema. Hack around by
      //       sniffing if it looks like an actual $ref or not.
      if (
        key === "$ref" &&
        typeof obj[key] === "string" &&
        obj[key].indexOf("#") !== -1
      ) {
        // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
        const $ref = (obj[key] = normalizeRef(obj[key], loadedFrom))
        await this.loadFile(pathFromRef($ref))
      } else if (typeof obj[key] === "object" && !!obj[key]) {
        await this.normalizeRefs(loadedFrom, obj[key])
      }
    }
  }

  static async createFromLiteral(
    value: object,
    validator: OpenapiValidator,
    genericLoader: GenericLoader,
  ): Promise<OpenapiLoader> {
    const loader = new OpenapiLoader("input.yaml", validator, genericLoader)

    await loader.loadFileContent("input.yaml", value)

    return loader
  }

  static async create(
    config: {entryPoint: string; fileType: "openapi3" | "typespec"},
    validator: OpenapiValidator,
    genericLoader: GenericLoader,
    typespecLoader: TypespecLoader,
  ): Promise<OpenapiLoader> {
    const entryPoint = isRemote(config.entryPoint)
      ? config.entryPoint
      : path.resolve(config.entryPoint)

    const loader = new OpenapiLoader(entryPoint, validator, genericLoader)

    switch (config.fileType) {
      case "openapi3": {
        await loader.loadFile(entryPoint)
        break
      }

      case "typespec": {
        const openapi =
          await typespecLoader.compileTypeSpecToOpenAPI3(entryPoint)
        await loader.loadFileContent(entryPoint, openapi)
        break
      }
      default: {
        throw new Error(`unsupported file type '${config.fileType}'`)
      }
    }

    return loader
  }

  toJSON(): Record<string, unknown> {
    return Array.from(this.library.keys()).reduce(
      (acc, key) => {
        const {title, version} = this.library.get(key)?.info ?? {}
        acc[prettyKey(key)] = {title, version}
        return acc
      },
      {} as Record<string, unknown>,
    )
  }

  toString(): string {
    return `loaded ${this.library.size} files: ${Array.from(this.library.keys())
      .map(prettyKey)
      .join(", ")}`
  }

  [util.inspect.custom](): Record<string, unknown> {
    return this.toJSON()
  }
}

export function normalizeRef($ref: string, loadedFrom: string) {
  let [file, objPath] = $ref.split("#")

  if (file === undefined || objPath === undefined) {
    throw new Error(`invalid $ref '${$ref}'`)
  }

  if (file === "") {
    return objPath ? `${loadedFrom}#${objPath}` : `${loadedFrom}`
  }

  if (isRemote(file)) {
    return $ref
  }

  if (path.isAbsolute(file)) {
    return $ref
  }

  if (isRemote(loadedFrom)) {
    file = new URL(file, loadedFrom).toString()
  } else {
    file = path.resolve(path.dirname(loadedFrom), file)
  }

  return objPath ? `${file}#${objPath}` : file
}

export function pathFromRef($ref: string) {
  const path = $ref.split("#")[0]

  if (!path) {
    throw new Error(`invalid $ref '${$ref}'`)
  }

  return path
}

function prettyKey(key: string) {
  return key.replace(process.cwd(), "")
}
