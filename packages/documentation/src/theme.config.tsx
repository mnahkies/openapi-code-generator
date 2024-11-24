import {useRouter} from "next/router"
import {useConfig} from "nextra-theme-docs"

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
    const {asPath} = useRouter()
    const config = useConfig()

    const pageTitle =
      asPath !== "/" ? config.frontMatter.title || config.title : ""

    const siteTitle = "OpenAPI Code Generator"
    const title = pageTitle ? `${pageTitle} – ${siteTitle}` : siteTitle

    const baseUrl = "https://openapi-code-generator.nahkies.co.nz"

    const url = `${baseUrl}${asPath}`
    const description =
      "A code generation tool for openapi 3 / 3.1, and typespec specifications, " +
      "primarily aimed at generating typescript client SDKs, and server stubs, " +
      "with an emphasis on compile & runtime safety."

    return (
      <>
        <title>{title}</title>
        <meta name="robots" content="index,follow" />
        <meta name="description" content={description} />

        <meta property="og:title" content={pageTitle?.trim() ?? ""} />
        <meta property="og:site_name" content={siteTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${baseUrl}/opengraph_image.jpeg`} />
        <meta property="og:locale" content="en_US" />

        <link rel="canonical" href={baseUrl} />

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </>
    )
  },

  footer: {
    content: (
      <span>
        {new Date().getFullYear()} ©{" "}
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
}

export default ThemeConfig
