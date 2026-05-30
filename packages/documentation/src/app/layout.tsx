import {Banner, Head} from "nextra/components"
import {getPageMap} from "nextra/page-map"
import {Footer, Layout, Link, Navbar} from "nextra-theme-docs"
import "nextra-theme-docs/style.css"
import type {Metadata} from "next"
import Script from "next/script"
import type {ReactNode} from "react"

export const metadata: Metadata = {
  title: {
    default: "OpenAPI Code Generator",
    template: "%s - OpenAPI Code Generator",
  },
  description:
    "A code generation tool for openapi 3 / 3.1, and typespec specifications, " +
    "primarily aimed at generating typescript client SDKs, and server stubs, " +
    "with an emphasis on compile & runtime safety.",
  keywords: [
    "openapi",
    "openapi3",
    "typespec",
    "typescript",
    "zod",
    "api",
    "sdk",
    "generator",
    "codegen",
    "koa",
    "express",
    "fetch",
    "axios",
    "angular",
  ],
  robots: {index: true, follow: true},
  openGraph: {
    url: "https://openapi-code-generator.nahkies.co.nz/",
    siteName: "OpenAPI Code Generator",
    locale: "en_US",
    type: "website",
    images: "https://openapi-code-generator.nahkies.co.nz/opengraph_image.jpeg",
  },
}

const banner = (
  <Banner>
    🎉 Try out our new <Link href={"/playground"}>interactive playground</Link>
  </Banner>
)

const navbar = (
  <Navbar
    logo={<strong>🔧 OpenAPI Code Generator</strong>}
    projectLink={"https://github.com/mnahkies/openapi-code-generator"}
    // ... Your additional navbar options
  />
)
const footer = (
  <Footer>
    <span>
      {new Date().getFullYear()} ©{" "}
      <a href="https://nahkies.co.nz" target="_blank" rel="noopener noreferrer">
        Michael Nahkies
      </a>
    </span>
  </Footer>
)

export default async function RootLayout({children}: {children: ReactNode}) {
  const baseUrl = "https://openapi-code-generator.nahkies.co.nz"

  return (
    <html
      lang="en"
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Head faviconGlyph={"🔧"}>
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={baseUrl} />

        <Script
          async
          src="https://plausible.nahkies.co.nz/js/pa-0fbOteYkFF3Wja9FWEfQB.js"
        />
        <Script id="plausible-init">
          {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
          plausible.init()`}
        </Script>
      </Head>
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          darkMode={true}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/mnahkies/openapi-code-generator/tree/main/packages/documentation"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
