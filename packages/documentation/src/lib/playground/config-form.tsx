import {zodResolver} from "@hookform/resolvers/zod"
import {type Config, configSchema} from "@nahkies/openapi-code-generator"
import type React from "react"
import {useEffect} from "react"
import {useForm} from "react-hook-form"
import type {z} from "zod/v4"
import {ControlledCheckbox} from "@/lib/playground/controls/controlled-checkbox"
import {ControlledSelect} from "@/lib/playground/controls/controlled-select"
import styles from "./config-form.module.css"

const schema = configSchema.pick({
  template: true,
  schemaBuilder: true,
  enableRuntimeResponseValidation: true,
  enableTypedBasePaths: true,
  extractInlineSchemas: true,
  groupingStrategy: true,
  tsAllowAny: true,
  tsServerImplementationMethod: true,
  enumExtensibility: true,
})

type Inputs = z.infer<typeof schema>

export const ConfigForm: React.FC<{
  config: Config
  setConfig: (config: Config) => void
}> = ({config, setConfig}) => {
  const {control, watch} = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      template: config.template,
      schemaBuilder: config.schemaBuilder,
      enableRuntimeResponseValidation: config.enableRuntimeResponseValidation,
      enableTypedBasePaths: config.enableTypedBasePaths,
      extractInlineSchemas: config.extractInlineSchemas,
      groupingStrategy: config.groupingStrategy,
      tsAllowAny: config.tsAllowAny,
      tsServerImplementationMethod: config.tsServerImplementationMethod,
      enumExtensibility: config.enumExtensibility,
    } as const,
  })

  useEffect(() => {
    const {unsubscribe} = watch((value) => {
      setConfig({...config, ...value})
    })
    return () => unsubscribe()
  }, [watch, config, setConfig])

  return (
    <div className={styles.container}>
      <ControlledSelect
        key={"template"}
        name={"template"}
        control={control}
        label={"--template"}
        values={schema.shape.template.options}
      />
      <ControlledSelect
        name={"schemaBuilder"}
        control={control}
        label={"--schema-builder"}
        values={schema.shape.schemaBuilder.options}
      />
      <ControlledCheckbox
        label={"--enable-runtime-response-validation"}
        name={"enableRuntimeResponseValidation"}
        control={control}
      />
      <ControlledCheckbox
        label={"--enable-typed-base-paths"}
        name={"enableTypedBasePaths"}
        control={control}
      />
      <ControlledCheckbox
        label={"--extract-inline-schemas"}
        name={"extractInlineSchemas"}
        control={control}
      />
      <ControlledCheckbox
        label={"--ts-allow-any"}
        name={"tsAllowAny"}
        control={control}
      />
      <ControlledSelect
        name={"tsServerImplementationMethod"}
        control={control}
        label={"--ts-server-implementation-method"}
        values={schema.shape.tsServerImplementationMethod.options}
      />
      <ControlledSelect
        name={"groupingStrategy"}
        control={control}
        label={"--grouping-strategy"}
        values={schema.shape.groupingStrategy.options}
      />
      <ControlledSelect
        name={"enumExtensibility"}
        control={control}
        label={"--enum-extensibility"}
        values={schema.shape.enumExtensibility.options}
      />
    </div>
  )
}
