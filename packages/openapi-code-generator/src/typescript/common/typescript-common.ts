import {logger} from "../../core/logger"
import type {
  IRMediaType,
  IROperation,
  IRParameter,
} from "../../core/openapi-types-normalized"
import {isDefined} from "../../core/utils"

export type MethodParameterDefinition = {
  name: string
  type: string
  required?: boolean
  default?: string | undefined
}

export type MethodDefinition = {
  name: string
  parameters: (MethodParameterDefinition | undefined)[]
  returnType: string
  overloads?: {
    parameters: (MethodParameterDefinition | undefined)[]
    returnType: string
  }[]
  body: string
}

export function combineParams(
  parameters: MethodParameterDefinition[],
  name = "p",
): MethodParameterDefinition | undefined {
  if (!parameters.length) {
    return undefined
  }

  const required = parameters.some((it) => it.required)

  return {
    name,
    type: `{
    ${params(parameters)}
    }`,
    required: true, // avoid "TS1015: Parameter cannot have question mark and initializer."
    default: !required ? "{}" : undefined,
  }
}

export function combineAndDestructureParams(
  parameters: MethodParameterDefinition[],
): MethodParameterDefinition | undefined {
  if (!parameters.length) {
    return undefined
  }

  return {
    name: `{
    ${parameters.map((it) => it.name).join(",\n")}
    }`,
    type: `{
    ${params(parameters)}
    }`,
  }
}

export function buildMethod({
  name,
  parameters,
  returnType,
  overloads = [],
  body,
}: MethodDefinition): string {
  return `
  ${overloads
    .map((it) => `${name}(${params(it.parameters)}): ${it.returnType};`)
    .join("\n")}
  ${name}(${params(parameters)}): ${returnType}
  {
    ${body}
  }`
}

export function asyncMethod({
  name,
  parameters,
  returnType,
  overloads = [],
  body,
}: MethodDefinition): string {
  return `
  ${overloads
    .map(
      (it) =>
        `async ${name}(${params(it.parameters)}): Promise<${it.returnType}>;`,
    )
    .join("\n")}
  async ${name}(${params(parameters)}): Promise<${returnType}>
  {
    ${body}
  }`
}

export type ExportDefinition =
  | {
      kind: "const"
      name: string
      type?: string
      value: string
    }
  | {
      kind: "type"
      name: string
      value: string
    }
  | {
      kind: "interface"
      name: string
      value: string
    }
  | {
      kind: "abstract-class"
      name: string
      value: string
    }

export function buildExport(args: ExportDefinition) {
  if (!args.value) {
    return ""
  }

  switch (args.kind) {
    case "const":
      return `export const ${args.name}${args.type ? `: ${args.type}` : ""} = ${
        args.value
      }`
    case "type":
      return `export type ${args.name} = ${args.value}`
    case "interface":
      return `export interface ${args.name} ${args.value}`
    case "abstract-class":
      return `export abstract class ${args.name} ${args.value}`
  }
}

export type Serializer = "JSON.stringify" | "String"
// TODO: support more serializations
// | "Blob"
// | "FormData"
// | "URLSearchParams"

export type RequestBodyAsParameter = {
  isSupported: boolean
  parameter: IRParameter
  contentType: string
  serializer: Serializer | undefined
}

function serializerForNormalizedContentType(contentType: string): Serializer {
  switch (contentType) {
    case "application/json":
    case "text/json":
    case "application/merge-patch+json":
      return "JSON.stringify"

    case "text/plain":
    case "text/x-markdown":
      return "String"

    // TODO: support more serializations
    // case "application/x-www-form-urlencoded":
    //   return "URLSearchParams"
    //
    // case "application/octet-stream":
    //   return "Blob"
    //
    // case "multipart/form-data":
    //   return "FormData"

    default: {
      throw new Error(`unsupported requestBody type '${contentType}'`)
    }
  }
}

export function filterBySupportedMediaTypes(
  object: Record<string, IRMediaType>,
  supportedMediaTypes: string[],
): {contentType: string; mediaType: IRMediaType; serializer: Serializer}[] {
  const normalized = Object.fromEntries(
    Object.entries(object).map(([key, value]) => {
      const contentType = key.split(/\s*[,;]\s*/)[0]

      if (!contentType) {
        throw new Error(`unspecified content type '${key}'`)
      }

      return [
        contentType,
        {
          normalizedContentType: contentType,
          fullContentType: key,
          mediaType: value,
        },
      ]
    }),
  )

  return supportedMediaTypes
    .map((supportedMediaType) => normalized[supportedMediaType])
    .filter(isDefined)
    .map((it) => ({
      contentType: it.fullContentType,
      mediaType: it.mediaType,
      serializer: serializerForNormalizedContentType(it.normalizedContentType),
    }))
}

export function firstByBySupportedMediaTypes(
  object: Record<string, IRMediaType>,
  supportedMediaTypes: string[],
):
  | {contentType: string; mediaType: IRMediaType; serializer: Serializer}
  | undefined {
  return filterBySupportedMediaTypes(object, supportedMediaTypes)[0]
}

export function requestBodyAsParameter(
  operation: IROperation,
  supportedMediaTypes = [
    "application/json",
    "application/scim+json",
    "application/merge-patch+json",
    "text/json",
    "text/plain",
    "text/x-markdown",
  ],
): RequestBodyAsParameter | undefined {
  const {requestBody} = operation

  if (!requestBody) {
    return undefined
  }

  // todo: support multiple media types properly. https://github.com/mnahkies/openapi-code-generator/issues/42
  const result = firstByBySupportedMediaTypes(
    requestBody.content,
    supportedMediaTypes,
  )

  if (result) {
    return {
      isSupported: true,
      contentType: result.contentType,
      parameter: {
        name: "requestBody",
        description: requestBody.description,
        in: "body",
        required: requestBody.required,
        schema: result.mediaType.schema,
        allowEmptyValue: false,
        deprecated: false,
      },
      serializer: result.serializer,
    }
  }

  logger.warn("no supported content-type on defined request body ", {
    requestBody,
  })

  const contentType = Object.keys(requestBody.content).sort().join(", ")

  if (!contentType) {
    return undefined
  }

  return {
    isSupported: false,
    contentType,
    parameter: {
      name: "requestBody",
      description: requestBody.description,
      in: "body",
      required: requestBody.required,
      schema: {type: "never", nullable: false, readOnly: false},
      allowEmptyValue: false,
      deprecated: false,
    },
    serializer: undefined,
  }
}

export function statusStringToType(status: string): string {
  if (/^\d+$/.test(status)) {
    return status
  }
  if (/^\d[xX]{2}$/.test(status)) {
    return `StatusCode${status[0]}xx`
  }
  if (status === "default") {
    return "StatusCode"
  }

  throw new Error(`unexpected status string '${status}'`)
}

export function ifElseIfBuilder(
  parts: ({condition?: string; body: string} | undefined)[],
) {
  const result = []

  const definedParts = parts
    .filter(isDefined)
    .sort((a, b) => (a.condition && !b.condition ? -1 : 1))

  for (const {condition, body} of definedParts) {
    if (result.length === 0 && condition) {
      result.push(`if(${condition}) { ${body} }`)
    } else if (condition) {
      result.push(`else if(${condition}) { ${body} }`)
    } else if (result.length > 0) {
      result.push(`else { ${body} }`)
    } else {
      result.push(body)
    }
  }

  return result.join("\n")
}

// todo: do we need to quote names sometimes here?
function params(
  parameters: (MethodParameterDefinition | undefined)[],
  quoteNames = false,
): string {
  return parameters
    .filter(isDefined)
    .map((param) => {
      const name = quoteNames ? `"${param.name}"` : param.name
      return `${name}${param.required === false ? "?" : ""}: ${param.type} ${
        param.default ? `= ${param.default}` : ""
      }`
    })
    .join(",")
}
