import {useMDXComponents as getThemeComponents} from "nextra-theme-docs" // nextra-theme-blog or your custom theme

// Get the default MDX components
const themeComponents = getThemeComponents()

// Merge components
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function useMDXComponents(components: any) {
  return {
    ...themeComponents,
    ...components,
  }
}
