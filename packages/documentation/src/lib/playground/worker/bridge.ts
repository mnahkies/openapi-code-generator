import type {
  Monad,
  WorkerMessage,
  WorkerResult,
} from "@/lib/playground/worker/types"

export function createWorker() {
  return new Worker(new URL("./worker.ts", import.meta.url))
}

export function sendMessageToWorker(
  worker: Worker | null,
  message: WorkerMessage,
) {
  worker?.postMessage(message)
}

export function subscribeToWorkerMessages(
  worker: Worker,
  onMessage: (data: Monad<WorkerResult>) => void,
) {
  worker.onmessage = (event) => {
    console.info("received event from worker", event)
    onMessage(event.data)
  }
  worker.onerror = (event) => {
    console.info("received error event from worker", event)
  }
}
