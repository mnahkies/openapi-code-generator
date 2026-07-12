import {defineConfig} from "tsdown"
import packageJson from "./package.json" with {type: "json"}

export default defineConfig({
  name: packageJson.name,
  entry: ["./src/index.ts", "./src/cli.ts", "./src/web.ts"],

  target: "esnext",
  dts: true,
  sourcemap: true,
  failOnWarn: true,
  logLevel: "warn",
  publint: true,
  attw: {profile: "esm-only"},

  deps: {
    onlyBundle: ["@nahkies/typescript-common-runtime"],
  },

  format: {
    esm: {
      outDir: "./dist/esm",
    },
  },
})
