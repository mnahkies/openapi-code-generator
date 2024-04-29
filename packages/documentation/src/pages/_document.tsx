import {Head, Html, Main, NextScript} from "next/document"
import Script from "next/script"

const GA_ID = "G-X7JHJYGVNR"

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* https://developers.google.com/tag-platform/security/guides/consent?consentmode=advanced */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied',
            'personalization_storage': 'denied',
          });

          gtag('js', new Date());

          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            restricted_data_processing: true
          });
        `,
          }}
        />
      </Head>
      <Script
        strategy={"afterInteractive"}
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
