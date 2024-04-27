export function isRemote(location: string): boolean {
  return location.startsWith("http://") || location.startsWith("https://")
}
