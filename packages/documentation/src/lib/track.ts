export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(event, {props})
  }
}
