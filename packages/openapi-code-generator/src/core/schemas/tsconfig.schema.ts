import {z} from "zod/v4"

export type TsConfig = z.infer<typeof tsconfigSchema>
export type TsCompilerOptions = TsConfig["compilerOptions"]

export const tsconfigSchema = z.object({
  extends: z.union([z.array(z.string()), z.string()]).optional(),
  compilerOptions: z
    .object({
      useDefineForClassFields: z.boolean(),
      resolvePackageJsonExports: z.boolean(),
      resolvePackageJsonImports: z.boolean(),
      importsNotUsedAsValues: z.string(),
      preserveConstEnums: z.boolean(),
      preserveValueImports: z.boolean(),
      allowSyntheticDefaultImports: z.boolean(),
      esModuleInterop: z.boolean(),
      forceConsistentCasingInFileNames: z.boolean(),
      strict: z.boolean(),
      noImplicitAny: z.boolean(),
      strictNullChecks: z.boolean(),
      strictFunctionTypes: z.boolean(),
      strictBindCallApply: z.boolean(),
      strictPropertyInitialization: z.boolean(),
      noImplicitThis: z.boolean(),
      useUnknownInCatchVariables: z.boolean(),
      alwaysStrict: z.boolean(),
      noUnusedLocals: z.boolean(),
      noUnusedParameters: z.boolean(),
      exactOptionalPropertyTypes: z.boolean(),
      noImplicitReturns: z.boolean(),
      noFallthroughCasesInSwitch: z.boolean(),
      noUncheckedIndexedAccess: z.boolean(),
      noImplicitOverride: z.boolean(),
      noPropertyAccessFromIndexSignature: z.boolean(),
      allowUnusedLabels: z.boolean(),
      allowUnreachableCode: z.boolean(),
    })
    .partial(),
})
