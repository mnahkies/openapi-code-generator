import {Editor, type Monaco, useMonaco} from "@monaco-editor/react"
import {
  type IFormatter,
  OpenapiValidator,
  TypescriptFormatterPrettier,
  TypespecLoader,
  WebFsAdaptor,
  generate,
} from "@nahkies/openapi-code-generator"
import type {editor} from "monaco-editor"
import {
  AutoTypings,
  LocalStorageCache,
} from "monaco-editor-auto-typings/custom-editor"
import type React from "react"
import {useCallback, useEffect, useState} from "react"

const useHost = ({
  specifications,
}: {specifications: {filename: string; content: string}[]}) => {
  const monaco = useMonaco()
  const [host] = useState(
    new WebFsAdaptor(
      specifications.reduce((acc, it) => {
        acc.set(it.filename, it.content)
        return acc
      }, new Map()),
    ),
  )
  const [formatter, setFormatter] = useState<IFormatter>()
  const [openapiValidator, setOpenapiValidator] = useState<OpenapiValidator>()
  const [typespecLoader, setTypespecLoader] = useState<TypespecLoader>()
  const [selectedModel, setSelectedModel] = useState<string>()
  const [availableModels, setAvailableModels] = useState<string[]>([])

  useEffect(() => {
    if (!monaco) {
      return
    }

    TypescriptFormatterPrettier.create().then(setFormatter)
    OpenapiValidator.create().then(setOpenapiValidator)
    TypespecLoader.create().then(setTypespecLoader)
  }, [monaco])

  const onFileChanged = useCallback(
    ({filename, value}: {filename: string; value: string}) => {
      if (!monaco) {
        console.warn(`ignoring change for ${filename}`)
        return
      }

      console.info(`handling change for ${filename}`, {
        models: monaco.editor.getModels(),
        selectedModel,
      })

      const uri = monaco.Uri.file(filename)
      const language = filename.endsWith(".ts") ? "typescript" : "yaml"

      if (!monaco.editor.getModel(uri)) {
        monaco.editor.createModel(value, language, uri)
      } else {
        monaco.editor.getModel(uri)?.setValue(value)
      }

      setAvailableModels(
        monaco.editor
          .getModels()
          .filter((it) => it.uri.path.includes("/generated/"))
          .map((it) => it.uri.path),
      )
    },
    [monaco, selectedModel],
  )

  useEffect(() => {
    host.onFileChanged(onFileChanged)
    return () => host.offFileChanged(onFileChanged)
  }, [host, onFileChanged])

  useEffect(() => {
    if (!monaco || !formatter) {
      return
    }

    console.info("init /example.yaml")
    host.writeFile("/example.yaml", specifications[0].content)
  }, [monaco, formatter, host, specifications])

  return {
    formatter,
    openapiValidator,
    typespecLoader,
    host,
    selectedModel: selectedModel || availableModels[0],
    setSelectedModel,
    availableModels,
  }
}

/**
 * Hack: the monaco-editor-auto-typings/custom-editor package doesn't handle the "exports" field in package.json
 * files correctly, and annoyingly even if modified to handle this, the typescript language service doesn't seem
 * to like it. Let's manually fetch these and map to locations the service will understand.
 * @param monaco
 * @param template
 */
const loadRuntimeTypes = async (
  monaco: Monaco,
  template: "typescript-fetch" | "typescript-axios" | "typescript-koa",
) => {
  const files = {
    "typescript-fetch": [
      {
        uri: "https://unpkg.com/@nahkies/typescript-fetch-runtime@latest/package.json",
        path: "/node_modules/@nahkies/typescript-fetch-runtime/package.json",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-fetch-runtime@latest/dist/main.d.ts",
        path: "/node_modules/@nahkies/typescript-fetch-runtime/main.d.ts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-fetch-runtime@latest/dist/zod.d.ts",
        path: "/node_modules/@nahkies/typescript-fetch-runtime/zod.d.ts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-fetch-runtime@latest/dist/joi.d.ts",
        path: "/node_modules/@nahkies/typescript-fetch-runtime/joi.d.ts",
      },
    ],
    "typescript-axios": [
      {
        uri: "https://unpkg.com/@nahkies/typescript-axios-runtime@latest/package.json",
        path: "/node_modules/@nahkies/typescript-axios-runtime/package.json",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-axios-runtime@latest/dist/main.d.ts",
        path: "/node_modules/@nahkies/typescript-axios-runtime/main.d.ts",
      },
    ],
    "typescript-koa": [
      {
        uri: "https://unpkg.com/@nahkies/typescript-koa-runtime@latest/package.json",
        path: "/node_modules/@nahkies/typescript-koa-runtime/package.json",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-koa-runtime@latest/dist/server.d.ts",
        path: "/node_modules/@nahkies/typescript-koa-runtime/server.d.ts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-koa-runtime@latest/dist/errors.d.ts",
        path: "/node_modules/@nahkies/typescript-koa-runtime/errors.d.ts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-koa-runtime@latest/dist/zod.d.ts",
        path: "/node_modules/@nahkies/typescript-koa-runtime/zod.d.ts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-koa-runtime@latest/dist/joi.d.ts",
        path: "/node_modules/@nahkies/typescript-koa-runtime/joi.d.ts",
      },
    ],
  }

  for (const file of files[template]) {
    const source = await (await fetch(file.uri)).text()
    const uri = monaco.Uri.file(file.path)
    if (!monaco.editor.getModel(uri)) {
      console.info(`[MICHAEL] createModel for ${uri.path}`)
      monaco.editor.createModel(source, "typescript", uri)
      // monaco.languages.typescript.typescriptDefaults.addExtraLib(await source.text(), file.path)
    }
  }
}

const Playground: React.FC<{
  specifications: {filename: string; content: string}[]
}> = ({specifications}) => {
  const {
    formatter,
    openapiValidator,
    typespecLoader,
    host,
    selectedModel,
    availableModels,
    setSelectedModel,
  } = useHost({specifications})
  const [input, setInput] = useState<string>()
  const [monaco, setMonaco] = useState<Monaco>()

  const [inputEditor, setInputEditor] = useState<editor.IStandaloneCodeEditor>()
  const [outputEditor, setOutputEditor] =
    useState<editor.IStandaloneCodeEditor>()

  const onMountInput = useCallback((editor: editor.IStandaloneCodeEditor) => {
    setInputEditor(editor)
  }, [])

  const inputModel = monaco?.editor.getModel(monaco.Uri.file("/example.yaml"))

  useEffect(() => {
    if (!inputModel || !inputEditor) {
      return
    }
    console.info("mounting input", {inputModel})
    inputEditor.setModel(inputModel)
    inputModel.onDidChangeContent((e) => {
      console.info("input changed", e)
      setInput(inputModel?.getValue())
    })
    setInput(inputModel.getValue())
  }, [inputEditor, inputModel])

  const onMountOutput = useCallback(
    (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
      const fileRootPath = "file:///"
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
        // biome-ignore lint/suspicious/noExplicitAny: https://github.com/microsoft/monaco-editor/pull/4545
        moduleResolution: 100 as any, //monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        target: monaco.languages.typescript.ScriptTarget.ES2020,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        rootDir: fileRootPath,
      })
      loadRuntimeTypes(monaco, "typescript-fetch")
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      AutoTypings.create(editor, {
        monaco,
        fileRootPath,
        sourceCache: new LocalStorageCache(),
        onUpdate: (update) => console.log("progress", update),
        onError: (error) => console.error(error),
        dontAdaptEditorOptions: true,
      })

      setOutputEditor(editor)
      setMonaco(monaco)
    },
    [],
  )

  /**
   * Run generation
   */
  useEffect(() => {
    if (!formatter || !openapiValidator || !typespecLoader || !input) {
      return
    }
    console.info("run generation")

    generate(
      {
        input: "/example.yaml",
        output: "/generated",
        template: "typescript-fetch",
        inputType: "openapi3",
        schemaBuilder: "zod",
        enableRuntimeResponseValidation: true,
        extractInlineSchemas: true,
        allowUnusedImports: false,
        groupingStrategy: "none",
        tsAllowAny: false,
        tsCompilerOptions: {exactOptionalPropertyTypes: false},
      },
      host,
      formatter,
      openapiValidator,
      typespecLoader,
    ).then(() => {
      if (!selectedModel) {
        return
      }
      const model = monaco?.editor.getModel(monaco.Uri.file(selectedModel))

      console.info("set output model", {
        model,
        models: monaco?.editor.getModels(),
        outputEditor,
      })
      if (!outputEditor || !model) {
        return
      }
      outputEditor.setModel(model)
    })
    // )
  }, [
    input,
    openapiValidator,
    typespecLoader,
    host,
    formatter,
    monaco?.Uri,
    monaco?.editor,
    outputEditor,
    selectedModel,
  ])

  /**
   * Update the output model
   */
  useEffect(() => {
    if (!selectedModel) {
      return
    }

    const model = monaco?.editor.getModel(monaco.Uri.file(selectedModel))

    console.info("set output model", {
      model,
      models: monaco?.editor.getModels(),
      outputEditor,
    })
    if (!outputEditor || !model) {
      return
    }
    outputEditor.setModel(model)
  }, [outputEditor, selectedModel, monaco])

  return (
    <>
      <Editor height="30vh" onMount={onMountInput} />

      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
      >
        {availableModels.map((it) => (
          <option key={it} value={it}>
            {it}
          </option>
        ))}
      </select>

      <Editor
        height="30vh"
        defaultLanguage="typescript"
        onMount={onMountOutput}
      />
    </>
  )
}

export default Playground
