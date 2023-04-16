import _ from "lodash"
import {IROperation, IRParameter, MaybeIRModel} from "../../core/openapi-types-normalized"
import {isDefined} from "../../core/utils"
import {generationLib} from "../../core/generation-lib"
import {TypeBuilder} from "./type-builder"
import {combineParams, MethodParameterDefinition, requestBodyAsParameter, statusStringToType} from "./typescript-common"

export class ClientOperationBuilder {
  constructor(
    private readonly operation: IROperation,
    private readonly models: TypeBuilder,
  ) {
  }

  get operationId(): string {
    return this.operation.operationId
  }

  get route(): string {
    return this.operation.route
  }

  get method(): string {
    return this.operation.method
  }

  methodParameter(): MethodParameterDefinition | undefined {
    const {parameters} = this.operation
    const {requestBodyParameter} = this.requestBodyAsParameter()

    return combineParams(
      [...parameters, requestBodyParameter]
        .filter(isDefined)
        .map(it => ({
          name: `${_.camelCase(it.name)}`,
          type: this.models.schemaObjectToType(it.schema),
          required: it.required,
        })),
    )
  }

  requestBodyAsParameter(): { requestBodyParameter?: IRParameter, requestBodyContentType?: string } {
    return requestBodyAsParameter(this.operation)
  }

  queryString(): string {
    const {parameters} = this.operation

    return parameters.filter(it => it.in === "query")
      .map(it => "'" + it.name + "': " + this.paramName(it.name))
      .join(",\n")
  }

  headers(): string {
    const {parameters} = this.operation

    const paramHeaders = parameters.filter(it => it.in === "header")
      .map(it => `'${it.name}': ${this.paramName(it.name)}`)

    const hasAcceptHeader = this.hasHeader("Accept")

    const {requestBodyContentType} = this.requestBodyAsParameter()

    const result = [
      hasAcceptHeader ? undefined : "'Accept': 'application/json'",
      requestBodyContentType ? `'Content-Type': '${requestBodyContentType}'` : undefined,
    ]
      .concat(paramHeaders)
      .filter(isDefined)

    return result.length ? `{${result.join(",\n")}}` : ""
  }

  hasHeader(name: string): boolean {
    const {parameters} = this.operation

    return parameters
      .find(it => it.in === "header" && it.name.toLowerCase() === name.toLowerCase()) !== null
  }

  returnType(): { statusType: string, responseType: string }[] {
    const models = this.models

    return this.responsesToArray()
      .map(it => {
        return {
          statusType: statusStringToType(it.status),
          responseType: it.definition ? models.schemaObjectToType(it.definition) : "void"
        }
      })
  }

  paramName(name: string): string {
    return `p['${_.camelCase(name)}']`
  }

  private responsesToArray(): { status: string, definition: null | MaybeIRModel }[] {
    const {responses} = this.operation

    if (!responses) {
      return [{status: "number", definition: {$ref: generationLib.UnknownObject$Ref}}]
    }

    return Object.entries(responses)
      .map(([status, response]) => {

        const responseContent = Object.values(response?.content || {}).pop()

        if (!responseContent) {
          return {status, definition: null}
        }

        return {status, definition: responseContent.schema}
      })
  }

}
