"use client"

import {LoadingSpinner} from "@/lib/loading-spinner"
import {sampleFilenames} from "@/lib/playground/consts"
import {ControlledSelect} from "@/lib/playground/controls/controlled-select"
import {loadRuntimeTypes} from "@/lib/playground/load-runtime-types"
import {createOrUpdateModel, listAvailableModels} from "@/lib/playground/utils"
import {
  createWorker,
  sendMessageToWorker,
  subscribeToWorkerMessages,
} from "@/lib/playground/worker/bridge"
import type {Monad, WorkerResult} from "@/lib/playground/worker/types"
import {zodResolver} from "@hookform/resolvers/zod"
import {Editor, type Monaco, useMonaco} from "@monaco-editor/react"
import {type Config, WebFsAdaptor} from "@nahkies/openapi-code-generator"
import type {editor} from "monaco-editor"
import type {AutoTypingsCore} from "monaco-editor-auto-typings/lib/AutoTypingsCore"
import {useMDXComponents} from "nextra-theme-docs"
import {Callout} from "nextra/components"
import type React from "react"
import type {PropsWithChildren} from "react"
import {useCallback, useEffect, useRef, useState} from "react"
import {useForm} from "react-hook-form"
import {z} from "zod"
import styles from "./playground.module.css"
import {ConfigForm} from "./playground/config-form"

type IStandaloneCodeEditor = editor.IStandaloneCodeEditor

const fetchSample = async (sample: string) => {
  try {
    const res = await fetch(`/samples/${sample}`)
    const text = await res.text()

    if (res.ok) {
      return text
    }

    return `Failed to load sample. ${text}`
  } catch (err) {
    return `Failed to load sample. ${err instanceof Error ? err.message : err}`
  }
}

const defaultConfig = {
  input: "/example.yaml",
  output: "/generated",
  template: "typescript-fetch",
  inputType: "openapi3",
  schemaBuilder: "zod",
  enableRuntimeResponseValidation: true,
  extractInlineSchemas: true,
  allowUnusedImports: false,
  groupingStrategy: "first-tag",
  tsAllowAny: false,
  tsCompilerOptions: {exactOptionalPropertyTypes: false},
  enableTypedBasePaths: true,
  filenameConvention: "kebab-case",
  tsServerImplementationMethod: "type",
  enumExtensibility: "",
} satisfies Config

const EditorFileSelectorWrapper: React.FC<PropsWithChildren> = ({children}) => {
  return (
    <div style={{display: "flex", gap: "0.5rem", margin: "0.5rem 0"}}>
      {children}
    </div>
  )
}

const EditorControls: React.FC<{editor?: IStandaloneCodeEditor}> = ({
  editor,
}) => {
  const onClickFoldAll = useCallback(() => {
    editor?.trigger("fold", "editor.foldAll", undefined)
  }, [editor])
  const onClickUnFoldAll = useCallback(() => {
    editor?.trigger("fold", "editor.unfoldAll", undefined)
  }, [editor])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginTop: "0.5rem",
        alignItems: "center",
      }}
    >
      <div style={{display: "flex", flexDirection: "row", gap: "1rem"}}>
        <button type={"button"} onClick={onClickFoldAll}>
          Fold All
        </button>
        <button type={"button"} onClick={onClickUnFoldAll}>
          Unfold All
        </button>
      </div>
    </div>
  )
}

const GenerationResult: React.FC<{result: Monad<WorkerResult> | null}> = ({
  result,
}) => {
  if (!result || result.loading) {
    return (
      <Callout type="info" emoji="✅">
        <p>
          <strong>Running generation</strong>
          <br />
          <LoadingSpinner />
        </p>
      </Callout>
    )
  }

  if (result.success) {
    const {elapsed} = result.result

    return (
      <Callout type="info" emoji="✅">
        <p>
          <strong>Generation success</strong>
          <br />
          Generation ran in {elapsed}ms
        </p>
      </Callout>
    )
  }

  if (!result.success) {
    const err = result.err
    const cause = result.err.cause

    return (
      <Callout type="warning" emoji="⚠️">
        <p>
          <strong>{err.message}</strong>
          <br />
          {cause instanceof Error ? `Details: ${cause.message}` : null}
        </p>
      </Callout>
    )
  }

  return null
}

const PlaygroundInner: React.FC<{
  monaco: Monaco
  webFsAdaptor: WebFsAdaptor
  defaultSample: {filename: string; content: string}
  samples: string[]
}> = ({monaco, webFsAdaptor, defaultSample, samples}) => {
  const Components = useMDXComponents()

  const workerRef = useRef<Worker | null>(null)
  const [config, setConfig] = useState<Config>(defaultConfig)
  const [result, setResult] = useState<Monad<WorkerResult> | null>(null)
  const [inputEditor, setInputEditor] = useState<IStandaloneCodeEditor>()
  const [outputEditor, setOutputEditor] = useState<IStandaloneCodeEditor>()
  const [availableModels, setAvailableModels] = useState<string[]>([])

  const inputModel = monaco.editor.getModel(monaco.Uri.file(config.input))

  //region config form
  const {control, watch} = useForm({
    resolver: zodResolver(
      z.object({
        input: z.string(),
        output: z.string().optional(),
      }),
    ),
    defaultValues: {
      input: defaultSample.filename,
      output: "",
    },
  })

  const inputFilename = watch("input")
  const outputFilename = watch("output")
  //endregion

  //region create worker
  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = createWorker()
    }

    subscribeToWorkerMessages(workerRef.current, async (data) => {
      if (data.success) {
        webFsAdaptor.clearFiles((it) => it.includes("/generated/"))

        for (const [key, value] of data.result.files) {
          await webFsAdaptor.writeFile(key, value)
          createOrUpdateModel({filename: key, value}, monaco)
        }
        // pruneModels(webFsAdaptor, monaco)
        setAvailableModels(listAvailableModels(webFsAdaptor, monaco))
      }
      setResult(data)
    })

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [webFsAdaptor, monaco])
  //endregion

  //region mount input/output editors
  const onMountInput = useCallback(
    (e: IStandaloneCodeEditor) => setInputEditor(e),
    [],
  )
  const onMountOutput = useCallback(
    (e: IStandaloneCodeEditor) => setOutputEditor(e),
    [],
  )

  useEffect(() => {
    if (!inputEditor) {
      return
    }

    const inputUri = monaco.Uri.file(config.input)
    if (!monaco.editor.getModel(inputUri)) {
      monaco.editor.createModel(defaultSample.content, "yaml", inputUri)

      sendMessageToWorker(workerRef.current, {
        type: "generate",
        config,
        input: defaultSample.content,
      })
    }

    const model = monaco.editor.getModel(inputUri)
    inputEditor.setModel(model)

    if (!model) {
      return
    }

    const listener = model.onDidChangeContent(() => {
      console.info("input changed")
      const value = model.getValue()

      if (value) {
        sendMessageToWorker(workerRef.current, {
          type: "generate",
          config,
          input: value,
        })
      }
    })

    return () => {
      listener.dispose()
    }
  }, [monaco, inputEditor, config, defaultSample])
  //endregion

  //region set input/output model
  useEffect(() => {
    const sample = samples.find((it) => it === inputFilename)

    if (!sample || !inputModel || inputModel.isDisposed()) {
      return
    }
    inputModel.setValue("Loading...")
    fetchSample(sample).then((content) => inputModel.setValue(content))
  }, [inputFilename, inputModel, samples])

  useEffect(() => {
    const outputModel =
      outputFilename && monaco.editor.getModel(monaco.Uri.file(outputFilename))

    if (!outputEditor || !outputModel || outputModel.isDisposed()) {
      return
    }

    if (outputEditor.getModel() !== outputModel) {
      outputEditor.setModel(outputModel)
    }
  }, [outputFilename, outputEditor, monaco])
  //endregion

  //region load typescript definitions
  useEffect(() => {
    if (!outputEditor) {
      return
    }

    let typings: AutoTypingsCore | undefined

    loadRuntimeTypes(monaco, outputEditor, config.template)
      .then((it) => {
        typings = it
      })
      .catch((err) => {
        setResult({
          success: false,
          loading: false,
          err: new Error("Failed to load typescript typings", {cause: err}),
        })
      })

    return () => typings?.dispose()
  }, [config.template, monaco, outputEditor])
  //endregion

  //region run generation
  useEffect(() => {
    const input = inputModel?.getValue()
    if (input) {
      sendMessageToWorker(workerRef.current, {
        type: "generate",
        config,
        input,
      })
    }
  }, [config, inputModel])
  //endregion

  return (
    <>
      <Components.h3>Configuration</Components.h3>
      <ConfigForm config={config} setConfig={setConfig} />
      {/*TODO: output a copy-paste-able CLI command*/}
      {/*<Components.code>*/}
      {/*  yarn openapi-code-generator --template typescript-koa*/}
      {/*</Components.code>*/}
      <div className={styles.editorContainer}>
        <div>
          <Components.h3>Input Specification</Components.h3>
          <EditorFileSelectorWrapper>
            <ControlledSelect
              label={"Sample Specification"}
              values={samples}
              name={"input"}
              control={control}
            />
          </EditorFileSelectorWrapper>
          <Editor
            height="30vh"
            onMount={onMountInput}
            options={{theme: "vs-dark", minimap: {enabled: false}}}
          />
          <EditorControls editor={inputEditor} />
          <GenerationResult result={result} />
        </div>
        <div>
          <Components.h3>Output</Components.h3>
          <EditorFileSelectorWrapper>
            <ControlledSelect
              label={"Output File"}
              values={availableModels ?? [""]}
              name={"output"}
              control={control}
            />
          </EditorFileSelectorWrapper>
          <Editor
            height="30vh"
            defaultLanguage="typescript"
            options={{
              theme: "vs-dark",
              minimap: {enabled: false},
              domReadOnly: true,
              readOnly: true,
            }}
            onMount={onMountOutput}
          />
          <EditorControls editor={outputEditor} />
        </div>
      </div>
    </>
  )
}

const PlaygroundWrapper: React.FC = () => {
  const monaco = useMonaco()
  const [webFsAdaptor] = useState(new WebFsAdaptor())

  const defaultSampleFilename = sampleFilenames[0]

  const [defaultSample, setDefaultSample] = useState<{
    filename: string
    content: string
  } | null>(null)

  useEffect(() => {
    fetchSample(defaultSampleFilename).then((content) =>
      setDefaultSample({filename: defaultSampleFilename, content: content}),
    )
  }, [defaultSampleFilename])

  if (!monaco || !defaultSample) {
    return null
  }

  return (
    <PlaygroundInner
      monaco={monaco}
      webFsAdaptor={webFsAdaptor}
      defaultSample={defaultSample}
      samples={sampleFilenames}
    />
  )
}

export default PlaygroundWrapper
