"use client"

import Script from "next/script"

export default function PlausibleScript() {
  return (
    <Script
      async
      src="https://ps.nahkies.co.nz/js/pa-0fbOteYkFF3Wja9FWEfQB.js"
      onLoad={() => {
        window.plausible =
          window.plausible ||
          function () {
            window.plausible.q = window.plausible.q || []
            // biome-ignore lint/complexity/noArguments: analytics
            window.plausible.q.push(arguments)
          }

        window.plausible.init =
          window.plausible.init ||
          ((i: unknown) => {
            window.plausible.o = i || {}
          })
        window.plausible.init()
      }}
    />
  )
}
