import type {OpenapiLoader} from "../openapi-loader"
import type {
  Parameter,
  Reference,
  Schema,
  SchemaObject,
  Style,
} from "../openapi-types"
import type {
  IROperationParameters,
  IRParameter,
  IRParameterBase,
  IRParameterCookie,
  IRParameterHeader,
  IRParameterPath,
  IRParameterQuery,
} from "../openapi-types-normalized"
import type {SyntheticNameGenerator} from "../synthetic-name-generator"
import {lowerFirst} from "../utils"
import type {SchemaNormalizer} from "./schema-normalizer"

export class ParameterNormalizer {
  constructor(
    private readonly loader: OpenapiLoader,
    private readonly schemaNormalizer: SchemaNormalizer,
    private readonly syntheticNameGenerator: SyntheticNameGenerator,
  ) {}

  public normalizeParameters(
    operationId: string,
    parameters: (Parameter | Reference)[] = [],
  ): IROperationParameters {
    const allParameters = parameters.map((it) => this.loader.parameter(it))

    const pathParameters = allParameters.filter((it) => it.in === "path")
    const queryParameters = allParameters.filter((it) => it.in === "query")
    const headerParameters = allParameters.filter((it) => it.in === "header")

    const normalizedParameters = allParameters.map((it) =>
      this.normalizeParameter(it),
    )

    return {
      all: normalizedParameters,
      path: {
        name: lowerFirst(
          this.syntheticNameGenerator.forPathParameters({operationId}),
        ),
        list: normalizedParameters.filter((it) => it.in === "path"),
        $ref: pathParameters.length
          ? this.loader.addVirtualType(
              operationId,
              this.syntheticNameGenerator.forPathParameters({operationId}),
              this.reduceParametersToOpenApiSchema(pathParameters),
            )
          : undefined,
      },
      query: {
        name: lowerFirst(
          this.syntheticNameGenerator.forQueryParameters({operationId}),
        ),
        list: normalizedParameters.filter((it) => it.in === "query"),
        $ref: queryParameters.length
          ? this.loader.addVirtualType(
              operationId,
              this.syntheticNameGenerator.forQueryParameters({operationId}),
              this.reduceParametersToOpenApiSchema(queryParameters),
            )
          : undefined,
      },
      header: {
        name: lowerFirst(
          this.syntheticNameGenerator.forRequestHeaders({operationId}),
        ),
        list: normalizedParameters.filter((it) => it.in === "header"),
        $ref: headerParameters.length
          ? this.loader.addVirtualType(
              operationId,
              this.syntheticNameGenerator.forRequestHeaders({operationId}),
              this.reduceParametersToOpenApiSchema(
                headerParameters.map((it) => ({
                  ...it,
                  name: it.name.toLowerCase(),
                })),
              ),
            )
          : undefined,
      },
    }
  }

  private reduceParametersToOpenApiSchema(
    parameters: Parameter[],
  ): SchemaObject {
    const properties: Record<string, Schema | Reference> = {}
    const required: string[] = []

    for (const parameter of parameters) {
      const schema = parameter.schema

      const dereferenced = this.loader.schema(schema)

      /**
       * HACK: With exploded array query parameters, you can't tell between an
       * array with one element and plain parameter without runtime schema information.
       * If it's supposed to be an array, and it's a scalar, coerce to an array.
       *
       * When better support for explode / style lands, we might be able to remove this.
       */
      if (parameter.in === "query" && dereferenced.type === "array") {
        schema["x-internal-preprocess"] = {
          deserialize: {
            fn: "(it: unknown) => Array.isArray(it) || it === undefined ? it : [it]",
          },
        }
      }

      properties[parameter.name] = schema

      if (parameter.required) {
        required.push(parameter.name)
      }
    }

    return {
      type: "object",
      properties,
      required,
      additionalProperties: false,
      nullable: false,
    }
  }

  public normalizeParameter(it: Parameter): IRParameter {
    const base = {
      name: it.name,
      schema: this.schemaNormalizer.normalize(it.schema),
      description: it.description,
      required: it.required ?? false,
      deprecated: it.deprecated ?? false,
    } satisfies Omit<IRParameterBase, "explode">

    function throwUnsupportedStyle(style: Style): never {
      throw new Error(
        `unsupported parameter style: '${style}' for in: '${it.in}'`,
      )
    }

    switch (it.in) {
      case "path": {
        const style = it.style ?? "simple"
        const explode = this.explodeForParameter(it, style)

        if (!this.isStyleForPathParameter(style)) {
          throwUnsupportedStyle(style)
        }

        return {
          ...base,
          in: "path",
          required: true,
          style,
          explode,
        } satisfies IRParameterPath
      }

      case "query": {
        const style = it.style ?? "form"
        const explode = this.explodeForParameter(it, style)

        if (!this.isStyleForQueryParameter(style)) {
          throwUnsupportedStyle(style)
        }

        return {
          ...base,
          in: "query",
          style,
          explode,
          allowEmptyValue: it.allowEmptyValue ?? false,
        } satisfies IRParameterQuery
      }

      case "header": {
        const style = it.style ?? "simple"
        const explode = this.explodeForParameter(it, style)

        if (!this.isStyleForHeaderParameter(style)) {
          throwUnsupportedStyle(style)
        }

        return {
          ...base,
          in: "header",
          style,
          explode,
        } satisfies IRParameterHeader
      }

      case "cookie": {
        const style = it.style ?? "form"
        const explode = this.explodeForParameter(it, style)

        if (!this.isStyleForCookieParameter(style)) {
          throwUnsupportedStyle(style)
        }

        return {
          ...base,
          in: "cookie",
          style,
          explode,
        } satisfies IRParameterCookie
      }

      default: {
        throw new Error(
          `unsupported parameter location: '${it.in satisfies never}'`,
        )
      }
    }
  }

  private isStyleForPathParameter(
    style: Style,
  ): style is IRParameterPath["style"] {
    return ["simple", "label", "matrix"].includes(style)
  }

  private isStyleForQueryParameter(
    style: Style,
  ): style is IRParameterQuery["style"] {
    return ["form", "spaceDelimited", "pipeDelimited", "deepObject"].includes(
      style,
    )
  }

  private isStyleForHeaderParameter(
    style: Style,
  ): style is IRParameterHeader["style"] {
    return ["simple"].includes(style)
  }

  private isStyleForCookieParameter(
    style: Style,
  ): style is IRParameterCookie["style"] {
    if (style === "cookie") {
      // todo: openapi v3.2.0
      throw new Error("support for style: cookie not implemented.")
    }

    return ["form"].includes(style)
  }

  private explodeForParameter(parameter: Parameter, style: Style): boolean {
    if (typeof parameter.explode === "boolean") {
      return parameter.explode
    }

    /**
     * "When style is "form" or "cookie", the default value is true. For all other styles, the default value is false."
     * ref: {@link https://spec.openapis.org/oas/v3.2.0.html#parameter-explode}
     */
    if (style === "form" || style === "cookie") {
      return true
    }

    return false
  }
}
