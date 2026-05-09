import {defineConfig} from "tsdown"
import packageJson from "./package.json" with {type: "json"}

export default defineConfig({
  name: packageJson.name,
  entry: ["./src/index.ts", "./src/cli.ts", "./src/web.ts"],

  target: "esnext",
  dts: true,
  sourcemap: true,
  publint: true,
  attw: {profile: "node16"},

  deps: {
    alwaysBundle: [
      "@nahkies/typescript-common-runtime",
      "@nahkies/typescript-common-runtime/*",
    ],
    neverBundle: ["joi"],
  },

  format: {
    esm: {
      outDir: "./dist/esm",
    },
    cjs: {
      outDir: "./dist/cjs",
    },
  },
})
