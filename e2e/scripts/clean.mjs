#!/usr/bin/env node
import {rm} from "node:fs/promises"

await rm("./dist", {
  recursive: true,
  force: true,
})

await rm("./src/generated", {recursive: true, force: true})
