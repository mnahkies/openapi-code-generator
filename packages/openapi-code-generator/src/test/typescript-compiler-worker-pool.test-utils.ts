import {Piscina} from "piscina"

import path from "node:path"
import {filename} from "./typescript-compiler-worker.test-utils"

let pool: Piscina | null = null

export function startWorkerPool() {
  if (pool) {
    throw new Error("already started")
  }

  pool = new Piscina({
    filename: path.resolve(__dirname, "./workerWrapper.js"),
    workerData: {fullpath: filename},
    concurrentTasksPerWorker: 1,
    maxThreads: 4,
    minThreads: 4,
    idleTimeout: 5_000,
  })
}

export function stopWorkerPool() {
  if (!pool) {
    throw new Error("worker pool not started")
  }

  pool.destroy()
  pool = null
}

export async function typecheckInWorker(
  compilationUnits: {filename: string; content: string}[],
) {
  if (!pool) {
    throw new Error("worker pool not started")
  }

  await pool.run(compilationUnits)
}
