import {
  type SourceFile,
  StructureKind,
  ts,
  VariableDeclarationKind,
} from "ts-morph"
import type {Input} from "../../../core/input"
import type {IROperation} from "../../../core/openapi-types-normalized"
import {
  type HttpMethod,
  isDefined,
  isHttpMethod,
  titleCase,
} from "../../../core/utils"
import {CompilationUnit, type ICompilable} from "../../common/compilation-units"
import type {ImportBuilder} from "../../common/import-builder"
import type {SchemaBuilder} from "../../common/schema-builders/schema-builder"
import type {TypeBuilder} from "../../common/type-builder"
import {
  ServerOperationBuilder,
  type ServerSymbols,
} from "../server-operation-builder"

import SyntaxKind = ts.SyntaxKind

export class TypescriptNextjsAppRouterBuilder implements ICompilable {
  protected readonly capabilities = {
    requestBody: {
      mediaTypes: [
        "application/json",
        "application/scim+json",
        "application/merge-patch+json",
        "application/x-www-form-urlencoded",
        "text/json",
        "text/plain",
        "text/x-markdown",
      ],
    },
  }

  constructor(
    private readonly filename: string,
    private readonly name: string,
    private readonly input: Input,
    private readonly imports: ImportBuilder,
    private readonly types: TypeBuilder,
    private readonly schemaBuilder: SchemaBuilder,
    private readonly companionFilename: string,
    private readonly sourceFile: SourceFile,
  ) {}

  private readonly httpMethodsUsed = new Set<HttpMethod>()

  add(operation: IROperation): void {
    const builder = new ServerOperationBuilder(
      operation,
      this.input,
      this.types,
      this.schemaBuilder,
      {
        requestBody: {
          supportedMediaTypes: this.capabilities.requestBody.mediaTypes,
        },
      },
    )

    const params = builder.parameters()

    const sourceFile = this.sourceFile

    const wrappingMethod = `_${operation.method.toUpperCase()}`

    this.httpMethodsUsed.add(operation.method)

    // Get the existing function, or create a new default one
    const variableDeclaration =
      sourceFile
        .getVariableDeclaration(operation.method.toUpperCase())
        ?.getVariableStatement() ||
      sourceFile.addVariableStatement({
        isExported: true,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: operation.method.toUpperCase(),
            kind: StructureKind.VariableDeclaration,
            initializer: `${wrappingMethod}(async (input, respond, context) => {
            // TODO: implementation
            return respond.withStatus(501).body({message: "not implemented"} as any)
          }, async (err) => {
            // TODO: implementation
            return new Response(JSON.stringify({message: "not implemented"}), {status: 501})
          })`,
          },
        ],
      })

    // Replace the params based on what inputs we have
    // biome-ignore lint/style/noNonNullAssertion: ignore
    const declarations = variableDeclaration.getDeclarations()[0]!
    const callExpression = declarations.getInitializerIfKindOrThrow(
      SyntaxKind.CallExpression,
    )

    // biome-ignore lint/style/noNonNullAssertion: ignore
    const implementationFunction = callExpression
      .getArguments()[0]!
      .asKind(SyntaxKind.ArrowFunction)!

    // biome-ignore lint/complexity/noForEach: ignore
    implementationFunction?.getParameters().forEach((parameter) => {
      parameter.remove()
    })

    if (params.hasParams) {
      implementationFunction?.addParameter({
        name: `{${[
          params.path.schema ? "params" : undefined,
          params.query.schema ? "query" : undefined,
          params.body.schema ? "body" : undefined,
          params.header.schema ? "headers" : undefined,
        ]
          .filter(isDefined)
          .join(",")}}`,
      })
    } else {
      implementationFunction?.addParameter({
        name: "_params",
      })
    }

    implementationFunction?.addParameter({name: "respond"})
    implementationFunction?.addParameter({name: "request"})

    const onErrorFunction = callExpression.getArguments()[1]

    if (!onErrorFunction) {
      callExpression.addArgument(`async (err) => {
            // TODO: implementation
            return new Response(JSON.stringify({message: "not implemented"}), {status: 501})
          }`)
    } else if (onErrorFunction.getKind() === SyntaxKind.ArrowFunction) {
      for (const param of onErrorFunction
        .asKind(SyntaxKind.ArrowFunction)
        ?.getParameters() ?? []) {
        param.remove()
      }

      onErrorFunction
        ?.asKind(SyntaxKind.ArrowFunction)
        ?.addParameter({name: "err"})
    } else if (onErrorFunction.getKind() === SyntaxKind.FunctionExpression) {
      // todo
    }
  }

  // TODO: duplication - should be shared with router builder
  protected operationSymbols(operationId: string): ServerSymbols {
    return {
      implPropName: operationId,
      implTypeName: titleCase(operationId),
      responderName: `${titleCase(operationId)}Responder`,
      responseBodyValidator: `${operationId}ResponseValidator`,
    }
  }

  toString(): string {
    return this.sourceFile.getFullText()
  }

  toCompilationUnit(): CompilationUnit {
    // Reconcile imports - attempt to find an existing one and replace it with correct one
    const imports = this.sourceFile.getImportDeclarations()
    const from = this.imports.normalizeFrom(
      `./${this.companionFilename}`,
      `./${this.filename}`,
    )
    // biome-ignore lint/complexity/noForEach: ignore
    imports
      .filter((it) => it.getModuleSpecifierValue().includes(from))
      .forEach((it) => {
        it.remove()
      })

    this.sourceFile.addImportDeclaration({
      namedImports: Array.from(this.httpMethodsUsed)
        .map((it) => `_${it}`)
        .sort(),
      moduleSpecifier: from,
    })

    // Remove any methods that were removed from the spec
    // biome-ignore lint/complexity/noForEach: ignore
    this.sourceFile
      .getVariableDeclarations()
      .filter((it) => {
        const name = it.getName()
        return isHttpMethod(name) && !this.httpMethodsUsed.has(name)
      })
      .forEach((it) => {
        it.remove()
      })

    return new CompilationUnit(
      this.filename,
      this.imports,
      this.toString(),
      false,
    )
  }
}
