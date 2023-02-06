import _ from "lodash"
import { isDefined } from "../../core/utils"
import {IROperation, IRParameter} from "../../core/openapi-types-normalized"
import {logger} from "../../core/logger"

export type MethodParameterDefinition = { name: string, type: string, required?: boolean }

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

export function combineParams(parameters: MethodParameterDefinition[], name = "p"): MethodParameterDefinition | undefined {
  if (!parameters.length) {
    return undefined
  }

  return {
    name,
    type: `{
    ${
      params(parameters)
    }
    }`,
  }
}

export function combineAndDestructureParams(parameters: MethodParameterDefinition[]): MethodParameterDefinition | undefined {
  if (!parameters.length) {
    return undefined
  }

  return {
    name: `{
    ${
      parameters.map(it => it.name)
        .join(",\n")
    }
    }`,
    type: `{
    ${
      params(parameters)
    }
    }`,
  }
}

export function routeToTemplateString(route: string, paramName = "p"): string {
  const placeholder = /{([^{}]+)}/g

  return Array.from(route.matchAll(placeholder))
    .reduce((result, match) => {
      return result.replace(match[0], "${" + paramName + '["' + _.camelCase(match[1]) + '"]}')
    }, route)
}

export function buildMethod({ name, parameters, returnType, overloads = [], body }: MethodDefinition): string {
  return `
  ${ overloads.map(it => `${ name }(${ params(it.parameters) }): ${ it.returnType };`).join("\n") }
  ${ name }(${ params(parameters) }): ${ returnType }
  {
    ${ body }
  }`
}

export function asyncMethod({ name, parameters, returnType, overloads = [], body }: MethodDefinition): string {
  return `
  ${ overloads.map(it => `async ${ name }(${ params(it.parameters) }): Promise<${ it.returnType }>;`).join("\n") }
  async ${ name }(${ params(parameters) }): Promise<${ returnType }>
  {
    ${ body }
  }`
}

export function requestBodyAsParameter(operation: IROperation): { requestBodyParameter?: IRParameter, requestBodyContentType?: string } {
  const {requestBody} = operation

  if (!requestBody) {
    return {}
  }

  // todo support multiple request body types
  for (const [requestBodyContentType, definition] of Object.entries(requestBody.content)) {
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

  logger.warn("no content on defined request body ", requestBody)
  return {}
}

export function ifElseIfBuilder(parts: ({ condition?: string, body: string } | undefined)[]) {
  const result = []

  const definedParts = parts.filter(isDefined).sort((a,b) => a.condition && !b.condition ? -1 : 1)

  for (const {condition, body} of definedParts) {
    if (result.length === 0 && condition) {
      result.push(`if(${ condition }) { ${ body } }`)
    } else if (condition) {
      result.push(`else if(${ condition }) { ${ body } }`)
    } else if(result.length > 0) {
      result.push(`else { ${ body } }`)
    } else {
      result.push(body)
    }
  }

  return result.join("\n")
}

// TODO do we need to quote names sometimes here?
function params(parameters: (MethodParameterDefinition | undefined)[], quoteNames = false): string {
  return parameters
    .filter(isDefined)
    .map((param) => {
      const name = quoteNames ? `"${ param.name }"` : param.name
      return `${ name }${ param.required === false ? "?" : "" }: ${ (param.type) }`
    })
    .join(",")
}
