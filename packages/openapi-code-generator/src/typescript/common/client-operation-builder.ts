import _ from "lodash"
import { IROperation, IRParameter, MaybeIRModel } from "../../core/openapi-types-normalized"
import { isDefined } from "../../core/utils"
import { generationLib } from "../../core/generation-lib"
import { logger } from "../../core/logger"
import { ModelBuilder } from "./model-builder"
import { combineParams, MethodParameterDefinition } from "./typescript-common"

export class ClientOperationBuilder {
  constructor(
    private readonly operation: IROperation,
    private readonly models: ModelBuilder,
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
    const { parameters } = this.operation
    const { requestBodyParameter } = this.requestBodyAsParameter()

    return combineParams(
      [...parameters, requestBodyParameter]
        .filter(isDefined)
        .map(it => ({
          name: `${ _.camelCase(it.name) }`,
          type: this.models.schemaObjectToType(it.schema),
          required: it.required,
        })),
    )
  }

  requestBodyAsParameter(): { requestBodyParameter?: IRParameter, requestBodyContentType?: string } {
    const { requestBody } = this.operation

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

  queryString(): string {
    const { parameters } = this.operation

    return parameters.filter(it => it.in === "query")
      .map(it => "'" + it.name + "': " + this.paramName(it.name))
      .join(",\n")
  }

  headers(): string {
    const { parameters } = this.operation

    return parameters.filter(it => it.in === "header")
      .map(it => `'${ it.name }': ${ this.paramName(it.name) }`)
      .join(",\n")
  }

  hasHeader(name: string): boolean {
    const { parameters } = this.operation

    return parameters
      .find(it => it.in === "header" && it.name.toLowerCase() === name.toLowerCase()) !== null
  }

  returnType(): {statusType: string, responseType: string}[] {
    const models = this.models

    return this.responsesToArray()
      .map(it => {
        // Note: status can be a number, or "default", "5XX", etc
        //       and we can't represent 5XX easily as a specific type
        const statusType = /^\d+$/.test(it.status) ? it.status : "number"
        const responseType = it.definition ? models.schemaObjectToType(it.definition) : "void"
        return {statusType, responseType}
      })
  }

  paramName(name: string): string {
    return `p['${ _.camelCase(name) }']`
  }

  private responsesToArray(): { status: string, definition: null | MaybeIRModel }[] {
    const { responses } = this.operation

    if (!responses) {
      return [{ status: "number", definition: { $ref: generationLib.UnknownObject$Ref } }]
    }

    return Object.entries(responses)
      .map(([status, response]) => {

        const responseContent = Object.values(response?.content || {}).pop()

        if (!responseContent) {
          return { status, definition: null }
        }

        return { status, definition: responseContent.schema }
      })
  }

}
