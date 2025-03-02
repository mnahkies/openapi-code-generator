export function isRemote(location: string): boolean {
  return location.startsWith("http://") || location.startsWith("https://")
}

export const isJsonFile = (filepath: string) => filepath.endsWith(".json")

export const isYamlFile = (filepath: string) =>
  filepath.endsWith(".yaml") || filepath.endsWith(".yml")

export const isTextFile = (filepath: string) =>
  filepath.endsWith(".txt") || filepath.endsWith(".md")
