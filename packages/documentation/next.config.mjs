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
      // todo: ajv validator uses `require` in esm context, causing `node:module` to be used
      //       https://github.com/ajv-validator/ajv/issues/2598 should solve upstream
      "@nahkies/openapi-code-generator/web":
        "./node_modules/@nahkies/openapi-code-generator/dist/cjs/web.cjs",
    },
  },
}

const withNextra = nextra({})

export default withNextra(nextConfig)
