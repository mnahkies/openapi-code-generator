import nextra from "nextra"
import NodePolyfillPlugin from "node-polyfill-webpack-plugin"

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "dist",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.experiments = {...config.experiments, syncWebAssembly: true}

    /**
     * Webpack doesn't support `node:` prefixed imports, so rewrite them to be
     * plain imports, allowing the NodePolyfillPlugin to do its job correctly.
     */
    config.plugins.push({
      apply(compiler) {
        compiler.hooks.normalModuleFactory.tap("RewriteNodeProtocol", (nmf) => {
          nmf.hooks.beforeResolve.tap("RewriteNodeProtocol", (result) => {
            if (result?.request?.startsWith("node:")) {
              result.request = result.request.replace(/^node:/, "")
            }
          })
        })
      },
    })

    config.plugins.push(new NodePolyfillPlugin())

    config.module.rules.push({
      test: /@biomejs\/wasm-nodejs/i,
      use: "null-loader",
    })

    return config
  },
}

const withNextra = nextra({})

export default withNextra(nextConfig)
