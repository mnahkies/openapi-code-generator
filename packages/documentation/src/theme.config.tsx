import type {NextSeoProps} from "next-seo"
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

  useNextSeoProps(): NextSeoProps {
    const {asPath} = useRouter()

    const titleTemplate =
      asPath !== "/" ? "%s – OpenAPI Code Generator" : "OpenAPI Code Generator"

    return {
      titleTemplate,
      description:
        "A code generation tool for openapi 3 / 3.1, and typespec specifications, primarily aimed at generating typescript client SDKs, and server stubs, with an emphasis on compile & runtime safety.",
    }
  },
}

export default ThemeConfig
