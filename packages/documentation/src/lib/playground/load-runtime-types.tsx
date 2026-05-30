import type {Monaco} from "@monaco-editor/react"
import type {editor} from "monaco-editor"
import {
  AutoTypings,
  LocalStorageCache,
} from "monaco-editor-auto-typings/custom-editor"

type IStandaloneCodeEditor = editor.IStandaloneCodeEditor

/**
 * Hack: the monaco-editor-auto-typings/custom-editor package doesn't handle the "exports" field in package.json
 * files correctly, and annoyingly even if modified to handle this, the typescript language service doesn't seem
 * to like it. Let's manually fetch these and map to locations the service will understand.
 */
export const loadRuntimeTypes = async (
  monaco: Monaco,
  editor: IStandaloneCodeEditor,
  template:
    | "typescript-angular"
    | "typescript-fetch"
    | "typescript-axios"
    | "typescript-koa"
    | "typescript-express",
) => {
  const fileRootPath = "file:///"

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    rootDir: fileRootPath,
  })

  const files = {
    "typescript-angular": [],
    "typescript-fetch": [
      {
        uri: "https://unpkg.com/@nahkies/typescript-fetch-runtime@latest/package.json",
        path: "/node_modules/@nahkies/typescript-fetch-runtime/package.json",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-fetch-runtime@latest/dist/esm/main.d.mts",
        path: "/node_modules/@nahkies/typescript-fetch-runtime/main.d.mts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-fetch-runtime@latest/dist/esm/zod-v3.d.mts",
        path: "/node_modules/@nahkies/typescript-fetch-runtime/zod-v3.d.mts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-fetch-runtime@latest/dist/esm/zod-v4.d.mts",
        path: "/node_modules/@nahkies/typescript-fetch-runtime/zod-v4.d.mts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-fetch-runtime@latest/dist/esm/joi.d.mts",
        path: "/node_modules/@nahkies/typescript-fetch-runtime/joi.d.mts",
      },
    ],
    "typescript-axios": [
      {
        uri: "https://unpkg.com/@nahkies/typescript-axios-runtime@latest/package.json",
        path: "/node_modules/@nahkies/typescript-axios-runtime/package.json",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-axios-runtime@latest/dist/esm/main.d.mts",
        path: "/node_modules/@nahkies/typescript-axios-runtime/main.d.mts",
      },
    ],
    "typescript-koa": [
      {
        uri: "https://unpkg.com/@nahkies/typescript-koa-runtime@latest/package.json",
        path: "/node_modules/@nahkies/typescript-koa-runtime/package.json",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-koa-runtime@latest/dist/esm/server.d.mts",
        path: "/node_modules/@nahkies/typescript-koa-runtime/server.d.mts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-koa-runtime@latest/dist/esm/errors.d.mts",
        path: "/node_modules/@nahkies/typescript-koa-runtime/errors.d.mts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-koa-runtime@latest/dist/esm/zod-v3.d.mts",
        path: "/node_modules/@nahkies/typescript-koa-runtime/zod-v3.d.mts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-koa-runtime@latest/dist/esm/zod-v4.d.mts",
        path: "/node_modules/@nahkies/typescript-koa-runtime/zod-v4.d.mts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-koa-runtime@latest/dist/esm/joi.d.mts",
        path: "/node_modules/@nahkies/typescript-koa-runtime/joi.d.mts",
      },
    ],
    "typescript-express": [
      {
        uri: "https://unpkg.com/@nahkies/typescript-express-runtime@latest/package.json",
        path: "/node_modules/@nahkies/typescript-express-runtime/package.json",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-express-runtime@latest/dist/esm/server.d.mts",
        path: "/node_modules/@nahkies/typescript-express-runtime/server.d.mts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-express-runtime@latest/dist/esm/errors.d.mts",
        path: "/node_modules/@nahkies/typescript-express-runtime/errors.d.mts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-express-runtime@latest/dist/esm/zod-v3.d.mts",
        path: "/node_modules/@nahkies/typescript-express-runtime/zod-v3.d.mts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-express-runtime@latest/dist/esm/zod-v4.d.mts",
        path: "/node_modules/@nahkies/typescript-express-runtime/zod-v4.d.mts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-express-runtime@latest/dist/esm/joi.d.mts",
        path: "/node_modules/@nahkies/typescript-express-runtime/joi.d.mts",
      },
    ],
  }

  for (const file of files[template]) {
    const uri = monaco.Uri.file(file.path)
    if (!monaco.editor.getModel(uri)) {
      // TODO: error handling
      const source = await (await fetch(file.uri)).text()
      console.info(`createModel for ${uri.path}`)
      monaco.editor.createModel(source, "typescript", uri)
      // monaco.languages.typescript.typescriptDefaults.addExtraLib(await source.text(), file.path)
    }
  }

  return AutoTypings.create(editor, {
    monaco,
    fileRootPath,
    sourceCache: new LocalStorageCache(),
    onUpdate: (update) => console.log("progress", update),
    onError: (error) => console.error(error),
    dontAdaptEditorOptions: true,
    preloadPackages: true,
    shareCache: true,
    versions: {
      zod: "4.1.12",
    },
  })
}
