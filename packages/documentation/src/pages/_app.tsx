import {GA_ID} from "@/lib/ga"
import "@/styles/globals.css"
import type {AppProps} from "next/app"
import Script from "next/script"

export default function App({Component, pageProps}: AppProps) {
  return (
    <>
      {" "}
      <Script
        strategy={"afterInteractive"}
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Component {...pageProps} />
    </>
  )
}
