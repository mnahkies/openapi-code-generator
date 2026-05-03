import {defineConfig} from "tsdown"
import packageJson from "./package.json" with {type: "json"}

export default defineConfig({
  name: packageJson.name,
  entry: [
    "./src/errors.ts",
    "./src/validation.ts",
    "./src/types.ts",
    "./src/query-parser.ts",
    "./src/request-bodies/index.ts",
  ],
  target: "esnext",

  format: {
    esm: {
      outDir: "./dist/esm",
    },
    cjs: {
      outDir: "./dist/cjs",
    },
  },

  dts: true,
  sourcemap: true,
})
