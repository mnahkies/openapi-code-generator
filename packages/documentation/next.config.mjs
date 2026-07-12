import nextra from "nextra"

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "dist",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: {
      "next-mdx-import-source-file": "./src/mdx-components.tsx",
      // todo: @hyperjump/json-schema isn't playing nice in the esm build
      "@nahkies/openapi-code-generator/web":
        "./node_modules/@nahkies/openapi-code-generator/dist/cjs/web.cjs",
    },
  },
}

const withNextra = nextra({})

export default withNextra(nextConfig)
