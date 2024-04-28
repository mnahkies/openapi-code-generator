import {useRouter} from "next/router"

const ThemeConfig = {
  logo: <strong>🔧 OpenAPI Code Generator</strong>,
  project: {
    link: "https://github.com/mnahkies/openapi-code-generator",
  },
  docsRepositoryBase:
    "https://github.com/mnahkies/openapi-code-generator/tree/main/packages/documentation",
  darkMode: true,
  faviconGlyph: "🔧",

  useNextSeoProps() {
    const {asPath} = useRouter()
    if (asPath !== "/") {
      return {
        titleTemplate: "%s – OpenAPI Code Generator",
      }
    }
  },
}

export default ThemeConfig
