import {
  type SourceFile,
  StructureKind,
  SyntaxKind,
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
import type {ServerSymbols} from "../abstract-router-builder"
import {ServerOperationBuilder} from "../server-operation-builder"

export class TypescriptNextjsAppRouterBuilder implements ICompilable {
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
    )

    const symbols = this.operationSymbols(builder.operationId)
    const params = builder.parameters(symbols)

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
          })`,
          },
        ],
      })

    // Replace the params based on what inputs we have
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const declarations = variableDeclaration.getDeclarations()[0]!
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const innerFunction = declarations
      .getInitializerIfKindOrThrow(SyntaxKind.CallExpression)
      .getArguments()[0]!
      .asKind(SyntaxKind.ArrowFunction)!

    // biome-ignore lint/complexity/noForEach: <explanation>
    innerFunction?.getParameters().forEach((parameter) => {
      parameter.remove()
    })

    if (params.hasParams) {
      innerFunction?.addParameter({
        name: `{${[
          params.path.schema ? "params" : undefined,
          params.query.schema ? "query" : undefined,
          params.body.schema ? "body" : undefined,
          params.header.schema ? "headers" : undefined,
        ]
          .filter(isDefined)
          .join(",")}}`,
      })
    }

    innerFunction?.addParameter({name: "respond"})
    innerFunction?.addParameter({name: "request"})
  }

  // TODO: duplication - should be shared with router builder
  protected operationSymbols(operationId: string): ServerSymbols {
    return {
      implPropName: operationId,
      implTypeName: titleCase(operationId),
      responderName: `${titleCase(operationId)}Responder`,
      paramSchema: `${operationId}ParamSchema`,
      querySchema: `${operationId}QuerySchema`,
      requestBodySchema: `${operationId}BodySchema`,
      requestHeaderSchema: `${operationId}HeaderSchema`,
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
    // biome-ignore lint/complexity/noForEach: <explanation>
    imports
      .filter((it) => it.getModuleSpecifierValue().includes(from))
      .forEach((it) => it.remove())

    this.sourceFile.addImportDeclaration({
      namedImports: Array.from(this.httpMethodsUsed)
        .map((it) => `_${it}`)
        .sort(),
      moduleSpecifier: from,
    })

    // Remove any methods that were removed from the spec
    // biome-ignore lint/complexity/noForEach: <explanation>
    this.sourceFile
      .getVariableDeclarations()
      .filter((it) => {
        const name = it.getName()
        return isHttpMethod(name) && !this.httpMethodsUsed.has(name)
      })
      .forEach((it) => it.remove())

    return new CompilationUnit(
      this.filename,
      this.imports,
      this.toString(),
      false,
    )
  }
}
