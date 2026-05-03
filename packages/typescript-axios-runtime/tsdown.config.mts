import {defineConfig} from "tsdown"
import packageJson from "./package.json" with {type: "json"}

export default defineConfig({
  name: packageJson.name,
  entry: ["./src/main.ts"],

  target: "esnext",
  dts: true,
  sourcemap: true,

  format: {
    esm: {
      outDir: "./dist/esm",
    },
    cjs: {
      outDir: "./dist/cjs",
    },
  },
})
