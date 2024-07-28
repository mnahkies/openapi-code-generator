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

  head: function Head() {
    return (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </>
    )
  },

  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} ©{" "}
        <a
          href="https://nahkies.co.nz"
          target="_blank"
          rel="noopener noreferrer"
        >
          Michael Nahkies
        </a>
      </span>
    ),
  },

  useNextSeoProps(): NextSeoProps {
    const {asPath} = useRouter()

    const titleTemplate =
      asPath !== "/" ? "%s – OpenAPI Code Generator" : "OpenAPI Code Generator"

    return {
      titleTemplate,
      description:
        "A code generation tool for openapi 3 / 3.1, and typespec specifications, primarily aimed at generating typescript client SDKs, and server stubs, with an emphasis on compile & runtime safety.",
      canonical: "https://openapi-code-generator.nahkies.co.nz/",
      openGraph: {
        url: `https://openapi-code-generator.nahkies.co.nz${asPath}`,
      },
    }
  },
}

export default ThemeConfig
