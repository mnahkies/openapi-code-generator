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
      {
        uri: "https://unpkg.com/@nahkies/typescript-fetch-runtime@latest/dist/common.d.ts",
        path: "/node_modules/@nahkies/typescript-fetch-runtime/common.d.ts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-fetch-runtime@latest/dist/types.d.ts",
        path: "/node_modules/@nahkies/typescript-fetch-runtime/types.d.ts",
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
    "typescript-express": [
      {
        uri: "https://unpkg.com/@nahkies/typescript-express-runtime@latest/package.json",
        path: "/node_modules/@nahkies/typescript-express-runtime/package.json",
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
        uri: "https://unpkg.com/@nahkies/typescript-express-runtime@latest/dist/zod.d.ts",
        path: "/node_modules/@nahkies/typescript-express-runtime/zod.d.ts",
      },
      {
        uri: "https://unpkg.com/@nahkies/typescript-express-runtime@latest/dist/joi.d.ts",
        path: "/node_modules/@nahkies/typescript-express-runtime/joi.d.ts",
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
      zod: "3.24.1",
    },
  })
}
