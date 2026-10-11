import { brand, brandCssVariables, brandFontsUrl } from "@lib/brand"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: { default: brand.name, template: `%s | ${brand.name}` },
  description: brand.tagline,
  icons: brand.logo.favicon ? { icon: brand.logo.favicon } : undefined,
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      style={brandCssVariables() as React.CSSProperties}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={brandFontsUrl()} />
      </head>
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
