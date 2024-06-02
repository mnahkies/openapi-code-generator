export interface IFormatter {
  format(filename: string, raw: string): Promise<string>
}
