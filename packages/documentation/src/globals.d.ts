export {}

declare global {
  interface Window {
    // biome-ignore lint/suspicious/noExplicitAny: analytics
    plausible: any
  }
}
