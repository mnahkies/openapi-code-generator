import _ from "lodash"
import { isDefined } from "../../core/utils"

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
