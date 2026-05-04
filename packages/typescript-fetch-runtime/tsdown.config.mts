import {defineConfig} from "tsdown"
import packageJson from "./package.json" with {type: "json"}

export default defineConfig({
  name: packageJson.name,
  entry: [
    "./src/main.ts",
    "./src/joi.ts",
    "./src/zod-v4.ts",
    "./src/zod-v3.ts",
  ],

  target: "esnext",
  dts: true,
  sourcemap: true,
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
