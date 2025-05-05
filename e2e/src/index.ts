import {startKoaServer} from "./koa.entrypoint"

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
] satisfies StartServerFunction[]
