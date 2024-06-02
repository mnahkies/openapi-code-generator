import type {
  Monad,
  WorkerMessage,
  WorkerResult,
} from "@/lib/playground/worker/types"
import {
  type Config,
  OpenapiValidator,
  TypescriptFormatterPrettier,
  TypespecLoader,
  WebFsAdaptor,
  generate,
} from "@nahkies/openapi-code-generator"
import _ from "lodash"

// TODO: move
export function asyncDebounce<
  // biome-ignore lint/suspicious/noExplicitAny: generic
  T extends any[],
  R,
  F extends (...args: T) => Promise<R>,
>(func: F, delayMs: number, opts?: {trailing?: boolean; leading?: boolean}) {
  const resolves = new Set<(result: R) => void>()
  const rejects = new Set<(err: Error) => void>()

  const debounced = _.debounce(
    (args: Parameters<F>) => {
      func(...args)
        .then((...res) => {
          for (const resolve of resolves) {
            resolve(...res)
          }
          resolves.clear()
          rejects.clear()
        })
        .catch((...res) => {
          for (const reject of rejects) {
            reject(...res)
          }
          resolves.clear()
          rejects.clear()
        })
    },
    delayMs,
    opts,
  )

  return (...args: Parameters<F>): ReturnType<F> =>
    new Promise((resolve, reject) => {
      resolves.add(resolve)
      rejects.add(reject)
      debounced(args)
    }) as ReturnType<F>
}

async function createGenerator() {
  const webFsAdaptor = new WebFsAdaptor()
  const formatter = await TypescriptFormatterPrettier.create()
  const validator = await OpenapiValidator.create()
  const typespecLoader = await TypespecLoader.create()

  let mostRecentEventTimeStamp: DOMHighResTimeStamp

  const innerGenerate = async (
    eventTimeStamp: DOMHighResTimeStamp,
    config: Config,
    input: string,
  ) => {
    const start = Date.now()
    webFsAdaptor.clearFiles(() => true)
    await webFsAdaptor.writeFile(config.input, input)

    await generate(config, webFsAdaptor, formatter, validator, typespecLoader)

    const files = new Map(webFsAdaptor.files)
    files.delete(config.input)

    if (eventTimeStamp === mostRecentEventTimeStamp) {
      sendMessage({
        success: true,
        loading: false,
        result: {files, elapsed: Date.now() - start},
      })
    } else {
      console.info("ignoring message", {
        eventTimeStamp,
        mostRecentEventTimeStamp,
      })
    }
  }

  const debouncedGenerate = asyncDebounce(innerGenerate, 200, {
    leading: false,
    trailing: true,
  })

  return {
    generate: (
      timeStamp: DOMHighResTimeStamp,
      config: Config,
      input: string,
    ) => {
      if (!mostRecentEventTimeStamp || timeStamp > mostRecentEventTimeStamp) {
        mostRecentEventTimeStamp = timeStamp
      }

      sendMessage({success: null, loading: true})
      return debouncedGenerate(timeStamp, config, input)
    },
  }
}

async function createOnMessageHandler(
  generator: Awaited<ReturnType<typeof createGenerator>>,
) {
  return async function onMessage(event: MessageEvent<WorkerMessage>) {
    try {
      console.info("Worker: received message", event.data.type)

      const data = event.data

      switch (data.type) {
        case "generate": {
          event.lastEventId
          await generator.generate(event.timeStamp, data.config, data.input)
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        sendError(new Error("Failed to generate code", {cause: err}))
      } else {
        sendError(new Error("Unknown error", {cause: err}))
      }
    }
  }
}

async function main() {
  console.info("Worker: starting worker")
  const generator = await createGenerator()
  const onMessage = await createOnMessageHandler(generator)
  addEventListener("message", onMessage)
}

main().catch(sendError)

function sendError(err: Error) {
  sendMessage({success: false, loading: false, err: err})
}

function sendMessage(message: Monad<WorkerResult>) {
  console.info("Worker: sending message", message)
  postMessage(message)
}
