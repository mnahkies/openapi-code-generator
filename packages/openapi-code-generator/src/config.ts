import {z} from "zod/v4"
import type {GenericLoaderRequestHeaders} from "./core/loaders/generic.loader"
import type {CompilerOptions} from "./core/loaders/tsconfig.loader"
import {tsconfigSchema} from "./core/schemas/tsconfig.schema"
import type {IdentifierConvention} from "./core/utils"
import {templateNames} from "./templates"
import type {ServerImplementationMethod} from "./templates.types"

export type Config = {
  input: string
  inputType: "openapi3" | "typespec"
  overrideSpecificationTitle?: string | undefined
  output: string
  template:
    | "typescript-fetch"
    | "typescript-axios"
    | "typescript-angular"
    | "typescript-koa"
    | "typescript-express"
  schemaBuilder: "zod-v3" | "zod-v4" | "joi"
  enableRuntimeResponseValidation: boolean
  enableTypedBasePaths: boolean
  extractInlineSchemas: boolean
  allowUnusedImports: boolean
  groupingStrategy: "none" | "first-slug" | "first-tag"
  filenameConvention: IdentifierConvention
  enumExtensibility: "" | "open" | "closed"
  tsAllowAny: boolean
  tsServerImplementationMethod: ServerImplementationMethod
  tsCompilerOptions: CompilerOptions
  remoteSpecRequestHeaders?: GenericLoaderRequestHeaders | undefined
}

const templatesSchema = z.enum(templateNames)

const schemaBuilderSchema = z.enum(["zod-v3", "zod-v4", "joi"])

const groupingStrategySchema = z.enum(["none", "first-slug", "first-tag"])

const tsServerImplementationSchema = z.enum([
  "interface",
  "type",
  "abstract-class",
])

export const configSchema = z.object({
  input: z.string(),
  inputType: z.enum(["openapi3", "typespec"]),
  overrideSpecificationTitle: z.string().optional(),
  output: z.string(),
  template: templatesSchema,
  schemaBuilder: schemaBuilderSchema,
  enableRuntimeResponseValidation: z.boolean(),
  enableTypedBasePaths: z.boolean(),
  extractInlineSchemas: z.boolean(),
  allowUnusedImports: z.boolean(),
  groupingStrategy: groupingStrategySchema,
  filenameConvention: z.enum([
    "camel-case",
    "title-case",
    "kebab-case",
    "snake-case",
  ]),
  enumExtensibility: z.enum(["", "open", "closed"]),
  tsAllowAny: z.boolean(),
  tsServerImplementationMethod: tsServerImplementationSchema,
  tsCompilerOptions: tsconfigSchema.shape.compilerOptions,
  remoteSpecRequestHeaders: z
    .record(
      z.string(),
      z.array(z.object({name: z.string(), value: z.string()})),
    )
    .optional(),
})
