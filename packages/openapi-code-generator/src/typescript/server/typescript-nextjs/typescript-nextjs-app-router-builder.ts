import {
  type SourceFile,
  StructureKind,
  SyntaxKind,
  VariableDeclarationKind,
} from "ts-morph"
import type {IROperation} from "../../../core/openapi-types-normalized"
import {type HttpMethod, isDefined, isHttpMethod} from "../../../core/utils"
import {CompilationUnit, type ICompilable} from "../../common/compilation-units"
import type {ImportBuilder} from "../../common/import-builder"
import {requestBodyAsParameter} from "../../common/typescript-common"

export class TypescriptNextjsAppRouterBuilder implements ICompilable {
  constructor(
    public readonly filename: string,
    private readonly imports: ImportBuilder,
    private readonly companionFilename: string,
    private readonly sourceFile: SourceFile,
  ) {}

  private readonly httpMethodsUsed = new Set<HttpMethod>()

  add(operation: IROperation): void {
    const sourceFile = this.sourceFile

    const hasPathParam =
      operation.parameters.filter((it) => it.in === "path").length > 0
    const hasQueryParam =
      operation.parameters.filter((it) => it.in === "query").length > 0
    const hasBodyParam = Boolean(
      requestBodyAsParameter(operation).requestBodyParameter,
    )

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

    innerFunction?.addParameter({
      name: `{${[
        hasPathParam ? "params" : undefined,
        hasQueryParam ? "query" : undefined,
        hasBodyParam ? "body" : undefined,
      ]
        .filter(isDefined)
        .join(",")}}`,
    })

    innerFunction?.addParameter({name: "respond"})
    innerFunction?.addParameter({name: "context"})
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
      namedImports: Array.from(this.httpMethodsUsed).map((it) => `_${it}`),
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
