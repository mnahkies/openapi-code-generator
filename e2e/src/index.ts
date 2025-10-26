import {startExpressServer} from "./express.entrypoint.ts"
import {startKoaServer} from "./koa.entrypoint.ts"

type StartServerFunction = {
  name: string
  startServer: () => Promise<{
    address: {port: number}
    server: {close: () => void}
  }>
}

export const startServerFunctions = [
  {
    name: "koa",
    startServer: startKoaServer,
  },
  {
    name: "express",
    startServer: startExpressServer,
  },
] satisfies StartServerFunction[]
