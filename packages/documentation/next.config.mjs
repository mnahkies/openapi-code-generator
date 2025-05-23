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
  webpack: (config, {buildId, dev, isServer, defaultLoaders, webpack}) => {
    config.experiments = {...config.experiments, syncWebAssembly: true}
    config.plugins.push(new NodePolyfillPlugin())
    config.module.rules.push({
      test: /node:.+/i,
      use: "null-loader",
    })
    config.module.rules.push({
      test: /@biomejs\/wasm-nodejs/i,
      use: "null-loader",
    })

    return config
  },
}

const withNextra = nextra({})

export default withNextra(nextConfig)
