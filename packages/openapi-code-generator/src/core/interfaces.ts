export interface IFormatter {
  format(filename: string, raw: string): Promise<{result: string; err?: Error}>
}
