import {logger} from "../../core/logger"
import type {
  IROperation,
  IRParameter,
} from "../../core/openapi-types-normalized"
import {camelCase, isDefined} from "../../core/utils"

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

export function routeToTemplateString(route: string, paramName = "p"): string {
  const placeholder = /{([^{}]+)}/g

  return Array.from(route.matchAll(placeholder)).reduce((result, match) => {
    const wholeString = match[0]
    const placeholderName = match[1]

    if (!placeholderName) {
      throw new Error(
        `invalid route parameter placeholder in route '${placeholder}'`,
      )
    }

    return result.replace(
      wholeString,
      `\${${paramName}["${camelCase(placeholderName)}"]}`,
    )
  }, route)
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

export function requestBodyAsParameter(operation: IROperation): {
  requestBodyParameter?: IRParameter
  requestBodyContentType?: string
} {
  const {requestBody} = operation

  if (!requestBody) {
    return {}
  }

  // todo: https://github.com/mnahkies/openapi-code-generator/issues/42
  for (const [requestBodyContentType, definition] of Object.entries(
    requestBody.content,
  )) {
    return {
      requestBodyContentType,
      requestBodyParameter: {
        name: "requestBody",
        description: requestBody.description,
        in: "body",
        required: requestBody.required,
        schema: definition.schema,
        allowEmptyValue: false,
        deprecated: false,
      },
    }
  }

  logger.warn("no content on defined request body ", {requestBody})
  return {}
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
