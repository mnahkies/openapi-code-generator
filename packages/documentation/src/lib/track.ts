export function track(event: string, props?: Record<string, any>) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(event, {props})
  }
}
