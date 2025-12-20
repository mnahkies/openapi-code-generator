import type {Monaco} from "@monaco-editor/react"
import type {WebFsAdaptor} from "@nahkies/openapi-code-generator"

export function createOrUpdateModel(
  {filename, value}: {filename: string; value: string},
  monaco: Monaco,
) {
  const uri = monaco.Uri.file(filename)
  const language = filename.endsWith(".ts") ? "typescript" : "yaml"

  if (!monaco.editor.getModel(uri)) {
    monaco.editor.createModel(value, language, uri)
  } else {
    monaco.editor.getModel(uri)?.setValue(value)
  }
}

export function pruneModels(fsAdapter: WebFsAdaptor, monaco: Monaco) {
  for (const model of monaco.editor.getModels()) {
    if (!fsAdapter.existsSync(model.uri.path)) {
      model.dispose()
    }
  }
}

export function listAvailableModels(fsAdapter: WebFsAdaptor, monaco: Monaco) {
  return (
    monaco.editor
      .getModels()
      .filter(
        // biome-ignore lint/suspicious/noExplicitAny: todo: https://github.com/suren-atoyan/monaco-react/issues/771
        (it: any) =>
          it.uri.path.includes("/generated/") &&
          fsAdapter.existsSync(it.uri.path),
      )
      // biome-ignore lint/suspicious/noExplicitAny: todo: https://github.com/suren-atoyan/monaco-react/issues/771
      .map((it: any): string => it.uri.path)
  )
}
