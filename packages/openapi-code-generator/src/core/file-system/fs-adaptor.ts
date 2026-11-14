export interface IFsAdaptor {
  readFile(path: string): Promise<string>

  writeFile(path: string, content: string): Promise<void>

  exists(path: string): Promise<boolean>

  existsSync(path: string): boolean

  isDir(path: string): Promise<boolean>

  readDir(path: string): Promise<string[]>

  mkDir(path: string, recursive: boolean): Promise<void>

  resolve(request: string, fromDir: string): string

  pathJoin(...paths: string[]): string

  dirname(path: string): string
}
