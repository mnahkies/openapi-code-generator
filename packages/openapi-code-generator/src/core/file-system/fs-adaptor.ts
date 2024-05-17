export interface IFsAdaptor {
  readFile(path: string): Promise<string>

  writeFile(path: string, content: string): Promise<void>

  exists(path: string): Promise<boolean>

  existsSync(path: string): boolean

  mkDir(path: string, recursive: boolean): Promise<void>
}
