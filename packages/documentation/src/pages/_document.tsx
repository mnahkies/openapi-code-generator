import {Head, Html, Main, NextScript} from "next/document"

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          defer={true}
          data-domain="openapi-code-generator.nahkies.co.nz"
          src="https://plausible.nahkies.co.nz/js/script.js"
        />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
