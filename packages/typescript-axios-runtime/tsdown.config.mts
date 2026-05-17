import {defineConfig} from "tsdown"
import packageJson from "./package.json" with {type: "json"}

export default defineConfig({
  name: packageJson.name,
  entry: ["./src/main.ts"],

  target: "esnext",
  dts: true,
  sourcemap: true,
  failOnWarn: true,
  logLevel: "warn",
  publint: true,
  attw: {profile: "node16"},

  format: {
    esm: {
      outDir: "./dist/esm",
    },
    cjs: {
      outDir: "./dist/cjs",
    },
  },
})
